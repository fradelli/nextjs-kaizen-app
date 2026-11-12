import type { TrainingDayExerciseDto } from "@/features/training/application/training-dto";
import type { TrainingExerciseRole } from "@/features/training/domain/training-day.types";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";
import type { TrainingExerciseExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";

export type TrainingExerciseProps = Readonly<{
  exercise: TrainingDayExerciseDto;
  previewSets?: boolean;
  sessionId?: string;
  role?: TrainingExerciseRole;
  civilDate?: string;
  activityId?: string;
  saveExerciseAction?: TrainingFormAction;
  executionDraft?: TrainingExerciseExecutionDraft;
  onExecutionDraftChange?: (draft: TrainingExerciseExecutionDraft) => void;
}>;
