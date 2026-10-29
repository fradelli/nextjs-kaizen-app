"use client";
import { useTranslations } from "next-intl";

import { PencilSimpleIcon } from "@fradelli/ui/icons/PencilSimple";
import { PlusIcon } from "@fradelli/ui/icons/Plus";
import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { useCallback, useState, useTransition, useRef } from "react";
import { isTrainingAgendaDateEditable } from "@/features/training/domain/training-edit-window";
import { TrainingActivityEditorContent } from "../training-activity-editor-content/training-activity-editor-content";
import type { TrainingActivityEditorProps } from "./training-activity-editor.types";
export function TrainingActivityEditor(props: TrainingActivityEditorProps) {
  const t = useTranslations("training");

  const triggerRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [refreshing, startTransition] = useTransition();
  const router = useRouter();
  const committed = useCallback(
    (targetCivilDate: string) => {
      setOpen(false);
      startTransition(() => {
        if (targetCivilDate !== props.civilDate) router.push(`/treino?date=${targetCivilDate}`);
        else router.refresh();
      });
    },
    [props.civilDate, router],
  );
  const close = useCallback(() => setOpen(false), []);
  if (!isTrainingAgendaDateEditable(props.civilDate) || props.activity?.status === "completed")
    return null;
  return (
    <>
      <Button
        ref={triggerRef}
        type="button"
        size="icon"
        variant={props.activity ? "ghost" : "default"}
        className="min-h-11 min-w-11 [&>svg]:size-5"
        aria-label={
          props.activity ? t("editNamedActivity", { name: props.activity.name }) : t("addActivity")
        }
        disabled={refreshing}
        aria-busy={refreshing || undefined}
        onClick={() => setOpen(true)}
      >
        {props.activity ? (
          <PencilSimpleIcon size={20} weight="fill" aria-hidden="true" focusable="false" />
        ) : (
          <PlusIcon size={20} weight="bold" aria-hidden="true" focusable="false" />
        )}
      </Button>
      {open ? (
        <TrainingActivityEditorContent
          {...props}
          triggerRef={triggerRef}
          onClose={close}
          onCommitted={committed}
        />
      ) : null}
    </>
  );
}
