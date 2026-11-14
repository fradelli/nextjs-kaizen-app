export const trainingExerciseStyles = {
  status: {
    pending: "border-l-[var(--fd-color-category-purple-solid)]",
    completed: "border-l-status-success-border",
    partial: "border-l-status-warning-border",
    empty: "border-l-status-destructive-border",
  },
  header: "flex items-start justify-between gap-2",
  heading: "min-w-0",
  prescription: "text-sm font-medium text-foreground",
  metadata: "flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground",
  screenReaderOnly: "sr-only",
  notes: "whitespace-pre-wrap text-sm text-muted-foreground",
} as const;
