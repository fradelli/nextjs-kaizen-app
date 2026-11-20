import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { ScheduleMutationError } from "../application/schedule-command";
import { recordReservationRows, recordTodoRows, touchActivityParents } from "./schedule-history";
import { intervalDates } from "../domain/schedule-time";

// One placement version per task, one bulk update/history write per reservation group.
// All calls stay inside the caller's serializable transaction.
export async function moveTodosToList(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  todos: readonly Prisma.TodoGetPayload<object>[],
  list: Prisma.TodoListGetPayload<object>,
  now: Date,
) {
  const changed = todos.filter((todo) => todo.listId !== list.id);
  if (!changed.length) return [];
  const latest = await tx.todoPlacementVersion.findMany({
    where: { workspaceId, todoId: { in: changed.map((row) => row.id) } },
    orderBy: [{ todoId: "asc" }, { effectiveFrom: "desc" }],
    distinct: ["todoId"],
  });
  const previous = new Map(latest.map((row) => [row.todoId, row]));
  if (changed.some((todo) => !previous.has(todo.id)))
    throw new ScheduleMutationError("invalid", "placement_missing");
  const placements = await tx.todoPlacementVersion.createManyAndReturn({
    data: changed.map((todo) => ({
      workspaceId,
      todoId: todo.id,
      listId: list.id,
      colorKey: list.colorKey,
      effectiveFrom: new Date(
        Math.max(now.getTime(), previous.get(todo.id)!.effectiveFrom.getTime() + 1),
      ),
    })),
  });
  const parents = new Set<string>();
  const dates = new Set<string>();
  const future = await tx.todoReservation.findMany({
    where: {
      workspaceId,
      todoId: { in: changed.map((row) => row.id) },
      startsAt: { gte: now },
      removedAt: null,
    },
    select: { id: true, todoId: true, parentActivityId: true },
  });
  const reservationIdsByTodo = new Map<string, string[]>();
  future.forEach((row) => {
    if (row.parentActivityId) parents.add(row.parentActivityId);
    const ids = reservationIdsByTodo.get(row.todoId) ?? [];
    ids.push(row.id);
    reservationIdsByTodo.set(row.todoId, ids);
  });
  for (const placement of placements) {
    const reservationIds = reservationIdsByTodo.get(placement.todoId);
    if (!reservationIds?.length) continue;
    const rows = await tx.todoReservation.updateManyAndReturn({
      where: {
        workspaceId,
        id: { in: reservationIds },
      },
      data: {
        parentActivityId: null,
        placementVersionId: placement.id,
        colorKey: list.colorKey,
        revision: { increment: 1 },
      },
    });
    await recordReservationRows(tx, workspaceId, rows);
    rows.forEach((row) =>
      intervalDates(row.startsAt, row.endsAt).forEach((date) => dates.add(date)),
    );
  }
  await touchActivityParents(tx, workspaceId, [...parents]);
  const updated = await tx.todo.updateManyAndReturn({
    where: { workspaceId, id: { in: changed.map((row) => row.id) } },
    data: { listId: list.id, revision: { increment: 1 } },
  });
  await recordTodoRows(tx, workspaceId, updated);
  return [...dates].sort();
}
