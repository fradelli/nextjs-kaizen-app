import type { TrainingActivityDto } from "../../../application/training-dto";
import {
  completionDraftKey,
  completionDraftSchema,
} from "../../lib/training-activity-completion-draft/training-activity-completion-draft";
import { TRAINING_ACTIVITY_DRAFT_EVENT } from "./use-training-activity-draft.constants";
import {
  isTrainingActivityDraft,
  trainingActivityDraftKey,
  trainingExerciseDraftKey,
} from "./use-training-activity-draft.utils";

import type {
  TrainingDraftReconciliation,
  TrainingExerciseExecutionDraft,
} from "./use-training-activity-draft.types";

// This acknowledges an existing server result. It never submits or modifies an execution.
export function reconcileCompletedTrainingDraft(
  activity: TrainingActivityDto,
  civilDate: string,
): TrainingDraftReconciliation {
  if (activity.status !== "completed") return "none";
  const key = trainingActivityDraftKey(civilDate, activity.id);
  const feedbackKey = completionDraftKey("complete", civilDate, activity.id);
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return "none";
    const draft: unknown = JSON.parse(raw);
    if (!isTrainingActivityDraft(draft, activity.id, civilDate)) return "preserved";
    const feedbackRaw = sessionStorage.getItem(feedbackKey);
    const feedback = completionDraftSchema.safeParse(feedbackRaw ? JSON.parse(feedbackRaw) : null);
    if (
      !feedback.success ||
      feedback.data.action !== "complete" ||
      feedback.data.revision !== draft.expectedRevision ||
      feedback.data.executionSignature !== JSON.stringify(draft) ||
      !feedback.data.completionRequestedAt ||
      activity.revision !== draft.expectedRevision + 1 ||
      draft.status !== "paused" ||
      !sameInstant(activity.startedAt, draft.startedAt) ||
      !Array.isArray(draft.intervals) ||
      draft.intervals.length !== activity.intervals.length ||
      !draft.intervals.every((interval, index) => {
        const saved = activity.intervals[index];
        return (
          saved &&
          interval.endedAt &&
          sameInstant(interval.startedAt, saved.startedAt) &&
          sameInstant(interval.endedAt, saved.endedAt)
        );
      }) ||
      (feedback.data.values.comment.trim() || null) !== activity.comment ||
      (activity.type !== "mobility" &&
        (feedback.data.values.intensity !== activity.intensity ||
          feedback.data.values.energy !== activity.energy))
    )
      return "preserved";
    const endTime = new Intl.DateTimeFormat("en-GB", {
      timeZone: "America/Sao_Paulo",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).format(new Date(feedback.data.completionRequestedAt));
    if (endTime !== activity.actualEndTime) return "preserved";
    const sessions = [
      activity.structured?.preparation ?? activity.preparationSession,
      activity.structured?.main,
    ].filter((session) => session != null);
    if (
      Object.keys(draft.exercises).length !==
      sessions.reduce((count, session) => count + session.exercises.length, 0)
    )
      return "preserved";
    for (const session of sessions) {
      if (session.role !== "main" && session.role !== "preparation") return "preserved";
      for (const exercise of session.exercises) {
        const local: TrainingExerciseExecutionDraft | undefined =
          draft.exercises[trainingExerciseDraftKey(session.role, exercise.exerciseId)];
        if (
          !local ||
          !exercise.executionId ||
          local.sessionId !== session.sessionId ||
          local.exerciseId !== exercise.exerciseId ||
          local.role !== session.role ||
          local.completed !== (exercise.status === "completed" || exercise.status === "skipped") ||
          (local.comment.trim() || null) !== exercise.comment ||
          local.sets.length !== exercise.sets.length
        )
          return "preserved";
        if (new Set(local.sets.map((set) => set.setNumber)).size !== local.sets.length)
          return "preserved";
        for (const set of local.sets) {
          const saved = exercise.sets.find((candidate) => candidate.setNumber === set.setNumber);
          if (
            !saved ||
            (set.kind ?? "work") !== saved.kind ||
            (set.confirmed ?? null) !== saved.confirmed ||
            integer(set.value) !== saved.value ||
            (set.leftValue === "" && exercise.dose.scope !== "each_side"
              ? null
              : integer(set.leftValue)) !== saved.leftValue ||
            (set.rightValue === "" && exercise.dose.scope !== "each_side"
              ? null
              : integer(set.rightValue)) !== saved.rightValue ||
            decimal(set.loadKg.trim()) !== decimal(saved.loadKg ?? "") ||
            JSON.stringify(
              Object.entries(set.directionValues)
                .map(([direction, value]) => [direction, integer(value)])
                .sort(),
            ) !== JSON.stringify(Object.entries(saved.directionValues ?? {}).sort())
          )
            return "preserved";
        }
      }
    }
    // Read again before deletion so another local writer's newer data is retained.
    if (localStorage.getItem(key) !== raw || sessionStorage.getItem(feedbackKey) !== feedbackRaw)
      return "preserved";
    localStorage.removeItem(key);
    window.dispatchEvent(
      new CustomEvent(TRAINING_ACTIVITY_DRAFT_EVENT, { detail: { key, draft: null } }),
    );
    sessionStorage.removeItem(feedbackKey);
    return "cleared";
  } catch {
    return "storage_error";
  }
}

function sameInstant(left: string | null, right: string | null): boolean {
  return (
    left !== null &&
    right !== null &&
    Number.isFinite(Date.parse(left)) &&
    Date.parse(left) === Date.parse(right)
  );
}

function integer(value: string): number | undefined {
  if (value === "") return 0;
  if (!/^(0|[1-9]\d*)$/.test(value)) return undefined;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : undefined;
}

function decimal(value: string): string | null | undefined {
  if (value === "") return null;
  if (!/^\d+(?:[.,]\d{1,3})?$/.test(value)) return undefined;
  const [whole, fraction = ""] = value.replace(",", ".").split(".");
  return `${whole!.replace(/^0+(?=\d)/, "")}.${fraction.padEnd(3, "0")}`;
}
