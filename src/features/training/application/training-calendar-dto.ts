import type { TrainingActivityDto, TrainingDayDto } from "./training-dto";

// Calendar reads do not contain prescriptions, exercise results or exercise history.
export type TrainingCalendarActivityDto = Pick<
  TrainingActivityDto,
  | "id"
  | "type"
  | "name"
  | "status"
  | "revision"
  | "plannedStartTime"
  | "plannedEndTime"
  | "plannedDurationMinutes"
  | "actualStartTime"
  | "actualEndTime"
  | "actualDurationMinutes"
  | "intervals"
  | "accumulatedActiveSeconds"
>;
export type TrainingCalendarDayDto = {
  civilDate: TrainingDayDto["civilDate"];
  state: "ready";
  hasActivePlan: boolean;
  plannedRestReason: string | null;
  activities: readonly TrainingCalendarActivityDto[];
};
