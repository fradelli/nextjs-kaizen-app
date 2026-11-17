import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";

export type TrainingActivityTimerProps = Readonly<{
  onPause?: () => void;
  onResume?: () => void;
  activity: TrainingActivityDto;
  draft?: TrainingActivityExecutionDraft | null;
}>;
