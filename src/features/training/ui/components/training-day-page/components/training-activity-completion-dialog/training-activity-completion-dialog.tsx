"use client";
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
import { trainingActivityControlsStyles as styles } from "../training-activity-controls/training-activity-controls.styles";
import type { TrainingActivityCompletionDialogProps } from "./training-activity-completion-dialog.types";

const draftMessages = {
  loading: "Carregando avaliação…",
  clean: "O registro será salvo ao confirmar.",
  stored: "Rascunho salvo neste navegador.",
  restored: "Avaliação recuperada. O registro ainda não foi salvo.",
  storage_error:
    "Não foi possível guardar o rascunho neste navegador. Você ainda pode salvar o registro.",
  stale: "A atividade mudou desde este rascunho. Confira os dados atuais antes de salvar.",
  expired: "Este rascunho expirou. Descarte-o para continuar.",
  invalid: "Não foi possível recuperar este rascunho. Descarte-o para continuar.",
  external_change: "A avaliação mudou em outra aba. Feche e reabra para conferir os dados.",
};
export function TrainingActivityCompletionDialog(props: TrainingActivityCompletionDialogProps) {
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
  const confirmation = useRef<HTMLDialogElement>(null);
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
          message:
            "Não foi possível confirmar o salvamento. Os campos foram preservados. Confira a agenda antes de tentar novamente.",
        };
      } finally {
        busy.current = false;
        setSubmitting(false);
      }
    },
    { status: "idle" },
  );

  useEffect(() => {
    if (confirming && !confirmation.current?.open) confirmation.current?.showModal();
    if (!confirming && confirmation.current?.open) confirmation.current.close();
  }, [confirming]);

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
      title="Registrar atividade realizada"
      description={`${activity.name} · ${civilDate.split("-").reverse().join("/")}. ${mode === "update_feedback" ? "Corrija a avaliação sem alterar a execução registrada." : snapshot ? "O cronômetro está pausado. Revise sua avaliação para concluir." : "Registre como foi a atividade, sem iniciar um cronômetro."}`}
      busy={locked || confirming}
      onRequestClose={requestClose}
      restoreFocusRef={triggerRef}
      footer={
        <>
          <span />
          <PendingButton
            type="submit"
            form={id}
            className="min-h-11"
            pending={locked}
            pendingLabel="Salvando…"
            disabled={!draft.ready || blocked || confirming || closeError}
          >
            Salvar registro
          </PendingButton>
        </>
      }
    >
      <p role="status" className="py-2 fd-text-interface text-muted-foreground">
        {changed
          ? "A execução ou a agenda mudou. Feche e confira os dados atuais antes de salvar."
          : draftMessages[draft.status]}
      </p>
      {draft.blocked && draft.status !== "external_change" ? (
        <Button
          type="button"
          variant="outline"
          className="mb-3 h-auto min-h-11 whitespace-normal"
          onClick={() => draft.discard()}
        >
          Descartar avaliação e carregar dados atuais
        </Button>
      ) : null}
      {closeError ? (
        <div role="alert" className="grid gap-3 py-3">
          <p>
            {props.executionStorageError
              ? "A pausa não pôde ser guardada neste navegador. Salve o registro antes de sair da página ou libere espaço. Ao fechar apenas o modal, o treino continuará pausado nesta aba."
              : "Não foi possível guardar a avaliação. Continue preenchendo ou feche descartando apenas estes campos. O treino continuará pausado."}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => setCloseError(false)}>
              Continuar preenchendo
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                draft.release();
                onClose();
              }}
            >
              {props.executionStorageError
                ? "Fechar e manter pausa nesta aba"
                : "Fechar sem guardar avaliação"}
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
      <dialog
        ref={confirmation}
        className={styles.confirmation}
        aria-labelledby={`${id}-confirm-title`}
        aria-describedby={`${id}-confirm-message`}
        onCancel={(event) => {
          event.preventDefault();
          setConfirming(false);
        }}
        onClose={() => setConfirming(false)}
      >
        <div className="grid gap-4">
          <h2 id={`${id}-confirm-title`} className="fd-text-card">
            Finalizar treino?
          </h2>
          <p id={`${id}-confirm-message`}>
            Há exercícios ou séries incompletos. Deseja voltar ou finalizar com os dados atuais?
          </p>
          <div className="flex flex-wrap gap-2">
            <Button type="button" onClick={() => setConfirming(false)}>
              Voltar
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={locked}
              onClick={() => {
                confirmed.current = true;
                setConfirming(false);
                form.current?.requestSubmit();
              }}
            >
              Finalizar
            </Button>
          </div>
        </div>
      </dialog>
    </TrainingActivityModal>
  );
}
