import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import type { ScheduleRange } from "../application/schedule-range";
import type {
  ScheduleCommand,
  ScheduleSaved,
  SchedulePatch,
} from "../application/schedule-command";
import { readScheduleRange } from "./read-schedule-range";

export async function readScheduleMutationPatch(
  db: PrismaClient,
  workspaceId: string,
  command: ScheduleCommand,
  saved: Pick<
    ScheduleSaved,
    "id" | "affectedDates" | "affectedGroupIds" | "affectedTodoIds" | "group"
  >,
  cachedDates: readonly string[] = [],
  refreshCalendar = false,
): Promise<SchedulePatch> {
  // A successful empty-group deletion already tells us the complete client change.
  // Conflicts and legacy receipts still need the authoritative read below.
  if (
    !refreshCalendar &&
    command.kind === "delete_list" &&
    saved.affectedTodoIds?.length === 0 &&
    saved.affectedGroupIds?.length === 1 &&
    saved.affectedGroupIds[0] === saved.id &&
    saved.affectedDates.length === 0
  ) {
    return {
      groups: [],
      removedGroupIds: [saved.id],
      todos: [],
      removedTodoIds: [],
      tags: [],
    };
  }
  const todoIds = new Set(saved.affectedTodoIds ?? []);
  if (["create_todo", "update_todo", "complete", "change_list"].includes(command.kind))
    todoIds.add(saved.id);
  const rows = todoIds.size
    ? await db.todo.findMany({ where: { workspaceId, id: { in: [...todoIds] } } })
    : [];
  const groupIds = new Set(saved.affectedGroupIds ?? []);
  if (["create_list", "update_list", "delete_list"].includes(command.kind)) groupIds.add(saved.id);
  if (saved.group) groupIds.add(saved.group.id);
  rows.forEach((row) => groupIds.add(row.listId));
  const groups = groupIds.size
    ? await db.todoList.findMany({
        where: { workspaceId, id: { in: [...groupIds] }, archivedAt: null },
        select: {
          id: true,
          name: true,
          colorKey: true,
          systemKey: true,
          revision: true,
          _count: { select: { todos: { where: { archivedAt: null, completedAt: null } } } },
        },
      })
    : [];
  const tags =
    command.kind === "create_tag" || command.kind === "update_tag"
      ? await db.agendaTag.findMany({
          where: { workspaceId, id: saved.id, archivedAt: null },
          select: { id: true, name: true, colorKey: true, revision: true, systemKey: true },
        })
      : [];
  const patch: SchedulePatch = {
    groups: groups.map(({ _count, ...row }) => ({ ...row, incompleteCount: _count.todos })),
    removedGroupIds: [...groupIds].filter((id) => !groups.some((row) => row.id === id)),
    todos: rows
      .filter((row) => !row.archivedAt)
      .map((row) => ({
        id: row.id,
        listId: row.listId,
        title: row.title,
        revision: row.revision,
        estimatedMinutes: row.estimatedMinutes,
        completedAt: row.completedAt?.toISOString() ?? null,
      })),
    removedTodoIds: rows.filter((row) => row.archivedAt).map((row) => row.id),
    tags,
  };
  if (
    saved.affectedDates.length &&
    (refreshCalendar || (command.kind !== "complete" && command.kind !== "update_todo"))
  ) {
    const dates = [...new Set(saved.affectedDates)].sort();
    const requested = dates.filter((date) => cachedDates.includes(date));
    const range: ScheduleRange = { activities: [], reservations: [] };
    // Read only loaded affected dates, coalescing adjacent days instead of spanning distant months.
    for (let index = 0; index < requested.length;) {
      const start = new Date(requested[index] + "T00:00:00-03:00");
      let end = new Date(start.getTime() + 86400000);
      index++;
      while (
        index < requested.length &&
        new Date(requested[index] + "T00:00:00-03:00").getTime() === end.getTime()
      ) {
        end = new Date(end.getTime() + 86400000);
        index++;
      }
      const part = await readScheduleRange(db, workspaceId, start, end);
      range.activities.push(...part.activities);
      range.reservations.push(...part.reservations);
    }
    patch.calendar = {
      dates,
      refreshedDates: requested,
      range: {
        activities: [...new Map(range.activities.map((row) => [row.id, row])).values()],
        reservations: [...new Map(range.reservations.map((row) => [row.id, row])).values()],
      },
    };
  }
  return patch;
}
