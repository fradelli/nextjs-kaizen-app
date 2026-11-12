"use client";
import { useCallback, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  TrainingWorkoutOverlayContext,
  TrainingWorkoutPortalContext,
} from "./training-workout-overlay.context";
import styles from "./training-workout-overlay.module.css";
import { lockTrainingDialogScroll } from "../../lib/training-dialog-scroll-lock";

export function TrainingWorkoutOverlay({ children }: Readonly<{ children: ReactNode }>) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const [dialog, setPortalContainer] = useState<HTMLDialogElement | null>(null);
  const setDialog = useCallback((element: HTMLDialogElement | null) => {
    dialogRef.current = element;
    setPortalContainer(element);
  }, []);
  const router = useRouter();
  const t = useTranslations("training");
  useLayoutEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const unlock = lockTrainingDialogScroll();
    element?.showModal();
    return () => {
      element?.close();
      unlock();
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, []);
  return (
    <dialog
      ref={setDialog}
      className={styles.dialog}
      aria-label={t("training")}
      onCancel={(event) => {
        event.preventDefault();
        router.back();
      }}
    >
      <TrainingWorkoutOverlayContext.Provider value={() => router.back()}>
        <TrainingWorkoutPortalContext.Provider value={dialog}>
          {children}
        </TrainingWorkoutPortalContext.Provider>
      </TrainingWorkoutOverlayContext.Provider>
    </dialog>
  );
}
