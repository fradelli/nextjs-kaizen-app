import { useLocale, useTranslations } from "next-intl";
import { TrainingDateNavigation } from "./components/training-date-navigation/training-date-navigation";
import { trainingDayPageStyles } from "./training-day-page.styles";
import type { TrainingDayPageProps } from "./training-day-page.types";
import { formatTrainingDateLabel } from "./training-day-page.utils";

export function TrainingDayPage({
  dateResolution,
  children,
  controls,
  summary,
}: TrainingDayPageProps) {
  const t = useTranslations("training");
  const shell = useTranslations("shell");
  const locale = useLocale();

  const selectedDate = dateResolution.status === "valid" ? dateResolution.civilDate : null;

  return (
    <section
      data-training-agenda
      className={trainingDayPageStyles.root}
      aria-labelledby="training-day-title"
    >
      <header className={trainingDayPageStyles.header}>
        <h1 id="training-day-title" className={trainingDayPageStyles.title}>
          {shell("training")}
        </h1>
        <div className={trainingDayPageStyles.headingRow}>
          <p className={trainingDayPageStyles.date}>
            {selectedDate
              ? formatTrainingDateLabel(selectedDate, locale)
              : t("invalidDateDescription")}
          </p>
        </div>
        <div className={trainingDayPageStyles.toolbar}>
          <TrainingDateNavigation dateResolution={dateResolution} />
          {controls}
        </div>
        {summary}
      </header>
      {children}
    </section>
  );
}
