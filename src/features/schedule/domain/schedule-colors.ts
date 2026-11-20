export const scheduleColors = [
  "purple",
  "blue",
  "cyan",
  "green",
  "yellow",
  "orange",
  "red",
  "pink",
  "lilac",
  "sage",
  "peach",
  "sky",
  "rose",
] as const;
export type ScheduleColor = (typeof scheduleColors)[number];

export function isScheduleColor(value: unknown): value is ScheduleColor {
  return scheduleColors.some((color) => color === value);
}
