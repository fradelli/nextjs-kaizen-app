import type {
  AvailablePublicTrainingPlanDto,
  TrainingActivityDto,
} from "@/features/training/application/training-dto";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";

export type TrainingActivitySectionProps = Readonly<{
  availablePlan?: AvailablePublicTrainingPlanDto | null;
  civilDate: string;
  activities: readonly TrainingActivityDto[];
  actions?: TrainingDayFormActions;
}>;
