import type { RefObject } from "react";
import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";
import type { CompletionMode } from "@/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft";
export type TrainingActivityCompletionDialogProps = Readonly<{
  civilDate: string;
  executionStorageError?: boolean;
  activity: TrainingActivityDto;
  action: TrainingFormAction;
  mode: CompletionMode;
  snapshot: TrainingActivityExecutionDraft | null;
  completionRequestedAt: string | null;
  executionChanged: boolean;
  triggerRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onSaved: (cacheCleared: boolean) => void;
}>;
