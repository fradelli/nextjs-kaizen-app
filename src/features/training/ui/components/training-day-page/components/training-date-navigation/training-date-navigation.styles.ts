export const trainingDateNavigationStyles = {
  root: "inline-grid grid-cols-[repeat(3,3rem)] gap-2",
  todayLink:
    "h-9 w-full px-0 hover:bg-primary hover:text-primary-foreground hover:brightness-100 focus-visible:bg-primary focus-visible:text-primary-foreground",
  todayCurrent: "h-9 w-full px-0 disabled:opacity-100",
  button: "h-9 w-full px-0",
} as const;
