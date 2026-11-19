import type { ScheduleRange } from "./schedule-range";

export function scheduleForDate(range: ScheduleRange, date: string): ScheduleRange {
  const start = new Date(date + "T00:00:00-03:00").toISOString();
  const end = new Date(Date.parse(start) + 86_400_000).toISOString();
  return {
    activities: range.activities.filter(
      (row) =>
        row.scheduledDate === date ||
        Boolean(row.startsAt && row.endsAt && row.startsAt < end && row.endsAt > start),
    ),
    reservations: range.reservations.filter((row) => row.startsAt < end && row.endsAt > start),
  };
}
