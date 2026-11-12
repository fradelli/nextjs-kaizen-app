export const plannedClockPattern = /^([01]\d|2[0-3]):(00|15|30|45)$/;

export function roundUpToQuarterHour(minutes: number) {
  return Math.ceil(minutes / 15) * 15;
}
