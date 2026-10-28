"use client";
import { Button } from "@fradelli/ui/button";
import { useEffect, useId, useRef } from "react";
import type { TrainingActivityModalProps } from "./training-activity-modal.types";
import { trainingActivityModalStyles as s } from "./training-activity-modal.styles";
export function TrainingActivityModal({
  title,
  description,
  children,
  footer,
  busy,
  onRequestClose,
  restoreFocusRef,
}: TrainingActivityModalProps) {
  const id = useId(),
    dialog = useRef<HTMLDialogElement>(null),
    heading = useRef<HTMLHeadingElement>(null);
  const backdropDown = useRef(false);
  useEffect(() => {
    const previous =
      restoreFocusRef?.current ??
      (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (element && !element.open) element.showModal();
    heading.current?.focus();
    return () => {
      if (element?.open) element.close();
      document.body.style.overflow = overflow;
      const target =
        previous?.isConnected && !previous.matches(":disabled")
          ? previous
          : document.querySelector<HTMLElement>("#training-day-title");
      if (target) {
        const had = target.hasAttribute("tabindex");
        if (!had) target.tabIndex = -1;
        target.focus();
        if (!had) target.removeAttribute("tabindex");
      }
    };
  }, [restoreFocusRef]);
  function outside(x: number, y: number) {
    const bounds = dialog.current?.getBoundingClientRect();
    return Boolean(
      bounds && (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom),
    );
  }
  return (
    <dialog
      ref={dialog}
      className={s.root}
      aria-labelledby={`${id}-title`}
      aria-describedby={`${id}-description`}
      onKeyDown={(event) => {
        if (
          event.key !== "Tab" ||
          !(event.target instanceof Element) ||
          event.target.closest("dialog") !== event.currentTarget
        )
          return;
        const items = [
          ...event.currentTarget.querySelectorAll<HTMLElement>(
            'button,input:not([type="hidden"]),select,textarea,a[href],[tabindex]',
          ),
        ].filter(
          (item) =>
            item.tabIndex >= 0 && !item.matches(":disabled") && item.getClientRects().length > 0,
        );
        const first = items[0],
          last = items.at(-1),
          active = document.activeElement;
        if (!first) {
          event.preventDefault();
          heading.current?.focus();
        } else if (event.shiftKey && (active === first || !items.includes(active as HTMLElement))) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && (active === last || !items.includes(active as HTMLElement))) {
          event.preventDefault();
          first.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onRequestClose();
      }}
      onPointerDown={(event) => {
        backdropDown.current =
          event.target === event.currentTarget && outside(event.clientX, event.clientY);
      }}
      onClick={(event) => {
        if (backdropDown.current && outside(event.clientX, event.clientY) && !busy)
          onRequestClose();
        backdropDown.current = false;
      }}
    >
      <div className={s.layout}>
        <header className={s.header}>
          <div>
            <h2 id={`${id}-title`} ref={heading} tabIndex={-1} className={s.title}>
              {title}
            </h2>
            <p id={`${id}-description`} className={s.description}>
              {description}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label="Fechar formulário"
            disabled={busy}
            onClick={onRequestClose}
          >
            <span aria-hidden="true">×</span>
          </Button>
        </header>
        <div className={s.body}>{children}</div>
        <footer className={s.footer}>{footer}</footer>
      </div>
    </dialog>
  );
}
