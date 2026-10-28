export const trainingActivityModalStyles = {
  root: "fd-surface-glass-elevated fixed inset-0 m-auto w-[calc(100%-1rem)] max-w-lg max-h-[calc(100dvh-1rem)] overflow-hidden rounded-2xl border border-border p-0 text-foreground backdrop:bg-black/70 sm:w-[calc(100%-2rem)]",
  layout: "flex max-h-[calc(100dvh-1rem-2px)] min-h-0 flex-col overflow-hidden",
  header: "flex shrink-0 items-start justify-between gap-4 border-b border-border px-5 py-4",
  title: "fd-text-card",
  description: "mt-1 fd-text-interface text-muted-foreground",
  body: "min-h-0 overflow-y-auto overscroll-contain px-5 py-2",
  footer:
    "flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
} as const;
