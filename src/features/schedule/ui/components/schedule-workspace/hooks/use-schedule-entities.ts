import { useCallback, useEffect, useReducer, useState } from "react";
import type { SchedulePatch, ScheduleTag } from "../../../../application/schedule-command";
import type { TodoListPage, TodoPage } from "../../../../application/todo-list-page";
import type { ScheduleWorkspaceProps } from "../schedule-workspace.types";

function mergeRows<T extends { id: string; revision: number }>(
  old: readonly T[],
  next: readonly T[],
) {
  const rows = new Map(old.map((row) => [row.id, row]));
  for (const row of next)
    if ((rows.get(row.id)?.revision ?? -1) <= row.revision) rows.set(row.id, row);
  return [...rows.values()];
}
export function useScheduleEntities(
  props: Pick<
    ScheduleWorkspaceProps,
    "initialLists" | "initialTodos" | "tags" | "loadLists" | "loadTodos"
  >,
  report: () => void,
) {
  const [cache] = useState(() => ({
    listPages: new Map([
      ["current", { ...props.initialLists, items: [...props.initialLists.items] }],
    ]),
    todos: new Map<string, TodoPage>(
      props.initialTodos ? [[props.initialTodos.listId, props.initialTodos.page]] : [],
    ),
    tags: new Map<string, ScheduleTag>(props.tags.map((tag) => [tag.id, tag])),
    todoChanges: new Map<string, TodoPage["items"][number]>(),
    loading: new Set<string>(),
    removedTodos: new Set<string>(),
    removedGroups: new Set<string>(),
  }));
  const { loadTodos, loadLists } = props;
  const [snapshot, redraw] = useReducer(
    (previous) => ({
      version: previous.version + 1,
      todoChanges: new Map(cache.todoChanges),
      tags: [...cache.tags.values()],
    }),
    { version: 0, todoChanges: cache.todoChanges, tags: [...cache.tags.values()] },
  );
  const upsertGroup = useCallback(
    (row: TodoListPage["items"][number]) => {
      const current = cache.listPages.get("current")!;
      if (!current.items.some((item) => item.id === row.id))
        cache.todos.set(row.id, { items: [], nextCursor: null });
      cache.listPages.set("current", { ...current, items: mergeRows(current.items, [row]) });
      redraw();
    },
    [cache],
  );
  const upsertTodo = useCallback(
    (todo: TodoPage["items"][number]) => {
      const page = cache.todos.get(todo.listId);
      if (page) cache.todos.set(todo.listId, { ...page, items: mergeRows(page.items, [todo]) });
      cache.todoChanges.set(todo.id, todo);
      redraw();
    },
    [cache],
  );
  const applyPatch = useCallback(
    (patch: SchedulePatch) => {
      const current = cache.listPages.get("current")!;
      cache.listPages.set("current", {
        ...current,
        items: mergeRows(current.items, patch.groups).filter(
          (row) => !patch.removedGroupIds.includes(row.id),
        ),
      });
      patch.removedGroupIds.forEach((id) => {
        cache.todos.delete(id);
        cache.removedGroups.add(id);
      });
      patch.removedTodoIds.forEach((id) => cache.removedTodos.add(id));
      for (const [listId, page] of cache.todos) {
        const items = page.items.filter(
          (row) =>
            !patch.removedTodoIds.includes(row.id) &&
            !patch.todos.some((todo) => todo.id === row.id && todo.listId !== listId),
        );
        cache.todos.set(listId, {
          ...page,
          items: mergeRows(
            items,
            patch.todos.filter((todo) => todo.listId === listId),
          ),
        });
      }
      patch.todos.forEach((todo) => {
        if ((cache.todoChanges.get(todo.id)?.revision ?? -1) <= todo.revision)
          cache.todoChanges.set(todo.id, todo);
      });

      patch.tags.forEach((tag) => cache.tags.set(tag.id, tag));
      redraw();
    },
    [cache],
  );
  useEffect(() => {
    const current = cache.listPages.get("current")!;
    cache.listPages.set("current", {
      ...current,
      items: mergeRows(props.initialLists.items, current.items).filter(
        (row) => !cache.removedGroups.has(row.id),
      ),
    });
    if (props.initialTodos) {
      const { listId, page } = props.initialTodos;
      const old = cache.todos.get(listId);
      cache.todos.set(listId, {
        ...page,
        items: mergeRows(old?.items ?? [], page.items).filter(
          (row) => !cache.removedTodos.has(row.id),
        ),
      });
    }
    props.tags.forEach((tag) => {
      if ((cache.tags.get(tag.id)?.revision ?? -1) <= tag.revision) cache.tags.set(tag.id, tag);
    });
    redraw();
  }, [cache, props.initialLists, props.initialTodos, props.tags]);
  const loadTasks = useCallback(
    async (listId: string, more = false) => {
      const key = "tasks:" + listId;
      if (cache.loading.has(key)) return;
      const old = cache.todos.get(listId);
      if (more && !old?.nextCursor) return;
      cache.loading.add(key);
      try {
        const page = await loadTodos(listId, more ? old?.nextCursor : null);
        if (cache.removedGroups.has(listId)) return;
        const latest = cache.todos.get(listId);
        const changes = [...cache.todoChanges.values()];
        cache.todos.set(listId, {
          ...page,
          items: mergeRows(
            mergeRows(more ? (latest?.items ?? []) : [], page.items),
            changes.filter((row) => row.listId === listId),
          ).filter(
            (row) =>
              !cache.removedTodos.has(row.id) &&
              !changes.some((changed) => changed.id === row.id && changed.listId !== listId),
          ),
        });
        redraw();
      } catch {
        report();
      } finally {
        cache.loading.delete(key);
      }
    },
    [cache, loadTodos, report],
  );
  const loadMoreLists = useCallback(async () => {
    const current = cache.listPages.get("current")!;
    if (cache.loading.has("groups") || !current.nextCursor) return;
    cache.loading.add("groups");
    try {
      const page = await loadLists(current.nextCursor);
      cache.listPages.set("current", {
        ...page,
        items: mergeRows(page.items, cache.listPages.get("current")!.items).filter(
          (row) => !cache.removedGroups.has(row.id),
        ),
      });
      redraw();
    } catch {
      report();
    } finally {
      cache.loading.delete("groups");
    }
  }, [cache, loadLists, report]);
  return {
    cache,
    version: snapshot.version,
    todoChanges: snapshot.todoChanges,
    lists: cache.listPages.get("current")!,
    tags: snapshot.tags,
    upsertGroup,
    upsertTodo,
    applyPatch,
    loadTasks,
    loadMoreLists,
  };
}
