"use client";
import { Button } from "@fradelli/ui/button";
import { PendingButton } from "@fradelli/ui/pending-button";
import { useRouter } from "next/navigation";
import { useCallback, useId, useRef, useState } from "react";
import {
  activityEditorContext,
  initialActivityEditorValues,
  announceEditorNotice,
} from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import { useTrainingActivityEditorDraft } from "@/features/training/ui/hooks/use-training-activity-editor-draft/use-training-activity-editor-draft";
import { TrainingActivityModal } from "../training-activity-modal/training-activity-modal";
import { TrainingActivityForm } from "../training-activity-form/training-activity-form";
import { TrainingActivityDeleteForm } from "../training-activity-delete-form/training-activity-delete-form";
import type { TrainingActivityEditorContentProps } from "./training-activity-editor-content.types";

const messages = {
  loading: "Carregando formulário…",
  clean: "",
  dirty: "Guardando rascunho…",
  stored: "Rascunho salvo neste navegador.",
  restored: "Rascunho recuperado neste navegador. As alterações ainda não foram aplicadas.",
  storage_error:
    "Não foi possível guardar o rascunho neste navegador. Você pode salvar a atividade ou tentar guardar novamente antes de fechar.",
  stale: "O treino ou o plano mudou desde este rascunho. Confira os dados atuais antes de salvar.",
  external_change: "Este rascunho mudou em outra aba. Reabra o editor para conferir os dados.",
  expired: "Este rascunho expirou. Descarte-o para começar novamente.",
  invalid: "Não foi possível recuperar este rascunho. Descarte-o para começar novamente.",
};
export function TrainingActivityEditorContent({
  civilDate,
  activity,
  availablePlan,
  actions,
  startedLocally,
  onClose,
  onCommitted,
  triggerRef,
}: TrainingActivityEditorContentProps) {
  const router = useRouter();
  const formId = useId();
  const currentContext = activityEditorContext(civilDate, activity, availablePlan);
  const [base] = useState(() => ({
    context: currentContext,
    baseValues: initialActivityEditorValues(civilDate, activity, availablePlan),
  }));
  const draft = useTrainingActivityEditorDraft(base);
  const [formVersion, setFormVersion] = useState(0),
    [closeError, setCloseError] = useState(false),
    [needsReload, setNeedsReload] = useState(false);
  const [busyKind, setBusyKind] = useState<"save" | "delete" | null>(null),
    [confirmingDelete, setConfirmingDelete] = useState(false);
  const busy = useRef(false),
    confirmation = useRef(false);
  const changed = JSON.stringify(base.context) !== JSON.stringify(currentContext);
  const blocked = draft.blocked || changed || needsReload;
  const saveBusy = useCallback((next: boolean) => {
    busy.current = next;
    setBusyKind(next ? "save" : null);
  }, []);
  const deleteBusy = useCallback((next: boolean) => {
    busy.current = next;
    setBusyKind(next ? "delete" : null);
  }, []);
  const deleteConfirmation = useCallback((next: boolean) => {
    confirmation.current = next;
    setConfirmingDelete(next);
  }, []);
  const requireReload = useCallback(() => setNeedsReload(true), []);
  const finishDraft = draft.finish;
  const saved = useCallback(
    ({ targetCivilDate }: { targetCivilDate: string }) => {
      if (finishDraft().status === "failed")
        announceEditorNotice(
          "A alteração foi salva. Não foi possível limpar o rascunho deste navegador.",
        );
      busy.current = false;
      onCommitted(targetCivilDate);
    },
    [finishDraft, onCommitted],
  );
  const deleted = useCallback(() => {
    finishDraft();
    busy.current = false;
    onCommitted(civilDate);
  }, [finishDraft, onCommitted, civilDate]);
  function requestClose() {
    if (busy.current || confirmation.current) return;
    if (!draft.dirty) {
      onClose();
      return;
    }
    if (draft.flush().status === "ok") onClose();
    else setCloseError(true);
  }
  function discard() {
    if (draft.discard().status !== "ok") {
      setCloseError(true);
      return;
    }
    if (changed || needsReload) {
      router.refresh();
      onClose();
      return;
    }
    setFormVersion((v) => v + 1);
    setCloseError(false);
  }
  const lock = busyKind !== null || confirmingDelete;
  return (
    <TrainingActivityModal
      title={activity ? "Editar atividade" : "Adicionar atividade"}
      description={`Atividade de ${civilDate.split("-").reverse().join("/")}. ${activity ? "As alterações serão aplicadas ao salvar." : "Preencha os dados para incluir na agenda."}`}
      busy={lock}
      restoreFocusRef={triggerRef}
      onRequestClose={requestClose}
      footer={
        <>
          {activity ? (
            <TrainingActivityDeleteForm
              civilDate={civilDate}
              activity={activity}
              action={actions.deleteActivity}
              refreshOnSaved={false}
              startedLocally={startedLocally}
              disabled={busyKind !== null || blocked || closeError}
              onBusyChange={deleteBusy}
              onConfirmationChange={deleteConfirmation}
              onDeleted={deleted}
            />
          ) : (
            <span />
          )}
          <PendingButton
            type="submit"
            form={formId}
            className="min-h-11"
            pending={busyKind === "save"}
            pendingLabel="Salvando…"
            disabled={!draft.ready || lock || blocked || closeError}
          >
            {activity ? "Salvar alterações" : "Adicionar atividade"}
          </PendingButton>
        </>
      }
    >
      <div role="status" className="pt-2 fd-text-interface text-muted-foreground">
        {changed
          ? messages.stale
          : needsReload
            ? "Confira a agenda atual antes de tentar salvar novamente."
            : messages[draft.status]}
      </div>
      {blocked ? (
        <div className="flex flex-wrap gap-2 py-3">
          {draft.status !== "external_change" ? (
            <Button type="button" variant="outline" size="sm" onClick={discard}>
              Descartar rascunho e carregar dados atuais
            </Button>
          ) : null}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              router.refresh();
              requestClose();
            }}
          >
            Conferir agenda
          </Button>
        </div>
      ) : draft.dirty ? (
        <Button type="button" variant="ghost" size="sm" disabled={lock} onClick={discard}>
          Descartar rascunho
        </Button>
      ) : null}
      {closeError ? (
        <section
          role="alert"
          className="my-3 grid gap-3 rounded-lg border border-status-destructive-border p-3 text-sm"
        >
          <p>
            Não foi possível guardar este preenchimento. Fechar sem guardar pode perder as últimas
            alterações.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (draft.flush().status === "ok") onClose();
              }}
            >
              Tentar guardar novamente
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Fechar sem guardar
            </Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => setCloseError(false)}>
              Continuar preenchendo
            </Button>
          </div>
        </section>
      ) : null}
      {draft.ready ? (
        <TrainingActivityForm
          key={formVersion}
          civilDate={civilDate}
          activity={activity}
          availablePlan={availablePlan}
          action={activity ? actions.updateActivity : actions.addActivity}
          startedLocally={startedLocally}
          editor={{
            formId,
            initialValues: draft.initialValues,
            blocked: blocked || closeError,
            readOnly: blocked,
            onValuesChange: draft.update,
            onBusyChange: saveBusy,
            onSaved: saved,
            onNeedsReload: requireReload,
          }}
        />
      ) : null}
    </TrainingActivityModal>
  );
}
