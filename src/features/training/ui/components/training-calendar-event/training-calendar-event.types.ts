import type { TrainingCalendarActivityDto } from "../../../application/training-calendar-dto";
import type { TrainingDayDto } from "../../../application/training-dto";
import type { TrainingDayFormActions } from "../../training-action.types";
export type TrainingCalendarEventProps = {
  activity: TrainingCalendarActivityDto;
  civilDate: string;
  actions: TrainingDayFormActions;
  compact?: boolean;
  markerOnly?: boolean;
  inList?: boolean;
  loadTrainingDay: (date: string) => Promise<TrainingDayDto | null>;
  onTrainingChanged: (dates: string[]) => void;
};
