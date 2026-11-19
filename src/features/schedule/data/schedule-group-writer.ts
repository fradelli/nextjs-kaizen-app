import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import {
  ScheduleMutationError,
  type ScheduleCommand,
  type ScheduleSaved,
} from "../application/schedule-command";
import { intervalDates } from "../domain/schedule-time";
import { moveTodosToList } from "./schedule-todo-placement-writer";
import { recordReservationRows, recordTodoRows, touchActivityParents } from "./schedule-history";

export async function deleteTodoGroup(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  command: Extract<ScheduleCommand, { kind: "delete_list" }>,
  now: Date,
): Promise<ScheduleSaved> {
  const list = await tx.todoList.findFirst({
    where: { workspaceId, id: command.listId, archivedAt: null },
  });
  if (!list) throw new ScheduleMutationError("missing", "list_missing");
  if (list.revision !== command.expectedRevision)
    throw new ScheduleMutationError("conflict", "revision_changed");
  if (list.systemKey === "inbox") throw new ScheduleMutationError("invalid", "inbox_required");
  const todos = await tx.todo.findMany({
    where: { workspaceId, listId: list.id, archivedAt: null },
    orderBy: { id: "asc" },
  });
  const target =
    command.policy === "keep" && todos.length > 0
      ? await tx.todoList.upsert({
          where: { workspaceId_systemKey: { workspaceId, systemKey: "inbox" } },
          create: { workspaceId, systemKey: "inbox", name: "Inbox" },
          update: {},
        })
      : null;
  const dates = new Set<string>();
  if (target)
    (await moveTodosToList(tx, workspaceId, todos, target, now)).forEach((date) => dates.add(date));
  else if (todos.length > 0) {
    const removed = await tx.todoReservation.updateManyAndReturn({
      where: {
        workspaceId,
        todoId: { in: todos.map((row) => row.id) },
        removedAt: null,
        startsAt: { gte: now },
      },
      data: { removedAt: now, revision: { increment: 1 } },
    });
    await recordReservationRows(tx, workspaceId, removed);
    await touchActivityParents(
      tx,
      workspaceId,
      removed.flatMap((row) => (row.parentActivityId ? [row.parentActivityId] : [])),
    );
    removed.forEach((row) =>
      intervalDates(row.startsAt, row.endsAt).forEach((date) => dates.add(date)),
    );
    const archived = await tx.todo.updateManyAndReturn({
      where: { workspaceId, id: { in: todos.map((row) => row.id) } },
      data: { archivedAt: now, revision: { increment: 1 } },
    });
    await recordTodoRows(tx, workspaceId, archived);
  }
  const updated = await tx.todoList.update({
    where: { workspaceId_id: { workspaceId, id: list.id } },
    data: { archivedAt: now, revision: { increment: 1 } },
  });
  return {
    status: "saved",
    id: list.id,
    revision: updated.revision,
    affectedDates: [...dates].sort(),
    affectedGroupIds: [list.id, ...(target ? [target.id] : [])],
    affectedTodoIds: todos.map((todo) => todo.id),
  };
}
