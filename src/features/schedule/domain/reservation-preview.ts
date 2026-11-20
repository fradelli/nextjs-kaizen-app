import { assertQuarterHour, contains } from "./schedule-time";

export function reservationPreview(
  start: Date,
  minutes: number | null,
  parentStart: Date,
  parentEnd: Date,
  occupied: readonly { start: Date; end: Date }[],
):
  | { end: Date; error?: never }
  | { error: "outside_parent" | "occupied" | "invalid_interval"; end?: never } {
  if (!assertQuarterHour(start)) return { error: "invalid_interval" };
  if (start < parentStart || start >= parentEnd) return { error: "outside_parent" };
  let end = new Date(Math.min(start.getTime() + (minutes ?? 30) * 60000, parentEnd.getTime()));
  for (const item of occupied) {
    if (!contains(parentStart, parentEnd, item.start, item.end)) continue;
    if (item.start <= start && item.end > start) return { error: "occupied" };
    if (item.start > start && item.start < end) end = item.start;
  }
  return { end };
}
