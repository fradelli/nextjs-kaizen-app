"use client";
import { createPortal } from "react-dom";
import styles from "./training-rest-timer.module.css";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
export function TrainingRestTimer({
  endsAt,
  onAdjust,
  onSkip,
}: {
  endsAt: number;
  onAdjust: (seconds: number) => void;
  onSkip: () => void;
}) {
  const t = useTranslations("training");
  const [now, setNow] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);
  const remaining = now ? Math.max(0, Math.ceil((endsAt - now) / 1000)) : 0;
  if (!remaining) return null;
  return (
    <>
      <span data-rest-panel-active hidden />
      {createPortal(
        <section className={styles.panel} aria-label={t("rest")}>
          <p className={styles.time}>
            {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
          </p>
          <div className={styles.actions}>
            <Button type="button" variant="outline" onClick={() => onAdjust(-15)}>
              {t("lessRest")}
            </Button>
            <Button type="button" variant="outline" onClick={() => onAdjust(15)}>
              {t("moreRest")}
            </Button>
            <Button type="button" onClick={onSkip}>
              {t("skipRest")}
            </Button>
          </div>
        </section>,
        document.body,
      )}
    </>
  );
}
