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

import { TagEditor } from "./tag-editor";
const state = vi.hoisted(() => ({
  tags: [
    { id: "study", name: "Study", colorKey: "blue", revision: 2, systemKey: null },
    { id: "training", name: "Treino", colorKey: "purple", revision: 0, systemKey: "training" },
  ],
  submit: vi.fn(),
  pending: false,
}));
vi.mock("../schedule-workspace/schedule-workspace", () => ({ useScheduleWorkspace: () => state }));
describe("tag editor", () => {
  it("creates a custom tag with its chosen color", () => {
    render(<TagEditor />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Hobbies" } });
    fireEvent.change(screen.getAllByRole("combobox")[1], { target: { value: "green" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(state.submit).toHaveBeenCalledWith({
      kind: "create_tag",
      name: "Hobbies",
      colorKey: "green",
    });
  });
  it("edits a custom tag while protecting system names", () => {
    render(<TagEditor />);
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "study" } });
    expect(screen.getByRole("textbox")).toHaveValue("Study");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Estudo" } });
    fireEvent.submit(screen.getByRole("textbox").closest("form")!);
    expect(state.submit).toHaveBeenCalledWith({
      kind: "update_tag",
      tagId: "study",
      expectedRevision: 2,
      name: "Estudo",
      colorKey: "blue",
    });
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "training" } });
    expect(screen.getByRole("textbox")).toBeDisabled();
    fireEvent.change(screen.getAllByRole("combobox")[0], { target: { value: "new" } });
    expect(screen.getByRole("textbox")).toHaveValue("");
    expect(screen.getByRole("textbox")).toBeEnabled();
  });
});
