import type { TrainingDayExerciseDto } from "@/features/training/application/training-dto";
import type { TrainingExerciseExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";

export type TrainingLocalExerciseEditorProps = Readonly<{
  exercise: TrainingDayExerciseDto;
  draft: TrainingExerciseExecutionDraft;
  onChange?: (draft: TrainingExerciseExecutionDraft) => void;
}>;
