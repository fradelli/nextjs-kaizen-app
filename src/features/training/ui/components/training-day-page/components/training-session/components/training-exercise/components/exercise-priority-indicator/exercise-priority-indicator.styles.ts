export const exercisePriorityIndicatorStyles = {
  root: "inline-flex items-center gap-2",
  bars: "inline-flex items-center gap-1",
  bar: "h-3 w-1 rounded-full border",
  inactive: "border-border bg-transparent",
  active: "border-status-warning bg-status-warning",
} as const;
