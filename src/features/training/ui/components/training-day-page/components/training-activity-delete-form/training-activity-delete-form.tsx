"use client";
import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { useEffect, useId, useRef, useState } from "react";
import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { trainingActivityDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import {
  announceEditorNotice,
  removeActivityEditorDraft,
} from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import { TrainingActionFeedback } from "../training-action-feedback/training-action-feedback";
import { trainingActivityDeleteFormStyles as s } from "./training-activity-delete-form.styles";
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
  const id = useId();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false),
    [foundLocalDraft, setFoundLocalDraft] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    busy = useRef(false);
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
          if (!cleared)
            announceEditorNotice(
              "A atividade foi excluída. Não foi possível limpar o rascunho deste navegador.",
            );
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
          message:
            "Não foi possível confirmar a exclusão. Confira a agenda antes de tentar novamente.",
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
  useEffect(() => {
    const d = dialog.current;
    if (confirming && !d?.open) d?.showModal();
    if (!confirming && d?.open) d.close();
  }, [confirming]);
  if (activity.status === "completed") return null;
  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size={compact ? "icon" : "sm"}
        className={compact ? "min-h-11 min-w-11" : "min-h-11 text-status-destructive-foreground"}
        disabled={disabled || submission.pending}
        aria-label="Excluir atividade"
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
        {compact ? "🗑" : "Excluir atividade"}
      </Button>
      <dialog
        ref={dialog}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        className={s.confirmation}
        onCancel={(event) => {
          event.preventDefault();
          if (!busy.current) setConfirmation(false);
        }}
        onClose={() => {
          if (!busy.current) setConfirmation(false);
        }}
      >
        <div className={s.header}>
          <h2 id={`${id}-title`} className={s.title}>
            Excluir atividade?
          </h2>
        </div>
        <form
          action={submission.formAction}
          className={s.form}
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
          <p id={`${id}-description`} className={s.message} role="alert">
            <strong>{activity.name}</strong> · {civilDate}
            <br />
            {activity.status === "scheduled" && !startedLocally && !foundLocalDraft
              ? "Ela será removida da agenda deste dia."
              : "A atividade já começou. Excluí-la descarta o rascunho e a remove da agenda."}
          </p>
          <div className={s.actions}>
            <Button
              type="button"
              size="sm"
              disabled={submission.pending}
              onClick={() => {
                if (!busy.current) setConfirmation(false);
              }}
            >
              Manter atividade
            </Button>
            <Button type="submit" variant="outline" size="sm" disabled={submission.pending}>
              Excluir atividade
            </Button>
          </div>
          <TrainingActionFeedback state={submission.state} pending={submission.pending} />
        </form>
      </dialog>
    </>
  );
}
