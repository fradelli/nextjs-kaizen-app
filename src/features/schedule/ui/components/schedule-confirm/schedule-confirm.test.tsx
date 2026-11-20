import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
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

import { ScheduleConfirm } from "./schedule-confirm";
describe("linked activity decisions", () => {
  it.each(["move", "delete"] as const)(
    "confirms the selected %s policy and supports cancel",
    (kind) => {
      const confirm = vi.fn(),
        close = vi.fn();
      render(
        <ScheduleConfirm
          kind={kind}
          title="Trabalho"
          count={2}
          busy={false}
          confirm={confirm}
          close={close}
        />,
      );
      const select = screen.getByRole("combobox");
      fireEvent.change(select, { target: { value: kind === "move" ? "shift" : "remove" } });
      const buttons = screen.getAllByRole("button");
      fireEvent.click(buttons[buttons.length - 1]);
      expect(confirm).toHaveBeenCalledWith(kind === "move" ? "shift" : "remove");
      fireEvent.click(buttons[0]);
      expect(close).toHaveBeenCalledOnce();
    },
  );
  it("omits policy selection without linked reservations and locks busy actions", () => {
    render(
      <ScheduleConfirm
        kind="delete"
        title="Trabalho"
        count={0}
        busy
        confirm={vi.fn()}
        close={vi.fn()}
      />,
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    for (const button of screen.getAllByRole("button")) expect(button).toBeDisabled();
  });
});
