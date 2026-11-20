export function assertQuarterHour(value: Date): boolean {
  return (
    Number.isFinite(value.getTime()) &&
    value.getUTCSeconds() === 0 &&
    value.getUTCMilliseconds() === 0 &&
    value.getUTCMinutes() % 15 === 0
  );
}

export function contains(start: Date, end: Date, innerStart: Date, innerEnd: Date): boolean {
  return innerStart >= start && innerEnd <= end;
}

export function civilDate(value: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(value);
}

export function intervalDates(start: Date, end: Date): string[] {
  const first = civilDate(start);
  const last = civilDate(new Date(end.getTime() - 1));
  const dates: string[] = [];
  const cursor = new Date(first + "T12:00:00Z");
  while (cursor.toISOString().slice(0, 10) <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}
