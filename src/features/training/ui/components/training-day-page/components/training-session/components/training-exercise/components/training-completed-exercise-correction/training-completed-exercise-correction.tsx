"use client";
import { useTranslations } from "next-intl";

import { Button } from "@fradelli/ui/button";
import { Switch } from "@fradelli/ui/switch";
import { useState } from "react";

import { initialTrainingExerciseDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import { serializeTrainingSetDrafts } from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";
import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { TrainingActionFeedback } from "../../../../../training-action-feedback/training-action-feedback";
import { TrainingLocalExerciseEditor } from "../training-local-exercise-editor/training-local-exercise-editor";
import type { TrainingCompletedExerciseCorrectionProps } from "./training-completed-exercise-correction.types";

export function TrainingCompletedExerciseCorrection({
  civilDate,
  activityId,
  sessionId,
  exercise,
  action,
}: TrainingCompletedExerciseCorrectionProps) {
  const t = useTranslations("training");

  const [draft, setDraft] = useState(() =>
    initialTrainingExerciseDraft(sessionId, "main", exercise),
  );
  const submission = useTrainingActionFeedback(action);

  return (
    <details>
      <summary>{t("correctExercise")}</summary>
      <form action={submission.formAction} className="space-y-3 pt-3">
        <input type="hidden" name="civilDate" value={civilDate} />
        <input type="hidden" name="activityId" value={activityId} />
        <input type="hidden" name="sessionId" value={sessionId} />
        <input type="hidden" name="exerciseId" value={exercise.exerciseId} />
        <input type="hidden" name="role" value="main" />
        <input type="hidden" name="expectedRevision" value={exercise.revision ?? ""} />
        <input type="hidden" name="completed" value={String(draft.completed)} />
        <input type="hidden" name="comment" value={draft.comment} />
        <input type="hidden" name="sets" value={serializeTrainingSetDrafts(draft.sets)} />
        <TrainingLocalExerciseEditor exercise={exercise} draft={draft} onChange={setDraft} />
        <Switch
          checked={draft.completed}
          onClick={() => setDraft((current) => ({ ...current, completed: !current.completed }))}
          aria-label={draft.completed ? t("uncheckExercise") : t("markExerciseDone")}
        />
        <Button type="submit" disabled={submission.pending}>
          {t("saveCorrection")}
        </Button>
        {submission.state.status !== "saved" && !submission.pending ? (
          <TrainingActionFeedback state={submission.state} pending={false} />
        ) : null}
      </form>
    </details>
  );
}
