import type {
  TrainingActivityDto,
  TrainingDayExerciseDto,
} from "@/features/training/application/training-dto";
import { createTrainingSetDrafts } from "../use-training-exercise-draft/use-training-exercise-draft.utils";
import { TRAINING_ACTIVITY_DRAFT_PREFIX } from "./use-training-activity-draft.constants";
import type {
  TrainingActivityExecutionDraft,
  TrainingExerciseExecutionDraft,
} from "./use-training-activity-draft.types";

export function trainingActivityDraftKey(civilDate: string, activityId: string): string {
  return `${TRAINING_ACTIVITY_DRAFT_PREFIX}${civilDate}:${activityId}`;
}

export function trainingExerciseDraftKey(role: "main" | "preparation", exerciseId: string): string {
  return `${role}:${exerciseId}`;
}

export function initialTrainingExerciseDraft(
  sessionId: string,
  role: "main" | "preparation",
  exercise: TrainingDayExerciseDto,
): TrainingExerciseExecutionDraft {
  return {
    sessionId,
    exerciseId: exercise.exerciseId,
    role,
    completed: exercise.status === "completed" || exercise.status === "skipped",
    comment: exercise.comment ?? "",
    sets: createTrainingSetDrafts(exercise),
  };
}

export function startTrainingActivityDraft(
  activity: TrainingActivityDto,
  civilDate: string,
  now: string,
): TrainingActivityExecutionDraft {
  const exercises: Record<string, TrainingExerciseExecutionDraft> = {};
  for (const session of [
    activity.structured?.preparation ?? activity.preparationSession,
    activity.structured?.main,
  ]) {
    if (!session || (session.role !== "main" && session.role !== "preparation")) continue;
    for (const exercise of session.exercises) {
      exercises[trainingExerciseDraftKey(session.role, exercise.exerciseId)] =
        initialTrainingExerciseDraft(session.sessionId, session.role, exercise);
    }
  }
  return {
    version: 1,
    activityName: activity.name,
    activityId: activity.id,
    civilDate,
    expectedRevision: activity.revision,
    status: "in_progress",
    startedAt: now,
    intervals: [{ startedAt: now, endedAt: null }],
    exercises,
  };
}

export function trainingActivityDraftTimerInput(draft: TrainingActivityExecutionDraft) {
  const accumulatedActiveSeconds = draft.intervals.reduce(
    (total, interval) =>
      total +
      (interval.endedAt
        ? Math.max(
            0,
            Math.floor((Date.parse(interval.endedAt) - Date.parse(interval.startedAt)) / 1000),
          )
        : 0),
    0,
  );
  return {
    accumulatedActiveSeconds,
    currentIntervalStartedAt:
      draft.status === "in_progress"
        ? (draft.intervals.findLast((interval) => interval.endedAt === null)?.startedAt ?? null)
        : null,
  };
}

export function resumePersistedTrainingActivityDraft(
  activity: TrainingActivityDto,
  civilDate: string,
): TrainingActivityExecutionDraft | null {
  if (
    (activity.status !== "in_progress" && activity.status !== "paused") ||
    !activity.startedAt ||
    !activity.intervals?.length
  )
    return null;

  const initial = startTrainingActivityDraft(activity, civilDate, activity.startedAt);
  return {
    ...initial,
    status: activity.status,
    intervals: activity.intervals,
  };
}

export function isTrainingActivityDraft(
  value: unknown,
  activityId: string,
  civilDate: string,
): value is TrainingActivityExecutionDraft {
  if (!value || typeof value !== "object") return false;
  const draft = value as Partial<TrainingActivityExecutionDraft>;
  return (
    draft.version === 1 &&
    draft.activityId === activityId &&
    draft.civilDate === civilDate &&
    (draft.status === "in_progress" || draft.status === "paused") &&
    typeof draft.startedAt === "string" &&
    Number.isFinite(Date.parse(draft.startedAt)) &&
    Array.isArray(draft.intervals) &&
    draft.intervals.length > 0 &&
    typeof draft.expectedRevision === "number" &&
    typeof draft.exercises === "object" &&
    draft.exercises !== null
  );
}
