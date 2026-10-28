import type {
  AvailablePublicTrainingPlanDto,
  TrainingActivityDto,
} from "@/features/training/application/training-dto";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";
export type TrainingActivityEditorProps = Readonly<{
  civilDate: string;
  activity?: TrainingActivityDto;
  availablePlan: AvailablePublicTrainingPlanDto | null;
  actions: TrainingDayFormActions;
  startedLocally?: boolean;
}>;
