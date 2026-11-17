import { useLocale, useTranslations } from "next-intl";
import { TrainingDateNavigation } from "./components/training-date-navigation/training-date-navigation";
import { trainingDayPageStyles } from "./training-day-page.styles";
import type { TrainingDayPageProps } from "./training-day-page.types";

export function TrainingDayPage({
  dateResolution,
  view = "week",
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
              ? new Intl.DateTimeFormat(locale, {
                  timeZone: "UTC",
                  month: "long",
                  year: "numeric",
                }).format(new Date(`${selectedDate}T00:00:00.000Z`))
              : t("invalidDateDescription")}
          </p>
        </div>
        <div className={trainingDayPageStyles.toolbar}>
          <TrainingDateNavigation dateResolution={dateResolution} view={view} />
          {controls}
        </div>
        {summary}
      </header>
      {children}
    </section>
  );
}
