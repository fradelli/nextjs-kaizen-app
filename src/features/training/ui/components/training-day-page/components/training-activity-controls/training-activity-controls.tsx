"use client";
import { Play, Pause, CircleCheck } from "lucide-react";
import { useTranslations } from "next-intl";

import { Popover } from "@fradelli/ui/popover";
import { Button } from "@fradelli/ui/button";
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
  showLabel = false,
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
  const editable = isTrainingExecutionDateEditable(civilDate);
  const showStart = showLabel && activity.type === "structured_training" && status === "scheduled";
  if ((!editable && !showStart) || activity.status === "skipped") return null;
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
        <Button ref={trigger} type="button" variant="outline" size="sm" onClick={openCompletion}>
          {t("correctFeedback")}
        </Button>
      ) : direct ? (
        <Button
          ref={trigger}
          type="button"
          variant="ghost"
          size={showLabel ? "default" : "icon"}
          tone="start"
          disabled={!ready}
          aria-label={t("finishNamedActivity", { name: activity.name })}
          title={t("recordPerformedActivity")}
          onClick={openCompletion}
        >
          <CircleCheck size={20} aria-hidden="true" focusable="false" />
          {showLabel ? t("registerTraining") : null}
        </Button>
      ) : showStart && !editable ? (
        <Popover.Root>
          <Popover.Trigger asChild>
            <Button type="button" size="sm" variant="outline" tone="start" aria-disabled="true">
              <Play aria-hidden="true" />
              {t("startTraining")}
            </Button>
          </Popover.Trigger>
          <Popover.Content align="end" className="max-w-48">
            {t("executionDateUnavailable")}
          </Popover.Content>
        </Popover.Root>
      ) : (
        <>
          {(!showLabel || status === "scheduled") && (
            <Button
              type="button"
              tone={showStart ? "start" : undefined}
              variant={showStart ? "default" : "ghost"}
              size={showStart ? "default" : "icon"}
              disabled={!editable || !ready || (!draft && status !== "scheduled")}
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
              onClick={
                status === "in_progress" ? onPause : status === "paused" ? onResume : onStart
              }
            >
              {status === "in_progress" ? (
                <Pause size={20} aria-hidden="true" focusable="false" />
              ) : (
                <Play size={20} aria-hidden="true" focusable="false" />
              )}
              {showStart ? t("startTraining") : null}
            </Button>
          )}
          {draft ? (
            <Button
              ref={trigger}
              type="button"
              variant={showLabel ? "default" : "ghost"}
              size={showLabel ? "default" : "icon"}
              tone="start"
              aria-label={t("finishNamedActivity", { name: activity.name })}
              title={t("finishActivity")}
              onClick={openCompletion}
            >
              <CircleCheck size={20} aria-hidden="true" focusable="false" />
              {showLabel
                ? t(activity.type === "structured_training" ? "finishTraining" : "finishActivity")
                : null}
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
