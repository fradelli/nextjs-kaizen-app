import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type {
  AvailablePublicTrainingPlanDto,
  TrainingActivityDto,
} from "@/features/training/application/training-dto";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";
import { TrainingActivityForm } from "./training-activity-form";

const navigation = vi.hoisted(() => ({ refresh: vi.fn(), push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => navigation }));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.localStorage.clear();
});
const plan: AvailablePublicTrainingPlanDto = {
  status: "available",
  planId: "plan",
  version: "2",
  sourceStatus: "active",
  sessions: [
    {
      sessionId: "a",
      name: "Treino A",
      targetDurationMinutes: 40,
      shortDurationMinutes: 20,
      intensity: null,
      notes: null,
      assignmentRole: "main",
      compatiblePreparationSessionIds: [],
      exercises: [],
    },
    {
      sessionId: "b",
      name: "Treino B",
      targetDurationMinutes: 60,
      shortDurationMinutes: null,
      intensity: null,
      notes: null,
      assignmentRole: "main",
      compatiblePreparationSessionIds: [],
      exercises: [],
    },
  ],
};
const activity: TrainingActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "structured_training",
  source: "manual",
  role: "primary",
  name: "Treino antigo",
  sport: null,
  status: "scheduled",
  plannedStartTime: "18:00",
  plannedEndTime: "18:30",
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
  revision: 3,
  preparations: [],
  structured: {
    main: {
      sessionId: "a",
      name: "Treino antigo",
      role: "main",
      targetDurationMinutes: 30,
      shortDurationMinutes: null,
      intensity: null,
      notes: null,
      exercises: [],
    },
    preparation: null,
  },
};
const saved = vi.fn<TrainingFormAction>(async () => ({ status: "saved", revision: 4 }));
function change(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}
function end() {
  return screen.getByLabelText("Fim planejado");
}
function renderForm(
  action: TrainingFormAction = saved,
  existing?: TrainingActivityDto,
  availablePlan = plan,
) {
  return render(
    <TrainingActivityForm
      civilDate="2026-10-26"
      action={action}
      activity={existing}
      availablePlan={availablePlan}
    />,
  );
}
function chooseTraining() {
  change("Tipo de atividade", "structured_training");
}
function submit() {
  fireEvent.submit(
    screen.getByRole("button", { name: /Adicionar atividade|Salvar alterações/ }).closest("form")!,
  );
}

describe("training activity schedule experience", () => {
  it.each([true, false])("calculates regardless of session/start order (%s)", (startFirst) => {
    renderForm();
    if (startFirst) change("Início planejado", "18:00");
    chooseTraining();
    if (!startFirst) change("Início planejado", "18:00");
    expect(end()).toHaveValue("18:40");
    change("Treino", "b");
    expect(end()).toHaveValue("19:00");
    change("Início planejado", "19:00");
    expect(end()).toHaveValue("20:00");
  });
  it("preserves manual and cleared endings until explicitly restored", () => {
    renderForm();
    chooseTraining();
    change("Início planejado", "18:00");
    change("Fim planejado", "18:50");
    change("Treino", "b");
    expect(end()).toHaveValue("18:50");
    change("Fim planejado", "");
    change("Início planejado", "19:00");
    expect(end()).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Usar duração do treino" }));
    expect(end()).toHaveValue("20:00");
  });
  it("preserves a manually entered value even when equal to the suggestion", () => {
    renderForm();
    chooseTraining();
    change("Fim planejado", "18:40");
    change("Início planejado", "18:00");
    change("Treino", "b");
    expect(end()).toHaveValue("18:40");
  });
  it("freezes the ending when switching to a manual activity type and back", () => {
    renderForm();
    chooseTraining();
    change("Início planejado", "18:00");
    change("Tipo de atividade", "mobility");
    change("Início planejado", "19:00");
    expect(end()).toHaveValue("18:40");
    chooseTraining();
    expect(end()).toHaveValue("18:40");
  });
  it("clears obsolete automatic suggestions and explains midnight overflow", () => {
    renderForm();
    chooseTraining();
    change("Início planejado", "18:00");
    change("Início planejado", "");
    expect(end()).toHaveValue("");
    change("Início planejado", "23:20");
    expect(end()).toHaveValue("");
    expect(screen.getByText(/terminaria no dia seguinte/)).toBeInTheDocument();
    change("Fim planejado", "23:50");
    expect(end()).toHaveValue("23:50");
  });
  it("does not substitute a missing duration", () => {
    renderForm(saved, undefined, {
      ...plan,
      sessions: [{ ...plan.sessions[0], targetDurationMinutes: 0 }],
    });
    chooseTraining();
    change("Início planejado", "18:00");
    expect(end()).toHaveValue("");
    expect(screen.getByText(/Não foi possível calcular/)).toBeInTheDocument();
  });
  it("preserves persisted hours and uses the historical session duration, not the active version", () => {
    renderForm(saved, activity);
    expect(end()).toHaveValue("18:30");
    change("Início planejado", "19:00");
    expect(end()).toHaveValue("18:30");
    fireEvent.click(screen.getByRole("button", { name: "Usar duração do treino" }));
    expect(end()).toHaveValue("19:30");
    expect(saved).not.toHaveBeenCalled();
  });
  it("does not replace an absent historical session or revision on refreshed props", () => {
    const view = renderForm(saved, activity, { ...plan, sessions: [plan.sessions[1]] });
    change("Fim planejado", "18:55");
    view.rerender(
      <TrainingActivityForm
        civilDate="2026-10-26"
        action={saved}
        activity={{ ...activity, revision: 9 }}
        availablePlan={plan}
      />,
    );
    expect(end()).toHaveValue("18:55");
    expect(view.container.querySelector('[name="expectedRevision"]')).toHaveValue("3");
    expect(screen.getByRole("option", { name: "Treino antigo" })).toBeInTheDocument();
  });
  it("blocks invalid intervals without dispatching a mutation", () => {
    const action = vi.fn<TrainingFormAction>();
    renderForm(action);
    chooseTraining();
    change("Início planejado", "18:00");
    change("Fim planejado", "17:00");
    submit();
    expect(action).not.toHaveBeenCalled();
    expect(end()).toHaveAttribute("aria-invalid", "true");
  });
  it.each(["invalid", "conflict"] as const)(
    "preserves all fields after %s from the actual action state",
    async (status) => {
      const action = vi.fn<TrainingFormAction>(async () => ({ status, message: "Não foi salvo." }));
      renderForm(action);
      change("Nome", "Jogo");
      change("Esporte", "Futevôlei");
      change("Início planejado", "18:00");
      change("Fim planejado", "18:50");
      submit();
      await screen.findByText("Não foi salvo.");
      expect(screen.getByLabelText("Nome")).toHaveValue("Jogo");
      expect(end()).toHaveValue("18:50");
      expect(action.mock.calls[0][1].get("plannedEndTime")).toBe("18:50");
    },
  );
  it("preserves input when the server action rejects because the connection failed", async () => {
    const action = vi.fn<TrainingFormAction>().mockRejectedValue(new Error("offline"));
    renderForm(action);
    chooseTraining();
    change("Início planejado", "18:00");
    change("Fim planejado", "18:55");
    submit();
    await screen.findByText(
      "Não foi possível confirmar o salvamento. Confira a agenda antes de tentar novamente.",
    );
    expect(end()).toHaveValue("18:55");
    expect(end()).not.toBeDisabled();
  });
  it("freezes controls while saving and resets a successful addition", async () => {
    let finish!: () => void;
    const action: TrainingFormAction = () =>
      new Promise((resolve) => {
        finish = () => resolve({ status: "saved", revision: 1 });
      });
    renderForm(action);
    chooseTraining();
    change("Início planejado", "18:00");
    submit();
    await waitFor(() => expect(end()).toBeDisabled());
    await act(async () => finish());
    await screen.findByText("Salvo.");
    expect(end()).toHaveValue("");
    expect(screen.getByLabelText("Tipo de atividade")).toHaveValue("sport_practice");
  });
  it("uses the saved revision and preserves the submitted ending after editing", async () => {
    const action = vi.fn<TrainingFormAction>(async () => ({ status: "saved", revision: 4 }));
    const view = renderForm(action, activity);
    change("Fim planejado", "18:55");
    submit();
    await screen.findByText("Salvo.");
    expect(end()).toHaveValue("18:55");
    expect(view.container.querySelector('[name="expectedRevision"]')).toHaveValue("4");
    expect(action.mock.calls[0][1].get("expectedRevision")).toBe("3");
  });
});

describe("preparation choice and rescheduling", () => {
  const preparedPlan: AvailablePublicTrainingPlanDto = {
    ...plan,
    preparationSuggestions: [{ sport: "Footvolley", sessionId: "warmup" }],
    sessions: [
      ...plan.sessions,
      {
        ...plan.sessions[0],
        sessionId: "warmup",
        name: "Aquecimento futevôlei",
        assignmentRole: "preparation",
      },
      {
        ...plan.sessions[0],
        sessionId: "other_warmup",
        name: "Outro aquecimento",
        assignmentRole: "preparation",
      },
    ],
  };
  it("suggests the real plan warmup for Portuguese sport and preserves a manual choice", () => {
    renderForm(saved, undefined, preparedPlan);
    change("Tipo de atividade", "specific_training");
    change("Esporte", "Futevôlei");
    expect(screen.getByLabelText("Aquecimento")).toHaveValue("warmup");
    change("Aquecimento", "other_warmup");
    change("Esporte", "Outro esporte");
    expect(screen.getByLabelText("Aquecimento")).toHaveValue("other_warmup");
    expect(
      screen.getByLabelText("Aquecimento").querySelector('[value="a"]'),
    ).not.toBeInTheDocument();
  });
  it("submits an explicit no-warmup choice and preserves it after failure", async () => {
    const action = vi.fn<TrainingFormAction>(async () => ({
      status: "invalid",
      message: "Não salvo",
    }));
    renderForm(action, undefined, preparedPlan);
    change("Tipo de atividade", "specific_training");
    change("Nome", "Treino extra");
    change("Esporte", "Futevôlei");
    change("Aquecimento", "none");
    change("Início planejado", "18:00");
    change("Fim planejado", "19:00");
    submit();
    await screen.findByText("Não salvo");
    expect(action.mock.calls[0][1].get("preparationSessionId")).toBe("none");
    expect(screen.getByLabelText("Aquecimento")).toHaveValue("none");
  });
  it("submits original and destination dates separately and navigates only after success", async () => {
    const action = vi.fn<TrainingFormAction>(async () => ({ status: "saved", revision: 4 }));
    renderForm(action, activity);
    change("Data da atividade", "2026-10-28");
    submit();
    await waitFor(() => expect(navigation.push).toHaveBeenCalledWith("/treino?date=2026-10-28"));
    expect(action.mock.calls[0][1].get("civilDate")).toBe("2026-10-26");
    expect(action.mock.calls[0][1].get("targetCivilDate")).toBe("2026-10-28");
    expect(action.mock.calls[0][1].get("plannedEndTime")).toBe("18:30");
  });
  it("keeps destination and hours after a rescheduling conflict without navigating", async () => {
    const action = vi.fn<TrainingFormAction>(async () => ({
      status: "conflict",
      message: "Conflito",
    }));
    renderForm(action, activity);
    change("Data da atividade", "2026-10-28");
    submit();
    await screen.findByText("Conflito");
    expect(navigation.push).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Data da atividade")).toHaveValue("2026-10-28");
    expect(end()).toHaveValue("18:30");
  });
  it("blocks rescheduling if a draft exists only in the browser", () => {
    const action = vi.fn<TrainingFormAction>();
    renderForm(action, activity);
    window.localStorage.setItem(`kaizen:training-draft:v1:2026-10-26:${activity.id}`, "draft");
    change("Data da atividade", "2026-10-28");
    submit();
    expect(screen.getByRole("alert")).toHaveTextContent("treino iniciado neste navegador");
    expect(action).not.toHaveBeenCalled();
  });
  it("disables rescheduling for already started activities", () => {
    renderForm(saved, { ...activity, status: "paused", startedAt: "2026-10-26T21:00:00Z" });
    expect(screen.getByLabelText("Data da atividade")).toBeDisabled();
  });
});
