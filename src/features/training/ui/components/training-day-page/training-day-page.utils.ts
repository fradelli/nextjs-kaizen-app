import type { CivilDate } from "../../../domain/training-day.types";

export function formatTrainingDateLabel(civilDate: CivilDate, locale = "pt-BR"): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(`${civilDate}T00:00:00.000Z`));
}

export function formatTrainingShortDate(civilDate: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone: "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${civilDate}T00:00:00.000Z`));
}
