"use client";
import { Trash2 } from "@fradelli/ui/lucide-icons";
import { TRAINING_ACTIVITY_DRAFT_EVENT } from "../../hooks/use-training-activity-draft/use-training-activity-draft.constants";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Item, ItemActions, ItemContent, ItemTitle, ItemDescription } from "@fradelli/ui/item";
import { StatusIndicator } from "@fradelli/ui/status-indicator";
import { Button } from "@fradelli/ui/button";
import { TrainingActivityModal } from "../training-day-page/components/training-activity-modal/training-activity-modal";
import { useTrainingActivityTimer } from "../../hooks/use-training-activity-timer/use-training-activity-timer";
import {
  trainingActivityDraftKey,
  trainingActivityDraftTimerInput,
} from "../../hooks/use-training-activity-draft/use-training-activity-draft.utils";
import type { TrainingActivityExecutionDraft } from "../../hooks/use-training-activity-draft/use-training-activity-draft.types";
import { readActiveTrainingDrafts } from "./active-training-bar.utils";
import styles from "./active-training-bar.module.css";

export function ActiveTrainingBar() {
  const t = useTranslations("training");
  const pathname = usePathname();
  const trigger = useRef<HTMLButtonElement>(null);
  const keepButton = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<TrainingActivityExecutionDraft | null>(null);
  const [confirmation, setConfirmation] = useState<{ key: string; raw: string | null } | null>(
    null,
  );
  const [error, setError] = useState("");
  useEffect(() => {
    function read() {
      try {
        setActive(readActiveTrainingDrafts(window.localStorage)[0] ?? null);
      } catch {
        /* Preserve the current recovery entry when storage is temporarily unavailable. */
      }
    }
    const timer = window.setTimeout(read, 0);
    window.addEventListener("storage", read);
    window.addEventListener(TRAINING_ACTIVITY_DRAFT_EVENT, read);
    window.addEventListener("focus", read);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", read);
      window.removeEventListener(TRAINING_ACTIVITY_DRAFT_EVENT, read);
      window.removeEventListener("focus", read);
    };
  }, [pathname]);
  const seconds = useTrainingActivityTimer(
    active
      ? trainingActivityDraftTimerInput(active)
      : { accumulatedActiveSeconds: 0, currentIntervalStartedAt: null },
  );
  if (!active || pathname?.startsWith("/workout/activity/")) return null;
  const href = `/workout/activity/${encodeURIComponent(active.activityId)}?date=${encodeURIComponent(active.civilDate)}`;
  const name = typeof active.activityName === "string" ? active.activityName : t("activeWorkout");
  const duration = [Math.floor(seconds / 3600), Math.floor((seconds % 3600) / 60), seconds % 60]
    .map((value) => String(value).padStart(2, "0"))
    .join(":");
  function discard() {
    if (!confirmation) return;
    try {
      const latest = window.localStorage.getItem(confirmation.key);
      if (latest !== null && latest !== confirmation.raw) {
        setConfirmation({ ...confirmation, raw: latest });
        setError(t("discardWorkoutChanged"));
        return;
      }
      window.localStorage.removeItem(confirmation.key);
      window.dispatchEvent(
        new CustomEvent(TRAINING_ACTIVITY_DRAFT_EVENT, {
          detail: { key: confirmation.key, draft: null },
        }),
      );
      setConfirmation(null);
      setError("");
    } catch {
      setError(t("discardWorkoutFailed"));
    }
  }
  return (
    <>
      <Item
        variant="outline"
        size="sm"
        role="complementary"
        data-active-workout
        className={`${styles.bar} bg-surface-elevated`}
        aria-label={t("activeWorkout")}
      >
        <Link href={href} prefetch={false} className={styles.resume}>
          <ItemContent>
            <ItemTitle>
              <StatusIndicator
                tone={active.status === "in_progress" ? "success" : "warning"}
                pulse={active.status === "in_progress"}
                aria-label={t(active.status === "in_progress" ? "inProgress" : "paused")}
              />
              {t("backToWorkout")}
            </ItemTitle>
            <ItemDescription className="flex gap-2">
              <span className={styles.name}>{name}</span>
              <time className="shrink-0 tabular-nums">{duration}</time>
              {active.status === "paused" ? ` · ${t("paused")}` : ""}
            </ItemDescription>
          </ItemContent>
        </Link>
        <ItemActions>
          <Button
            ref={trigger}
            variant="ghost"
            size="icon"
            tone="danger"
            aria-label={t("discardWorkout")}
            onClick={() => {
              try {
                setError("");
                setConfirmation({
                  key: trainingActivityDraftKey(active.civilDate, active.activityId),
                  raw: window.localStorage.getItem(
                    trainingActivityDraftKey(active.civilDate, active.activityId),
                  ),
                });
              } catch {
                setError(t("discardWorkoutFailed"));
              }
            }}
          >
            <Trash2 size={20} aria-hidden="true" />
          </Button>
        </ItemActions>
        {error && !confirmation ? <p role="alert">{error}</p> : null}
      </Item>
      {confirmation ? (
        <TrainingActivityModal
          title={t("discardWorkoutQuestion")}
          busy={false}
          restoreFocusRef={trigger}
          initialFocusRef={keepButton}
          size="confirmation"
          onRequestClose={() => setConfirmation(null)}
          footer={
            <>
              <Button variant="destructive" tone="danger" onClick={discard}>
                {t("discardWorkout")}
              </Button>
              <Button ref={keepButton} onClick={() => setConfirmation(null)}>
                {t("keepWorkout")}
              </Button>
            </>
          }
        >
          <p>{t("discardWorkoutDescription")}</p>
          {error ? <p role="alert">{error}</p> : null}
        </TrainingActivityModal>
      ) : null}
    </>
  );
}
