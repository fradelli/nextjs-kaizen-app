import type { CivilDate } from "../../../../../domain/training-day.types";

export function createTrainingDateHref(civilDate: CivilDate): string {
  return `/workout?date=${encodeURIComponent(civilDate)}`;
}
