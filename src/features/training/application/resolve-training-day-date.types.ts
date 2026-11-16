import type { CivilDate } from "../domain/training-day.types";

export type TrainingDayDateResolution =
  | Readonly<{
      status: "valid";
      civilDate: CivilDate;
      previousDate: CivilDate;
      nextDate: CivilDate;
      canNavigateNext: boolean;
      maximumFutureDate: CivilDate;
      todayDate: CivilDate;
      isToday: boolean;
      requiresCanonicalRedirect: boolean;
    }>
  | Readonly<{
      status: "invalid";
      reason: "invalid_date" | "repeated_date";
      todayDate: CivilDate;
    }>;

export type ResolveTrainingDayDateInput = Readonly<{
  rawDate: string | readonly string[] | undefined;
  now?: Date;
}>;
