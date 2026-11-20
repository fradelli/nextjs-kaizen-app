const civilFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone: "America/Sao_Paulo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function localParts(instant: string) {
  const date = new Date(instant);
  const parts = civilFormatter.formatToParts(date);
  const get = (key: string) => parts.find((part) => part.type === key)?.value ?? "";
  return {
    date: get("year") + "-" + get("month") + "-" + get("day"),
    time: get("hour") + ":" + get("minute"),
  };
}
export function toInstant(date: string, time: string) {
  return new Date(date + "T" + time + ":00-03:00").toISOString();
}
