import type { TrainingDayDateResolution } from "../../../../../application/resolve-training-day-date.types";

export type TrainingDateNavigationProps = Readonly<{
  dateResolution: TrainingDayDateResolution;
  onCountChange?: (count: number) => void;
  onNavigate?: (href: string) => void;
  view?: "day" | "week";
}>;
