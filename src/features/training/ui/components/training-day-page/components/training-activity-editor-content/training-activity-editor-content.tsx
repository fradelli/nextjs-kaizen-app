"use client";
import { useTranslations } from "next-intl";
import Link from "next/link";

import { Button } from "@fradelli/ui/button";
import { PendingButton } from "@fradelli/ui/pending-button";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  activityEditorContext,
  initialActivityEditorValues,
  sameActivityEditorValues,
} from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import { TrainingActivityModal } from "../training-activity-modal/training-activity-modal";
import { TrainingActivityForm } from "../training-activity-form/training-activity-form";
import { TrainingActivityDeleteForm } from "../training-activity-delete-form/training-activity-delete-form";
import type { TrainingActivityEditorContentProps } from "./training-activity-editor-content.types";

export function TrainingActivityEditorContent({
  selectedPeriod,
  civilDate,
  activity,
  availablePlan,
  actions,
  startedLocally,
  onClose,
  onCommitted,
  triggerRef,
}: TrainingActivityEditorContentProps) {
  const t = useTranslations("training");

  const router = useRouter();
  const formId = useId();
  const currentContext = activityEditorContext(civilDate, activity, availablePlan);
  const [base] = useState(() => ({
    context: currentContext,
    baseValues: initialActivityEditorValues(civilDate, activity, availablePlan),
  }));
  const [initialValues] = useState(() =>
    selectedPeriod
      ? {
          ...base.baseValues,
          plannedStartTime: selectedPeriod.start,
          manualEndTime: selectedPeriod.end,
          automaticEnd: false,
        }
      : base.baseValues,
  );
  const [dirty, setDirty] = useState(Boolean(selectedPeriod));
  const trackChanges = useCallback(
    (values: typeof initialValues) => {
      setDirty(!sameActivityEditorValues(base.baseValues, values));
    },
    [base],
  );
  const [needsReload, setNeedsReload] = useState(false);
  const [busyKind, setBusyKind] = useState<"save" | "delete" | null>(null),
    [confirmingDelete, setConfirmingDelete] = useState(false);
  const busy = useRef(false),
    confirmation = useRef(false);
  const changed = JSON.stringify(base.context) !== JSON.stringify(currentContext);
  const blocked = changed || needsReload;
  useEffect(() => {
    if (!changed && !needsReload) return;
    router.refresh();
    onClose();
  }, [changed, needsReload, router, onClose]);
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
  function requestClose() {
    if (!busy.current && !confirmation.current) onClose();
  }
  const lock = busyKind !== null || confirmingDelete;
  return (
    <TrainingActivityModal
      placement="right"
      title={activity ? t("editActivity") : t("addActivity")}
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
              disabled={busyKind !== null || blocked}
              onBusyChange={deleteBusy}
              onConfirmationChange={deleteConfirmation}
              onDeleted={() => onCommitted(civilDate)}
            />
          ) : dirty ? (
            <Button
              type="button"
              variant="ghost"
              tone="danger"
              disabled={lock}
              onClick={requestClose}
            >
              {t("deleteDraft")}
            </Button>
          ) : (
            <span />
          )}
          <PendingButton
            type="submit"
            form={formId}
            tone={activity ? undefined : "general"}
            pending={busyKind === "save"}
            pendingLabel={t("saving")}
            disabled={lock || blocked}
          >
            {activity ? t("saveChanges") : t("addActivity")}
          </PendingButton>
        </>
      }
    >
      <TrainingActivityForm
        onPanelClose={requestClose}
        civilDate={civilDate}
        activity={activity}
        availablePlan={availablePlan}
        action={activity ? actions.updateActivity : actions.addActivity}
        startedLocally={startedLocally}
        editor={{
          formId,
          initialValues,
          blocked: blocked,
          readOnly: blocked,
          onValuesChange: trackChanges,
          onBusyChange: saveBusy,
          onSaved: ({ targetCivilDate }) => onCommitted(targetCivilDate),
          onNeedsReload: requireReload,
        }}
      />
      {activity?.structured ? (
        <Button variant="outline" asChild>
          <Link href={`/workout/activity/${encodeURIComponent(activity.id)}?date=${civilDate}`}>
            {t("backToWorkout")}
          </Link>
        </Button>
      ) : null}
    </TrainingActivityModal>
  );
}
