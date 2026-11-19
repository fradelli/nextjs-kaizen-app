import "server-only";
import type { PrismaClient } from "@/generated/prisma/client";
import type { TodoListPage, TodoPage } from "../application/todo-list-page";

function pageSize(value: number) {
  if (!Number.isInteger(value) || value < 1 || value > 100)
    throw new RangeError("Invalid page size");
  return value;
}

export async function readTodoLists(
  db: PrismaClient,
  workspaceId: string,
  after: string | null = null,
  limit = 30,
): Promise<TodoListPage> {
  const rows = await db.todoList.findMany({
    where: { workspaceId, archivedAt: null, ...(after ? { id: { gt: after } } : {}) },
    orderBy: { id: "asc" },
    take: pageSize(limit) + 1,
    select: {
      id: true,
      systemKey: true,
      name: true,
      colorKey: true,
      revision: true,
      _count: { select: { todos: { where: { archivedAt: null, completedAt: null } } } },
    },
  });
  return {
    items: rows
      .slice(0, limit)
      .map(({ _count, ...list }) => ({ ...list, incompleteCount: _count.todos })),
    nextCursor: rows.length > limit ? rows[limit - 1].id : null,
  };
}

export async function readTodos(
  db: PrismaClient,
  workspaceId: string,
  listId: string,
  after: string | null = null,
  limit = 30,
): Promise<TodoPage> {
  const rows = await db.todo.findMany({
    where: {
      workspaceId,
      listId,
      archivedAt: null,
      list: { archivedAt: null },
      ...(after ? { id: { gt: after } } : {}),
    },
    orderBy: { id: "asc" },
    take: pageSize(limit) + 1,
    select: {
      id: true,
      listId: true,
      title: true,
      revision: true,
      estimatedMinutes: true,
      completedAt: true,
    },
  });
  return {
    items: rows
      .slice(0, limit)
      .map((row) => ({ ...row, completedAt: row.completedAt?.toISOString() ?? null })),
    nextCursor: rows.length > limit ? rows[limit - 1].id : null,
  };
}
