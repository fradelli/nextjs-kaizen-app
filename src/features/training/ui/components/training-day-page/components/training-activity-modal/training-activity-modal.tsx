"use client";

import { Button } from "@fradelli/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@fradelli/ui/dialog";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { useLayoutEffect, useRef, useState } from "react";
import { lockTrainingDialogScroll } from "../../../../lib/training-dialog-scroll-lock";
import type { TrainingActivityModalProps } from "./training-activity-modal.types";

export function TrainingActivityModal({
  placement = "center",
  initialFocusRef,
  size = "form",
  closeLabel,
  title,
  description,
  children,
  footer,
  busy,
  onRequestClose,
  restoreFocusRef,
}: TrainingActivityModalProps) {
  const t = useTranslations("training");
  const [panel] = useState(() =>
    typeof document === "undefined" ? null : document.getElementById("schedule-editor-panel"),
  );
  const [mobile, setMobile] = useState(
    () =>
      typeof window !== "undefined" && (window.matchMedia?.("(width < 48rem)").matches ?? false),
  );
  useLayoutEffect(() => {
    if (placement !== "right" || !window.matchMedia) return;
    const query = window.matchMedia("(width < 48rem)");
    const sync = () => setMobile(query.matches);
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, [placement]);
  const sidePanel = placement === "right" && !mobile && panel !== null;
  useLayoutEffect(() => {
    if (sidePanel) return;
    return lockTrainingDialogScroll();
  }, [sidePanel]);
  const heading = useRef<HTMLHeadingElement>(null);
  if (sidePanel) {
    if (!panel) return null;
    return createPortal(
      <aside
        aria-label={title}
        className="relative flex h-full min-w-0 flex-col gap-2 bg-background px-3 py-2"
      >
        <div className="min-h-0 overflow-y-auto">
          <section aria-label={title} className="border-b border-border pb-3">
            {children}
            {footer && <footer className="flex flex-wrap justify-end gap-2">{footer}</footer>}
          </section>
        </div>
      </aside>,
      panel,
    );
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !busy) onRequestClose();
      }}
    >
      <DialogContent
        showCloseButton={false}
        initialFocus={initialFocusRef ?? heading}
        finalFocus={restoreFocusRef}
        className={`flex max-h-[calc(100dvh-1rem)] flex-col overflow-hidden ${size === "form" ? "sm:max-w-lg" : "sm:max-w-md"}`}
      >
        <DialogHeader className={placement === "right" ? "relative h-6" : "relative pr-10"}>
          <DialogTitle
            className={placement === "right" ? "sr-only" : undefined}
            ref={heading}
            tabIndex={-1}
          >
            {title}
          </DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0"
            aria-label={closeLabel ?? t("closeForm")}
            disabled={busy}
            onClick={onRequestClose}
          >
            <X aria-hidden="true" />
          </Button>
        </DialogHeader>
        <div className="min-h-0 overflow-y-auto overscroll-contain">{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}
