import { useLocale, useTranslations } from "next-intl";
import { TrainingDateNavigation } from "./components/training-date-navigation/training-date-navigation";
import { trainingDayPageStyles } from "./training-day-page.styles";
import type { TrainingDayPageProps } from "./training-day-page.types";

export function TrainingDayPage({
  dateResolution,
  view = "week",
  onCountChange,
  onNavigate,
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
      <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
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
            <div className={trainingDayPageStyles.toolbar}>
              <TrainingDateNavigation
                dateResolution={dateResolution}
                view={view}
                onCountChange={onCountChange}
                onNavigate={onNavigate}
              />
              {controls}
            </div>
          </div>
          {summary}
        </header>
        {children}
      </div>
      <div
        id="schedule-editor-panel"
        className="empty:hidden w-[min(14rem,50vw)] shrink-0 overflow-y-auto border-l border-border"
      />
    </section>
  );
}
