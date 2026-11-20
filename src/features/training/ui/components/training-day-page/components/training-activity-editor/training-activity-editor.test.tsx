import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";
import { TrainingActivityEditor } from "./training-activity-editor";
const navigation = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
const action = vi.fn<TrainingFormAction>();
const actions = {
  addActivity: action,
  updateActivity: action,
  controlActivity: action,
  saveActivityExercise: action,
  deleteActivity: action,
};
const date = "2026-09-17";
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  vi.setSystemTime(new Date("2026-09-17T15:00:00Z"));
  action.mockReset();
  action.mockResolvedValue({ status: "saved", revision: 1 });
});
afterEach(() => {
  cleanup();
  sessionStorage.clear();
  vi.restoreAllMocks();
  vi.clearAllMocks();
  vi.useRealTimers();
});
function renderEditor(edit = false) {
  return render(
    <TrainingActivityEditor
      civilDate={date}
      activity={edit ? activity : undefined}
      availablePlan={null}
      actions={actions}
    />,
  );
}
async function open(edit = false) {
  fireEvent.click(
    screen.getByRole("button", {
      name: edit ? `Editar atividade: ${activity.name}` : "Adicionar atividade",
    }),
  );
  await screen.findByLabelText("Tipo de atividade");
}
function fill() {
  fireEvent.change(screen.getByLabelText("Tipo de atividade"), { target: { value: "mobility" } });
  fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Jogo" } });
  fireEvent.change(screen.getByLabelText("Início planejado"), { target: { value: "18:00" } });
  fireEvent.change(screen.getByLabelText("Fim planejado"), { target: { value: "19:00" } });
}
function submit() {
  fireEvent.submit(screen.getByLabelText("Tipo de atividade").closest("form")!);
}
describe("activity editor workflows", () => {
  it("closes clean without writing a draft", async () => {
    renderEditor();
    await open();
    fireEvent.click(screen.getByRole("button", { name: "Fechar formulário" }));
    expect(sessionStorage.length).toBe(0);
  });
  it("saves once, clears the draft and refreshes before closing", async () => {
    renderEditor();
    await open();
    fill();
    submit();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(action).toHaveBeenCalledTimes(1);
    expect(navigation.refresh).toHaveBeenCalledTimes(1);
    expect(sessionStorage.length).toBe(0);
  });
  it("preserves errors without closing or erasing fields", async () => {
    action.mockResolvedValue({ status: "invalid", message: "Horário inválido" });
    renderEditor();
    await open();
    fill();
    submit();
    await screen.findByText("Horário inválido");
    expect(screen.getByLabelText("Nome")).toHaveValue("Jogo");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
  it("locks closing, fields and duplicate submissions while saving", async () => {
    let resolve!: (value: Awaited<ReturnType<TrainingFormAction>>) => void;
    action.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    renderEditor();
    await open();
    fill();
    submit();
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Fechar formulário" })).toBeDisabled();
    expect(screen.getByLabelText("Nome")).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    await act(async () => resolve({ status: "saved", revision: 1 }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
  it("edits only the selected activity and navigates only after a successful move", async () => {
    renderEditor(true);
    await open(true);
    expect(screen.getByLabelText("Nome")).toHaveValue("Mobilidade");
    fireEvent.change(screen.getByLabelText("Data da atividade"), {
      target: { value: "2026-09-18" },
    });
    submit();
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/workout?date=2026-09-18"));
    const data = action.mock.calls[0][1];
    expect(data.get("civilDate")).toBe(date);
    expect(data.get("targetCivilDate")).toBe("2026-09-18");
  });

  it("keeps a rejected move without navigating and requires reloading a conflict", async () => {
    action.mockResolvedValue({
      status: "conflict",
      message: "Outro dispositivo alterou a atividade",
    });
    renderEditor(true);
    await open(true);
    fireEvent.change(screen.getByLabelText("Data da atividade"), {
      target: { value: "2026-09-18" },
    });
    submit();
    await waitFor(() => expect(navigation.refresh).toHaveBeenCalled());
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
  it("deletion is separate from the edit form and cancellation preserves values", async () => {
    renderEditor(true);
    await open(true);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Alongamento" } });
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    const confirmation = screen.getByRole("dialog", { name: "Excluir atividade?" });
    expect(confirmation.closest("form")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Manter atividade" }));
    expect(screen.getByLabelText("Nome")).toHaveValue("Alongamento");
    expect(action).not.toHaveBeenCalled();
  });
  it("keeps the local execution separate and disables rescheduling when started locally", async () => {
    render(
      <TrainingActivityEditor
        civilDate={date}
        activity={activity}
        availablePlan={null}
        actions={actions}
        startedLocally
      />,
    );
    await open(true);
    expect(screen.getByLabelText("Data da atividade")).toBeEnabled();
    expect(screen.getByLabelText("Início planejado")).toBeEnabled();
  });
});
describe("editor additional safeguards", () => {
  it("cleans up and navigates even if the server response already removed the source card", async () => {
    const view = renderEditor(true);
    await open(true);
    fireEvent.change(screen.getByLabelText("Data da atividade"), {
      target: { value: "2026-09-18" },
    });
    action.mockImplementationOnce(async () => {
      view.unmount();
      return { status: "saved", revision: 1 };
    });
    submit();
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/workout?date=2026-09-18"));
  });

  it("detects changes to the server DTO while editing", async () => {
    const { rerender } = renderEditor(true);
    await open(true);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Meu rascunho" } });
    rerender(
      <TrainingActivityEditor
        civilDate={date}
        activity={{ ...activity, revision: 2 }}
        availablePlan={null}
        actions={actions}
      />,
    );
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(navigation.refresh).toHaveBeenCalled();
  });
  it("blocks automatic retry when the network result is uncertain", async () => {
    action.mockRejectedValue(new Error("offline"));
    renderEditor();
    await open();
    fill();
    submit();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(navigation.refresh).toHaveBeenCalled();
    expect(action).toHaveBeenCalledTimes(1);
  });
  it("deletes once and blocks cancel and escape until confirmed", async () => {
    let resolve!: (value: Awaited<ReturnType<TrainingFormAction>>) => void;
    action.mockImplementation(
      () =>
        new Promise((r) => {
          resolve = r;
        }),
    );
    renderEditor(true);
    await open(true);
    fireEvent.change(screen.getByLabelText("Nome"), { target: { value: "Rascunho" } });
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    const confirmation = screen.getByRole("dialog", { name: "Excluir atividade?" });
    fireEvent.submit(confirmation.querySelector("form")!);
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Manter atividade" })).toBeDisabled();
    fireEvent.keyDown(confirmation, { key: "Escape" });
    expect(confirmation).toBeVisible();
    await act(async () => resolve({ status: "saved", revision: 1 }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    expect(sessionStorage.length).toBe(0);
  });
  it("keeps both dialogs and draft when deletion is rejected", async () => {
    action.mockResolvedValue({ status: "conflict", message: "Exclusão não confirmada" });
    renderEditor(true);
    await open(true);
    fireEvent.click(screen.getByRole("button", { name: "Excluir atividade" }));
    fireEvent.submit(
      screen.getByRole("dialog", { name: "Excluir atividade?" }).querySelector("form")!,
    );
    await screen.findByText("Exclusão não confirmada");
    expect(screen.getAllByRole("dialog", { hidden: true })).toHaveLength(2);
    expect(screen.getByRole("button", { name: "Manter atividade" })).toBeEnabled();
  });
});

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
