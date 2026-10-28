"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  readCompletionDraft,
  type CompletionValues,
} from "../../lib/training-activity-completion-draft/training-activity-completion-draft";
import type {
  CompletionDraftInput,
  CompletionDraftStatus,
} from "./use-training-activity-completion-draft.types";

export function useTrainingActivityCompletionDraft(input: CompletionDraftInput) {
  const [base] = useState(input);
  const [values, setValues] = useState(base.initialValues);
  const currentValues = useRef(values);
  const [status, setStatus] = useState<CompletionDraftStatus>("loading");
  const blockedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const readyRef = useRef(false);
  const observedRaw = useRef<string | null | undefined>(undefined);
  const [completionRequestedAt, setCompletionRequestedAt] = useState(base.completionRequestedAt);
  const stopInstant = useRef(base.completionRequestedAt);
  const writer = useRef("");
  const finished = useRef(false);

  const flush = useCallback((): "ok" | "failed" | "external_change" => {
    if (finished.current) return "ok";
    if (blockedRef.current || !readyRef.current) return "external_change";
    try {
      const stored = window.localStorage.getItem(base.key);
      if (observedRaw.current === undefined ? stored !== null : stored !== observedRaw.current) {
        blockedRef.current = true;
        setStatus("external_change");
        return "external_change";
      }
      const raw = JSON.stringify({
        version: 1,
        revision: base.revision,
        action: base.action,
        values: currentValues.current,
        executionSignature: base.executionSignature,
        completionRequestedAt: stopInstant.current,
        expiresAt: Date.now() + 7 * 86_400_000,
        writerId: writer.current,
      });
      window.localStorage.setItem(base.key, raw);
      observedRaw.current = raw;
      setStatus("stored");
      return "ok";
    } catch {
      setStatus("storage_error");
      return "failed";
    }
  }, [base]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      writer.current = crypto.randomUUID();
      try {
        const raw = window.localStorage.getItem(base.key);
        observedRaw.current = raw;
        if (raw) {
          const restored = readCompletionDraft(raw, base.revision, base.action, Date.now());
          setStatus(restored.status);
          blockedRef.current = restored.status !== "restored";
          if (restored.draft) {
            currentValues.current = restored.draft.values;
            setValues(restored.draft.values);
            if (
              restored.status === "restored" &&
              restored.draft.executionSignature === base.executionSignature
            ) {
              stopInstant.current =
                restored.draft.completionRequestedAt ?? base.completionRequestedAt;
              setCompletionRequestedAt(stopInstant.current);
            }
          }
        } else setStatus("clean");
      } catch {
        setStatus("storage_error");
      }
      readyRef.current = true;
      setReady(true);
    }, 0);
    function external(event: StorageEvent) {
      if (
        (event.key === base.key || event.key === null) &&
        event.newValue !== observedRaw.current
      ) {
        blockedRef.current = true;
        setStatus("external_change");
      }
    }
    window.addEventListener("storage", external);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("storage", external);
    };
  }, [base]);

  useEffect(() => {
    if (!ready || values === base.initialValues || blockedRef.current) return;
    const timer = window.setTimeout(flush, 400);
    return () => window.clearTimeout(timer);
  }, [values, ready, base, flush]);

  useEffect(() => {
    function beforeUnload(event: BeforeUnloadEvent) {
      if (readyRef.current && !finished.current && flush() !== "ok") event.preventDefault();
    }
    function pageHide() {
      if (readyRef.current && !finished.current) flush();
    }
    window.addEventListener("beforeunload", beforeUnload);
    window.addEventListener("pagehide", pageHide);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      window.removeEventListener("pagehide", pageHide);
      if (readyRef.current && !finished.current && !blockedRef.current) flush();
    };
  }, [flush]);

  function update(next: CompletionValues) {
    currentValues.current = next;
    setValues(next);
  }
  function discard() {
    try {
      if (window.localStorage.getItem(base.key) !== observedRaw.current) {
        blockedRef.current = true;
        setStatus("external_change");
        return false;
      }
      window.localStorage.removeItem(base.key);
      observedRaw.current = null;
      blockedRef.current = false;
      update(base.initialValues);
      stopInstant.current = base.completionRequestedAt;
      setCompletionRequestedAt(base.completionRequestedAt);
      setStatus("clean");
      return true;
    } catch {
      setStatus("storage_error");
      return false;
    }
  }
  function finish() {
    finished.current = true;
    try {
      if (
        observedRaw.current !== undefined &&
        window.localStorage.getItem(base.key) === observedRaw.current
      )
        window.localStorage.removeItem(base.key);
      return true;
    } catch {
      return false;
    }
  }
  return {
    values,
    update,
    ready,
    status,
    completionRequestedAt,
    blocked: ["external_change", "stale", "expired", "invalid"].includes(status),
    flush,
    discard,
    finish,
    release: () => {
      finished.current = true;
    },
    isBlocked: () => blockedRef.current,
  };
}
