import { useTranslations } from "next-intl";
import { exercisePriorityIndicatorStyles } from "./exercise-priority-indicator.styles";
import type { ExercisePriorityIndicatorProps } from "./exercise-priority-indicator.types";

const PRIORITY_LABELS = {
  1: "lowPriority",
  2: "mediumPriority",
  3: "highPriority",
} as const;

export function ExercisePriorityIndicator({ level }: ExercisePriorityIndicatorProps) {
  const t = useTranslations("training");

  const label = t(PRIORITY_LABELS[level]);
  return (
    <span
      className={exercisePriorityIndicatorStyles.root}
      role="img"
      aria-label={label}
      title={label}
    >
      <span>{t("priorityLabel")}</span>
      <span className={exercisePriorityIndicatorStyles.bars} aria-hidden="true">
        {[1, 2, 3].map((position) => (
          <span
            key={position}
            className={`${exercisePriorityIndicatorStyles.bar} ${
              position <= level
                ? exercisePriorityIndicatorStyles.active
                : exercisePriorityIndicatorStyles.inactive
            }`}
          />
        ))}
      </span>
    </span>
  );
}
