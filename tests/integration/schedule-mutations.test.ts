import { randomUUID } from "node:crypto";
import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { PrismaScheduleRepository } from "@/features/schedule/data/prisma-schedule-repository";
import { readScheduleRange } from "@/features/schedule/data/read-schedule-range";
import type {
  ScheduleResult,
  ScheduleSaved,
} from "@/features/schedule/application/schedule-command";
import { withAgendaDatabase } from "./fixtures/agenda-database.fixture";
import type { PrismaClient } from "@/generated/prisma/client";

function saved(result: ScheduleResult): ScheduleSaved {
  expect(result.status).toBe("saved");
  if (result.status !== "saved") throw new Error(JSON.stringify(result));
  return result;
}

async function setup(db: PrismaClient) {
  const workspace = await db.workspace.create({ data: {} });
  let now = new Date("2026-11-16T10:00:00Z");
  const repo = new PrismaScheduleRepository(db, workspace.id, () => now);
  const list = saved(
    await repo.execute({
      operationId: randomUUID(),
      kind: "create_list",
      name: "Trabalho",
      colorKey: "purple",
    }),
  );
  const task = saved(
    await repo.execute({
      operationId: randomUUID(),
      kind: "create_todo",
      listId: list.id,
      title: "Revisar PR",
      estimatedMinutes: null,
    }),
  );
  const parent = saved(
    await repo.execute({
      operationId: randomUUID(),
      kind: "create_activity",
      title: "Trabalho",
      startsAt: "2026-11-17T12:00:00Z",
      endsAt: "2026-11-17T15:00:00Z",
    }),
  );
  return {
    workspaceId: workspace.id,
    repo,
    task,
    parent,
    setNow: (date: string) => {
      now = new Date(date);
    },
  };
}

describe("schedule transactional operations", () => {
  it("reuses Inbox and archives a deleted group while preserving its tasks and history", () =>
    withAgendaDatabase(async (db) => {
      const { repo, workspaceId, task } = await setup(db);
      const first = saved(
        await repo.execute({
          kind: "create_todo",
          operationId: randomUUID(),
          listId: null,
          title: "Read",
          estimatedMinutes: null,
        }),
      );
      const second = saved(
        await repo.execute({
          kind: "create_todo",
          operationId: randomUUID(),
          listId: null,
          title: "Write",
          estimatedMinutes: null,
        }),
      );
      expect(first.group?.id).toBe(second.group?.id);
      const todo = await db.todo.findUniqueOrThrow({ where: { id: task.id } });
      saved(
        await repo.execute({
          kind: "delete_list",
          operationId: randomUUID(),
          listId: todo.listId,
          expectedRevision: 0,
          policy: "keep",
        }),
      );
      expect((await db.todo.findUniqueOrThrow({ where: { id: task.id } })).listId).toBe(
        first.group?.id,
      );
      expect(await db.todoList.count({ where: { workspaceId, systemKey: "inbox" } })).toBe(1);
      expect(
        (await db.todoList.findUniqueOrThrow({ where: { id: todo.listId } })).archivedAt,
      ).not.toBeNull();
      expect(await db.todoRevision.count({ where: { entityId: task.id } })).toBeGreaterThan(1);
    }));
  it("archives tasks when deleting a group without deleting history rows", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task } = await setup(db);
      const todo = await db.todo.findUniqueOrThrow({ where: { id: task.id } });
      saved(
        await repo.execute({
          kind: "delete_list",
          operationId: randomUUID(),
          listId: todo.listId,
          expectedRevision: 0,
          policy: "remove",
        }),
      );
      expect(
        (await db.todo.findUniqueOrThrow({ where: { id: task.id } })).archivedAt,
      ).not.toBeNull();
      expect(await db.todoRevision.count({ where: { entityId: task.id } })).toBe(2);
    }));
  it("creates a dateless-time activity, edits it and preserves one identity across dates", () =>
    withAgendaDatabase(async (db) => {
      const { repo, workspaceId } = await setup(db);
      const activity = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_activity",
          title: "Buscar encomenda",
          scheduledDate: "2026-11-18",
        }),
      );
      const dateOnly = await readScheduleRange(
        db,
        workspaceId,
        new Date("2026-11-18T03:00:00Z"),
        new Date("2026-11-19T03:00:00Z"),
      );
      expect(
        dateOnly.activities.some((row) => row.id === activity.id && row.startsAt === null),
      ).toBe(true);
      const edited = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "update_activity",
          activityId: activity.id,
          expectedRevision: 0,
          title: "Viagem",
          scheduledDate: null,
          tagId: null,
          policy: "keep",
          startsAt: "2026-11-18T00:00:00Z",
          endsAt: "2026-11-20T15:00:00Z",
        }),
      );
      expect(edited.id).toBe(activity.id);
      expect(await db.agendaActivityRevision.count({ where: { entityId: activity.id } })).toBe(2);
      expect(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_activity",
          title: "Horário inválido",
          startsAt: "2026-11-18T12:17:00Z",
          endsAt: "2026-11-18T13:00:00Z",
        }),
      ).toEqual({ status: "invalid", code: "invalid_interval" });
    }));

  it("creates a block and reservation atomically and unschedules only that reservation", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task } = await setup(db);
      const command = {
        operationId: randomUUID(),
        kind: "reserve_new",
        todoId: task.id,
        expectedRevision: 0,
        startsAt: "2026-11-18T12:00:00Z",
      };
      const reservation = saved(await repo.execute(command));
      expect(await repo.execute(command)).toEqual(reservation);
      expect(await db.todoReservation.count()).toBe(1);
      expect(await db.agendaActivity.count()).toBe(2);
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "remove_reservation",
          reservationId: reservation.id,
          expectedRevision: reservation.revision,
        }),
      );
      expect(await db.todo.count()).toBe(1);
      expect(await db.todoReservation.count({ where: { removedAt: null } })).toBe(0);
    }));

  it("changes future list colors while preserving ended reservations and fixed tag names", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent, workspaceId, setNow } = await setup(db);
      for (const [index, hour] of ["12:00", "13:00"].entries()) {
        saved(
          await repo.execute({
            operationId: randomUUID(),
            kind: "reserve",
            todoId: task.id,
            expectedRevision: 0,
            parentActivityId: parent.id,
            expectedParentRevision: index,
            startsAt: "2026-11-17T" + hour + ":00Z",
          }),
        );
      }
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "delete_activity",
          activityId: parent.id,
          expectedRevision: 2,
          policy: "keep",
        }),
      );
      setNow("2026-11-17T12:45:00Z");
      const taskRow = await db.todo.findUniqueOrThrow({ where: { id: task.id } });
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "update_list",
          listId: taskRow.listId,
          expectedRevision: 0,
          name: "Projeto",
          colorKey: "blue",
        }),
      );
      const rows = await db.todoReservation.findMany({ orderBy: { startsAt: "asc" } });
      expect(rows.map((row) => row.colorKey)).toEqual(["purple", "blue"]);
      const tag = await db.agendaTag.findFirstOrThrow({
        where: { workspaceId, systemKey: "training" },
      });
      expect(
        await repo.execute({
          operationId: randomUUID(),
          kind: "update_tag",
          tagId: tag.id,
          expectedRevision: 0,
          name: "Outro nome",
          colorKey: "blue",
        }),
      ).toEqual({ status: "invalid", code: "immutable_tag" });
    }));

  it("keeps past activity colors when a tag changes and rolls back invalid resizing", () =>
    withAgendaDatabase(async (db) => {
      const { repo, parent, task, workspaceId, setNow } = await setup(db);
      const tag = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_tag",
          name: "Estudo",
          colorKey: "purple",
        }),
      );
      const past = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_activity",
          title: "Passado",
          tagId: tag.id,
          startsAt: "2026-11-16T12:00:00Z",
          endsAt: "2026-11-16T13:00:00Z",
        }),
      );
      const future = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_activity",
          title: "Futuro",
          tagId: tag.id,
          startsAt: "2026-11-18T12:00:00Z",
          endsAt: "2026-11-18T13:00:00Z",
        }),
      );
      setNow("2026-11-17T10:00:00Z");
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "update_tag",
          tagId: tag.id,
          expectedRevision: 0,
          name: "Estudo",
          colorKey: "blue",
        }),
      );
      const visible = await readScheduleRange(
        db,
        workspaceId,
        new Date("2026-11-16T03:00:00Z"),
        new Date("2026-11-19T03:00:00Z"),
      );
      expect(visible.activities.find((row) => row.id === past.id)?.colorKey).toBe("purple");
      expect(visible.activities.find((row) => row.id === future.id)?.colorKey).toBe("blue");
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "reserve",
          todoId: task.id,
          expectedRevision: 0,
          parentActivityId: parent.id,
          expectedParentRevision: 0,
          startsAt: "2026-11-17T14:00:00Z",
        }),
      );
      expect(
        await repo.execute({
          operationId: randomUUID(),
          kind: "update_activity",
          activityId: parent.id,
          expectedRevision: 1,
          title: "Não deve salvar",
          tagId: null,
          scheduledDate: null,
          policy: "keep",
          startsAt: "2026-11-17T12:00:00Z",
          endsAt: "2026-11-17T14:15:00Z",
        }),
      ).toEqual({ status: "invalid", code: "occupied" });
      expect((await db.agendaActivity.findUniqueOrThrow({ where: { id: parent.id } })).title).toBe(
        "Trabalho",
      );
    }));
  it("returns one persisted creation when the same operation is sent concurrently", () =>
    withAgendaDatabase(async (db) => {
      const { repo } = await setup(db);
      const command = {
        operationId: randomUUID(),
        kind: "create_activity",
        title: "Inglês",
        startsAt: "2026-11-17T20:00:00Z",
        endsAt: "2026-11-17T20:30:00Z",
      };
      const [first, second] = await Promise.all([repo.execute(command), repo.execute(command)]);
      expect(saved(first)).toEqual(saved(second));
      expect(await db.agendaActivity.count({ where: { title: "Inglês" } })).toBe(1);
    }));
  it("shifts children by the same offset and removes reservations without deleting the task", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent } = await setup(db);
      const reservation = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "reserve",
          todoId: task.id,
          expectedRevision: 0,
          parentActivityId: parent.id,
          expectedParentRevision: 0,
          startsAt: "2026-11-17T12:30:00Z",
        }),
      );
      const daily = await db.agendaActivity.create({
        data: {
          workspaceId: (await db.todo.findUniqueOrThrow({ where: { id: task.id } })).workspaceId,
          title: "Daily",
          parentActivityId: parent.id,
          startsAt: new Date("2026-11-17T13:00:00Z"),
          endsAt: new Date("2026-11-17T13:15:00Z"),
        },
      });
      const moved = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "move_activity",
          activityId: parent.id,
          expectedRevision: 1,
          startsAt: "2026-11-17T14:00:00Z",
          policy: "shift",
        }),
      );
      expect(
        (
          await db.todoReservation.findUniqueOrThrow({ where: { id: reservation.id } })
        ).startsAt.toISOString(),
      ).toBe("2026-11-17T14:30:00.000Z");
      expect(
        (
          await db.agendaActivity.findUniqueOrThrow({ where: { id: daily.id } })
        ).startsAt?.toISOString(),
      ).toBe("2026-11-17T15:00:00.000Z");
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "delete_activity",
          activityId: parent.id,
          expectedRevision: moved.revision,
          policy: "remove",
        }),
      );
      expect(await db.todo.count()).toBe(1);
      expect(await db.todoReservation.count({ where: { removedAt: null } })).toBe(0);
      expect(
        (await db.agendaActivity.findUniqueOrThrow({ where: { id: daily.id } })).removedAt,
      ).not.toBeNull();
    }));

  it("rolls back child updates, history and receipt when removing the parent fails", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent } = await setup(db);
      const reservation = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "reserve",
          todoId: task.id,
          expectedRevision: 0,
          parentActivityId: parent.id,
          expectedParentRevision: 0,
          startsAt: "2026-11-17T12:30:00Z",
        }),
      );
      await db.$executeRawUnsafe(`
        CREATE FUNCTION reject_agenda_removal() RETURNS trigger LANGUAGE plpgsql AS $$
        BEGIN
          IF NEW.removed_at IS NOT NULL THEN RAISE EXCEPTION 'test failure'; END IF;
          RETURN NEW;
        END $$`);
      await db.$executeRawUnsafe(`
        CREATE TRIGGER reject_agenda_removal BEFORE UPDATE ON agenda_activity
        FOR EACH ROW EXECUTE FUNCTION reject_agenda_removal()`);
      const operationId = randomUUID();
      await expect(
        repo.execute({
          operationId,
          kind: "delete_activity",
          activityId: parent.id,
          expectedRevision: 1,
          policy: "keep",
        }),
      ).rejects.toThrow();
      const row = await db.todoReservation.findUniqueOrThrow({ where: { id: reservation.id } });
      expect(row.parentActivityId).toBe(parent.id);
      expect(row.revision).toBe(0);
      expect(await db.todoReservationRevision.count({ where: { entityId: row.id } })).toBe(1);
      expect(await db.agendaMutationReceipt.count({ where: { operationId } })).toBe(0);
    }));

  it("does not allow a repository for another workspace to mutate a task", () =>
    withAgendaDatabase(async (db) => {
      const { task } = await setup(db);
      const other = await db.workspace.create({ data: {} });
      const repo = new PrismaScheduleRepository(db, other.id);
      expect(
        await repo.execute({
          operationId: randomUUID(),
          kind: "complete",
          todoId: task.id,
          expectedRevision: 0,
          completed: true,
        }),
      ).toEqual({ status: "missing", code: "todo_missing" });
    }));
  it("keeps an external reservation and its task when removing the parent, with persistent history", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent, workspaceId } = await setup(db);
      const reservation = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "reserve",
          todoId: task.id,
          expectedRevision: 0,
          parentActivityId: parent.id,
          expectedParentRevision: 0,
          startsAt: "2026-11-17T12:30:00Z",
        }),
      );
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "move_activity",
          activityId: parent.id,
          expectedRevision: 1,
          startsAt: "2026-11-17T14:00:00Z",
          policy: "keep",
        }),
      );
      let row = await db.todoReservation.findUniqueOrThrow({ where: { id: reservation.id } });
      expect(row.parentActivityId).toBe(parent.id);
      expect(row.startsAt.toISOString()).toBe("2026-11-17T12:30:00.000Z");
      const range = await readScheduleRange(
        db,
        parent.id,
        new Date("2026-11-17T12:00:00Z"),
        new Date("2026-11-17T13:00:00Z"),
      );
      expect(range.reservations).toHaveLength(0);
      const visible = await readScheduleRange(
        db,
        workspaceId,
        new Date("2026-11-17T12:00:00Z"),
        new Date("2026-11-17T13:00:00Z"),
      );
      expect(visible.activities).toHaveLength(0);
      expect(visible.reservations[0].parentTitle).toBe("Trabalho");
      const deletion = {
        operationId: randomUUID(),
        kind: "delete_activity",
        activityId: parent.id,
        expectedRevision: 2,
        policy: "keep",
      };
      const result = saved(await repo.execute(deletion));
      expect(await repo.execute(deletion)).toEqual(result);
      row = await db.todoReservation.findUniqueOrThrow({ where: { id: reservation.id } });
      expect(row.parentActivityId).toBeNull();
      expect(row.removedAt).toBeNull();
      expect(row.colorKey).toBe("purple");
      expect(await db.todoReservationRevision.count({ where: { entityId: row.id } })).toBe(3);
      expect(await db.todo.count()).toBe(1);
      expect(
        (await db.agendaActivity.findUniqueOrThrow({ where: { id: parent.id } })).removedAt,
      ).not.toBeNull();
    }));

  it("moves only future reservations on list change and preserves running and ended placements", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent, setNow } = await setup(db);
      for (const [index, start] of ["12:00", "12:30", "13:00"].entries()) {
        saved(
          await repo.execute({
            operationId: randomUUID(),
            kind: "reserve",
            todoId: task.id,
            expectedRevision: 0,
            parentActivityId: parent.id,
            expectedParentRevision: index,
            startsAt: "2026-11-17T" + start + ":00Z",
          }),
        );
      }
      const target = saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "create_list",
          name: "Pessoal",
          colorKey: null,
        }),
      );
      setNow("2026-11-17T12:45:00Z");
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "change_list",
          todoId: task.id,
          expectedRevision: 0,
          listId: target.id,
        }),
      );
      const rows = await db.todoReservation.findMany({ orderBy: { startsAt: "asc" } });
      expect(rows.map((row) => row.parentActivityId)).toEqual([parent.id, parent.id, null]);
      expect(rows[0].placementVersionId).toBe(rows[1].placementVersionId);
      expect(rows[2].placementVersionId).not.toBe(rows[1].placementVersionId);
      saved(
        await repo.execute({
          operationId: randomUUID(),
          kind: "complete",
          todoId: task.id,
          expectedRevision: 1,
          completed: true,
        }),
      );
      expect(await db.todo.count()).toBe(1);
      expect(await db.todoReservation.count()).toBe(3);
      expect(
        (await db.todo.findUniqueOrThrow({ where: { id: task.id } })).completedAt,
      ).not.toBeNull();
    }));

  it("fits remaining time and rejects simultaneous reservations in the same gap", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent } = await setup(db);
      const results = await Promise.all(
        [0, 1].map(() =>
          repo.execute({
            operationId: randomUUID(),
            kind: "reserve",
            todoId: task.id,
            expectedRevision: 0,
            parentActivityId: parent.id,
            expectedParentRevision: 0,
            startsAt: "2026-11-17T14:45:00Z",
          }),
        ),
      );
      expect(results.filter((result) => result.status === "saved")).toHaveLength(1);
      expect(results.filter((result) => result.status === "conflict")).toHaveLength(1);
      const row = await db.todoReservation.findFirstOrThrow();
      expect(row.endsAt.toISOString()).toBe("2026-11-17T15:00:00.000Z");
      expect(await db.todoReservation.count()).toBe(1);
    }));

  it("rejects stale dialogs and reused operation keys with different data", () =>
    withAgendaDatabase(async (db) => {
      const { repo, task, parent } = await setup(db);
      const command = {
        operationId: randomUUID(),
        kind: "reserve",
        todoId: task.id,
        expectedRevision: 0,
        parentActivityId: parent.id,
        expectedParentRevision: 0,
        startsAt: "2026-11-17T12:00:00Z",
      };
      saved(await repo.execute(command));
      expect(await repo.execute({ ...command, startsAt: "2026-11-17T13:00:00Z" })).toEqual({
        status: "conflict",
        code: "operation_reused",
      });
      expect(
        await repo.execute({
          operationId: randomUUID(),
          kind: "delete_activity",
          activityId: parent.id,
          expectedRevision: 0,
          policy: "remove",
        }),
      ).toEqual({ status: "conflict", code: "revision_changed" });
      expect(await db.todoReservation.count({ where: { removedAt: null } })).toBe(1);
    }));
});
