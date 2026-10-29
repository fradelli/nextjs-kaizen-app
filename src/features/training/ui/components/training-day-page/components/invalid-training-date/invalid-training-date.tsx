import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import Link from "next/link";

import { TrainingDayFeedback } from "../training-day-feedback/training-day-feedback";
import { createTrainingDateHref } from "../training-date-navigation/training-date-navigation.utils";
import type { InvalidTrainingDateProps } from "./invalid-training-date.types";

export function InvalidTrainingDate({
  todayDate,
  reason,
  maximumFutureDate,
}: InvalidTrainingDateProps) {
  const t = useTranslations("training");

  const isFutureDateOutOfRange = reason === "future_date_out_of_range";
  return (
    <TrainingDayFeedback
      variant={isFutureDateOutOfRange ? "warning" : "destructive"}
      title={isFutureDateOutOfRange ? t("scheduleUnavailable") : t("invalidDate")}
      description={
        reason === "repeated_date"
          ? t("singleDateRequired")
          : isFutureDateOutOfRange
            ? t("futureDateLimit", { date: maximumFutureDate ?? t("fourDaysAhead") })
            : t("validDateRequired")
      }
      action={
        <Button asChild>
          <Link href={createTrainingDateHref(todayDate)}>{t("backToToday")}</Link>
        </Button>
      }
    />
  );
}
