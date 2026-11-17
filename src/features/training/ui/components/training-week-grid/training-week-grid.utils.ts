import type { TrainingActivityDto } from "../../../application/training-dto";
import type { PositionedTrainingActivity } from "./training-week-grid.types";

export function trainingActivityMinutes(activity: TrainingActivityDto) {
  const timing = trainingActivityTiming(activity);
  return timing
    ? { start: timing.start, end: Math.min(1440, timing.start + timing.duration) }
    : null;
}

export function isBriefTrainingActivity(activity: TrainingActivityDto): boolean {
  const timing = trainingActivityTiming(activity);
  return timing !== null && timing.duration < 1;
}

function trainingActivityTiming(activity: TrainingActivityDto) {
  const recorded = recordedTrainingActivityTiming(activity);
  if (recorded) return recorded;
  const time = activity.actualStartTime ?? activity.plannedStartTime;
  const shortDuration =
    activity.status === "completed" &&
    activity.actualStartTime !== null &&
    activity.actualDurationMinutes === 0 &&
    activity.accumulatedActiveSeconds > 0 &&
    activity.accumulatedActiveSeconds < 60
      ? activity.accumulatedActiveSeconds / 60
      : null;
  const duration =
    shortDuration ?? activity.actualDurationMinutes ?? activity.plannedDurationMinutes;
  if (!time || duration === null || duration <= 0) return null;
  const [hours, minutes] = time.split(":").map(Number);
  const start = hours! * 60 + minutes!;
  return { start, duration };
}

function recordedTrainingActivityTiming(activity: TrainingActivityDto) {
  if (activity.status !== "completed") return null;
  const first = activity.intervals[0];
  const last = activity.intervals.at(-1);
  if (!first || !last?.endedAt) return null;
  const startInstant = new Date(first.startedAt);
  const endInstant = new Date(last.endedAt);
  const duration = (endInstant.getTime() - startInstant.getTime()) / 60_000;
  if (!Number.isFinite(duration) || duration <= 0) return null;
  const clock = trainingGridClock(startInstant);
  // Corrected clock fields take precedence over the original timer intervals.
  if (
    clock.label !== activity.actualStartTime ||
    trainingGridClock(endInstant).label !== activity.actualEndTime
  )
    return null;
  const start =
    clock.minute + startInstant.getUTCSeconds() / 60 + startInstant.getUTCMilliseconds() / 60_000;
  return { start, duration };
}

export function positionTrainingActivities(
  activities: readonly TrainingActivityDto[],
): PositionedTrainingActivity[] {
  const timed = activities
    .flatMap((activity) => {
      const minutes = trainingActivityMinutes(activity);
      return minutes ? [{ activity, ...minutes, lane: 0, laneCount: 1 }] : [];
    })
    .sort(
      (left, right) =>
        left.start - right.start || left.activity.id.localeCompare(right.activity.id),
    );
  let group: PositionedTrainingActivity[] = [];
  let groupEnd = 0;
  let lanes: number[] = [];
  const result: PositionedTrainingActivity[] = [];
  function finishGroup() {
    result.push(...group.map((item) => ({ ...item, laneCount: lanes.length })));
  }
  for (const item of timed) {
    if (item.start >= groupEnd) {
      finishGroup();
      group = [];
      lanes = [];
    }
    let lane = lanes.findIndex((end) => end <= item.start);
    if (lane === -1) lane = lanes.length;
    lanes[lane] = item.end;
    group.push({ ...item, lane });
    groupEnd = group.length === 1 ? item.end : Math.max(groupEnd, item.end);
  }
  finishGroup();
  return result;
}

export function trainingGridClock(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return {
    date: `${values.get("year")}-${values.get("month")}-${values.get("day")}`,
    minute: Number(values.get("hour")) * 60 + Number(values.get("minute")),
    label: `${values.get("hour")}:${values.get("minute")}`,
  };
}
