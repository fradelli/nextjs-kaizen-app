import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";

export type TrainingActivityDeleteFormProps = Readonly<{
  civilDate: string;
  activity: TrainingActivityDto;
  action: TrainingFormAction;
  disabled?: boolean;
  refreshOnSaved?: boolean;
  onBusyChange?: (busy: boolean) => void;
  onConfirmationChange?: (open: boolean) => void;
  compact?: boolean;
  startedLocally?: boolean;
  onDeleted?: () => void;
}>;
