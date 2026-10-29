"use client";
import { useLocale, useTranslations } from "next-intl";

import { localizeTrainingFeedback } from "@/features/training/ui/localize-training-feedback";
import { trainingActionFeedbackStyles } from "./training-action-feedback.styles";
import type { TrainingActionFeedbackProps } from "./training-action-feedback.types";

export function TrainingActionFeedback({ state, pending }: TrainingActionFeedbackProps) {
  const t = useTranslations("training");
  const feedback = useTranslations("feedback");
  const locale = useLocale();

  if (pending) return <p className={trainingActionFeedbackStyles.root}>{t("saving")}</p>;
  if (state.status === "idle") return null;
  if (state.status === "saved") {
    return <p className={trainingActionFeedbackStyles.success}>{t("saved")}</p>;
  }
  return (
    <p className={trainingActionFeedbackStyles.error} role="alert">
      {localizeTrainingFeedback(state.message, locale, feedback, [
        t("saveUnconfirmed"),
        t("saveUnconfirmedPreserved"),
        t("restoredSessionUnavailable"),
        t("localSessionBlocksReschedule"),
        t("draftCheckFailed"),
      ])}
    </p>
  );
}
