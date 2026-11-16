import { getTranslations } from "next-intl/server";
import { TrainingDayFeedback } from "../training-day-feedback/training-day-feedback";
import type { TrainingDayContentProps } from "./training-day-content.types";

export async function TrainingDayContent({ reason }: TrainingDayContentProps) {
  const t = await getTranslations("training");

  return (
    <TrainingDayFeedback
      variant="destructive"
      title={t("resolveFailed")}
      description={
        reason === "reference_invalid" ? t("missingPlanReference") : t("inconsistentPlan")
      }
    />
  );
}
