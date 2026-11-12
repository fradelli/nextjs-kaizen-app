import { parseCivilDate, toCivilDateString } from "../domain/training-day.rules";
import type { CivilDate } from "../domain/training-day.types";
import { TrainingProjectionError } from "../domain/training-projection.error";
import type {
  ResolveTrainingDayDateInput,
  TrainingDayDateResolution,
} from "./resolve-training-day-date.types";

const TRAINING_TIME_ZONE = "America/Sao_Paulo";
const MAXIMUM_AGENDA_EDIT_DAYS = 4;

export function resolveTrainingDayDate({
  rawDate,
  now = new Date(),
}: ResolveTrainingDayDateInput): TrainingDayDateResolution {
  const todayDate = getCivilDateInTimeZone(now, TRAINING_TIME_ZONE);

  if (rawDate !== undefined && typeof rawDate !== "string") {
    return { status: "invalid", reason: "repeated_date", todayDate };
  }

  if (rawDate === undefined) {
    return createValidResolution(todayDate, todayDate, true);
  }

  try {
    const civilDate = parseCivilDate(rawDate);
    return createValidResolution(civilDate, todayDate, false);
  } catch (error) {
    if (error instanceof TrainingProjectionError && error.code === "TRAINING_CIVIL_DATE_INVALID") {
      return { status: "invalid", reason: "invalid_date", todayDate };
    }

    throw error;
  }
}

function createValidResolution(
  civilDate: CivilDate,
  todayDate: CivilDate,
  requiresCanonicalRedirect: boolean,
): Extract<TrainingDayDateResolution, { status: "valid" }> {
  const maximumFutureDate = shiftCivilDate(todayDate, MAXIMUM_AGENDA_EDIT_DAYS);
  return {
    status: "valid",
    civilDate,
    previousDate: shiftCivilDate(civilDate, -1),
    nextDate: shiftCivilDate(civilDate, 1),
    canNavigateNext: true,
    maximumFutureDate,
    todayDate,
    isToday: civilDate === todayDate,
    requiresCanonicalRedirect,
  };
}

function getCivilDateInTimeZone(now: Date, timeZone: string): CivilDate {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));

  return parseCivilDate(`${values.get("year")}-${values.get("month")}-${values.get("day")}`);
}

function shiftCivilDate(civilDate: CivilDate, days: number): CivilDate {
  const value = new Date(`${civilDate}T00:00:00.000Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return toCivilDateString(value);
}
