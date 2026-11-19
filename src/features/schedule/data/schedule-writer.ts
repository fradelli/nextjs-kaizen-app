import { deleteTodoGroup } from "./schedule-group-writer";
import { moveTodosToList } from "./schedule-todo-placement-writer";
import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import {
  ScheduleMutationError,
  type ScheduleCommand,
  type ScheduleSaved,
} from "../application/schedule-command";
import { assertQuarterHour, contains, intervalDates } from "../domain/schedule-time";
import { reservationPreview } from "../domain/reservation-preview";
import { updateClassification } from "./schedule-classification-writer";
import { recordActivity, recordReservation, recordTodo } from "./schedule-history";

async function inbox(tx: Prisma.TransactionClient, workspaceId: string) {
  return tx.todoList.upsert({
    where: { workspaceId_systemKey: { workspaceId, systemKey: "inbox" } },
    create: { workspaceId, systemKey: "inbox", name: "Inbox" },
    update: {},
  });
}

type Transaction = Prisma.TransactionClient;

function ensure(condition: unknown, code: string): asserts condition {
  if (!condition) throw new ScheduleMutationError("invalid", code);
}

function checkRevision(actual: number, expected: number) {
  if (actual !== expected) throw new ScheduleMutationError("conflict", "revision_changed");
}

async function activeTodo(tx: Transaction, workspaceId: string, id: string) {
  const row = await tx.todo.findFirst({ where: { workspaceId, id, archivedAt: null } });
  if (!row) throw new ScheduleMutationError("missing", "todo_missing");
  return row;
}

async function activeActivity(tx: Transaction, workspaceId: string, id: string) {
  const row = await tx.agendaActivity.findFirst({
    where: { workspaceId, id, removedAt: null },
    include: { tag: true },
  });
  if (!row) throw new ScheduleMutationError("missing", "activity_missing");
  return row;
}

async function activeList(tx: Transaction, workspaceId: string, id: string) {
  const row = await tx.todoList.findFirst({ where: { workspaceId, id, archivedAt: null } });
  if (!row) throw new ScheduleMutationError("missing", "list_missing");
  return row;
}

async function touchParent(tx: Transaction, workspaceId: string, id: string) {
  await tx.agendaActivity.update({
    where: { workspaceId_id: { workspaceId, id } },
    data: { revision: { increment: 1 } },
  });
  await recordActivity(tx, workspaceId, id);
}

export async function writeSchedule(
  tx: Transaction,
  workspaceId: string,
  command: ScheduleCommand,
  now: Date,
): Promise<ScheduleSaved> {
  const affected = new Set<string>();
  const dates = (start: Date, end: Date) =>
    intervalDates(start, end).forEach((date) => affected.add(date));
  const saved = (id: string, revision: number): ScheduleSaved => ({
    status: "saved",
    id,
    revision,
    affectedDates: [...affected].sort(),
  });

  switch (command.kind) {
    case "update_tag":
    case "update_list":
      return updateClassification(tx, workspaceId, command, now);
    case "delete_list":
      return deleteTodoGroup(tx, workspaceId, command, now);
    case "create_list": {
      await tx.agendaTag.createMany({
        data: [
          { workspaceId, name: "Treino", colorKey: "green", systemKey: "training" },
          { workspaceId, name: "Alimentação", colorKey: "orange", systemKey: "nutrition" },
        ],
        skipDuplicates: true,
      });
      const list = await tx.todoList.create({
        data: { workspaceId, name: command.name, colorKey: command.colorKey },
      });
      return saved(list.id, list.revision);
    }
    case "create_todo": {
      const list = command.listId
        ? await activeList(tx, workspaceId, command.listId)
        : await inbox(tx, workspaceId);
      const todo = await tx.todo.create({
        data: {
          workspaceId,
          listId: list.id,
          title: command.title,
          estimatedMinutes: command.estimatedMinutes,
        },
      });
      await tx.todoPlacementVersion.create({
        data: {
          workspaceId,
          todoId: todo.id,
          listId: list.id,
          colorKey: list.colorKey,
          effectiveFrom: now,
        },
      });
      await recordTodo(tx, workspaceId, todo.id);
      return {
        ...saved(todo.id, todo.revision),
        group: {
          id: list.id,
          name: list.name,
          colorKey: list.colorKey,
          revision: list.revision,
          systemKey: list.systemKey,
        },
      };
    }
    case "create_activity": {
      const start = command.startsAt ? new Date(command.startsAt) : null;
      const end = command.endsAt ? new Date(command.endsAt) : null;
      ensure(
        (start &&
          end &&
          !command.scheduledDate &&
          assertQuarterHour(start) &&
          assertQuarterHour(end) &&
          end > start) ||
          (!start && !end && command.scheduledDate),
        "invalid_interval",
      );
      if (command.tagId)
        ensure(
          await tx.agendaTag.findFirst({
            where: { workspaceId, id: command.tagId, archivedAt: null },
          }),
          "tag_missing",
        );
      const activity = await tx.agendaActivity.create({
        data: {
          workspaceId,
          title: command.title,
          startsAt: start,
          endsAt: end,
          scheduledDate: command.scheduledDate ? new Date(command.scheduledDate) : null,
          tagId: command.tagId,
          colorKey: command.tagId
            ? (
                await tx.agendaTag.findUniqueOrThrow({
                  where: { workspaceId_id: { workspaceId, id: command.tagId } },
                })
              ).colorKey
            : null,
        },
      });
      await recordActivity(tx, workspaceId, activity.id);
      if (start && end) dates(start, end);
      if (command.scheduledDate) affected.add(command.scheduledDate);
      return saved(activity.id, activity.revision);
    }
    case "create_tag": {
      const tag = await tx.agendaTag.create({
        data: { workspaceId, name: command.name, colorKey: command.colorKey },
      });
      return saved(tag.id, tag.revision);
    }
    case "update_todo": {
      const todo = await activeTodo(tx, workspaceId, command.todoId);
      checkRevision(todo.revision, command.expectedRevision);
      const row = await tx.todo.update({
        where: { workspaceId_id: { workspaceId, id: todo.id } },
        data: {
          title: command.title,
          estimatedMinutes: command.estimatedMinutes,
          revision: { increment: 1 },
        },
      });
      await recordTodo(tx, workspaceId, todo.id);
      const reservations = await tx.todoReservation.findMany({
        where: { workspaceId, todoId: todo.id, removedAt: null },
      });
      reservations.forEach((r) => dates(r.startsAt, r.endsAt));
      return saved(row.id, row.revision);
    }
    case "remove_reservation": {
      const row = await tx.todoReservation.findFirst({
        where: { workspaceId, id: command.reservationId, removedAt: null },
      });
      if (!row) throw new ScheduleMutationError("missing", "reservation_missing");
      checkRevision(row.revision, command.expectedRevision);
      await tx.todoReservation.update({
        where: { workspaceId_id: { workspaceId, id: row.id } },
        data: { removedAt: now, parentActivityId: null, revision: { increment: 1 } },
      });
      await recordReservation(tx, workspaceId, row.id);
      if (row.parentActivityId) await touchParent(tx, workspaceId, row.parentActivityId);
      dates(row.startsAt, row.endsAt);
      return saved(row.id, row.revision + 1);
    }
    case "update_activity": {
      let row = await activeActivity(tx, workspaceId, command.activityId);
      checkRevision(row.revision, command.expectedRevision);
      const start = command.startsAt ? new Date(command.startsAt) : null;
      const end = command.endsAt ? new Date(command.endsAt) : null;
      ensure(
        (start &&
          end &&
          !command.scheduledDate &&
          assertQuarterHour(start) &&
          assertQuarterHour(end) &&
          end > start) ||
          (!start && !end && command.scheduledDate),
        "invalid_interval",
      );
      if (command.tagId)
        ensure(
          await tx.agendaTag.findFirst({
            where: { workspaceId, id: command.tagId, archivedAt: null },
          }),
          "tag_missing",
        );
      if (row.startsAt && row.endsAt) dates(row.startsAt, row.endsAt);
      if (row.scheduledDate) affected.add(row.scheduledDate.toISOString().slice(0, 10));
      if (start && row.startsAt && start.getTime() !== row.startsAt.getTime()) {
        const moved = await writeSchedule(
          tx,
          workspaceId,
          {
            operationId: command.operationId,
            kind: "move_activity",
            activityId: row.id,
            expectedRevision: row.revision,
            startsAt: start.toISOString(),
            policy: command.policy,
          },
          now,
        );
        moved.affectedDates.forEach((date) => affected.add(date));
        row = await activeActivity(tx, workspaceId, row.id);
      }
      const reservations = await tx.todoReservation.findMany({
        where: { workspaceId, parentActivityId: row.id, removedAt: null },
      });
      const children = await tx.agendaActivity.findMany({
        where: { workspaceId, parentActivityId: row.id, removedAt: null },
      });
      // Existing external reservations retain their parent. Resizing may not cut a contained item.
      for (const child of [...reservations, ...children]) {
        if (
          row.startsAt &&
          row.endsAt &&
          child.startsAt &&
          child.endsAt &&
          contains(row.startsAt, row.endsAt, child.startsAt, child.endsAt)
        ) {
          ensure(start && end && contains(start, end, child.startsAt, child.endsAt), "occupied");
        }
      }
      const updated = await tx.agendaActivity.update({
        where: { workspaceId_id: { workspaceId, id: row.id } },
        data: {
          title: command.title,
          startsAt: start,
          endsAt: end,
          scheduledDate: command.scheduledDate ? new Date(command.scheduledDate) : null,
          tagId: command.tagId,
          colorKey: command.tagId
            ? (
                await tx.agendaTag.findUniqueOrThrow({
                  where: { workspaceId_id: { workspaceId, id: command.tagId } },
                })
              ).colorKey
            : null,
          revision: { increment: 1 },
        },
      });
      await recordActivity(tx, workspaceId, row.id);
      if (row.parentActivityId) await touchParent(tx, workspaceId, row.parentActivityId);
      if (start && end) dates(start, end);
      if (command.scheduledDate) affected.add(command.scheduledDate);
      return saved(row.id, updated.revision);
    }
    case "complete": {
      const todo = await activeTodo(tx, workspaceId, command.todoId);
      checkRevision(todo.revision, command.expectedRevision);
      const updated = await tx.todo.update({
        where: { workspaceId_id: { workspaceId, id: todo.id } },
        data: {
          completedAt: command.completed ? (todo.completedAt ?? now) : null,
          revision: { increment: 1 },
        },
      });
      await recordTodo(tx, workspaceId, todo.id);
      const reservations = await tx.todoReservation.findMany({
        where: { workspaceId, todoId: todo.id, removedAt: null },
      });
      reservations.forEach((row) => dates(row.startsAt, row.endsAt));
      return saved(updated.id, updated.revision);
    }
    case "reserve_new": {
      const todo = await activeTodo(tx, workspaceId, command.todoId);
      checkRevision(todo.revision, command.expectedRevision);
      const list = await activeList(tx, workspaceId, todo.listId);
      const start = new Date(command.startsAt);
      ensure(assertQuarterHour(start), "invalid_interval");
      const end = new Date(start.getTime() + (todo.estimatedMinutes ?? 30) * 60000);
      const parent = await writeSchedule(
        tx,
        workspaceId,
        {
          operationId: command.operationId,
          kind: "create_activity",
          title: list.name,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        },
        now,
      );
      const result = await writeSchedule(
        tx,
        workspaceId,
        {
          operationId: command.operationId,
          kind: "reserve",
          todoId: todo.id,
          expectedRevision: todo.revision,
          parentActivityId: parent.id,
          expectedParentRevision: parent.revision,
          startsAt: start.toISOString(),
        },
        now,
      );
      return result;
    }
    case "reserve": {
      const todo = await activeTodo(tx, workspaceId, command.todoId);
      checkRevision(todo.revision, command.expectedRevision);
      const parent = await activeActivity(tx, workspaceId, command.parentActivityId);
      checkRevision(parent.revision, command.expectedParentRevision);
      const start = new Date(command.startsAt);
      ensure(parent.startsAt && parent.endsAt && assertQuarterHour(start), "invalid_interval");
      ensure(start >= parent.startsAt && start < parent.endsAt, "outside_parent");
      const desiredEnd = new Date(
        Math.min(start.getTime() + (todo.estimatedMinutes ?? 30) * 60000, parent.endsAt.getTime()),
      );
      const reservations = await tx.todoReservation.findMany({
        where: {
          workspaceId,
          parentActivityId: parent.id,
          removedAt: null,
          startsAt: { lt: desiredEnd },
          endsAt: { gt: start },
        },
      });
      const activities = await tx.agendaActivity.findMany({
        where: {
          workspaceId,
          parentActivityId: parent.id,
          removedAt: null,
          startsAt: { lt: desiredEnd },
          endsAt: { gt: start },
        },
      });
      const preview = reservationPreview(
        start,
        todo.estimatedMinutes,
        parent.startsAt,
        parent.endsAt,
        [...reservations, ...activities].flatMap((row) =>
          row.startsAt && row.endsAt ? [{ start: row.startsAt, end: row.endsAt }] : [],
        ),
      );
      if (preview.error) throw new ScheduleMutationError("invalid", preview.error);
      const end = preview.end;
      const placement = await tx.todoPlacementVersion.findFirstOrThrow({
        where: { workspaceId, todoId: todo.id },
        orderBy: { effectiveFrom: "desc" },
      });
      const row = await tx.todoReservation.create({
        data: {
          workspaceId,
          todoId: todo.id,
          placementVersionId: placement.id,
          parentActivityId: parent.id,
          startsAt: start,
          endsAt: end,
          colorKey: parent.tag?.colorKey ?? null,
        },
      });
      await recordReservation(tx, workspaceId, row.id);
      await touchParent(tx, workspaceId, parent.id);
      dates(start, end);
      return saved(row.id, row.revision);
    }
    case "change_list": {
      const todo = await activeTodo(tx, workspaceId, command.todoId);
      checkRevision(todo.revision, command.expectedRevision);
      const list = await activeList(tx, workspaceId, command.listId);
      if (todo.listId === list.id) return saved(todo.id, todo.revision);
      const affectedDates = await moveTodosToList(tx, workspaceId, [todo], list, now);
      return {
        status: "saved",
        id: todo.id,
        revision: todo.revision + 1,
        affectedDates,
        affectedGroupIds: [todo.listId, list.id],
        affectedTodoIds: [todo.id],
      };
    }
    case "move_activity":
    case "delete_activity": {
      const parent = await activeActivity(tx, workspaceId, command.activityId);
      checkRevision(parent.revision, command.expectedRevision);
      if (command.kind === "delete_activity" && parent.scheduledDate) {
        const linked = await tx.todoReservation.count({
          where: { workspaceId, parentActivityId: parent.id, removedAt: null },
        });
        ensure(linked === 0, "occupied");
        await tx.agendaActivity.update({
          where: { workspaceId_id: { workspaceId, id: parent.id } },
          data: { removedAt: now, revision: { increment: 1 } },
        });
        await recordActivity(tx, workspaceId, parent.id);
        affected.add(parent.scheduledDate.toISOString().slice(0, 10));
        return saved(parent.id, parent.revision + 1);
      }
      ensure(parent.startsAt && parent.endsAt, "interval_required");
      // Read the complete tree by relationship, including reservations outside the interval.
      const reservations = await tx.todoReservation.findMany({
        where: { workspaceId, parentActivityId: parent.id, removedAt: null },
      });
      const activities = await tx.agendaActivity.findMany({
        where: { workspaceId, parentActivityId: parent.id, removedAt: null },
      });
      // Deeper trees need an explicit recursive mutation before this entry point can handle them.
      const deeper = await tx.agendaActivity.count({
        where: {
          workspaceId,
          parentActivityId: { in: activities.map((row) => row.id) },
          removedAt: null,
        },
      });
      const deeperReservations = await tx.todoReservation.count({
        where: {
          workspaceId,
          parentActivityId: { in: activities.map((row) => row.id) },
          removedAt: null,
        },
      });
      ensure(deeper === 0 && deeperReservations === 0, "nested_move_requires_review");
      const removing = command.kind === "delete_activity";
      const start = removing ? parent.startsAt : new Date(command.startsAt);
      ensure(assertQuarterHour(start), "invalid_interval");
      const delta = start.getTime() - parent.startsAt.getTime();
      const end = new Date(parent.endsAt.getTime() + delta);
      dates(parent.startsAt, parent.endsAt);
      if (!removing) dates(start, end);
      for (const row of reservations) {
        const shift = !removing && command.policy === "shift";
        const rowStart = new Date(row.startsAt.getTime() + (shift ? delta : 0));
        const rowEnd = new Date(row.endsAt.getTime() + (shift ? delta : 0));
        let colorKey = row.colorKey;
        if (removing && command.policy === "keep") {
          const todo = await activeTodo(tx, workspaceId, row.todoId);
          const list = await activeList(tx, workspaceId, todo.listId);
          colorKey = list.colorKey;
        }
        await tx.todoReservation.update({
          where: { workspaceId_id: { workspaceId, id: row.id } },
          data: {
            startsAt: rowStart,
            endsAt: rowEnd,
            parentActivityId: removing ? null : parent.id,
            removedAt: removing && command.policy === "remove" ? now : null,
            colorKey,
            revision: { increment: 1 },
          },
        });
        await recordReservation(tx, workspaceId, row.id);
        dates(row.startsAt, row.endsAt);
        dates(rowStart, rowEnd);
      }
      for (const row of activities) {
        ensure(row.startsAt && row.endsAt, "interval_required");
        const shift = !removing && command.policy === "shift";
        const rowStart = new Date(row.startsAt.getTime() + (shift ? delta : 0));
        const rowEnd = new Date(row.endsAt.getTime() + (shift ? delta : 0));
        const keepParent = !removing && contains(start, end, rowStart, rowEnd);
        await tx.agendaActivity.update({
          where: { workspaceId_id: { workspaceId, id: row.id } },
          data: {
            startsAt: rowStart,
            endsAt: rowEnd,
            parentActivityId: keepParent ? parent.id : null,
            removedAt: removing && command.policy === "remove" ? now : null,
            revision: { increment: 1 },
          },
        });
        await recordActivity(tx, workspaceId, row.id);
        dates(row.startsAt, row.endsAt);
        dates(rowStart, rowEnd);
      }
      const updated = await tx.agendaActivity.update({
        where: { workspaceId_id: { workspaceId, id: parent.id } },
        data: {
          startsAt: start,
          endsAt: end,
          removedAt: removing ? now : null,
          revision: { increment: 1 },
        },
      });
      await recordActivity(tx, workspaceId, parent.id);
      if (parent.parentActivityId) await touchParent(tx, workspaceId, parent.parentActivityId);
      return saved(updated.id, updated.revision);
    }
  }
}
