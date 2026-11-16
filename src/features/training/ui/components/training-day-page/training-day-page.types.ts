import type { ReactNode } from "react";

import type { TrainingDayDateResolution } from "../../../application/resolve-training-day-date.types";

export type TrainingDayPageProps = Readonly<{
  dateResolution: TrainingDayDateResolution;
  onCountChange?: (count: number) => void;
  view?: "day" | "week";
  children: ReactNode;
  controls?: ReactNode;
  summary?: ReactNode;
}>;
