"use client";
import { useTranslations } from "next-intl";

import { Switch } from "@fradelli/ui/switch";

import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { trainingWarmupToggleStyles } from "./training-warmup-toggle.styles";
import type { TrainingWarmupToggleProps } from "./training-warmup-toggle.types";
import {
  createTrainingSetDrafts,
  serializeTrainingSetDrafts,
} from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";

export function TrainingWarmupToggle({
  civilDate,
  activityId,
  sessionId,
  exercise,
  action,
}: TrainingWarmupToggleProps) {
  const t = useTranslations("training");

  const submission = useTrainingActionFeedback(action);
  const completed = exercise.status === "completed";
  return (
    <form action={submission.formAction} className={trainingWarmupToggleStyles.form}>
      <input type="hidden" name="civilDate" value={civilDate} />
      <input type="hidden" name="activityId" value={activityId} />
      <input type="hidden" name="sessionId" value={sessionId} />
      <input type="hidden" name="exerciseId" value={exercise.exerciseId} />
      <input type="hidden" name="role" value="preparation" />
      <input type="hidden" name="completed" value={completed ? "false" : "true"} />
      <input type="hidden" name="comment" value={exercise.comment ?? ""} />
      <input type="hidden" name="expectedRevision" value={exercise.revision ?? ""} />
      <input
        type="hidden"
        name="sets"
        value={serializeTrainingSetDrafts(createTrainingSetDrafts(exercise))}
      />
      <Switch
        type="submit"
        checked={completed}
        aria-label={completed ? t("markWarmupIncomplete") : t("markWarmupComplete")}
        disabled={submission.pending}
      />
      <span className={trainingWarmupToggleStyles.label}>{completed ? t("done") : "A fazer"}</span>
    </form>
  );
}
