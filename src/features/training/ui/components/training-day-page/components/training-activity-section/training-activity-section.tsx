import { useTranslations } from "next-intl";
import { TrainingActivityCard } from "../training-activity-card/training-activity-card";
import { trainingActivitySectionStyles } from "./training-activity-section.styles";
import type { TrainingActivitySectionProps } from "./training-activity-section.types";

export function TrainingActivitySection({
  civilDate,
  activities,
  actions,
  availablePlan = null,
}: TrainingActivitySectionProps) {
  const t = useTranslations("training");

  if (!activities.length || !actions) return null;
  return (
    <section className={trainingActivitySectionStyles.root} aria-label={t("dailyActivities")}>
      {activities.map((activity) => (
        <TrainingActivityCard
          key={activity.id}
          civilDate={civilDate}
          activity={activity}
          actions={actions}
          availablePlan={availablePlan}
        />
      ))}
    </section>
  );
}
