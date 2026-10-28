import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";

export type TrainingActivityControlsProps = Readonly<{
  civilDate: string;
  executionStorageError?: boolean;
  activity: TrainingActivityDto;
  action: TrainingFormAction;
  draft?: TrainingActivityExecutionDraft | null;
  onStart?: () => void;
  onPause?: () => void;
  onResume?: () => void;
  onPrepareCompletion?: () => {
    draft: TrainingActivityExecutionDraft;
    completionRequestedAt: string;
  } | null;
  onFinalized?: () => void;
  ready?: boolean;
}>;
