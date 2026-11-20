import { describe, expect, it } from "vitest";
import { withAgendaDatabase } from "./fixtures/agenda-database.fixture";

describe("agenda foundation on PostgreSQL", () => {
  it("preserves one task across reservations outside its parent and rejects invalid relations", () =>
    withAgendaDatabase(async (db) => {
      const workspace = await db.workspace.create({ data: {} });
      const foreign = await db.workspace.create({ data: {} });
      const list = await db.todoList.create({
        data: { workspaceId: workspace.id, name: "Trabalho" },
      });
      const task = await db.todo.create({
        data: { workspaceId: workspace.id, listId: list.id, title: "Revisar PR" },
      });
      const placement = await db.todoPlacementVersion.create({
        data: {
          workspaceId: workspace.id,
          todoId: task.id,
          listId: list.id,
          effectiveFrom: new Date("2026-11-16T00:00:00Z"),
        },
      });
      const parent = await db.agendaActivity.create({
        data: {
          workspaceId: workspace.id,
          title: "Trabalho",
          startsAt: new Date("2026-11-17T14:00:00Z"),
          endsAt: new Date("2026-11-17T17:00:00Z"),
        },
      });
      const reservation = {
        workspaceId: workspace.id,
        todoId: task.id,
        placementVersionId: placement.id,
        parentActivityId: parent.id,
        startsAt: new Date("2026-11-17T12:30:00Z"),
        endsAt: new Date("2026-11-17T13:00:00Z"),
      };
      await db.todoReservation.create({ data: reservation });
      await db.todoReservation.create({
        data: {
          ...reservation,
          startsAt: new Date("2026-11-18T12:30:00Z"),
          endsAt: new Date("2026-11-18T13:00:00Z"),
        },
      });
      await db.todo.update({
        where: { id: task.id },
        data: { completedAt: new Date("2026-11-17T13:00:00Z") },
      });
      expect(await db.todo.count()).toBe(1);
      expect(await db.todoReservation.count({ where: { todoId: task.id } })).toBe(2);
      await expect(
        db.todoReservation.create({
          data: { ...reservation, startsAt: new Date("2026-11-17T12:17:00Z") },
        }),
      ).rejects.toThrow();
      await expect(
        db.todoReservation.create({ data: { ...reservation, workspaceId: foreign.id } }),
      ).rejects.toThrow();
      await expect(
        db.agendaActivity.create({
          data: { workspaceId: workspace.id, title: "Sem data" },
        }),
      ).rejects.toThrow();
      await expect(db.agendaActivity.delete({ where: { id: parent.id } })).rejects.toThrow();
      await db.$transaction([
        db.todoReservation.updateMany({
          where: { parentActivityId: parent.id },
          data: { parentActivityId: null },
        }),
        db.agendaActivity.update({
          where: { id: parent.id },
          data: { removedAt: new Date() },
        }),
      ]);
      expect(await db.todoReservation.count({ where: { parentActivityId: null } })).toBe(2);
      expect(
        (await db.todo.findUniqueOrThrow({ where: { id: task.id } })).completedAt,
      ).not.toBeNull();
    }));
});
