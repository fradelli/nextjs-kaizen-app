import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import {
  ScheduleMutationError,
  type ScheduleCommand,
  type ScheduleSaved,
} from "../application/schedule-command";
import { intervalDates, civilDate } from "../domain/schedule-time";
import { recordActivityRows, recordReservationRows } from "./schedule-history";

export async function updateClassification(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  command: Extract<ScheduleCommand, { kind: "update_tag" | "update_list" }>,
  now: Date,
): Promise<ScheduleSaved> {
  const affected = new Set<string>();
  const dates = (start: Date, end: Date) =>
    intervalDates(start, end).forEach((date) => affected.add(date));
  if (command.kind === "update_tag") {
    const tag = await tx.agendaTag.findFirst({
      where: { workspaceId, id: command.tagId, archivedAt: null },
    });
    if (!tag) throw new ScheduleMutationError("missing", "tag_missing");
    if (tag.revision !== command.expectedRevision)
      throw new ScheduleMutationError("conflict", "revision_changed");
    if (tag.systemKey && command.name !== tag.name)
      throw new ScheduleMutationError("invalid", "immutable_tag");
    const row = await tx.agendaTag.update({
      where: { workspaceId_id: { workspaceId, id: tag.id } },
      data: { name: command.name, colorKey: command.colorKey, revision: { increment: 1 } },
    });
    const activities = await tx.agendaActivity.updateManyAndReturn({
      where: {
        workspaceId,
        tagId: tag.id,
        removedAt: null,
        OR: [
          { startsAt: { gte: now } },
          {
            scheduledDate: {
              gte: new Date(civilDate(now)),
            },
          },
        ],
      },
      data: { colorKey: command.colorKey, revision: { increment: 1 } },
    });
    await recordActivityRows(tx, workspaceId, activities);
    for (const activity of activities) {
      if (activity.startsAt && activity.endsAt) dates(activity.startsAt, activity.endsAt);
      if (activity.scheduledDate) affected.add(activity.scheduledDate.toISOString().slice(0, 10));
    }
    const reservations = await tx.todoReservation.updateManyAndReturn({
      where: {
        workspaceId,
        parentActivityId: { in: activities.map((activity) => activity.id) },
        removedAt: null,
        startsAt: { gte: now },
      },
      data: { colorKey: command.colorKey, revision: { increment: 1 } },
    });
    await recordReservationRows(tx, workspaceId, reservations);
    reservations.forEach((reservation) => dates(reservation.startsAt, reservation.endsAt));
    return {
      status: "saved",
      id: row.id,
      revision: row.revision,
      affectedDates: [...affected].sort(),
    };
  }
  const list = await tx.todoList.findFirst({
    where: { workspaceId, id: command.listId, archivedAt: null },
  });
  if (!list) throw new ScheduleMutationError("missing", "list_missing");
  if (list.revision !== command.expectedRevision)
    throw new ScheduleMutationError("conflict", "revision_changed");
  const row = await tx.todoList.update({
    where: { workspaceId_id: { workspaceId, id: list.id } },
    data: { name: command.name, colorKey: command.colorKey, revision: { increment: 1 } },
  });
  if (list.colorKey !== command.colorKey) {
    const todos = await tx.todo.findMany({
      where: { workspaceId, listId: list.id, archivedAt: null },
      orderBy: { id: "asc" },
    });
    const latest = await tx.todoPlacementVersion.findMany({
      where: { workspaceId, todoId: { in: todos.map((todo) => todo.id) } },
      orderBy: [{ todoId: "asc" }, { effectiveFrom: "desc" }],
      distinct: ["todoId"],
    });
    const previous = new Map(latest.map((placement) => [placement.todoId, placement]));
    if (todos.some((todo) => !previous.has(todo.id)))
      throw new ScheduleMutationError("invalid", "placement_missing");
    const placements = await tx.todoPlacementVersion.createManyAndReturn({
      data: todos.map((todo) => ({
        workspaceId,
        todoId: todo.id,
        listId: list.id,
        colorKey: command.colorKey,
        effectiveFrom: new Date(
          Math.max(now.getTime(), previous.get(todo.id)!.effectiveFrom.getTime() + 1),
        ),
      })),
    });
    for (const placement of placements) {
      const reservations = await tx.todoReservation.updateManyAndReturn({
        where: {
          workspaceId,
          todoId: placement.todoId,
          parentActivityId: null,
          removedAt: null,
          startsAt: { gte: now },
        },
        data: {
          colorKey: command.colorKey,
          placementVersionId: placement.id,
          revision: { increment: 1 },
        },
      });
      await recordReservationRows(tx, workspaceId, reservations);
      reservations.forEach((reservation) => dates(reservation.startsAt, reservation.endsAt));
    }
  }

  return {
    status: "saved",
    id: row.id,
    revision: row.revision,
    affectedDates: [...affected].sort(),
  };
}
