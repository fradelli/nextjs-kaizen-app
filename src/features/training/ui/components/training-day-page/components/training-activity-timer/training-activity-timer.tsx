"use client";
import { useFormatter, useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@fradelli/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@fradelli/ui/dialog";

import { useTrainingActivityTimer } from "@/features/training/ui/hooks/use-training-activity-timer/use-training-activity-timer";
import { trainingActivityTimerStyles } from "./training-activity-timer.styles";
import type { TrainingActivityTimerProps } from "./training-activity-timer.types";
import { trainingActivityDraftTimerInput } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";

export function TrainingActivityTimer({
  activity,
  draft,
  onPause,
  onResume,
}: TrainingActivityTimerProps) {
  const [open, setOpen] = useState(false);
  const formatter = useFormatter();
  const startedAt = draft?.startedAt ?? activity.startedAt;
  const t = useTranslations("training");

  const seconds = useTrainingActivityTimer(
    draft ? trainingActivityDraftTimerInput(draft) : activity,
  );
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        onClick={() => setOpen(true)}
        aria-label={t("durationDetails")}
      >
        <time
          aria-label={t("activeTime")}
          className={trainingActivityTimerStyles.root + " text-status-info tabular-nums"}
        >
          {formatDuration(seconds)}
        </time>
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogTitle>{t("durationDetails")}</DialogTitle>
          <div className="flex justify-between gap-4">
            <span>{t("activeTime")}</span>
            <time className="text-status-info tabular-nums">{formatDuration(seconds)}</time>
          </div>
          <div className="flex justify-between gap-4">
            <span>{t("startedAtLabel")}</span>
            <time>
              {startedAt
                ? formatter.dateTime(new Date(startedAt), {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "America/Sao_Paulo",
                  })
                : "—"}
            </time>
          </div>
          {draft ? (
            <Button
              type="button"
              tone="start"
              onClick={draft.status === "paused" ? onResume : onPause}
            >
              {t(draft.status === "paused" ? "resumeActivity" : "pauseActivity")}
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}

function formatDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}
