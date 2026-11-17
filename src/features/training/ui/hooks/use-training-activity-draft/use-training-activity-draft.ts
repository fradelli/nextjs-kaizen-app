"use client";
import { useTranslations } from "next-intl";

import { useEffect, useRef, useState } from "react";
import { reconcileCompletedTrainingDraft } from "./reconcile-completed-training-draft";
import { isTrainingExecutionDateEditable } from "@/features/training/domain/training-edit-window";

import type {
  TrainingDraftReconciliation,
  TrainingActivityExecutionDraft,
  TrainingExerciseExecutionDraft,
  UseTrainingActivityDraftInput,
} from "./use-training-activity-draft.types";
import {
  isTrainingActivityDraft,
  resumePersistedTrainingActivityDraft,
  startTrainingActivityDraft,
  trainingActivityDraftKey,
} from "./use-training-activity-draft.utils";

import {
  TRAINING_ACTIVITY_DRAFT_EVENT,
  TRAINING_ACTIVITY_DRAFT_PREFIX,
} from "./use-training-activity-draft.constants";

export function useTrainingActivityDraft({ activity, civilDate }: UseTrainingActivityDraftInput) {
  const t = useTranslations("training");

  const key = trainingActivityDraftKey(civilDate, activity.id);
  const terminal = activity.status === "completed" || activity.status === "skipped";
  const [draft, setDraft] = useState<TrainingActivityExecutionDraft | null>(null);
  const currentDraft = useRef<TrainingActivityExecutionDraft | null>(null);
  const [ready, setReady] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [reconciliation, setReconciliation] = useState<TrainingDraftReconciliation>("none");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (activity.status === "completed" || activity.status === "skipped") {
        setReconciliation(reconcileCompletedTrainingDraft(activity, civilDate));
        currentDraft.current = null;
        setDraft(null);
        setReady(true);
        return;
      }
      try {
        const stored = window.localStorage.getItem(key);
        if (stored) {
          const parsed: unknown = JSON.parse(stored);
          if (
            isTrainingActivityDraft(parsed, activity.id, civilDate) &&
            parsed.expectedRevision === activity.revision
          ) {
            currentDraft.current = parsed;
            setDraft(parsed);
          } else {
            currentDraft.current = resumePersistedTrainingActivityDraft(activity, civilDate);
            setDraft(currentDraft.current);
          }
        } else {
          currentDraft.current = resumePersistedTrainingActivityDraft(activity, civilDate);
          setDraft(currentDraft.current);
        }
      } catch {
        currentDraft.current = resumePersistedTrainingActivityDraft(activity, civilDate);
        setDraft(currentDraft.current);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [activity, civilDate, key]);

  useEffect(() => {
    function updateFromAnotherCard(event: Event) {
      const detail = (
        event as CustomEvent<{ key: string; draft: TrainingActivityExecutionDraft | null }>
      ).detail;
      if (
        detail?.key === key &&
        (detail.draft === null ||
          (activity.status !== "completed" && activity.status !== "skipped"))
      ) {
        currentDraft.current = detail.draft;
        setDraft(detail.draft);
      }
    }
    function updateFromAnotherTab(event: StorageEvent) {
      if (event.key !== key && event.key !== null) return;
      if (activity.status === "completed" || activity.status === "skipped") return;
      try {
        const raw = event.key === null ? window.localStorage.getItem(key) : event.newValue;
        const parsed: unknown = raw ? JSON.parse(raw) : null;
        if (
          parsed === null ||
          (isTrainingActivityDraft(parsed, activity.id, civilDate) &&
            parsed.expectedRevision === activity.revision)
        ) {
          currentDraft.current = parsed;
          setDraft(parsed);
        }
      } catch {
        /* Keep the current execution when another tab writes invalid data. */
      }
    }
    window.addEventListener("storage", updateFromAnotherTab);
    window.addEventListener(TRAINING_ACTIVITY_DRAFT_EVENT, updateFromAnotherCard);
    return () => {
      window.removeEventListener(TRAINING_ACTIVITY_DRAFT_EVENT, updateFromAnotherCard);
      window.removeEventListener("storage", updateFromAnotherTab);
    };
  }, [key, activity.id, activity.revision, activity.status, civilDate]);

  useEffect(() => {
    function protectUnstoredExecution(event: BeforeUnloadEvent) {
      if (storageError && currentDraft.current) event.preventDefault();
    }
    window.addEventListener("beforeunload", protectUnstoredExecution);
    return () => window.removeEventListener("beforeunload", protectUnstoredExecution);
  }, [storageError]);

  function pauseOtherActivity(): boolean {
    try {
      for (let index = 0; index < window.localStorage.length; index++) {
        const otherKey = window.localStorage.key(index);
        if (!otherKey?.startsWith(TRAINING_ACTIVITY_DRAFT_PREFIX) || otherKey === key) continue;
        const raw = window.localStorage.getItem(otherKey);
        if (!raw) continue;
        let other: unknown;
        try {
          other = JSON.parse(raw);
        } catch {
          continue;
        }
        if (
          !other ||
          typeof other !== "object" ||
          !("activityId" in other) ||
          typeof other.activityId !== "string" ||
          !("civilDate" in other) ||
          typeof other.civilDate !== "string" ||
          !isTrainingActivityDraft(other, other.activityId, other.civilDate) ||
          other.status !== "in_progress" ||
          !isTrainingExecutionDateEditable(other.civilDate)
        )
          continue;
        const running = other;
        if (!window.confirm(t("pauseOtherActivity"))) return false;
        const now = new Date().toISOString();
        const paused: TrainingActivityExecutionDraft = {
          ...running,
          exercises: Object.fromEntries(
            Object.entries(running.exercises).map(([key, exercise]) => [
              key,
              { ...exercise, rest: undefined },
            ]),
          ),
          status: "paused",
          intervals: running.intervals.map((interval, intervalIndex) =>
            intervalIndex === running.intervals.length - 1 && interval.endedAt === null
              ? { ...interval, endedAt: now }
              : interval,
          ),
        };
        window.localStorage.setItem(otherKey, JSON.stringify(paused));
        window.dispatchEvent(
          new CustomEvent(TRAINING_ACTIVITY_DRAFT_EVENT, {
            detail: { key: otherKey, draft: paused },
          }),
        );
      }
      return true;
    } catch {
      return false;
    }
  }

  function publishDraft(next: TrainingActivityExecutionDraft | null): boolean {
    currentDraft.current = next;
    setDraft(next);
    try {
      if (next) window.localStorage.setItem(key, JSON.stringify(next));
      else window.localStorage.removeItem(key);
      window.dispatchEvent(
        new CustomEvent(TRAINING_ACTIVITY_DRAFT_EVENT, { detail: { key, draft: next } }),
      );
      setStorageError(false);
      return true;
    } catch {
      setStorageError(true);
      return false;
    }
  }

  function pauseAt(completionRequestedAt: string) {
    const current = currentDraft.current;
    if (terminal || !current || !isTrainingExecutionDateEditable(civilDate)) return null;
    const paused: TrainingActivityExecutionDraft =
      current.status === "paused"
        ? current
        : {
            ...current,
            status: "paused",
            intervals: current.intervals.map((interval, index) =>
              index === current.intervals.length - 1 && interval.endedAt === null
                ? { ...interval, endedAt: completionRequestedAt }
                : interval,
            ),
          };
    publishDraft(paused);
    return { draft: paused, completionRequestedAt };
  }

  return {
    draft,
    ready,
    storageError,
    reconciliation,
    start() {
      if (terminal || !ready || !isTrainingExecutionDateEditable(civilDate)) return false;
      if (currentDraft.current) return true;
      if (!pauseOtherActivity()) return false;
      const next = startTrainingActivityDraft(activity, civilDate, new Date().toISOString());
      // Do not start a new clock when its recovery copy cannot be written.
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        setStorageError(true);
        return false;
      }
      publishDraft(next);
      return true;
    },
    pause() {
      pauseAt(new Date().toISOString());
    },
    prepareCompletion() {
      return pauseAt(new Date().toISOString());
    },
    resume() {
      const current = currentDraft.current;
      if (terminal || !isTrainingExecutionDateEditable(civilDate) || current?.status !== "paused")
        return;
      if (!pauseOtherActivity()) return;
      publishDraft({
        ...current,
        status: "in_progress",
        intervals: [...current.intervals, { startedAt: new Date().toISOString(), endedAt: null }],
      });
    },
    updateExercise(exerciseKey: string, exercise: TrainingExerciseExecutionDraft) {
      const current = currentDraft.current;
      if (terminal || !isTrainingExecutionDateEditable(civilDate) || !current) return;
      const exercises = { ...current.exercises };
      if (exercise.rest && exercise.rest !== exercises[exerciseKey]?.rest) {
        for (const key of Object.keys(exercises))
          exercises[key] = { ...exercises[key]!, rest: undefined };
      }
      exercises[exerciseKey] = exercise;
      publishDraft({ ...current, exercises });
    },
    clear() {
      publishDraft(null);
    },
  };
}
