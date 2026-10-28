const TRAINING_TIME_ZONE = "America/Sao_Paulo";

export function isTrainingAgendaDateEditable(civilDate: string, now = new Date()): boolean {
  if (!isCivilDate(civilDate)) return false;
  const today = getTodayCivilDate(now);
  return civilDate >= shiftCivilDate(today, -1) && civilDate <= shiftCivilDate(today, 4);
}

export function isTrainingExecutionDateEditable(civilDate: string, now = new Date()): boolean {
  if (!isCivilDate(civilDate)) return false;
  const today = getTodayCivilDate(now);
  return civilDate >= shiftCivilDate(today, -1) && civilDate <= today;
}

function getTodayCivilDate(now: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TRAINING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}`;
}

function shiftCivilDate(civilDate: string, days: number): string {
  const shifted = new Date(`${civilDate}T00:00:00.000Z`);
  shifted.setUTCDate(shifted.getUTCDate() + days);
  return shifted.toISOString().slice(0, 10);
}

function isCivilDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export function getTrainingAgendaDateWindow(now = new Date()) {
  const today = getTodayCivilDate(now);
  return { minimumDate: shiftCivilDate(today, -1), maximumDate: shiftCivilDate(today, 4) };
}
