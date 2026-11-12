import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  render,
  renderHook,
  screen,
  waitFor,
} from "../../../../../../tests/support/render-localized";
import type {
  TrainingActivityDto,
  TrainingDayExerciseDto,
} from "../../../application/training-dto";
import { ActiveTrainingBar } from "../../components/active-training-bar/active-training-bar";
import { completionDraftKey } from "../../lib/training-activity-completion-draft/training-activity-completion-draft";
import { useTrainingActivityDraft } from "./use-training-activity-draft";
import {
  startTrainingActivityDraft,
  trainingActivityDraftKey,
} from "./use-training-activity-draft.utils";
import { reconcileCompletedTrainingDraft } from "./reconcile-completed-training-draft";
import { TRAINING_ACTIVITY_DRAFT_EVENT } from "./use-training-activity-draft.constants";

vi.mock("next/navigation", () => ({ usePathname: () => "/workout" }));
const civilDate = "2026-11-11";
const startedAt = "2026-11-11T12:00:00.000Z";
const endedAt = "2026-11-11T13:00:00.000Z";
const exercise: TrainingDayExerciseDto = {
  prescriptionId: "prescription",
  exerciseId: "bench",
  name: "Supino",
  ordinal: 1,
  prescribedSets: 1,
  prescribedText: "8 repetições",
  restSeconds: 60,
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
  loadApplicable: true,
  loadUnit: "kg",
  instructions: [],
  cues: [],
  risks: null,
  executionId: "execution",
  status: "completed",
  comment: "Controle",
  revision: 0,
  sets: [
    {
      setNumber: 1,
      kind: "work",
      confirmed: true,
      status: "completed",
      value: 8,
      leftValue: null,
      rightValue: null,
      directionValues: null,
      loadKg: "20",
      revision: 0,
    },
  ],
};
const activity: TrainingActivityDto = {
  id: "one",
  type: "structured_training",
  source: "plan",
  role: "primary",
  name: "Superiores",
  sport: null,
  status: "completed",
  plannedStartTime: "09:00",
  plannedEndTime: "10:00",
  plannedDurationMinutes: 60,
  actualStartTime: "09:00",
  actualEndTime: "10:00",
  actualDurationMinutes: 60,
  startedAt,
  completedAt: endedAt,
  accumulatedActiveSeconds: 3600,
  currentIntervalStartedAt: null,
  intervals: [{ startedAt, endedAt }],
  intensity: "high",
  energy: "normal",
  comment: "Bom treino",
  revision: 1,
  structured: {
    preparation: null,
    main: {
      role: "main",
      sessionId: "push",
      name: "Superiores",
      targetDurationMinutes: 60,
      shortDurationMinutes: null,
      intensity: null,
      notes: null,
      exercises: [exercise],
    },
  },
  preparations: [],
};
const key = trainingActivityDraftKey(civilDate, activity.id);
const feedbackKey = completionDraftKey("complete", civilDate, activity.id);

function seed() {
  const initial = startTrainingActivityDraft(
    { ...activity, status: "scheduled", revision: 0 },
    civilDate,
    startedAt,
  );
  const draft = { ...initial, status: "paused" as const, intervals: [{ startedAt, endedAt }] };
  draft.exercises["main:bench"]!.comment = " Controle ";
  draft.exercises["main:bench"]!.sets = draft.exercises["main:bench"]!.sets.map((set) => ({
    ...set,
    loadKg: "020,000",
  }));
  const feedback = {
    version: 1,
    revision: 0,
    action: "complete",
    values: { intensity: "high", energy: "normal", comment: " Bom treino " },
    executionSignature: JSON.stringify(draft),
    completionRequestedAt: endedAt,
    expiresAt: Date.now() + 60_000,
    writerId: "tab",
  };
  localStorage.setItem(key, JSON.stringify(draft));
  sessionStorage.setItem(feedbackKey, JSON.stringify(feedback));
  return { draft, feedback };
}

beforeEach(() => {
  vi.setSystemTime(new Date("2026-11-11T14:00:00Z"));
  localStorage.clear();
  sessionStorage.clear();
  seed();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("reconcileCompletedTrainingDraft", () => {
  it("limpa somente as duas cópias confirmadas e atualiza a barra de retomada", async () => {
    localStorage.setItem("unrelated", "preserve");
    render(<ActiveTrainingBar />);
    await screen.findByRole("link", { name: /Voltar ao treino/ });
    act(() => expect(reconcileCompletedTrainingDraft(activity, civilDate)).toBe("cleared"));
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /Voltar ao treino/ })).not.toBeInTheDocument(),
    );
    expect(localStorage.getItem(key)).toBeNull();
    expect(sessionStorage.getItem(feedbackKey)).toBeNull();
    expect(localStorage.getItem("unrelated")).toBe("preserve");
  });

  it.each([
    "revision",
    "start",
    "interval",
    "set",
    "confirmation",
    "feedback",
    "signature",
    "missingFeedback",
    "duplicateSet",
  ])("preserva os dados quando há divergência em %s", (change) => {
    const { draft, feedback } = seed();
    if (change === "revision") draft.expectedRevision = 3;
    if (change === "start") draft.startedAt = "2026-11-11T11:00:00Z";
    if (change === "interval") draft.intervals[0]!.endedAt = "2026-11-11T12:59:00Z";
    if (change === "set")
      draft.exercises["main:bench"]!.sets = draft.exercises["main:bench"]!.sets.map((set) => ({
        ...set,
        value: "9",
      }));
    if (change === "confirmation")
      draft.exercises["main:bench"]!.sets = draft.exercises["main:bench"]!.sets.map((set) => ({
        ...set,
        confirmed: false,
      }));
    if (change === "feedback") feedback.values.comment = "Outra avaliação";
    feedback.executionSignature = change === "signature" ? "outro" : JSON.stringify(draft);
    if (change === "duplicateSet")
      draft.exercises["main:bench"]!.sets = [
        ...draft.exercises["main:bench"]!.sets,
        ...draft.exercises["main:bench"]!.sets,
      ];
    localStorage.setItem(key, JSON.stringify(draft));
    sessionStorage.setItem(feedbackKey, JSON.stringify(feedback));
    if (change === "missingFeedback") sessionStorage.removeItem(feedbackKey);
    const before = localStorage.getItem(key);
    expect(reconcileCompletedTrainingDraft(activity, civilDate)).toBe("preserved");
    expect(localStorage.getItem(key)).toBe(before);
  });

  it("preserva uma cópia modificada durante a conferência", () => {
    const getItem = Storage.prototype.getItem;
    let reads = 0;
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(function (this: Storage, name) {
      if (this === localStorage && name === key && ++reads === 2)
        localStorage.setItem(key, "newer");
      return getItem.call(this, name);
    });
    expect(reconcileCompletedTrainingDraft(activity, civilDate)).toBe("preserved");
    expect(localStorage.getItem(key)).toBe("newer");
    expect(sessionStorage.getItem(feedbackKey)).not.toBeNull();
  });

  it("mantém as cópias se o armazenamento recusar a remoção", () => {
    vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {
      throw Error("blocked");
    });
    expect(reconcileCompletedTrainingDraft(activity, civilDate)).toBe("storage_error");
    expect(localStorage.getItem(key)).not.toBeNull();
    expect(sessionStorage.getItem(feedbackKey)).not.toBeNull();
  });

  it("reconcilia na recarga e ignora eventos antigos sobre a sessão concluída", async () => {
    const { draft } = seed();
    const hook = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(hook.result.current.ready).toBe(true));
    expect(hook.result.current.reconciliation).toBe("cleared");
    act(() => expect(hook.result.current.start()).toBe(false));
    act(() =>
      window.dispatchEvent(
        new CustomEvent(TRAINING_ACTIVITY_DRAFT_EVENT, { detail: { key, draft } }),
      ),
    );
    expect(hook.result.current.draft).toBeNull();
  });

  it("retira o estado ativo da memória quando o servidor confirma a conclusão", async () => {
    const { draft } = seed();
    const hook = renderHook(
      ({ current }) => useTrainingActivityDraft({ activity: current, civilDate }),
      {
        initialProps: {
          current: {
            ...activity,
            status: "scheduled" as TrainingActivityDto["status"],
            revision: 0,
          },
        },
      },
    );
    await waitFor(() => expect(hook.result.current.draft).toEqual(draft));
    hook.rerender({ current: activity });
    await waitFor(() => expect(hook.result.current.draft).toBeNull());
    expect(localStorage.getItem(key)).toBeNull();
  });
});
