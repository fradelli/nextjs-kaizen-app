"use client";
import { Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Plus } from "lucide-react";
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
        if (targetCivilDate !== props.civilDate) router.push(`/workout?date=${targetCivilDate}`);
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
        tone={props.activity ? undefined : "general"}
        ref={triggerRef}
        type="button"
        size={props.triggerLabel ? "sm" : "icon"}
        variant={props.activity ? "ghost" : "default"}
        aria-label={
          props.triggerLabel ??
          (props.activity
            ? t("editNamedActivity", { name: props.activity.name })
            : t("addActivity"))
        }
        disabled={refreshing}
        aria-busy={refreshing || undefined}
        onClick={() => setOpen(true)}
      >
        {props.triggerLabel ? (
          props.triggerLabel
        ) : props.activity ? (
          <Pencil size={20} aria-hidden="true" focusable="false" />
        ) : (
          <Plus size={12} aria-hidden="true" focusable="false" />
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
