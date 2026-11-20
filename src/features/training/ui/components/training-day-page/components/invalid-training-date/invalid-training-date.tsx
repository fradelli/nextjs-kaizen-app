import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import Link from "next/link";

import { TrainingDayFeedback } from "../training-day-feedback/training-day-feedback";
import { createTrainingDateHref } from "../training-date-navigation/training-date-navigation.utils";
import type { InvalidTrainingDateProps } from "./invalid-training-date.types";

export function InvalidTrainingDate({ todayDate, reason }: InvalidTrainingDateProps) {
  const t = useTranslations("training");

  return (
    <TrainingDayFeedback
      variant="destructive"
      title={t("invalidDate")}
      description={reason === "repeated_date" ? t("singleDateRequired") : t("validDateRequired")}
      action={
        <Button asChild>
          <Link href={createTrainingDateHref(todayDate)}>{t("backToToday")}</Link>
        </Button>
      }
    />
  );
}
