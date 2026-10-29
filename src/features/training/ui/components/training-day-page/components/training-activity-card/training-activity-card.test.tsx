import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));

import type {
  TrainingActivityDto,
  TrainingDayExerciseDto,
  TrainingDaySessionDto,
} from "@/features/training/application/training-dto";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";
import { TrainingActivityCard } from "./training-activity-card";

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
        "Coment\u00e1rio",
      ),
      { target: { value: "Preserve" } },
    );
    fireEvent.click(screen.getByRole("button", { name: "Fechar formul\u00e1rio" }));
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
    await waitFor(() =>
      expect(
        within(screen.getByRole("dialog", { name: "Finalizar atividade" })).getByLabelText(
          "Coment\u00e1rio",
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
        "Coment\u00e1rio",
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
    fireEvent(
      screen.getByRole("dialog", { name: "Finalizar atividade" }),
      new Event("cancel", { cancelable: true }),
    );
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
      fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevôlei/ }));
      await waitFor(() =>
        expect(screen.getByRole("button", { name: /^Finalizar atividade:/ })).toBeEnabled(),
      );
      fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
      const registration = screen.getByRole("dialog", { name: "Finalizar atividade" });
      expect(registration).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Fechar formulário" }));
      expect(screen.getByRole("button", { name: "Aquecimento" })).toBeInTheDocument();
      expect(screen.getByText("Futevôlei · 120 min planejados")).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Aquecimento" }));
      expect(screen.getByText("Aquecimento de Jogo de futevôlei")).toBeInTheDocument();
      expect(screen.getByText(/Esta preparação é opcional/)).toBeInTheDocument();
      expect(screen.queryByLabelText("Tempo ativo")).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: /^Finalizar atividade:/ }));
      await waitFor(() => expect(screen.getByLabelText("Intensidade")).toBeEnabled());
      fireEvent.change(screen.getByLabelText("Intensidade"), { target: { value: "high" } });
      fireEvent.change(screen.getByLabelText("Disposição durante a atividade"), {
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
      fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevôlei/ }));
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
    expect(screen.getByText(/Concluído/)).toBeInTheDocument();
    expect(screen.queryByLabelText("Tempo ativo")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Jogo de futevôlei/ }));
    expect(screen.getByText("Corrigir avaliação")).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText("Disposição durante a atividade"), {
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
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercício" }));
    expect(
      screen.getByRole("switch", { name: "Reabrir exercício para edição" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Pausar atividade" }));
    expect(screen.getByText(/Pausado/)).toBeInTheDocument();
    expect(screen.queryByText("Salvo.")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();

    view.unmount();
    renderCard(planned);
    await waitFor(() => expect(screen.getByText(/Pausado/)).toBeInTheDocument());
    expect(
      screen.getByRole("switch", { name: "Reabrir exercício para edição" }),
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
    expect(screen.getByLabelText("Repetições")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercício" }));
    expect(screen.queryByLabelText("Repetições")).not.toBeInTheDocument();
    const exerciseCard = screen.getByText("Agachamento").closest("article");
    expect(within(exerciseCard!).getByText(/Não realizado/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercício para edição" }));
    expect(within(exerciseCard!).getByText(/Em aberto/)).toBeInTheDocument();
    fireEvent.click(within(exerciseCard!).getByRole("button", { name: "Comentário" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.change(within(dialog).getByLabelText("Comentário"), {
      target: { value: "Ajuste local" },
    });
    fireEvent.click(within(dialog).getByRole("button", { name: "Salvar" }));
    fireEvent.click(within(exerciseCard!).getByRole("button", { name: "Comentário" }));
    expect(within(screen.getByRole("dialog")).getByLabelText("Comentário")).toHaveValue(
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
    fireEvent.change(screen.getByLabelText("Série 1 Repetições"), { target: { value: "8" } });
    const check = screen.getByRole("button", { name: "Confirmar série 1" });
    expect(check).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(check);
    expect(check).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(screen.getByRole("button", { name: "+ Aquecimento" }));
    expect(screen.getByLabelText("Aquecimento 1")).toHaveTextContent("W");
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercício" }));
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
    expect(screen.queryByText(/exercícios registrados/i)).not.toBeInTheDocument();
    expect(screen.queryByText("Registrado")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercício para edição" }));
    expect(screen.getByLabelText("Repetições")).toHaveValue(8);
    fireEvent.change(screen.getByLabelText("Repetições"), { target: { value: "9" } });
    fireEvent.click(screen.getByRole("switch", { name: "Concluir exercício" }));
    expect(screen.queryByLabelText("Repetições")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("switch", { name: "Reabrir exercício para edição" }));
    expect(screen.getByLabelText("Repetições")).toHaveValue(9);
    expect(action).not.toHaveBeenCalled();
  });

  it("keeps a scheduled structured workout compact and summarizes both phases", () => {
    renderCard(createStructuredActivity({ status: "scheduled" }));

    expect(
      screen.getByText("09:00 · 75 min (inclui 10 min de aquecimento) · Não iniciado"),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Iniciar treino" })).toBeInTheDocument();
    expect(screen.queryByText("Knee to wall")).not.toBeInTheDocument();
  });

  it("opens in warmup, navigates without losing state and exposes the semantic switch", async () => {
    renderCard(createStructuredActivity({ status: "in_progress" }));

    await waitFor(() => expect(screen.getByText("Knee to wall")).toBeInTheDocument());
    expect(screen.getByText("Preparação", { selector: "span[data-slot='badge']" })).toHaveClass(
      "border-status-info-border",
    );
    await waitFor(() =>
      expect(screen.getByRole("switch", { name: "Concluir exercício" })).toHaveAttribute(
        "aria-checked",
        "false",
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ir para o treino" }));
    expect(screen.getByText("Treino", { selector: "span[data-slot='badge']" })).toHaveClass(
      "border-status-warning-border",
    );
    expect(screen.getByText("Agachamento")).toBeInTheDocument();
    expect(screen.getByText(/65 min · high quality heavy/)).toBeInTheDocument();
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
      expect(screen.getByText("Aquecimento de Jogo de futevôlei")).toBeInTheDocument(),
    );
    expect(screen.getByRole("button", { name: "Ir para a atividade" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Ir para a atividade" }));
    expect(screen.getByText("Futevôlei · 120 min planejados")).toBeInTheDocument();
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

    expect(screen.getByText(/Horário a definir · Duração a definir/)).toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByText("Duração a definir · preparação opcional")).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ir para a atividade" }));
    expect(screen.getByText("Futevôlei · Duração a definir")).toBeInTheDocument();
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
    expect(screen.getByText("Corrigir avaliação")).toBeInTheDocument();
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
    expect(screen.getByText(/Não realizado/)).toBeInTheDocument();
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
    fireEvent.click(screen.getByText("Corrigir avaliação"));
    expect(screen.queryByLabelText("Intensidade")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Disposição durante a atividade")).not.toBeInTheDocument();
    expect(screen.getByLabelText("Comentário")).toBeInTheDocument();
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
    fireEvent.click(screen.getByText("Corrigir exercício"));
    expect(screen.getByLabelText("Repetições")).toHaveValue(8);
    fireEvent.change(screen.getByLabelText("Repetições"), { target: { value: "9" } });
    expect(action).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Salvar correção" }));
    await waitFor(() => expect(action).toHaveBeenCalledTimes(1));
  });
});

function renderCard(activity: TrainingActivityDto) {
  return render(
    <TrainingActivityCard civilDate="2026-09-17" activity={activity} actions={actions} />,
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
    name: "Aquecimento de Jogo de futevôlei",
    type: "mobility",
    role: "preparation",
    plannedDurationMinutes: 10,
  };
  return {
    ...activityBase,
    name: "Jogo de futevôlei",
    type: "sport_practice",
    sport: "Futevôlei",
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
