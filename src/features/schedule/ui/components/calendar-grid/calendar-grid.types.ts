import type { CalendarDay } from "../calendar-range/calendar-range.types";
import type { TrainingDayDto } from "../../../../training/application/training-dto";
import type { TrainingDayFormActions } from "../../../../training/ui/training-action.types";

export type CalendarGridProps = Readonly<{
  days: readonly (
    | CalendarDay
    | {
        state: "loading";
        civilDate: TrainingDayDto["civilDate"];
        activities: readonly [];
        plannedRestReason?: undefined;
        schedule?: undefined;
      }
  )[];
  selectedDate: string;
  view?: "day" | "week";
  actions: TrainingDayFormActions;
  loadTrainingDay?: (date: string) => Promise<TrainingDayDto | null>;
  onTrainingChanged?: (dates: string[]) => void;
}>;
