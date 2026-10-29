import {
  act,
  cleanup,
  renderHook,
  waitFor,
} from "../../../../../../tests/support/render-localized";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import { useTrainingActivityDraft } from "./use-training-activity-draft";
import {
  isTrainingActivityDraft,
  trainingActivityDraftKey,
} from "./use-training-activity-draft.utils";

const civilDate = "2026-09-17";
const activity: TrainingActivityDto = {
  id: "11111111-1111-4111-8111-111111111111",
  type: "sport_practice",
  source: "manual",
  role: "primary",
  name: "Jogo",
  sport: "Futevôlei",
  status: "scheduled",
  plannedStartTime: "18:00",
  plannedEndTime: "19:30",
  plannedDurationMinutes: 90,
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

beforeEach(() => {
  vi.setSystemTime(new Date("2026-09-17T15:00:00Z"));
  window.localStorage.clear();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("useTrainingActivityDraft", () => {
  it("captures the latest exercise and one stop instant synchronously under rapid clicks", async () => {
    const { result } = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.start());
    vi.setSystemTime(new Date("2026-09-17T15:01:00Z"));
    let snapshot: ReturnType<typeof result.current.prepareCompletion> = null;
    act(() => {
      result.current.updateExercise("main:one", {
        sessionId: "one",
        exerciseId: "one",
        role: "main",
        completed: true,
        comment: "Latest",
        sets: [],
      });
      snapshot = result.current.prepareCompletion();
    });
    expect(snapshot!.draft.exercises["main:one"]?.comment).toBe("Latest");
    expect(snapshot!.draft.intervals[0]?.endedAt).toBe(snapshot!.completionRequestedAt);
    act(() => {
      result.current.resume();
      result.current.resume();
    });
    expect(result.current.draft?.intervals).toHaveLength(2);
    act(() => {
      result.current.pause();
      result.current.pause();
    });
    expect(result.current.draft?.intervals).toHaveLength(2);
    expect(result.current.draft?.status).toBe("paused");
  });
  it("freezes an existing clock even if storage fails at stop", async () => {
    const { result } = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => result.current.start());
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("full");
    });
    act(() => {
      expect(result.current.prepareCompletion()?.draft.status).toBe("paused");
    });
    expect(result.current.storageError).toBe(true);
    expect(result.current.draft?.intervals[0]?.endedAt).toBeTruthy();
  });

  it("starts without modifying a running draft outside the editable window", async () => {
    const oldDate = "2026-09-15";
    const oldActivityId = "22222222-2222-4222-8222-222222222222";
    const oldKey = trainingActivityDraftKey(oldDate, oldActivityId);
    const storedDraft = JSON.stringify({
      version: 1,
      activityId: oldActivityId,
      civilDate: oldDate,
      expectedRevision: 0,
      status: "in_progress",
      startedAt: "2026-09-15T12:00:00.000Z",
      intervals: [{ startedAt: "2026-09-15T12:00:00.000Z", endedAt: null }],
      exercises: {},
    });
    window.localStorage.setItem(oldKey, storedDraft);
    const confirmation = vi.spyOn(window, "confirm");
    const current = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(current.result.current.ready).toBe(true));
    act(() => expect(current.result.current.start()).toBe(true));
    expect(window.localStorage.getItem(oldKey)).toBe(storedDraft);
    expect(confirmation).not.toHaveBeenCalled();
  });

  it("does not let a malformed unrelated draft prevent starting", async () => {
    const malformedKey = trainingActivityDraftKey(civilDate, "unrelated");
    window.localStorage.setItem(malformedKey, "not-json");
    const current = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(current.result.current.ready).toBe(true));
    act(() => expect(current.result.current.start()).toBe(true));
    expect(window.localStorage.getItem(malformedKey)).toBe("not-json");
  });
  it("rejects unrelated or malformed local data", () => {
    expect(isTrainingActivityDraft(null, activity.id, civilDate)).toBe(false);
    expect(
      isTrainingActivityDraft({ version: 2, activityId: activity.id }, activity.id, civilDate),
    ).toBe(false);
  });

  it("starts, pauses, resumes and clears an activity without a server call", async () => {
    const { result } = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(result.current.ready).toBe(true));
    act(() => expect(result.current.start()).toBe(true));
    expect(result.current.draft?.status).toBe("in_progress");
    act(() => result.current.pause());
    expect(result.current.draft?.status).toBe("paused");
    expect(result.current.draft?.intervals[0]?.endedAt).toBeTruthy();
    act(() => result.current.resume());
    expect(result.current.draft?.intervals).toHaveLength(2);
    expect(result.current.draft?.status).toBe("in_progress");
    await waitFor(() =>
      expect(
        window.localStorage.getItem(trainingActivityDraftKey(civilDate, activity.id)),
      ).toContain("in_progress"),
    );
    act(() => result.current.clear());
    expect(result.current.draft).toBeNull();
    expect(
      window.localStorage.getItem(trainingActivityDraftKey(civilDate, activity.id)),
    ).toBeNull();
  });

  it("recovers only a matching local draft", async () => {
    const key = trainingActivityDraftKey(civilDate, activity.id);
    window.localStorage.setItem(key, "not-json");
    const invalid = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(invalid.result.current.ready).toBe(true));
    expect(invalid.result.current.draft).toBeNull();
    invalid.unmount();

    const draft = {
      version: 1,
      activityId: activity.id,
      civilDate,
      expectedRevision: 0,
      status: "paused",
      startedAt: "2026-09-17T12:00:00.000Z",
      intervals: [{ startedAt: "2026-09-17T12:00:00.000Z", endedAt: "2026-09-17T12:10:00.000Z" }],
      exercises: {},
    };
    window.localStorage.setItem(key, JSON.stringify(draft));
    const recovered = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() => expect(recovered.result.current.draft?.status).toBe("paused"));
  });

  it("asks before pausing another local activity", async () => {
    const otherActivity = { ...activity, id: "22222222-2222-4222-8222-222222222222" };
    const other = renderHook(() =>
      useTrainingActivityDraft({ activity: otherActivity, civilDate }),
    );
    const current = renderHook(() => useTrainingActivityDraft({ activity, civilDate }));
    await waitFor(() =>
      expect(other.result.current.ready && current.result.current.ready).toBe(true),
    );
    act(() => other.result.current.start());
    const confirmation = vi.spyOn(window, "confirm").mockReturnValue(false);
    act(() => expect(current.result.current.start()).toBe(false));
    expect(other.result.current.draft?.status).toBe("in_progress");
    confirmation.mockReturnValue(true);
    act(() => expect(current.result.current.start()).toBe(true));
    expect(other.result.current.draft?.status).toBe("paused");
    expect(current.result.current.draft?.status).toBe("in_progress");
  });
});
