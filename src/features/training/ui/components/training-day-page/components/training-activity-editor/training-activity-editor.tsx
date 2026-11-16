"use client";
import { PanelRight, Pencil } from "lucide-react";
import { useTranslations } from "next-intl";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@fradelli/ui/button";
import { useEffect, useCallback, useState, useTransition, useRef } from "react";
import { isTrainingAgendaDateEditable } from "@/features/training/domain/training-edit-window";
import { TrainingActivityEditorContent } from "../training-activity-editor-content/training-activity-editor-content";
import type { TrainingActivityEditorProps } from "./training-activity-editor.types";
export function TrainingActivityEditor(props: TrainingActivityEditorProps) {
  const t = useTranslations("training");

  const [open, setOpen] = useState(false);
  const [selection, setSelection] =
    useState<Pick<TrainingActivityEditorProps, "civilDate" | "availablePlan" | "selectedPeriod">>();
  useEffect(() => {
    if (!props.shortcutOnly) return;
    const handler = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.code === "Slash" && !event.repeat) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const select = (event: Event) => {
      if (open || document.querySelector("#schedule-editor-panel > aside")) return;
      setSelection((event as CustomEvent<NonNullable<typeof selection>>).detail);
      setOpen(true);
    };
    window.addEventListener("schedule-select-period", select);
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("schedule-select-period", select);
      window.removeEventListener("keydown", handler);
    };
  }, [props.shortcutOnly, open]);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const [refreshing, startTransition] = useTransition();
  const router = useRouter();
  const committed = useCallback(
    (targetCivilDate: string) => {
      setSelection(undefined);
      setOpen(false);
      startTransition(() => {
        if (targetCivilDate !== props.civilDate) router.push(`/workout?date=${targetCivilDate}`);
        else router.refresh();
      });
    },
    [props.civilDate, router],
  );
  const close = useCallback(() => {
    setSelection(undefined);
    setOpen(false);
  }, []);
  if (!isTrainingAgendaDateEditable(props.civilDate) || props.activity?.status === "completed")
    return null;
  return (
    <>
      {props.shortcutOnly && (
        <Button
          type="button"
          size="icon"
          variant="ghost"
          tone="neutral"
          ref={triggerRef}
          aria-label={t("activityPanel")}
          title={t("activityPanel")}
          className="max-md:hidden"
          data-schedule-panel-trigger
          aria-controls="schedule-editor-panel"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          <PanelRight size={12} aria-hidden="true" />
        </Button>
      )}
      {!props.shortcutOnly && (
        <Button
          className={props.triggerClassName}
          tone={props.activity ? undefined : "general"}
          ref={triggerRef}
          type="button"
          size={props.triggerContent || props.triggerLabel ? "sm" : "icon"}
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
          {props.triggerContent ? (
            props.triggerContent
          ) : props.triggerLabel ? (
            props.triggerLabel
          ) : props.activity ? (
            <Pencil size={20} aria-hidden="true" focusable="false" />
          ) : (
            <Plus size={12} aria-hidden="true" focusable="false" />
          )}
        </Button>
      )}
      {open ? (
        <TrainingActivityEditorContent
          {...props}
          {...selection}
          triggerRef={triggerRef}
          onClose={close}
          onCommitted={committed}
        />
      ) : null}
    </>
  );
}
