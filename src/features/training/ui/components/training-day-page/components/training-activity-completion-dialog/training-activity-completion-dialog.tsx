"use client";
import { useLocale, useTranslations } from "next-intl";
import { formatTrainingShortDate } from "@/features/training/ui/components/training-day-page/training-day-page.utils";

import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { PendingButton } from "@fradelli/ui/pending-button";
import { useActionState, useEffect, useId, useRef, useState } from "react";
import { useTrainingActivityCompletionDraft } from "@/features/training/ui/hooks/use-training-activity-completion-draft/use-training-activity-completion-draft";
import { completionDraftKey } from "@/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft";
import type { TrainingActionState } from "@/features/training/ui/training-action.types";
import { TrainingActivityModal } from "../training-activity-modal/training-activity-modal";
import { TrainingActivityCompletionForm } from "../training-activity-completion-form/training-activity-completion-form";
import { TrainingActionFeedback } from "../training-action-feedback/training-action-feedback";
import { hasUnfinishedTrainingExercises } from "../training-activity-controls/training-activity-controls.utils";
import type { TrainingActivityCompletionDialogProps } from "./training-activity-completion-dialog.types";

const draftMessages = {
  loading: "loadingFeedback",
  clean: "saveOnConfirmation",
  stored: "draftStored",
  restored: "feedbackRestored",
  storage_error: "feedbackStorageFailed",
  stale: "activityChanged",
  expired: "draftExpired",
  invalid: "draftInvalid",
  external_change: "feedbackChangedElsewhere",
} as const;
export function TrainingActivityCompletionDialog(props: TrainingActivityCompletionDialogProps) {
  const t = useTranslations("training");
  const locale = useLocale();

  const { activity, civilDate, mode, snapshot, triggerRef, executionChanged, onClose, onSaved } =
    props;
  const router = useRouter();
  const [revision] = useState(activity.revision);
  const id = useId();
  const draft = useTrainingActivityCompletionDraft({
    key: completionDraftKey(mode, civilDate, activity.id),
    revision,
    action: mode,
    initialValues: {
      intensity: activity.intensity ?? "",
      energy: activity.energy ?? "",
      comment: activity.comment ?? "",
    },
    executionSignature: snapshot ? JSON.stringify(snapshot) : null,
    completionRequestedAt: props.completionRequestedAt,
  });
  const busy = useRef(false);
  const [submitting, setSubmitting] = useState(false);
  const [needsReload, setNeedsReload] = useState(false);
  const [closeError, setCloseError] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const confirmed = useRef(false);
  const confirmationTrigger = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const form = useRef<HTMLFormElement>(null);
  const changed = activity.revision !== revision || executionChanged || needsReload;
  const [state, formAction, pending] = useActionState<TrainingActionState, FormData>(
    async (previous, formData) => {
      try {
        const result = await props.action(previous, formData);
        if (result.status === "saved") {
          // Clear recovery copies before refreshing the Server Component tree.
          onSaved(draft.finish());
        } else if (result.status === "conflict" || result.status === "not_found")
          setNeedsReload(true);
        return result;
      } catch {
        setNeedsReload(true);
        return {
          status: "invalid",
          message: t("saveUnconfirmedPreserved"),
        };
      } finally {
        busy.current = false;
        setSubmitting(false);
      }
    },
    { status: "idle" },
  );

  function requestClose() {
    if (busy.current || confirming) return;
    if (draft.flush() === "failed" || props.executionStorageError) {
      setCloseError(true);
      return;
    }
    draft.release();
    onClose();
    if (needsReload) router.refresh();
  }
  const locked = submitting || pending;
  const blocked = changed || draft.blocked;
  useEffect(() => {
    function protectPendingSave(event: BeforeUnloadEvent) {
      if (locked || props.executionStorageError) event.preventDefault();
    }
    window.addEventListener("beforeunload", protectPendingSave);
    return () => window.removeEventListener("beforeunload", protectPendingSave);
  }, [locked, props.executionStorageError]);

  return (
    <TrainingActivityModal
      title={t("finishActivity")}
      description={`${activity.name} · ${formatTrainingShortDate(civilDate, locale)}. ${mode === "update_feedback" ? t("correctFeedbackDescription") : snapshot ? t("pausedFeedbackDescription") : ""}`}
      busy={locked || confirming}
      onRequestClose={requestClose}
      restoreFocusRef={triggerRef}
      footer={
        <>
          {draft.status !== "clean" && draft.ready ? (
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-status-destructive"
              disabled={locked || draft.status === "external_change"}
              onClick={() => draft.discard()}
            >
              {t("deleteDraft")}
            </Button>
          ) : (
            <span />
          )}
          <PendingButton
            ref={confirmationTrigger}
            type="submit"
            form={id}
            className="min-h-11"
            pending={locked}
            pendingLabel={t("saving")}
            disabled={!draft.ready || blocked || confirming || closeError}
          >
            {t("saveRecord")}
          </PendingButton>
        </>
      }
    >
      <p role="status" className="py-2 fd-text-interface text-muted-foreground">
        {changed ? t("executionChanged") : t(draftMessages[draft.status])}
      </p>
      {closeError ? (
        <div role="alert" className="grid gap-3 py-3">
          <p>
            {props.executionStorageError ? t("pauseStorageFailed") : t("feedbackStorageGuidance")}
          </p>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              className="min-h-11 text-status-destructive"
              onClick={() => {
                draft.release();
                onClose();
              }}
            >
              {props.executionStorageError ? t("closeKeepPaused") : t("closeDiscardFeedback")}
            </Button>
            <Button
              type="button"
              variant="default"
              className="ml-auto"
              onClick={() => setCloseError(false)}
            >
              {t("continueEditing")}
            </Button>
          </div>
        </div>
      ) : null}
      <form
        id={id}
        ref={form}
        action={formAction}
        onReset={(event) => event.preventDefault()}
        className="grid gap-3 py-2"
        aria-busy={locked || undefined}
        onSubmit={(event) => {
          if (busy.current || blocked || !draft.ready || draft.isBlocked()) {
            event.preventDefault();
            return;
          }
          if (
            mode === "complete" &&
            !confirmed.current &&
            hasUnfinishedTrainingExercises(activity, snapshot)
          ) {
            event.preventDefault();
            setConfirming(true);
            return;
          }
          confirmed.current = false;
          if (draft.flush() === "external_change") {
            event.preventDefault();
            return;
          }
          busy.current = true;
          setSubmitting(true);
        }}
      >
        <input type="hidden" name="civilDate" value={civilDate} />
        <input type="hidden" name="activityId" value={activity.id} />
        <input
          type="hidden"
          name="expectedRevision"
          value={snapshot?.expectedRevision ?? revision}
        />
        <input type="hidden" name="action" value={mode} />
        {mode === "complete" && snapshot ? (
          <>
            <input type="hidden" name="executionDraft" value={JSON.stringify(snapshot)} />
            <input
              type="hidden"
              name="completionRequestedAt"
              value={draft.completionRequestedAt ?? ""}
            />
          </>
        ) : null}
        <TrainingActivityCompletionForm
          id={id}
          mobility={activity.type === "mobility"}
          disabled={locked || blocked || !draft.ready}
          values={draft.values}
          onChange={draft.update}
        />
        <TrainingActionFeedback state={state} pending={pending} />
      </form>
      {confirming ? (
        <TrainingActivityModal
          title={t("finishTrainingQuestion")}
          size="confirmation"
          closeLabel={t("closeFinishConfirmation")}
          initialFocusRef={backButton}
          restoreFocusRef={confirmationTrigger}
          busy={locked}
          onRequestClose={() => {
            if (!busy.current) setConfirming(false);
          }}
          footer={
            <>
              <Button
                ref={backButton}
                type="button"
                variant="outline"
                className="min-h-11"
                onClick={() => setConfirming(false)}
              >
                {t("back")}
              </Button>
              <Button
                type="button"
                className="min-h-11"
                disabled={locked}
                onClick={() => {
                  confirmed.current = true;
                  setConfirming(false);
                  form.current?.requestSubmit();
                }}
              >
                {t("finish")}
              </Button>
            </>
          }
        >
          <p className="fd-text-interface py-2 text-muted-foreground">{t("unfinishedExercises")}</p>
        </TrainingActivityModal>
      ) : null}
    </TrainingActivityModal>
  );
}
