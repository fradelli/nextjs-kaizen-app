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
import { useLayoutEffect, useRef } from "react";
import { lockTrainingDialogScroll } from "../../../../lib/training-dialog-scroll-lock";
import type { TrainingActivityModalProps } from "./training-activity-modal.types";

export function TrainingActivityModal({
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
  useLayoutEffect(lockTrainingDialogScroll, []);
  const heading = useRef<HTMLHeadingElement>(null);
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
        <DialogHeader className="relative pr-10">
          <DialogTitle ref={heading} tabIndex={-1}>
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
