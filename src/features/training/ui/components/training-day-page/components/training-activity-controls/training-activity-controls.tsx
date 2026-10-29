"use client";
import { useTranslations } from "next-intl";

import { Button } from "@fradelli/ui/button";
import { PlayIcon } from "@fradelli/ui/icons/Play";
import { PauseIcon } from "@fradelli/ui/icons/Pause";
import { StopIcon } from "@fradelli/ui/icons/Stop";
import { CheckCircleIcon } from "@fradelli/ui/icons/CheckCircle";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supportsRetrospectiveTrainingRecord } from "@/features/training/domain/training-retrospective-record.rules";
import { isTrainingExecutionDateEditable } from "@/features/training/domain/training-edit-window";
import type { TrainingActivityExecutionDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types";
import { TrainingActivityCompletionDialog } from "../training-activity-completion-dialog/training-activity-completion-dialog";
import type { TrainingActivityControlsProps } from "./training-activity-controls.types";

export function TrainingActivityControls({
  civilDate,
  activity,
  action,
  draft = null,
  onStart,
  onPause,
  onResume,
  onPrepareCompletion,
  onFinalized,
  ready = true,
  executionStorageError = false,
}: TrainingActivityControlsProps) {
  const t = useTranslations("training");

  const router = useRouter();
  const trigger = useRef<HTMLButtonElement>(null);
  const [completion, setCompletion] = useState<{
    draft: TrainingActivityExecutionDraft | null;
    completionRequestedAt: string | null;
  } | null>(null);
  const [notice, setNotice] = useState("");
  const completed = activity.status === "completed";
  const direct =
    supportsRetrospectiveTrainingRecord(activity.type) && !activity.startedAt && !draft;
  const status = draft?.status ?? activity.status;
  if (!isTrainingExecutionDateEditable(civilDate) || activity.status === "skipped") return null;
  function openCompletion() {
    if (completed || direct) setCompletion({ draft: null, completionRequestedAt: null });
    else {
      const snapshot = onPrepareCompletion?.();
      if (snapshot) setCompletion(snapshot);
    }
  }
  return (
    <>
      {completed ? (
        <Button
          ref={trigger}
          type="button"
          variant="outline"
          size="sm"
          className="min-h-11"
          onClick={openCompletion}
        >
          {t("correctFeedback")}
        </Button>
      ) : direct ? (
        <Button
          ref={trigger}
          type="button"
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 [&>svg]:size-5"
          disabled={!ready}
          aria-label={t("finishNamedActivity", { name: activity.name })}
          title={t("recordPerformedActivity")}
          onClick={openCompletion}
        >
          <CheckCircleIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
        </Button>
      ) : (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11 [&>svg]:size-5"
            disabled={!ready || (!draft && status !== "scheduled")}
            aria-label={
              status === "in_progress"
                ? t("pauseActivity")
                : status === "paused"
                  ? t("resumeActivity")
                  : activity.type === "structured_training"
                    ? t("startTraining")
                    : t("startActivity")
            }
            title={
              status === "in_progress"
                ? t("pauseActivity")
                : status === "paused"
                  ? t("resumeActivity")
                  : t("startActivity")
            }
            onClick={status === "in_progress" ? onPause : status === "paused" ? onResume : onStart}
          >
            {status === "in_progress" ? (
              <PauseIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
            ) : (
              <PlayIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
            )}
          </Button>
          {draft ? (
            <Button
              ref={trigger}
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11 [&>svg]:size-5"
              aria-label={t("finishNamedActivity", { name: activity.name })}
              title={t("finishActivity")}
              onClick={openCompletion}
            >
              <StopIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
            </Button>
          ) : null}
        </>
      )}
      {notice ? (
        <span role="status" className="basis-full text-sm text-muted-foreground">
          {notice}
        </span>
      ) : null}
      {completion ? (
        <TrainingActivityCompletionDialog
          civilDate={civilDate}
          activity={activity}
          action={action}
          mode={completed ? "update_feedback" : direct ? "record_completed" : "complete"}
          snapshot={completion.draft}
          completionRequestedAt={completion.completionRequestedAt}
          executionStorageError={executionStorageError}
          executionChanged={
            completion.draft !== null && JSON.stringify(draft) !== JSON.stringify(completion.draft)
          }
          triggerRef={trigger}
          onClose={() => setCompletion(null)}
          onSaved={(cacheCleared) => {
            if (!completed) onFinalized?.();
            setCompletion(null);
            if (!cacheCleared) setNotice(t("recordSavedCleanupFailed"));
            router.refresh();
          }}
        />
      ) : null}
    </>
  );
}
