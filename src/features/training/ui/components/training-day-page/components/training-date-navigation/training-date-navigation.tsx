import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import Link from "next/link";

import { trainingDateNavigationStyles } from "./training-date-navigation.styles";
import type { TrainingDateNavigationProps } from "./training-date-navigation.types";
import { createTrainingDateHref } from "./training-date-navigation.utils";

export function TrainingDateNavigation({ dateResolution }: TrainingDateNavigationProps) {
  const t = useTranslations("training");

  if (dateResolution.status === "invalid") {
    return (
      <nav className={trainingDateNavigationStyles.root} aria-label={t("dateNavigation")}>
        <Button className={trainingDateNavigationStyles.button} variant="outline" disabled>
          {t("previous")}
        </Button>
        <Button className={trainingDateNavigationStyles.todayLink} variant="secondary" asChild>
          <Link prefetch={false} href={createTrainingDateHref(dateResolution.todayDate)}>
            {t("today")}
          </Link>
        </Button>
        <Button className={trainingDateNavigationStyles.button} variant="outline" disabled>
          {t("next")}
        </Button>
      </nav>
    );
  }

  return (
    <nav className={trainingDateNavigationStyles.root} aria-label={t("dateNavigation")}>
      <Button className={trainingDateNavigationStyles.button} variant="outline" asChild>
        <Link
          prefetch={false}
          href={createTrainingDateHref(dateResolution.previousDate)}
          aria-label={t("openPreviousDay")}
        >
          {t("previous")}
        </Link>
      </Button>
      {dateResolution.isToday ? (
        <Button
          type="button"
          className={trainingDateNavigationStyles.todayCurrent}
          variant="default"
          disabled
          aria-current="date"
        >
          {t("today")}
        </Button>
      ) : (
        <Button className={trainingDateNavigationStyles.todayLink} variant="secondary" asChild>
          <Link prefetch={false} href={createTrainingDateHref(dateResolution.todayDate)}>
            {t("today")}
          </Link>
        </Button>
      )}
      {dateResolution.canNavigateNext ? (
        <Button className={trainingDateNavigationStyles.button} variant="outline" asChild>
          <Link
            prefetch={false}
            href={createTrainingDateHref(dateResolution.nextDate)}
            aria-label={t("openNextDay")}
          >
            {t("next")}
          </Link>
        </Button>
      ) : (
        <Button
          className={trainingDateNavigationStyles.button}
          variant="outline"
          aria-label={t("nextDayUnavailable")}
          disabled
        >
          {t("next")}
        </Button>
      )}
    </nav>
  );
}
