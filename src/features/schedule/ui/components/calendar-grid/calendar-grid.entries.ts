import type { TrainingCalendarActivityDto } from "../../../../training/application/training-calendar-dto";
import type { ScheduleRange } from "@/features/schedule/application/schedule-range";
import { clipToDay, positionIntervals } from "@/features/schedule/ui/schedule-layout";
import { trainingActivityMinutes } from "@/features/training/ui/training-calendar";

type Entry =
  | { kind: "training"; activity: TrainingCalendarActivityDto }
  | { kind: "activity"; activity: ScheduleRange["activities"][number] }
  | { kind: "reservation"; reservation: ScheduleRange["reservations"][number] };

export function scheduleGridEntries(
  date: string,
  training: readonly TrainingCalendarActivityDto[],
  schedule?: ScheduleRange,
) {
  const entries: { item: Entry; id: string; start: number; end: number }[] = [];
  for (const activity of training) {
    const clip = trainingActivityMinutes(activity);
    if (clip) entries.push({ item: { kind: "training", activity }, id: activity.id, ...clip });
  }
  for (const activity of schedule?.activities ?? []) {
    if (activity.startsAt && activity.endsAt)
      entries.push({
        item: { kind: "activity", activity },
        id: activity.id,
        ...clipToDay(date, activity.startsAt, activity.endsAt),
      });
  }
  const parents = new Map(schedule?.activities.map((parent) => [parent.id, parent]));
  for (const reservation of schedule?.reservations ?? []) {
    const parent = reservation.parentActivityId
      ? parents.get(reservation.parentActivityId)
      : undefined;
    const contained =
      parent &&
      parent.startsAt &&
      parent.endsAt &&
      reservation.startsAt >= parent.startsAt &&
      reservation.endsAt <= parent.endsAt;
    if (!contained)
      entries.push({
        item: { kind: "reservation", reservation },
        id: reservation.id,
        ...clipToDay(date, reservation.startsAt, reservation.endsAt),
      });
  }
  return positionIntervals(entries);
}
