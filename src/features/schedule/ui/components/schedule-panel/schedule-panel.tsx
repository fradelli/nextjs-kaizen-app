"use client";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { Dialog, DialogContent, DialogTitle } from "@fradelli/ui/dialog";

export function SchedulePanel({
  title,
  close,
  children,
}: {
  title: string;
  close: () => void;
  children: ReactNode;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const [mobile, setMobile] = useState(false);
  useLayoutEffect(() => {
    const query = window.matchMedia("(width < 48rem)");
    const sync = () => {
      setMobile(query.matches);
      setTarget(document.getElementById("schedule-editor-panel"));
    };
    sync();
    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);
  if (mobile)
    return (
      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) close();
        }}
      >
        <DialogContent
          showCloseButton={false}
          className="top-auto bottom-0 left-0 max-w-none max-h-[85dvh] translate-x-0 translate-y-0 rounded-b-none overflow-y-auto"
        >
          <DialogTitle className="sr-only">{title}</DialogTitle>
          {children}
        </DialogContent>
      </Dialog>
    );
  return target
    ? createPortal(
        <aside
          aria-label={title}
          className="h-full min-w-0 overflow-y-auto bg-background px-3 pt-4 pb-3 text-xs"
        >
          {children}
        </aside>,
        target,
      )
    : null;
}
