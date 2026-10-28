"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  activityEditorDraftKey,
  createActivityEditorDraft,
  parseActivityEditorDraft,
  sameActivityEditorValues,
} from "../../lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import type {
  TrainingActivityEditorDraftStatus,
  TrainingActivityEditorStorageResult,
  TrainingActivityEditorValues,
} from "../../lib/training-activity-editor-draft/training-activity-editor-draft.types";
import type {
  UseTrainingActivityEditorDraftInput,
  UseTrainingActivityEditorDraftResult,
} from "./use-training-activity-editor-draft.types";
const blockedStatuses = new Set<TrainingActivityEditorDraftStatus>([
  "stale",
  "external_change",
  "invalid",
  "expired",
]);
export function useTrainingActivityEditorDraft(
  input: UseTrainingActivityEditorDraftInput,
): UseTrainingActivityEditorDraftResult {
  const [base] = useState(input);
  const [initialValues, setInitialValues] = useState(base.baseValues);
  const [status, setStatus] = useState<TrainingActivityEditorDraftStatus>("loading");
  const [ready, setReady] = useState(false);
  const [dirty, setDirty] = useState(false);
  const values = useRef(base.baseValues);
  const storedValues = useRef<TrainingActivityEditorValues | null>(null);
  const knownRaw = useRef<string | null | undefined>(undefined);
  const finished = useRef(false),
    loaded = useRef(false),
    active = useRef(false);
  const currentStatus = useRef<TrainingActivityEditorDraftStatus>("loading");
  const writerId = useRef("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const key = activityEditorDraftKey(base.context);
  const publish = useCallback((next: TrainingActivityEditorDraftStatus) => {
    currentStatus.current = next;
    if (active.current) setStatus(next);
  }, []);
  const cancel = useCallback(() => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
  }, []);
  const matchesStorage = useCallback(() => {
    if (base.context.mode === "edit") return true;
    const raw = window.sessionStorage.getItem(key);
    if (knownRaw.current === undefined && raw === null) knownRaw.current = null;
    if (raw !== knownRaw.current) {
      publish("external_change");
      return false;
    }
    return true;
  }, [base, key, publish]);
  const flush = useCallback((): TrainingActivityEditorStorageResult => {
    cancel();
    if (base.context.mode === "edit") return { status: "ok" };
    if (finished.current) return { status: "ok" };
    if (!loaded.current) return { status: "failed" };
    if (blockedStatuses.has(currentStatus.current)) {
      try {
        if (
          currentStatus.current === "stale" &&
          storedValues.current &&
          sameActivityEditorValues(values.current, storedValues.current) &&
          matchesStorage()
        )
          return { status: "ok" };
      } catch {
        publish("storage_error");
      }
      return { status: "failed" };
    }
    try {
      if (!matchesStorage()) return { status: "failed" };
      if (sameActivityEditorValues(values.current, base.baseValues)) {
        if (knownRaw.current !== null) window.sessionStorage.removeItem(key);
        knownRaw.current = null;
        storedValues.current = null;
        publish("clean");
      } else if (
        !storedValues.current ||
        !sameActivityEditorValues(values.current, storedValues.current)
      ) {
        const draft = createActivityEditorDraft(base.context, values.current, writerId.current);
        const raw = JSON.stringify(draft);
        window.sessionStorage.setItem(key, raw);
        knownRaw.current = raw;
        storedValues.current = values.current;
        publish("stored");
      } else if (currentStatus.current === "storage_error") publish("stored");
      return { status: "ok" };
    } catch {
      publish("storage_error");
      return { status: "failed" };
    }
  }, [base, cancel, key, matchesStorage, publish]);
  const update = useCallback(
    (next: TrainingActivityEditorValues) => {
      if (
        finished.current ||
        !loaded.current ||
        blockedStatuses.has(currentStatus.current) ||
        sameActivityEditorValues(values.current, next)
      )
        return;
      values.current = next;
      setDirty(!sameActivityEditorValues(next, base.baseValues));
      if (currentStatus.current !== "storage_error") publish("dirty");
      cancel();
      if (base.context.mode !== "edit") timer.current = setTimeout(flush, 400);
    },
    [base, cancel, flush, publish],
  );
  const discard = useCallback((): TrainingActivityEditorStorageResult => {
    cancel();
    try {
      if (!matchesStorage()) return { status: "failed" };
      if (base.context.mode !== "edit") window.sessionStorage.removeItem(key);
      knownRaw.current = null;
      storedValues.current = null;
      values.current = base.baseValues;
      setInitialValues(base.baseValues);
      setDirty(false);
      publish("clean");
      return { status: "ok" };
    } catch {
      publish("storage_error");
      return { status: "failed" };
    }
  }, [base, cancel, key, matchesStorage, publish]);
  const finish = useCallback((): TrainingActivityEditorStorageResult => {
    finished.current = true;
    cancel();
    try {
      if (!matchesStorage()) return { status: "failed" };
      if (base.context.mode !== "edit") window.sessionStorage.removeItem(key);
      knownRaw.current = null;
      return { status: "ok" };
    } catch {
      return { status: "failed" };
    }
  }, [base.context.mode, cancel, key, matchesStorage]);
  useEffect(() => {
    active.current = true;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled) return;
      writerId.current = crypto.randomUUID();
      try {
        window.localStorage.removeItem(key);
      } catch {
        /* Legacy cleanup is independent of session recovery. */
      }
      if (base.context.mode === "edit") {
        try {
          window.sessionStorage.removeItem(key);
        } catch {
          /* Editing does not depend on storage. */
        }
        publish("clean");
        loaded.current = true;
        setReady(true);
        return;
      }
      try {
        const raw = window.sessionStorage.getItem(key);
        knownRaw.current = raw;
        const result = parseActivityEditorDraft(raw, base.context);
        if (result.status === "restored" || result.status === "stale") {
          values.current = result.draft.values;
          storedValues.current = result.draft.values;
          setInitialValues(result.draft.values);
          setDirty(!sameActivityEditorValues(result.draft.values, base.baseValues));
        }
        publish(result.status === "missing" ? "clean" : result.status);
      } catch {
        publish("storage_error");
      }
      loaded.current = true;
      setReady(true);
    });
    const visibility = () => {
      if (document.visibilityState === "hidden") flush();
    };
    const pagehide = () => {
      flush();
    };
    const unload = (event: BeforeUnloadEvent) => {
      if (
        !finished.current &&
        !sameActivityEditorValues(values.current, base.baseValues) &&
        flush().status === "failed"
      ) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    const storage = (event: StorageEvent) => {
      if (
        base.context.mode === "edit" ||
        finished.current ||
        !loaded.current ||
        event.storageArea !== window.sessionStorage
      )
        return;
      if ((event.key === key || event.key === null) && event.newValue !== knownRaw.current) {
        cancel();
        publish("external_change");
      }
    };
    if (base.context.mode !== "edit") {
      document.addEventListener("visibilitychange", visibility);
      window.addEventListener("pagehide", pagehide);
      window.addEventListener("beforeunload", unload);
      window.addEventListener("storage", storage);
    }
    return () => {
      cancelled = true;
      active.current = false;
      cancel();
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pagehide);
      window.removeEventListener("beforeunload", unload);
      window.removeEventListener("storage", storage);
    };
  }, [base, cancel, flush, key, publish]);
  return {
    ready,
    initialValues,
    status,
    dirty,
    blocked: blockedStatuses.has(status),
    update,
    flush,
    discard,
    finish,
  };
}
