import type { trainingGridClock } from "@/features/training/ui/training-calendar";
import type { CalendarGridProps } from "../../calendar-grid.types";
export type DayColumnProps = {
  item: CalendarGridProps["days"][number];
  selected: boolean;
  clock: ReturnType<typeof trainingGridClock> | null;
  actions: CalendarGridProps["actions"];
  label: string;
  loadTrainingDay: CalendarGridProps["loadTrainingDay"];
  onTrainingChanged: CalendarGridProps["onTrainingChanged"];
};
