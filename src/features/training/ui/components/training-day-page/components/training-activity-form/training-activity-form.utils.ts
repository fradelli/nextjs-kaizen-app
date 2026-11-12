import {
  plannedClockPattern,
  roundUpToQuarterHour,
} from "@/features/training/domain/training-schedule-time";

export type PlannedEndSuggestion =
  | { status: "ready"; time: string; durationMinutes: number }
  | { status: "incomplete" | "duration_unavailable" | "next_day" };

export function suggestPlannedEnd(
  startTime: string,
  duration: number | undefined,
): PlannedEndSuggestion {
  if (!plannedClockPattern.test(startTime)) return { status: "incomplete" };
  if (!Number.isSafeInteger(duration) || !duration || duration < 1)
    return { status: "duration_unavailable" };
  const [hours, minutes] = startTime.split(":").map(Number);
  const durationMinutes = roundUpToQuarterHour(duration);
  const endMinute = hours * 60 + minutes + durationMinutes;
  if (endMinute >= 1440) return { status: "next_day" };
  return {
    status: "ready",
    time:
      `${Math.floor(endMinute / 60)}`.padStart(2, "0") + ":" + `${endMinute % 60}`.padStart(2, "0"),
    durationMinutes,
  };
}

export function isValidPlannedInterval(start: string, end: string) {
  const clock = plannedClockPattern;
  return clock.test(start) && clock.test(end) && end > start;
}
