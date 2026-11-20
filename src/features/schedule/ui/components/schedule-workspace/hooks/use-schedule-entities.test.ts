import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useScheduleEntities } from "./use-schedule-entities";
import type { SchedulePatch } from "../../../../application/schedule-command";
const group = (id: string, revision = 0) => ({ id, name: id, colorKey: null, revision });
const todo = (id: string, listId = "a", revision = 0) => ({
  id,
  listId,
  title: id,
  revision,
  estimatedMinutes: null,
  completedAt: null,
});
const patch = (values: Partial<SchedulePatch>): SchedulePatch => ({
  groups: [],
  todos: [],
  tags: [],
  removedTodoIds: [],
  removedGroupIds: [],
  ...values,
});
function setup() {
  const props = {
    initialLists: { items: [group("a")], nextCursor: "next" },
    initialTodos: { listId: "a", page: { items: [todo("one")], nextCursor: "more" } },
    tags: [],
    loadLists: vi.fn().mockResolvedValue({ items: [group("b")], nextCursor: null }),
    loadTodos: vi.fn().mockResolvedValue({ items: [todo("two")], nextCursor: null }),
  };
  const report = vi.fn();
  const hook = renderHook(() => useScheduleEntities(props, report));
  return { ...hook, props, report };
}
describe("task cache consistency", () => {
  it("merges revisions and moves tasks between groups without stale duplicates", () => {
    const { result } = setup();
    act(() => result.current.upsertGroup(group("b")));
    act(() => result.current.upsertGroup(group("b", 2)));
    act(() => result.current.upsertGroup(group("b", 1)));
    expect(result.current.lists.items.find((g) => g.id === "b")?.revision).toBe(2);
    act(() => result.current.upsertTodo(todo("one", "a", 2)));
    act(() => result.current.applyPatch(patch({ todos: [todo("one", "b", 3)] })));
    expect(result.current.cache.todos.get("a")?.items).toEqual([]);
    expect(result.current.cache.todos.get("b")?.items[0].revision).toBe(3);
    act(() =>
      result.current.applyPatch(patch({ removedTodoIds: ["one"], removedGroupIds: ["b"] })),
    );
    expect(result.current.lists.items.map((g) => g.id)).toEqual(["a"]);
    expect(result.current.cache.todos.has("b")).toBe(false);
  });
  it("paginates and stops fetching when cursors are exhausted", async () => {
    const { result, props } = setup();
    await act(() => result.current.loadTasks("a", true));
    expect(result.current.cache.todos.get("a")?.items.map((t) => t.id)).toEqual(["one", "two"]);
    await act(() => result.current.loadTasks("a", true));
    expect(props.loadTodos).toHaveBeenCalledTimes(1);
    await act(() => result.current.loadMoreLists());
    expect(result.current.lists.items.map((g) => g.id)).toContain("b");
    await act(() => result.current.loadMoreLists());
    expect(props.loadLists).toHaveBeenCalledTimes(1);
  });
  it("reports failures and permits an explicit retry", async () => {
    const { result, props, report } = setup();
    props.loadTodos.mockRejectedValueOnce(new Error("offline"));
    props.loadLists.mockRejectedValueOnce(new Error("offline"));
    await act(() => result.current.loadTasks("a"));
    await act(() => result.current.loadMoreLists());
    expect(report).toHaveBeenCalledTimes(2);
    await act(() => result.current.loadTasks("a"));
    await act(() => result.current.loadMoreLists());
    expect(result.current.cache.loading.size).toBe(0);
  });
  it("ignores an in-flight page after its group was deleted", async () => {
    const { result, props } = setup();
    let resolve!: (value: { items: ReturnType<typeof todo>[]; nextCursor: null }) => void;
    props.loadTodos.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    let loading!: Promise<void>;
    act(() => {
      loading = result.current.loadTasks("a");
    });
    await act(() => result.current.loadTasks("a"));
    expect(props.loadTodos).toHaveBeenCalledTimes(1);
    act(() => result.current.applyPatch(patch({ removedGroupIds: ["a"] })));
    await act(async () => {
      resolve({ items: [todo("late")], nextCursor: null });
      await loading;
    });
    await waitFor(() => expect(result.current.cache.todos.has("a")).toBe(false));
  });
});
