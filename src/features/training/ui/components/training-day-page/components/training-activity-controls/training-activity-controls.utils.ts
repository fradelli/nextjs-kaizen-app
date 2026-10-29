import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";
import { isTrainingSetPerformed } from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";

export function hasUnfinishedTrainingExercises(
  activity: TrainingActivityDto,
  draft?: TrainingActivityExecutionDraft | null,
): boolean {
  if (!draft) return false;
  const sessions = [
    activity.structured?.preparation ?? activity.preparationSession,
    activity.structured?.main,
  ];
  return sessions.some((session) =>
    session?.exercises.some((exercise) => {
      const recorded = draft.exercises[`${session.role}:${exercise.exerciseId}`];
      return (
        !recorded?.completed ||
        (session.role === "main" &&
          recorded.sets.some(
            (set) => set.confirmed === false || !isTrainingSetPerformed(set, exercise.dose),
          ))
      );
    }),
  );
}
