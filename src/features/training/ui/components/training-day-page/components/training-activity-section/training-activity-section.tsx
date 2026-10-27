import { TrainingActivityCard } from "../training-activity-card/training-activity-card";
import { trainingActivitySectionStyles } from "./training-activity-section.styles";
import type { TrainingActivitySectionProps } from "./training-activity-section.types";

export function TrainingActivitySection({
  civilDate,
  activities,
  actions,
  availablePlan = null,
}: TrainingActivitySectionProps) {
  if (!activities.length || !actions) return null;
  return (
    <section className={trainingActivitySectionStyles.root} aria-label="Atividades do dia">
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
