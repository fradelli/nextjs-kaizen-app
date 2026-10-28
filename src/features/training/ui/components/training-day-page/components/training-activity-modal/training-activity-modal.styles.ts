const dialogSurface =
  "fd-surface-glass-elevated fixed inset-0 m-auto w-[calc(100%-1rem)] max-h-[calc(100dvh-1rem)] overflow-hidden rounded-2xl border border-border p-0 text-foreground backdrop:bg-black/70 sm:w-[calc(100%-2rem)]";

export const trainingActivityModalStyles = {
  root: `${dialogSurface} max-w-lg`,
  confirmation: `${dialogSurface} max-w-md`,
  layout: "flex max-h-[calc(100dvh-1rem-2px)] min-h-0 flex-col overflow-hidden",
  header: "relative shrink-0 border-b border-border py-3 pr-16 pl-5",
  close: "absolute top-1/2 right-3 min-h-11 min-w-11 -translate-y-1/2 [&>svg]:size-5",
  title: "fd-text-card",
  description: "mt-1 fd-text-interface text-muted-foreground",
  body: "min-h-0 overflow-y-auto overscroll-contain px-5 py-2",
  footer:
    "grid shrink-0 grid-cols-2 items-center gap-3 [&>button]:min-w-0 [&>button:first-child]:justify-self-start [&>button:last-child]:justify-self-end border-t border-border px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]",
} as const;
