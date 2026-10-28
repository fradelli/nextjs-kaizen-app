import { StrictMode } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, it, expect, vi } from "vitest";
import {
  activityEditorContext,
  activityEditorDraftKey,
  initialActivityEditorValues,
  createActivityEditorDraft,
} from "../../lib/training-activity-editor-draft/training-activity-editor-draft.utils";
import { useTrainingActivityEditorDraft } from "./use-training-activity-editor-draft";
const context = activityEditorContext("2026-10-27", undefined, null);
const baseValues = initialActivityEditorValues("2026-10-27", undefined, null);
const key = activityEditorDraftKey(context);
const next = { ...baseValues, name: "Jogo", manualEndTime: "19:00", automaticEnd: false };
const open = () =>
  renderHook(() => useTrainingActivityEditorDraft({ context, baseValues }), {
    wrapper: StrictMode,
  });
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
  localStorage.clear();
});
describe("activity editor local persistence", () => {
  it("closes an unchanged stale draft without overwriting or making it editable", async () => {
    const d = createActivityEditorDraft(
      { ...context, baseFingerprint: "old" },
      next,
      crypto.randomUUID(),
    );
    const raw = JSON.stringify(d);
    localStorage.setItem(key, raw);
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.blocked).toBe(true);
    act(() => expect(result.current.flush().status).toBe("ok"));
    expect(localStorage.getItem(key)).toBe(raw);
    expect(result.current.blocked).toBe(true);
  });

  it("does not create empty drafts on mount and flushes the last input before debounce", async () => {
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(localStorage.getItem(key)).toBeNull();
    act(() => result.current.update(next));
    act(() => expect(result.current.flush().status).toBe("ok"));
    expect(JSON.parse(localStorage.getItem(key)!).values).toEqual(next);
  });
  it("restores before any initial form emission and keeps expiration", async () => {
    const d = createActivityEditorDraft(context, next, crypto.randomUUID());
    localStorage.setItem(key, JSON.stringify(d));
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.initialValues).toEqual(next);
    act(() => result.current.update(next));
    act(() => result.current.flush());
    expect(JSON.parse(localStorage.getItem(key)!).expiresAt).toBe(d.expiresAt);
  });
  it("debounces changes and removes a draft reverted to baseline", async () => {
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    vi.useFakeTimers();
    act(() => result.current.update(next));
    act(() => vi.advanceTimersByTime(399));
    expect(localStorage.getItem(key)).toBeNull();
    act(() => vi.advanceTimersByTime(1));
    expect(localStorage.getItem(key)).not.toBeNull();
    act(() => result.current.update(baseValues));
    act(() => result.current.flush());
    expect(localStorage.getItem(key)).toBeNull();
  });
  it("pauses when another tab writes and never deletes its version", async () => {
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    const remote = JSON.stringify(createActivityEditorDraft(context, next, crypto.randomUUID()));
    localStorage.setItem(key, remote);
    act(() => window.dispatchEvent(new StorageEvent("storage", { key, newValue: remote })));
    expect(result.current.status).toBe("external_change");
    act(() => expect(result.current.flush().status).toBe("failed"));
    act(() => expect(result.current.finish().status).toBe("failed"));
    expect(localStorage.getItem(key)).toBe(remote);
  });
  it("keeps values in memory when browser writes fail", async () => {
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    act(() => result.current.update(next));
    act(() => expect(result.current.flush().status).toBe("failed"));
    expect(result.current.status).toBe("storage_error");
    expect(result.current.dirty).toBe(true);
  });
  it("does not resurrect a completed draft from timers or pagehide", async () => {
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    vi.useFakeTimers();
    act(() => result.current.update(next));
    act(() => result.current.finish());
    act(() => vi.advanceTimersByTime(1000));
    act(() => window.dispatchEvent(new Event("pagehide")));
    expect(localStorage.getItem(key)).toBeNull();
  });
  it("blocks corrupted and stale records until explicitly discarded", async () => {
    localStorage.setItem(key, "invalid");
    const { result } = open();
    await waitFor(() => expect(result.current.ready).toBe(true));
    expect(result.current.blocked).toBe(true);
    act(() => result.current.update(next));
    expect(localStorage.getItem(key)).toBe("invalid");
    act(() => result.current.discard());
    expect(result.current.blocked).toBe(false);
    expect(localStorage.getItem(key)).toBeNull();
  });
});
