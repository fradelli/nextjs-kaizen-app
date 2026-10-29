"use client";
import { useTranslations } from "next-intl";

import { TrashIcon } from "@fradelli/ui/icons/Trash";
import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { PendingButton } from "@fradelli/ui/pending-button";
import { useId, useRef, useState } from "react";
import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { trainingActivityDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import {
  announceEditorNotice,
  removeActivityEditorDraft,
} from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import { TrainingActionFeedback } from "../training-action-feedback/training-action-feedback";
import { TrainingActivityModal } from "../training-activity-modal/training-activity-modal";
import type { TrainingActivityDeleteFormProps } from "./training-activity-delete-form.types";
export function TrainingActivityDeleteForm({
  civilDate,
  activity,
  action,
  compact = false,
  startedLocally = false,
  onDeleted,
  disabled = false,
  refreshOnSaved = true,
  onBusyChange,
  onConfirmationChange,
}: TrainingActivityDeleteFormProps) {
  const t = useTranslations("training");

  const id = useId();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false),
    [foundLocalDraft, setFoundLocalDraft] = useState(false);
  const keepButton = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const busy = useRef(false);
  const submission = useTrainingActionFeedback(
    async (previous, data) => {
      let saved = false;
      try {
        const result = await action(previous, data);
        saved = result.status === "saved";
        if (saved) {
          let cleared = true;
          try {
            window.localStorage.removeItem(trainingActivityDraftKey(civilDate, activity.id));
          } catch {
            cleared = false;
          }
          if (!removeActivityEditorDraft(activity.id)) cleared = false;
          if (!cleared) announceEditorNotice(t("deletedCleanupFailed"));
          busy.current = false;
          onBusyChange?.(false);
          onConfirmationChange?.(false);
          setConfirming(false);
          onDeleted?.();
          if (refreshOnSaved) router.refresh();
        }
        return result;
      } catch {
        return {
          status: "invalid" as const,
          message: t("deleteUnconfirmed"),
        };
      } finally {
        if (!saved) {
          busy.current = false;
          onBusyChange?.(false);
        }
      }
    },
    { refreshOnSaved: false },
  );
  function setConfirmation(next: boolean) {
    setConfirming(next);
    onConfirmationChange?.(next);
  }
  if (activity.status === "completed") return null;
  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        variant="ghost"
        size={compact ? "icon" : "default"}
        className={
          compact ? "min-h-11 min-w-11 [&>svg]:size-5" : "min-h-11 text-status-destructive"
        }
        disabled={disabled || submission.pending}
        aria-label={t("deleteActivity")}
        onClick={() => {
          try {
            setFoundLocalDraft(
              Boolean(localStorage.getItem(trainingActivityDraftKey(civilDate, activity.id))),
            );
          } catch {
            setFoundLocalDraft(false);
          }
          setConfirmation(true);
        }}
      >
        {compact ? (
          <TrashIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
        ) : (
          t("deleteActivity")
        )}
      </Button>
      {confirming ? (
        <TrainingActivityModal
          title={t("deleteActivityQuestion")}
          size="confirmation"
          closeLabel={t("closeDeleteConfirmation")}
          initialFocusRef={keepButton}
          restoreFocusRef={triggerRef}
          busy={submission.pending}
          onRequestClose={() => {
            if (!busy.current) setConfirmation(false);
          }}
          footer={
            <>
              <PendingButton
                type="submit"
                form={id}
                variant="ghost"
                className="min-h-11 text-status-destructive"
                pending={submission.pending}
                pendingLabel={t("deleting")}
              >
                {t("deleteActivity")}
              </PendingButton>
              <Button
                ref={keepButton}
                type="button"
                className="min-h-11"
                disabled={submission.pending}
                onClick={() => {
                  if (!busy.current) setConfirmation(false);
                }}
              >
                {t("keepActivity")}
              </Button>
            </>
          }
        >
          <form
            id={id}
            action={submission.formAction}
            className="grid gap-3 py-2"
            onSubmit={(event) => {
              if (busy.current || disabled) {
                event.preventDefault();
                return;
              }
              busy.current = true;
              onBusyChange?.(true);
            }}
          >
            <input type="hidden" name="civilDate" value={civilDate} />
            <input type="hidden" name="activityId" value={activity.id} />
            <input type="hidden" name="expectedRevision" value={activity.revision} />
            <p className="fd-text-interface text-muted-foreground" role="alert">
              <strong>{activity.name}</strong> · {civilDate}
              <br />
              {activity.status === "scheduled" && !startedLocally && !foundLocalDraft
                ? t("removeFromSchedule")
                : t("deleteStartedActivity")}
            </p>
            <TrainingActionFeedback state={submission.state} pending={submission.pending} />
          </form>
        </TrainingActivityModal>
      ) : null}
    </>
  );
}
