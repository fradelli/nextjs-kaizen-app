import type { TrainingActivityDto, TrainingDayDto } from "../../../application/training-dto";
import type { TrainingDayFormActions } from "../../training-action.types";

export type TrainingWeekGridProps = Readonly<{
  days: readonly (TrainingDayDto | { state: "loading"; civilDate: TrainingDayDto["civilDate"]; activities: readonly []; plannedRestReason?: undefined })[];
  selectedDate: string;
  view?: "day" | "week";
  actions: TrainingDayFormActions;
}>;

export type PositionedTrainingActivity = Readonly<{
  activity: TrainingActivityDto;
  start: number;
  end: number;
  lane: number;
  laneCount: number;
}>;
