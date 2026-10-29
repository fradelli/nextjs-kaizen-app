import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import { TrainingActivityDeleteForm } from "./training-activity-delete-form";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

beforeAll(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
});

afterEach(cleanup);

describe("TrainingActivityDeleteForm", () => {
  it("confirms scheduled deletion and can cancel it", () => {
    renderForm(activity);
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    expect(screen.getByRole("dialog", { name: "Excluir atividade?" })).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Ela será removida da agenda deste dia.");
    const buttons = within(screen.getByRole("dialog"))
      .getAllByRole("button")
      .filter((button) => !button.getAttribute("aria-label")?.startsWith("Fechar"));
    expect(buttons[0]).toHaveAccessibleName("Excluir atividade");
    expect(buttons[1]).toHaveAccessibleName("Manter atividade");
    expect(screen.getByRole("button", { name: "Manter atividade" })).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: "Manter atividade" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });

  it("warns when a started activity is removed and hides completed deletion", () => {
    const { rerender } = renderForm({ ...activity, status: "paused" });
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A atividade já começou");

    rerender(
      <TrainingActivityDeleteForm
        civilDate="2026-09-17"
        activity={{ ...activity, status: "completed" }}
        action={action}
        compact
      />,
    );
    expect(screen.queryByRole("button", { name: "Excluir atividade" })).not.toBeInTheDocument();
  });

  it("recognizes a browser draft when deleting through the agenda", () => {
    window.localStorage.setItem(`kaizen:training-draft:v1:2026-09-17:${activity.id}`, "draft");
    renderForm(activity);
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    expect(screen.getByRole("alert")).toHaveTextContent("A atividade já começou");
    window.localStorage.clear();
  });
});

function renderForm(value: TrainingActivityDto) {
  return render(
    <TrainingActivityDeleteForm civilDate="2026-09-17" activity={value} action={action} compact />,
  );
}

const action = vi.fn(async () => ({ status: "saved" as const, revision: 1 }));
const activity: TrainingActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "mobility",
  source: "manual",
  role: "primary",
  name: "Mobilidade",
  sport: null,
  status: "scheduled",
  plannedStartTime: "09:00",
  plannedEndTime: "09:30",
  plannedDurationMinutes: 30,
  actualStartTime: null,
  actualEndTime: null,
  actualDurationMinutes: null,
  startedAt: null,
  completedAt: null,
  accumulatedActiveSeconds: 0,
  currentIntervalStartedAt: null,
  intervals: [],
  intensity: null,
  energy: null,
  comment: null,
  revision: 0,
  structured: null,
  preparations: [],
};
