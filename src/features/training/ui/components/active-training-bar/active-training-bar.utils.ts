import { TRAINING_ACTIVITY_DRAFT_PREFIX } from "../../hooks/use-training-activity-draft/use-training-activity-draft.constants";
import {
  isTrainingActivityDraft,
  trainingActivityDraftKey,
} from "../../hooks/use-training-activity-draft/use-training-activity-draft.utils";
import type { TrainingActivityExecutionDraft } from "../../hooks/use-training-activity-draft/use-training-activity-draft.types";

export function readActiveTrainingDrafts(storage: Storage): TrainingActivityExecutionDraft[] {
  const drafts: TrainingActivityExecutionDraft[] = [];
  for (let index = 0; index < storage.length; index++) {
    const key = storage.key(index);
    if (!key?.startsWith(TRAINING_ACTIVITY_DRAFT_PREFIX)) continue;
    try {
      const value: unknown = JSON.parse(storage.getItem(key) ?? "null");
      if (
        !value ||
        typeof value !== "object" ||
        !("activityId" in value) ||
        !("civilDate" in value) ||
        typeof value.activityId !== "string" ||
        typeof value.civilDate !== "string" ||
        !isTrainingActivityDraft(value, value.activityId, value.civilDate) ||
        key !== trainingActivityDraftKey(value.civilDate, value.activityId)
      )
        continue;
      const intervalsValid = value.intervals.every(
        (interval) =>
          interval &&
          typeof interval.startedAt === "string" &&
          Number.isFinite(Date.parse(interval.startedAt)) &&
          (interval.endedAt === null ||
            (typeof interval.endedAt === "string" &&
              Number.isFinite(Date.parse(interval.endedAt)) &&
              Date.parse(interval.endedAt) >= Date.parse(interval.startedAt))),
      );
      if (intervalsValid) drafts.push(value);
    } catch {
      // An unrelated malformed entry must not prevent recovery of a valid workout.
    }
  }
  return drafts.sort(
    (left, right) =>
      Number(right.status === "in_progress") - Number(left.status === "in_progress") ||
      Date.parse(right.startedAt) - Date.parse(left.startedAt),
  );
}
