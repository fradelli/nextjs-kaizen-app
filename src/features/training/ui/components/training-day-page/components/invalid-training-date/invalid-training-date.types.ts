import type { CivilDate } from "@/features/training/domain/training-day.types";

export type InvalidTrainingDateProps = Readonly<{
  todayDate: CivilDate;
  reason: "invalid_date" | "repeated_date";
}>;
