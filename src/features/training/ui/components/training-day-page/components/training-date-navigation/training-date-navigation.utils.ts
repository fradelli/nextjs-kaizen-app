import type { CivilDate } from "../../../../../domain/training-day.types";

export function createTrainingDateHref(civilDate: CivilDate, view?: "day" | "week"): string {
  return `/workout?date=${encodeURIComponent(civilDate)}${view ? `&view=${view}` : ""}`;
}

export function shiftTrainingDate(civilDate: CivilDate, days: number): CivilDate {
  const date = new Date(`${civilDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10) as CivilDate;
}

export function getTrainingWeekStart(civilDate: CivilDate): CivilDate {
  const date = new Date(`${civilDate}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  return date.toISOString().slice(0, 10) as CivilDate;
}
