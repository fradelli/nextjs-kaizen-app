"use client";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";
import { trainingSetVolumeKg } from "@/features/training/domain/training-set-execution.rules";
import { useTranslations } from "next-intl";
import type { TrainingDaySessionDto } from "@/features/training/application/training-dto";
import { trainingExerciseDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import {
  isTrainingSetPerformed,
  createTrainingSetDrafts,
} from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";

export function WorkoutTotals({
  exercises,
  draft,
}: {
  exercises: TrainingDaySessionDto["exercises"];
  draft: TrainingActivityExecutionDraft | null;
}) {
  const t = useTranslations("training");
  let volume = 0,
    performed = 0,
    total = 0;
  for (const exercise of exercises) {
    const sets =
      draft?.exercises[trainingExerciseDraftKey("main", exercise.exerciseId)]?.sets ??
      createTrainingSetDrafts(exercise);
    for (const set of sets) {
      if (set.kind === "warmup") continue;
      total++;
      if (!isTrainingSetPerformed(set, exercise.dose, exercise.loadApplicable)) continue;
      performed++;
      volume += trainingSetVolumeKg(set, exercise.dose, exercise.loadApplicable);
    }
  }
  return (
    <>
      <div>
        <p className="text-muted-foreground">{t("volume")}</p>
        <p className="tabular-nums">{t("volumeKg", { value: volume })}</p>
      </div>
      <div>
        <p className="text-muted-foreground">{t("performedSets")}</p>
        <p className="tabular-nums">
          {performed}/{total}
        </p>
      </div>
    </>
  );
}
