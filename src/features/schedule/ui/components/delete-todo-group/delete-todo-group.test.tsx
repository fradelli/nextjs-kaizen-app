import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../tests/support/render-localized";
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
vi.mock("../schedule-select/schedule-select", () => ({
  ScheduleSelect: ({
    label,
    value,
    onChange,
    items,
    disabled,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    items: { value: string; label: string }[];
    disabled?: boolean;
  }) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(e.target.value)}
    >
      {items.map((i) => (
        <option key={i.value} value={i.value}>
          {i.label}
        </option>
      ))}
    </select>
  ),
}));

import { DeleteTodoGroup } from "./delete-todo-group";
const state = vi.hoisted(() => ({ saveMutation: vi.fn() }));
vi.mock("../schedule-workspace/schedule-workspace", () => ({ useScheduleWorkspace: () => state }));
describe("delete task group", () => {
  it.each([true, false])("closes only after successful deletion: %s", async (saved) => {
    state.saveMutation.mockResolvedValue(saved);
    const close = vi.fn();
    render(
      <DeleteTodoGroup
        list={
          { id: "group", name: "Work", revision: 3 } as Parameters<
            typeof DeleteTodoGroup
          >[0]["list"]
        }
        close={close}
      />,
    );
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "remove" } });
    fireEvent.click(screen.getAllByRole("button").at(-1)!);
    await waitFor(() =>
      expect(state.saveMutation).toHaveBeenCalledWith({
        kind: "delete_list",
        listId: "group",
        expectedRevision: 3,
        policy: "remove",
      }),
    );
    await waitFor(() => expect(screen.getAllByRole("button").at(-1)).toBeEnabled());
    expect(close).toHaveBeenCalledTimes(saved ? 1 : 0);
  });
  it("cancels without deleting", () => {
    const close = vi.fn();
    render(
      <DeleteTodoGroup
        list={
          { id: "group", name: "Work", revision: 0 } as Parameters<
            typeof DeleteTodoGroup
          >[0]["list"]
        }
        close={close}
      />,
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(close).toHaveBeenCalledOnce();
    expect(state.saveMutation).not.toHaveBeenCalled();
  });
});
