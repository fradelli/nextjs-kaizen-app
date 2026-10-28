"use client";
import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { useCallback, useState, useTransition, useRef } from "react";
import { isTrainingAgendaDateEditable } from "@/features/training/domain/training-edit-window";
import { TrainingActivityEditorContent } from "../training-activity-editor-content/training-activity-editor-content";
import type { TrainingActivityEditorProps } from "./training-activity-editor.types";
export function TrainingActivityEditor(props: TrainingActivityEditorProps) {
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
        className="min-h-11 min-w-11"
        aria-label={
          props.activity ? `Editar atividade: ${props.activity.name}` : "Adicionar atividade"
        }
        disabled={refreshing}
        aria-busy={refreshing || undefined}
        onClick={() => setOpen(true)}
      >
        {props.activity ? (
          <svg
            aria-hidden="true"
            width="19"
            height="19"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="m15 5 4 4M4 20l4-1L20 7a2.8 2.8 0 0 0-4-4L4 15z" />
          </svg>
        ) : (
          <span aria-hidden="true">+</span>
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
