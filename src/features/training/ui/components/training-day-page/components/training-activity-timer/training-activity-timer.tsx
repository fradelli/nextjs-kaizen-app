"use client";
import { useTranslations } from "next-intl";

import { useTrainingActivityTimer } from "@/features/training/ui/hooks/use-training-activity-timer/use-training-activity-timer";
import { trainingActivityTimerStyles } from "./training-activity-timer.styles";
import type { TrainingActivityTimerProps } from "./training-activity-timer.types";
import { trainingActivityDraftTimerInput } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";

export function TrainingActivityTimer({ activity, draft }: TrainingActivityTimerProps) {
  const t = useTranslations("training");

  const seconds = useTrainingActivityTimer(
    draft ? trainingActivityDraftTimerInput(draft) : activity,
  );
  return (
    <time className={trainingActivityTimerStyles.root} aria-label={t("activeTime")}>
      {formatDuration(seconds)}
    </time>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
