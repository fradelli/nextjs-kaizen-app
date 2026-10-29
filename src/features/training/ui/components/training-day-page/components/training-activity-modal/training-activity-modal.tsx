"use client";
import { useTranslations } from "next-intl";

import { XIcon } from "@fradelli/ui/icons/X";
import { Button } from "@fradelli/ui/button";
import { useEffect, useId, useRef } from "react";
import type { TrainingActivityModalProps } from "./training-activity-modal.types";
import { trainingActivityModalStyles as s } from "./training-activity-modal.styles";
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
    (initialFocusRef?.current ?? heading.current)?.focus();
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
  }, [restoreFocusRef, initialFocusRef]);
  function outside(x: number, y: number) {
    const bounds = dialog.current?.getBoundingClientRect();
    return Boolean(
      bounds && (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom),
    );
  }
  return (
    <dialog
      ref={dialog}
      className={size === "confirmation" ? s.confirmation : s.root}
      aria-labelledby={`${id}-title`}
      aria-describedby={description ? `${id}-description` : undefined}
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
            item.closest("dialog") === event.currentTarget &&
            item.tabIndex >= 0 &&
            !item.matches(":disabled") &&
            item.getClientRects().length > 0,
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
        event.stopPropagation();
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
            {description ? (
              <p id={`${id}-description`} className={s.description}>
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={s.close}
            aria-label={closeLabel ?? t("closeForm")}
            disabled={busy}
            onClick={onRequestClose}
          >
            <XIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
          </Button>
        </header>
        <div className={s.body}>{children}</div>
        <footer className={s.footer}>{footer}</footer>
      </div>
    </dialog>
  );
}
