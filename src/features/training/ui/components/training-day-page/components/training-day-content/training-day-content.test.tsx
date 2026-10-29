import { cleanup, render, screen } from "../../../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it, vi } from "vitest";

import type {
  PublicTrainingExerciseDto,
  TrainingDayDto,
  TrainingDayExerciseDto,
  TrainingDayPageQueryResult,
  TrainingDaySessionDto,
} from "@/features/training/application/training-dto";
import type { CivilDate } from "@/features/training/domain/training-day.types";

import { TrainingDayContent } from "./training-day-content";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const { default: messages } = await import("../../../../../../../../messages/pt-BR.json");
  return {
    getTranslations: async (namespace: "training") =>
      createTranslator({ locale: "pt-BR", messages, namespace }),
  };
});

const civilDate = "2026-09-16" as CivilDate;

afterEach(cleanup);

describe("TrainingDayContent", () => {
  it("does not reveal the former assignment when the last activity was removed", async () => {
    render(
      await renderReadyDay({
        ...assignedBase,
        state: "training",
        preparation: null,
        main: createSession("main", "Treino excluído"),
      }),
    );

    expect(screen.getByText("Nenhuma atividade programada")).toBeInTheDocument();
    expect(screen.queryByText("Treino excluído")).not.toBeInTheDocument();
  });

  it("renders a safe failure instead of a partial projection", async () => {
    render(
      await TrainingDayContent({
        result: Promise.resolve({ status: "invalid_data", reason: "reference_invalid" }),
      }),
    );

    expect(screen.getByText("Não foi possível resolver o treino")).toBeInTheDocument();
    expect(screen.getByText(/Nenhum dado parcial foi exibido/)).toBeInTheDocument();
  });

  it("distinguishes an unavailable active plan from inconsistent data", async () => {
    render(
      await renderReadyDay({
        state: "unavailable",
        civilDate,
        reason: "active_plan_not_found",
        activities: [],
      }),
    );

    expect(screen.getByText("Plano de treino indisponível")).toBeInTheDocument();
    expect(screen.queryByText("Não foi possível resolver o treino")).not.toBeInTheDocument();
  });

  it("reports a missing plan schedule without turning session choice into the primary flow", async () => {
    render(
      await renderReadyDay({
        state: "unassigned",
        civilDate,
        assignmentId: null,
        assignmentRevision: null,
        activities: [],
        availablePlan: {
          status: "available",
          planId: "performance",
          version: "2.0.0",
          sourceStatus: "approved",
          sessions: [
            {
              ...createSession("main"),
              assignmentRole: "main",
              compatiblePreparationSessionIds: [],
            },
          ],
        },
      }),
    );

    expect(screen.getByText("Nenhuma atividade programada")).toBeInTheDocument();
    expect(screen.queryByText("Sessão principal")).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });

  it("does not render assignment sessions without an activity", async () => {
    render(
      await renderReadyDay({
        ...assignedBase,
        state: "mobility",
        mobility: createSession("mobility", "Mobilidade leve"),
      }),
    );

    expect(screen.getByText("Nenhuma atividade programada")).toBeInTheDocument();
    expect(screen.queryByText("Mobilidade leve")).not.toBeInTheDocument();
  });

  it("renders rest explicitly without artificial exercises", async () => {
    render(
      await renderReadyDay({
        state: "rest",
        civilDate,
        assignmentId: "assignment-rest",
        assignmentRevision: 1,
        availablePlan: null,
        reason: "Recuperação programada",
        execution: null,
        activities: [],
      }),
    );

    expect(screen.getByRole("heading", { level: 2, name: "Descanso hoje" })).toBeInTheDocument();
    expect(screen.getByText("Recuperação programada")).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 3 })).not.toBeInTheDocument();
  });
});

const assignedBase = {
  civilDate,
  assignmentId: "assignment-1",
  assignmentRevision: 1,
  planId: "performance",
  planVersion: "2.0.0",
  availablePlan: {
    status: "available",
    planId: "performance",
    version: "2.0.0",
    sourceStatus: "approved",
    sessions: [],
  },
  execution: null,
  plannedStartTime: "09:00",
  plannedEndTime: "10:05",
  plannedDurationMinutes: 65,
  activities: [],
} as const;

async function renderReadyDay(day: TrainingDayDto) {
  const result: TrainingDayPageQueryResult = { status: "ready", day };
  return TrainingDayContent({ result: Promise.resolve(result) });
}

function createSession(
  role: TrainingDaySessionDto["role"],
  name = "Sessão principal",
  exercises = [createExercise()],
): TrainingDaySessionDto {
  return {
    role,
    sessionId: `session-${role}`,
    name,
    targetDurationMinutes: 45,
    shortDurationMinutes: 30,
    intensity: "moderada",
    notes: null,
    exercises,
  };
}

function createExercise(
  overrides: Partial<PublicTrainingExerciseDto & TrainingDayExerciseDto> &
    Readonly<{ prescriptionId?: string; loadKg?: string | null }> = {},
) {
  const { loadKg = null, ...publicOverrides } = overrides;

  return {
    prescriptionId: "prescription-1",
    exerciseId: "exercise-1",
    name: "Mobilidade de quadril",
    ordinal: 1,
    prescribedSets: 1,
    prescribedText: "1 x 8 repetições",
    restSeconds: 60,
    priorityLevel: null,
    notes: null,
    dose: {
      sourceText: "8 repetições",
      minimum: 8,
      maximum: 8,
      unit: "repetitions",
      scope: "total",
      qualifier: null,
    },
    measurementType: "repetitions",
    loadApplicable: false,
    loadUnit: null,
    instructions: ["Execute com controle."],
    cues: [],
    risks: null,
    executionId: null,
    status: "completed",
    comment: null,
    revision: null,
    sets: [
      {
        setNumber: 1,
        status: "completed",
        value: 8,
        leftValue: null,
        rightValue: null,
        directionValues: null,
        loadKg,
        revision: 1,
      },
    ],
    ...publicOverrides,
  } as const;
}
