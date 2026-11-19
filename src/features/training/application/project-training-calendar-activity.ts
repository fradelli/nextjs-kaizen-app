import type { TrainingCalendarActivityDto } from "./training-calendar-dto";
import type { TrainingActivitySnapshot } from "../domain/training-day.types";

type CalendarSnapshot = Pick<
  TrainingActivitySnapshot,
  | "id"
  | "type"
  | "name"
  | "status"
  | "revision"
  | "plannedStartMinute"
  | "plannedEndMinute"
  | "actualStartMinute"
  | "actualEndMinute"
  | "intervals"
>;
const clock = (minute: number | null) =>
  minute === null
    ? null
    : `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
export function projectTrainingCalendarActivity(
  activity: CalendarSnapshot,
): TrainingCalendarActivityDto {
  return {
    id: activity.id,
    type: activity.type,
    name: activity.name,
    status: activity.status,
    revision: activity.revision,
    plannedStartTime: clock(activity.plannedStartMinute),
    plannedEndTime: clock(activity.plannedEndMinute),
    plannedDurationMinutes:
      activity.plannedStartMinute === null || activity.plannedEndMinute === null
        ? null
        : activity.plannedEndMinute - activity.plannedStartMinute,
    actualStartTime: clock(activity.actualStartMinute),
    actualEndTime: clock(activity.actualEndMinute),
    actualDurationMinutes:
      activity.actualStartMinute === null || activity.actualEndMinute === null
        ? null
        : activity.actualEndMinute - activity.actualStartMinute,
    intervals: activity.intervals,
    accumulatedActiveSeconds: Math.floor(
      activity.intervals.reduce(
        (total, interval) =>
          total +
          (interval.endedAt
            ? Math.max(0, Date.parse(interval.endedAt) - Date.parse(interval.startedAt)) / 1000
            : 0),
        0,
      ),
    ),
  };
}
