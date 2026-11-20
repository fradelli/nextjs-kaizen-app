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

import { ScheduleActivityEditor } from "./schedule-activity-editor";
import type { ScheduleActivity } from "../schedule-workspace/schedule-workspace.types";
const state = vi.hoisted(() => ({
  tags: [{ id: "study", name: "Study" }],
  submit: vi.fn(),
  setEditor: vi.fn(),
  requestTraining: vi.fn(),
  pending: false,
}));
vi.mock("../schedule-workspace/schedule-workspace", () => ({ useScheduleWorkspace: () => state }));
vi.mock("../schedule-clock/schedule-clock", () => ({
  ScheduleClock: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: string;
    onChange: (v: string) => void;
  }) => <input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />,
}));
vi.mock("../schedule-confirm/schedule-confirm", () => ({
  ScheduleConfirm: ({
    confirm,
    close,
  }: {
    confirm: (v: "shift" | "keep" | "remove") => void;
    close: () => void;
  }) => (
    <div>
      <button onClick={() => confirm("shift")}>shift</button>
      <button onClick={() => confirm("remove")}>remove</button>
      <button onClick={close}>close</button>
    </div>
  ),
}));
const activity: ScheduleActivity = {
  id: "work",
  revision: 3,
  title: "Work",
  startsAt: "2026-11-17T12:00:00.000Z",
  endsAt: "2026-11-17T21:00:00.000Z",
  scheduledDate: null,
  parentActivityId: null,
  colorKey: null,
  tagId: null,
  linkedCount: 2,
};
describe("schedule activity editing", () => {
  it("creates a timed activity using the selected interval", () => {
    render(<ScheduleActivityEditor date="2026-11-17" initialStart="08:00" initialEnd="08:30" />);
    fireEvent.change(screen.getByRole("textbox", { name: "Título" }), {
      target: { value: "Study" },
    });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "study" } });
    fireEvent.submit(screen.getByRole("textbox", { name: "Título" }).closest("form")!);
    expect(state.submit).toHaveBeenCalledWith({
      kind: "create_activity",
      title: "Study",
      tagId: "study",
      scheduledDate: null,
      startsAt: "2026-11-17T11:00:00.000Z",
      endsAt: "2026-11-17T11:30:00.000Z",
    });
  });
  it("creates an untimed activity and can cancel", () => {
    render(<ScheduleActivityEditor date="2026-11-17" />);
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(screen.getByRole("textbox", { name: "Título" }).closest("form")!);
    expect(state.submit).toHaveBeenCalledWith(
      expect.objectContaining({ scheduledDate: "2026-11-17", startsAt: null, endsAt: null }),
    );
    fireEvent.click(screen.getAllByRole("button")[0]);
    expect(state.setEditor).toHaveBeenCalledWith(null);
  });
  it("requests a policy before moving a parent and submits shifted children", () => {
    render(<ScheduleActivityEditor date="2026-11-17" activity={activity} />);
    const inputs = screen.getAllByRole("textbox");
    fireEvent.change(
      inputs.find((i) => i.getAttribute("value") === "09:00")!,
      { target: { value: "11:00" } },
    );
    fireEvent.submit(screen.getByRole("textbox", { name: "Título" }).closest("form")!);
    expect(state.submit).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "shift" }));
    expect(state.submit).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "update_activity", policy: "shift", expectedRevision: 3 }),
    );
  });
  it("confirms deletion with the selected child policy", () => {
    render(<ScheduleActivityEditor date="2026-11-17" activity={activity} />);
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));
    fireEvent.click(screen.getByRole("button", { name: "remove" }));
    expect(state.submit).toHaveBeenCalledWith({
      kind: "delete_activity",
      activityId: "work",
      expectedRevision: 3,
      policy: "remove",
    });
  });
  it("hands plan training off to the executor selector", () => {
    render(<ScheduleActivityEditor date="2026-11-17" />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "plan" } });
    expect(state.requestTraining).toHaveBeenCalledWith("2026-11-17", "09:00", "10:00");
    expect(state.setEditor).toHaveBeenCalledWith(null);
  });
});
