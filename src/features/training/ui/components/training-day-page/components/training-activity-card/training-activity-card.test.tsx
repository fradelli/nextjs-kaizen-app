import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { TrainingWorkoutOverlayContext } from "../../../training-workout-overlay/training-workout-overlay.context";
import { trainingActivityDraftKey } from "../../../../hooks/use-training-activity-draft/use-training-activity-draft.utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import type {
  TrainingActivityDto,
  TrainingDayExerciseDto,
  TrainingDaySessionDto,
} from "@/features/training/application/training-dto";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";
import { TrainingActivityCard, TrainingInlineActivityCard } from "./training-activity-card";

beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  vi.setSystemTime(new Date("2026-09-17T15:00:00Z"));
  window.localStorage.clear();
  window.sessionStorage.clear();
  action.mockClear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("TrainingActivityCard", () => {
  it("keeps prescription and measurements visible but locked before starting the dedicated workout", () => {
    render(
      <TrainingInlineActivityCard
        dedicated
        civilDate="2026-09-17"
        activity={createStructuredActivity()}
        actions={actions}
      />,
    );
    expect(screen.getByLabelText("Tempo ativo")).toHaveTextContent("00:00:00");
    expect(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "Confirmar sÃ©rie 1" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(localStorage.length).toBe(0);
    expect(action).not.toHaveBeenCalled();
  });

  it("uses a collapsible warmup alongside the main session without losing the main prescription", () => {
    render(
      <TrainingInlineActivityCard
        dedicated
        civilDate="2026-09-17"
        activity={createStructuredActivity()}
        actions={actions}
      />,
    );
    expect(screen.getByText("Agachamento")).toBeVisible();
    const trigger = screen.getByRole("button", { name: "Aquecimento" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(trigger);
    expect(screen.getByText("Knee to wall")).toBeVisible();
    expect(screen.getByText("Agachamento")).toBeVisible();
    fireEvent.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("Knee to wall")).not.toBeInTheDocument();
  });

  it("shows a preparation-only routine without phase or set progression controls", async () => {
    const activity = createStructuredActivity();
    render(
      <TrainingInlineActivityCard
        dedicated
        civilDate="2026-09-17"
        activity={{
          ...activity,
          type: "mobility",
          structured: null,
          preparationSession: activity.structured!.preparation!,
        }}
        actions={actions}
      />,
    );
    expect(screen.getByText("Knee to wall")).toBeVisible();
    expect(screen.queryByRole("button", { name: "Aquecimento" })).not.toBeInTheDocument();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar atividade" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar atividade" }));
    expect(screen.getByText("Knee to wall")).toBeVisible();
    expect(screen.queryByRole("checkbox")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "+ SÃ©rie" })).not.toBeInTheDocument();
  });

  it("avisa sobre uma cÃ³pia local nÃ£o confirmada sem ocultar o resultado concluÃ­do", async () => {
    const activity = createStructuredActivity({ status: "completed" });
    const key = trainingActivityDraftKey("2026-09-17", activity.id);
    localStorage.setItem(key, "cÃ³pia invÃ¡lida preservada");
    renderCard(activity);
    expect(
      await screen.findByText(/hÃ¡ dados locais cuja conferÃªncia nÃ£o foi concluÃ­da/),
    ).toBeVisible();
    expect(localStorage.getItem(key)).toBe("cÃ³pia invÃ¡lida preservada");
    expect(screen.queryByRole("button", { name: "Iniciar treino" })).not.toBeInTheDocument();
  });
  it("preserva o rascunho e reenvia a mesma finalizaÃ§Ã£o apÃ³s perder a resposta", async () => {
    action.mockRejectedValueOnce(new Error("Resposta perdida"));
    renderCard(createStructuredActivity({ status: "scheduled" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "high" } });
    fireEvent.change(screen.getByLabelText("DisposiÃ§Ã£o durante a atividade"), {
      target: { value: "normal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Salvar registro" })).toBeEnabled(),
    );
    expect(localStorage.length).toBeGreaterThan(0);
    const first = action.mock.calls[0]![1] as FormData;
    fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(2));
    const second = action.mock.calls[1]![1] as FormData;
    expect(second.get("executionDraft")).toBe(first.get("executionDraft"));
    expect(second.get("completionRequestedAt")).toBe(first.get("completionRequestedAt"));
    await waitFor(() => expect(localStorage.length).toBe(0));
  });
  it("volta pela navegaÃ§Ã£o da sobreposiÃ§Ã£o quando ela estÃ¡ ativa", () => {
    const close = vi.fn();
    render(
      <TrainingWorkoutOverlayContext.Provider value={close}>
        <TrainingInlineActivityCard
          dedicated
          civilDate="2026-09-17"
          activity={createStructuredActivity({ status: "scheduled" })}
          actions={actions}
        />
      </TrainingWorkoutOverlayContext.Provider>,
    );
    fireEvent.click(screen.getByRole("link", { name: "Voltar Ã  pÃ¡gina anterior" }));
    expect(close).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: /Excluir atividade/ })).not.toBeInTheDocument();
  });
  it("links the compact summary to the selected day without repeating the date", () => {
    const activity = createStructuredActivity({ status: "scheduled" });
    render(<TrainingActivityCard civilDate="2026-09-17" activity={activity} actions={actions} />);
    expect(screen.getByRole("link")).toHaveAttribute(
      "href",
      `/workout/activity/${encodeURIComponent(activity.id)}?date=2026-09-17`,
    );
    expect(screen.queryByText("2026-09-17")).not.toBeInTheDocument();
    expect(screen.getByText(/NÃ£o iniciado/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar treino" })).not.toBeInTheDocument();
  });

  it("provides a return link from the dedicated workout to its day", () => {
    render(
      <TrainingInlineActivityCard
        dedicated
        civilDate="2026-09-17"
        activity={createStructuredActivity({ status: "scheduled" })}
        actions={actions}
      />,
    );
    expect(screen.getByRole("link", { name: /Voltar/ })).toHaveAttribute(
      "href",
      "/workout?date=2026-09-17",
    );
  });
  it("requires an explicit choice before closing when the paused execution cannot be stored", async () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));
    await waitFor(
      () => expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    const storage = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("full");
    });
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
    fireEvent.click(screen.getByRole("button", { name: "Fechar formul\u00e1rio" }));
    expect(screen.getByText(/A pausa n\u00e3o p\u00f4de ser guardada/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Fechar e manter pausa nesta aba" }));
    expect(screen.queryByRole("dialog", { name: "Finalizar atividade" })).not.toBeInTheDocument();
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    const unload = new Event("beforeunload", { cancelable: true });
    window.dispatchEvent(unload);
    expect(unload.defaultPrevented).toBe(true);
    storage.mockRestore();
  });

  it("keeps the paused execution and feedback when closing, reopening and retrying an error", async () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));
    await waitFor(
      () => expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
      { timeout: 5000 },
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "high" } });
    fireEvent.change(screen.getByLabelText(/Disposi/), { target: { value: "normal" } });
    fireEvent.change(
      within(screen.getByRole("dialog", { name: "Finalizar atividade" })).getByLabelText(
        "Nota",
      ),
      { target: { value: "Preserve" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar formul\u00e1rio" }));
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog", { name: "Finalizar atividade" })).getByLabelText(
          "Nota",
        ),
      ).toHaveValue("Preserve"),
    );
    action.mockResolvedValueOnce({ status: "invalid", message: "Try again" });
    fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    await waitFor(() => expect(screen.getByText("Try again")).toBeInTheDocument());
    expect(screen.getByLabelText("Intensidade")).toHaveValue("high");
    expect(screen.getByLabelText(/Disposi/)).toHaveValue("normal");
    expect(
      within(screen.getByRole("dialog", { name: "Finalizar atividade" })).getByLabelText(
        "Nota",
      ),
    ).toHaveValue("Preserve");
    expect(screen.getByRole("dialog", { name: "Finalizar atividade" })).toBeInTheDocument();
  });
  it("locks duplicate submits and accidental closure until the server confirms success", async () => {
    let resolveSave!: (value: { status: "saved"; revision: number }) => void;
    action.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        }),
    );
    renderCard({
      ...createSportActivity(),
      status: "scheduled",
      startedAt: null,
      intervals: [],
      currentIntervalStartedAt: null,
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: /^Finalizar atividade:/ })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "low" } });
    fireEvent.change(screen.getByLabelText(/Disposi/), { target: { value: "normal" } });
    const save = screen.getByRole("button", { name: "Salvar registro" });
    fireEvent.click(save);
    fireEvent.click(save);
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Fechar formul\u00e1rio" })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole("dialog", { name: "Finalizar atividade" }), {
      key: "Escape",
    });
    expect(screen.getByRole("dialog", { name: "Finalizar atividade" })).toBeInTheDocument();
    resolveSave({ status: "saved", revision: 1 });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Finalizar atividade" })).not.toBeInTheDocument(),
    );
    expect(localStorage.length).toBe(0);
  });

  it.each(["sport_practice", "specific_training"] as const)(
    "records scheduled %s without starting a timer or requiring warmup",
    async (type) => {
      const sport = createSportActivity();
      renderCard({
        ...sport,
        type,
        status: "scheduled",
        startedAt: null,
        currentIntervalStartedAt: null,
        intervals: [],
      });
      expect(screen.queryByText("Finalizar atividade")).not.toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Iniciar atividade" })).not.toBeInTheDocument();
      expect(screen.queryByLabelText("Tempo ativo")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevÃ´lei/ }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /^Finalizar atividade:/ })).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
      const registration = screen.getByRole("dialog", { name: "Finalizar atividade" });
      expect(registration).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Fechar formulÃ¡rio" }));
      expect(screen.getByRole("button", { name: "Aquecimento" })).toBeInTheDocument();
      expect(screen.getByText("FutevÃ´lei Â· 120 min planejados")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Aquecimento" }));
      expect(screen.getByText("Aquecimento de Jogo de futevÃ´lei")).toBeInTheDocument();
      expect(screen.getByText(/Esta preparaÃ§Ã£o Ã© opcional/)).toBeInTheDocument();
      expect(screen.queryByLabelText("Tempo ativo")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
      await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
      fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "high" } });
      fireEvent.change(screen.getByLabelText("DisposiÃ§Ã£o durante a atividade"), {
        target: { value: "energized" },
      });
      fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
      await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
      const formData = action.mock.calls[0]![1] as FormData;
      expect(formData.get("action")).toBe("record_completed");
      expect(formData.get("intensity")).toBe("high");
      expect(formData.get("energy")).toBe("energized");
      expect(formData.has("executionDraft")).toBe(false);
      expect(screen.queryByRole("dialog", { name: "Finalizar treino?" })).not.toBeInTheDocument();
      await waitFor(() =>
        expect(
          screen.queryByRole("dialog", { name: "Finalizar atividade" }),
        ).not.toBeInTheDocument(),
      );
      expect(window.localStorage.length).toBe(0);
      fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevÃ´lei/ }));
      expect(screen.queryByText("Finalizar atividade")).not.toBeInTheDocument();
    },
  );

  it("keeps retrospective completion and feedback correction without a timer after reload", () => {
    renderCard({
      ...createSportActivity(),
      status: "completed",
      startedAt: null,
      completedAt: null,
      intervals: [],
      currentIntervalStartedAt: null,
      intensity: "high",
      energy: "normal",
    });
    expect(screen.getByText(/ConcluÃ­do/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Tempo ativo")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevÃ´lei/ }));
    expect(screen.getByText("Corrigir avaliaÃ§Ã£o")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Salvar registro" })).not.toBeInTheDocument();
  });

  it("does not offer retrospective recording on a future date", () => {
    vi.setSystemTime(new Date("2026-09-16T15:00:00Z"));
    renderCard({
      ...createSportActivity(),
      status: "scheduled",
      startedAt: null,
      currentIntervalStartedAt: null,
      intervals: [],
    });
    expect(screen.queryByText("Finalizar atividade")).not.toBeInTheDocument();
  });
  it("previews and collapses a scheduled workout without starting it", async () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));
    fireEvent.click(screen.getByRole("button", { name: /^Inferiores A/ }));
    expect(screen.getByText("Knee to wall")).toBeInTheDocument();
    expect(screen.queryByRole("switch")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Inferiores A/ }));
    expect(screen.queryByText("Knee to wall")).not.toBeInTheDocument();
    expect(window.localStorage.length).toBe(0);
    expect(action).not.toHaveBeenCalled();
  });
  it("allows future preview but not execution", () => {
    vi.setSystemTime(new Date("2026-09-16T15:00:00Z"));
    renderCard(createStructuredActivity({ status: "scheduled" }));
    fireEvent.click(screen.getByRole("button", { name: /^Inferiores A/ }));
    expect(screen.getByText("Knee to wall")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Iniciar treino" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Excluir atividade" })).toBeInTheDocument();
  });
  it("confirms partial finalization and keeps the draft when returning", async () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
    fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "high" } });
    fireEvent.change(screen.getByLabelText("DisposiÃ§Ã£o durante a atividade"), {
      target: { value: "normal" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
    expect(screen.getByRole("dialog", { name: "Finalizar treino?" })).toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Voltar" }));
    expect(screen.getByLabelText("Intensidade")).toHaveValue("high");
    fireEvent.click(screen.getByRole("button", { name: "Salvar registro" }));
    fireEvent.click(screen.getByRole("button", { name: "Finalizar" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
    const submitted = action.mock.calls[0]![1] as FormData;
    expect(submitted.get("completionRequestedAt")).toBeTruthy();
    expect(JSON.parse(submitted.get("executionDraft") as string).status).toBe("paused");
  });
  it("starts expanded, keeps pause and warmup locally, and restores the draft after remount", async () => {
    const planned = createStructuredActivity({ status: "scheduled" });
    const view = renderCard(planned);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    expect(screen.getByText("Knee to wall")).toBeInTheDocument();
    expect(screen.getByText(/Em andamento/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercÃ­cio" }));
    expect(
      screen.getByRole("switch", { name: "Reabrir exercÃ­cio para ediÃ§Ã£o" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pausar atividade" }));
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    expect(screen.queryByText("Salvo.")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();

    view.unmount();
    renderCard(planned);
    await waitFor(() => expect(screen.getByText(/Pausado/)).toBeInTheDocument());
    expect(
      screen.getByRole("switch", { name: "Reabrir exercÃ­cio para ediÃ§Ã£o" }),
    ).toBeInTheDocument();
  });

  it("collapses a completed exercise and reopens its comment without a server mutation", async () => {
    const planned = createStructuredActivity({ status: "scheduled" });
    const activity: TrainingActivityDto = {
      ...planned,
      structured: {
        ...planned.structured!,
        main: {
          ...planned.structured!.main,
          exercises: [createExercise("main", "Agachamento", "8 reps", "pending")],
        },
      },
    };
    renderCard(activity);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    expect(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercÃ­cio" }));
    expect(screen.queryByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).not.toBeInTheDocument();
    const exerciseCard = screen.getByText("Agachamento").closest("article");
    expect(within(exerciseCard!).getByText(/NÃ£o realizado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercÃ­cio para ediÃ§Ã£o" }));
    expect(within(exerciseCard!).getByText(/Em aberto/)).toBeInTheDocument();
    fireEvent.click(within(exerciseCard!).getByRole("button", { name: "ComentÃ¡rio" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("ComentÃ¡rio"), {
      target: { value: "Ajuste local" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    fireEvent.click(within(exerciseCard!).getByRole("button", { name: "ComentÃ¡rio" }));
    expect(within(screen.getByRole("dialog")).getByLabelText("ComentÃ¡rio")).toHaveValue(
      "Ajuste local",
    );
    expect(action).not.toHaveBeenCalled();
  });

  it("keeps confirmation and added warmups local and requires every set for green", async () => {
    const planned = createStructuredActivity({ status: "scheduled" });
    const exercise = createExercise("main", "Agachamento", "8 reps", "pending");
    renderCard({
      ...planned,
      structured: {
        ...planned.structured!,
        main: { ...planned.structured!.main, exercises: [exercise] },
      },
    });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Iniciar treino" }));
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    fireEvent.change(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes"), { target: { value: "8" } });
    fireEvent.change(screen.getByLabelText("SÃ©rie 1 Carga (kg)"), { target: { value: "10" } });
    const check = screen.getByRole("checkbox", { name: "Confirmar sÃ©rie 1" });
    expect(check).not.toBeChecked();
    fireEvent.click(check);
    expect(check).toBeChecked();
    fireEvent.click(screen.getByRole("button", { name: "Adicionar série" }));
    const addSetDialog = screen.getByRole("dialog");
    fireEvent.click(within(addSetDialog).getByRole("button", { name: "Aquecimento" }));
    fireEvent.click(within(addSetDialog).getByRole("button", { name: "Adicionar série" }));
    expect(screen.getByLabelText("Aquecimento 1")).toHaveTextContent("W");
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercÃ­cio" }));
    expect(screen.getByText(/Parcial/)).toBeInTheDocument();
    const stored = JSON.parse(
      localStorage.getItem(`kaizen:training-draft:v1:2026-09-17:${planned.id}`)!,
    );
    const recorded = stored.exercises[`main:${exercise.exerciseId}`];
    expect(recorded.sets).toHaveLength(exercise.sets.length + 1);
    expect(recorded.sets.find((set: { kind: string }) => set.kind === "warmup").confirmed).toBe(
      false,
    );
    expect(recorded.rest).toBeDefined();
    expect(action).not.toHaveBeenCalled();
  });

  it("reopens a previously persisted exercise locally without losing its measurements", async () => {
    renderCard(createStructuredActivity({ status: "paused", revision: 3 }));
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Ir para o treino" })).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    expect(screen.queryByText(/exercÃ­cios registrados/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Registrado")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercÃ­cio para ediÃ§Ã£o" }));
    expect(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).toHaveValue(8);
    fireEvent.change(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes"), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercÃ­cio" }));
    expect(screen.queryByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercÃ­cio para ediÃ§Ã£o" }));
    expect(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).toHaveValue(9);
    expect(action).not.toHaveBeenCalled();
  });

  it("keeps a scheduled structured workout compact and summarizes both phases", () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));

    expect(
      screen.getByText("09:00 Â· 75 min (inclui 10 min de aquecimento) Â· NÃ£o iniciado"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeInTheDocument();
    expect(screen.queryByText("Knee to wall")).not.toBeInTheDocument();
  });

  it("opens in warmup, navigates without losing state and exposes the semantic switch", async () => {
    renderCard(createStructuredActivity({ status: "in_progress" }));

    await waitFor(() => expect(screen.getByText("Knee to wall")).toBeInTheDocument());
    expect(screen.getByText("PreparaÃ§Ã£o", { selector: "span[data-slot='badge']" })).toHaveClass(
      "border-status-info-border",
    );
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Concluir exercÃ­cio" })).toHaveAttribute(
        "aria-checked",
        "false",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    expect(screen.getByText("Treino", { selector: "span[data-slot='badge']" })).toHaveClass(
      "border-status-warning-border",
    );
    expect(screen.getByText("Agachamento")).toBeInTheDocument();
    expect(screen.getByText(/65 min Â· high quality heavy/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Voltar ao aquecimento" }));
    expect(screen.getByText("Knee to wall")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { expanded: true }));
    expect(screen.queryByText("Knee to wall")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Knee to wall")).toBeInTheDocument();
  });

  it("shows a generic warmup for sports and uses activity wording", async () => {
    renderCard(createSportActivity());

    await waitFor(() =>
      expect(screen.getByText("Aquecimento de Jogo de futevÃ´lei")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Ir para a atividade" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ir para a atividade" }));
    expect(screen.getByText("FutevÃ´lei Â· 120 min planejados")).toBeInTheDocument();
  });

  it("keeps unprovided game times and warmup duration explicitly undefined", async () => {
    const sport = createSportActivity();
    renderCard({
      ...sport,
      plannedStartTime: null,
      plannedEndTime: null,
      plannedDurationMinutes: null,
      preparations: sport.preparations.map((preparation) => ({
        ...preparation,
        plannedStartTime: null,
        plannedEndTime: null,
        plannedDurationMinutes: null,
      })),
    });

    expect(screen.getByText(/HorÃ¡rio a definir Â· DuraÃ§Ã£o a definir/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("DuraÃ§Ã£o a definir Â· preparaÃ§Ã£o opcional")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ir para a atividade" }));
    expect(screen.getByText("FutevÃ´lei Â· DuraÃ§Ã£o a definir")).toBeInTheDocument();
  });

  it("locks deletion after completion and keeps feedback correction available", () => {
    renderCard(
      createStructuredActivity({
        status: "completed",
        completedAt: "2026-09-17T13:00:00.000Z",
        intensity: "high",
        energy: "energized",
      }),
    );

    expect(screen.queryByRole("button", { name: "Excluir atividade" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.getByText("Corrigir avaliaÃ§Ã£o")).toBeInTheDocument();
  });

  it("supports a paused workout without preparation and a skipped generic activity", async () => {
    const paused = createStructuredActivity({
      status: "paused",
      structured: {
        preparation: null,
        main: { ...createSession("main", "Superiores A", 45, []), intensity: null },
      },
      accumulatedActiveSeconds: 125,
    });
    const { rerender } = renderCard(paused);
    expect(screen.getByLabelText("Tempo ativo")).toHaveTextContent("00:02:05");
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Retomar atividade" })).toBeEnabled(),
    );
    fireEvent.click(screen.getByRole("button", { expanded: true }));
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    expect(screen.queryByRole("button", { name: "Aquecimento" })).not.toBeInTheDocument();
    expect(screen.getByText("45 min")).toBeInTheDocument();

    rerender(
      <TrainingActivityCard
        civilDate="2026-09-17"
        activity={{ ...createSportActivity(), status: "skipped" }}
        actions={actions}
      />,
    );
    expect(screen.getByText(/NÃ£o realizado/)).toBeInTheDocument();
    expect(screen.queryByText("Finalizar atividade")).not.toBeInTheDocument();
  });

  it("does not request perception fields when correcting completed mobility", () => {
    renderCard({
      ...activityBase,
      type: "mobility",
      name: "Mobilidade independente",
      status: "completed",
      completedAt: "2026-09-17T13:00:00.000Z",
    });
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByText("Corrigir avaliaÃ§Ã£o"));
    expect(screen.queryByLabelText("Intensidade")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("DisposiÃ§Ã£o durante a atividade")).not.toBeInTheDocument();
    expect(screen.getByLabelText("ComentÃ¡rio")).toBeInTheDocument();
  });

  it("edits a completed exercise only after an explicit correction submission", async () => {
    renderCard(
      createStructuredActivity({
        status: "completed",
        completedAt: "2026-09-17T13:00:00.000Z",
      }),
    );
    fireEvent.click(screen.getByRole("button", { expanded: false }));
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    fireEvent.click(screen.getByText("Corrigir exercÃ­cio"));
    expect(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes")).toHaveValue(8);
    fireEvent.change(screen.getByLabelText("SÃ©rie 1 RepetiÃ§Ãµes"), { target: { value: "9" } });
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Salvar correÃ§Ã£o" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });
});

function renderCard(activity: TrainingActivityDto) {
  return render(
    <TrainingInlineActivityCard civilDate="2026-09-17" activity={activity} actions={actions} />,
  );
}

const action = vi.fn<TrainingDayFormActions["controlActivity"]>(async () => ({
  status: "saved",
  revision: 1,
}));
const actions: TrainingDayFormActions = {
  addActivity: action,
  updateActivity: action,
  controlActivity: action,
  saveActivityExercise: action,
  deleteActivity: action,
};

function createStructuredActivity(
  overrides: Partial<TrainingActivityDto> = {},
): TrainingActivityDto {
  const persistedExecution =
    overrides.status === "in_progress" || overrides.status === "paused"
      ? {
          startedAt: "2026-09-17T12:00:00.000Z",
          currentIntervalStartedAt:
            overrides.status === "in_progress" ? "2026-09-17T12:00:00.000Z" : null,
          intervals: [
            {
              startedAt: "2026-09-17T12:00:00.000Z",
              endedAt: overrides.status === "paused" ? "2026-09-17T12:02:05.000Z" : null,
            },
          ],
        }
      : {};
  return {
    ...activityBase,
    ...persistedExecution,
    name: "Inferiores A",
    type: "structured_training",
    plannedEndTime: "10:15",
    plannedDurationMinutes: 75,
    structured: {
      preparation: createSession("preparation", "Aquecimento", 10, [
        createExercise("warmup", "Knee_to_wall", "8_each_side", "pending"),
      ]),
      main: createSession("main", "Inferiores A", 65, [
        createExercise("main", "Agachamento", "high_quality_heavy", "completed"),
      ]),
    },
    ...overrides,
  };
}

function createSportActivity(): TrainingActivityDto {
  const preparation: TrainingActivityDto = {
    ...activityBase,
    id: "22222222-2222-4222-8222-222222222222",
    name: "Aquecimento de Jogo de futevÃ´lei",
    type: "mobility",
    role: "preparation",
    plannedDurationMinutes: 10,
  };
  return {
    ...activityBase,
    name: "Jogo de futevÃ´lei",
    type: "sport_practice",
    sport: "FutevÃ´lei",
    status: "in_progress",
    plannedEndTime: "11:00",
    plannedDurationMinutes: 120,
    startedAt: "2026-09-17T12:00:00.000Z",
    currentIntervalStartedAt: "2026-09-17T12:00:00.000Z",
    intervals: [{ startedAt: "2026-09-17T12:00:00.000Z", endedAt: null }],
    preparations: [preparation],
  };
}

const activityBase: TrainingActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "structured_training",
  source: "plan",
  role: "primary",
  name: "Atividade",
  sport: null,
  status: "scheduled",
  plannedStartTime: "09:00",
  plannedEndTime: "10:00",
  plannedDurationMinutes: 60,
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

function createSession(
  role: TrainingDaySessionDto["role"],
  name: string,
  targetDurationMinutes: number,
  exercises: readonly TrainingDayExerciseDto[],
): TrainingDaySessionDto {
  return {
    role,
    sessionId: `${role}-session`,
    name,
    targetDurationMinutes,
    shortDurationMinutes: null,
    intensity: role === "main" ? "high_quality_heavy" : "progressive_non_fatiguing",
    notes: null,
    exercises,
  };
}

function createExercise(
  role: "warmup" | "main",
  name: string,
  prescribedText: string,
  status: TrainingDayExerciseDto["status"],
): TrainingDayExerciseDto {
  return {
    prescriptionId: `${role}-prescription`,
    exerciseId: `${role}-exercise`,
    name,
    ordinal: 1,
    prescribedSets: 1,
    prescribedText,
    restSeconds: role === "main" ? 120 : null,
    priorityLevel: null,
    notes: null,
    dose: {
      sourceText: "8",
      minimum: 8,
      maximum: 8,
      unit: "repetitions",
      scope: "total",
      qualifier: null,
    },
    measurementType: "repetitions",
    loadApplicable: role === "main",
    loadUnit: role === "main" ? "kg" : null,
    instructions: ["Execute com controle."],
    cues: ["Mantenha a postura."],
    risks: "Interrompa em caso de desconforto.",
    executionId: null,
    status,
    comment: null,
    revision: null,
    sets: [
      {
        setNumber: 1,
        status,
        value: status === "completed" ? 8 : null,
        leftValue: null,
        rightValue: null,
        directionValues: null,
        loadKg: status === "completed" ? "20" : null,
        revision: status === "completed" ? 1 : null,
      },
    ],
  };
}
