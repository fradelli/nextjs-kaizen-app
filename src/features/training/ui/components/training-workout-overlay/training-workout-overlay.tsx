"use client";
import { useLayoutEffect, useState, type ReactNode } from "react";
import { Dialog, DialogContent } from "@fradelli/ui/dialog";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  TrainingWorkoutOverlayContext,
  TrainingWorkoutPortalContext,
} from "./training-workout-overlay.context";
import { lockTrainingDialogScroll } from "../../lib/training-dialog-scroll-lock";
import styles from "./training-workout-overlay.module.css";
export function TrainingWorkoutOverlay({
  children,
  returnHref,
}: Readonly<{ children: ReactNode; returnHref?: string }>) {
  const [dialog, setPortalContainer] = useState<HTMLDivElement | null>(null);
  useLayoutEffect(lockTrainingDialogScroll, []);
  const router = useRouter();
  const t = useTranslations("training");
  return (
    <Dialog
      open
      disablePointerDismissal={false}
      onOpenChange={(open) => {
        if (!open) {
          if (returnHref) router.push(returnHref);
          else router.back();
        }
      }}
    >
      <DialogContent
        ref={setPortalContainer}
        showCloseButton={false}
        className={styles.dialog}
        aria-label={t("training")}
      >
        <TrainingWorkoutOverlayContext.Provider
          value={() => (returnHref ? router.push(returnHref) : router.back())}
        >
          <TrainingWorkoutPortalContext.Provider value={dialog}>
            {children}
          </TrainingWorkoutPortalContext.Provider>
        </TrainingWorkoutOverlayContext.Provider>
      </DialogContent>
    </Dialog>
  );
}
