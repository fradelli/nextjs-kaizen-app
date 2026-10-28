import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useTrainingActivityCompletionDraft } from "./use-training-activity-completion-draft";
import {
  completionDraftKey,
  readCompletionDraft,
} from "../../lib/training-activity-completion-draft/training-activity-completion-draft";
import type { CompletionDraftInput } from "./use-training-activity-completion-draft.types";
const input: CompletionDraftInput = {
  key: completionDraftKey("complete", "2026-10-27", "one"),
  revision: 2,
  action: "complete",
  initialValues: { intensity: "", energy: "", comment: "" },
  executionSignature: "paused-one",
  completionRequestedAt: "2026-10-27T15:00:00.000Z",
};
beforeEach(() => window.localStorage.clear());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
async function ready(overrides: Partial<CompletionDraftInput> = {}) {
  const view = renderHook(() => useTrainingActivityCompletionDraft({ ...input, ...overrides }));
  await waitFor(() => expect(view.result.current.ready).toBe(true));
  return view;
}
describe("completion recovery", () => {
  it("debounces feedback, restores the matching stop, and clears only after success", async () => {
    const first = await ready();
    act(() =>
      first.result.current.update({ intensity: "high", energy: "normal", comment: "Keep" }),
    );
    await waitFor(() => expect(first.result.current.status).toBe("stored"));
    first.unmount();
    const second = await ready({ completionRequestedAt: "2026-10-27T15:05:00.000Z" });
    expect(second.result.current.values.comment).toBe("Keep");
    expect(second.result.current.completionRequestedAt).toBe(input.completionRequestedAt);
    act(() => second.result.current.finish());
    expect(localStorage.getItem(input.key)).toBeNull();
  });
  it("keeps feedback after resume but replaces the stop instant", async () => {
    const first = await ready();
    act(() => first.result.current.flush());
    first.unmount();
    const second = await ready({
      executionSignature: "paused-two",
      completionRequestedAt: "2026-10-27T16:00:00.000Z",
    });
    expect(second.result.current.completionRequestedAt).toBe("2026-10-27T16:00:00.000Z");
  });
  it("blocks a stale revision until feedback alone is explicitly discarded", async () => {
    const first = await ready();
    act(() => first.result.current.flush());
    first.unmount();
    const second = await ready({ revision: 3 });
    expect(second.result.current.blocked).toBe(true);
    act(() => expect(second.result.current.flush()).toBe("external_change"));
    act(() => expect(second.result.current.discard()).toBe(true));
    expect(second.result.current.blocked).toBe(false);
  });
  it("never overwrites or removes another writer's cache", async () => {
    const view = await ready();
    act(() => view.result.current.flush());
    localStorage.setItem(input.key, "another writer");
    act(() => expect(view.result.current.flush()).toBe("external_change"));
    act(() => view.result.current.finish());
    expect(localStorage.getItem(input.key)).toBe("another writer");
  });
  it("blocks storage events immediately while keeping the local values visible", async () => {
    const view = await ready();
    act(() => view.result.current.update({ ...input.initialValues, comment: "Local" }));
    act(() =>
      window.dispatchEvent(new StorageEvent("storage", { key: input.key, newValue: "new" })),
    );
    expect(view.result.current.blocked).toBe(true);
    expect(view.result.current.values.comment).toBe("Local");
  });
  it("reports storage failure and preserves the fields for a server save", async () => {
    const view = await ready();
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("full");
    });
    act(() => {
      view.result.current.update({ ...input.initialValues, comment: "Still here" });
      expect(view.result.current.flush()).toBe("failed");
    });
    expect(view.result.current.values.comment).toBe("Still here");
    expect(view.result.current.blocked).toBe(false);
  });
  it("rejects invalid and expired cache without guessing values", () => {
    expect(readCompletionDraft("{", 2, "complete", Date.now()).status).toBe("invalid");
    expect(
      readCompletionDraft(JSON.stringify({ version: 9 }), 2, "complete", Date.now()).status,
    ).toBe("invalid");
    const raw = JSON.stringify({
      version: 1,
      revision: 2,
      action: "complete",
      values: input.initialValues,
      executionSignature: null,
      completionRequestedAt: null,
      expiresAt: 1,
      writerId: "one",
    });
    expect(readCompletionDraft(raw, 2, "complete", 2).status).toBe("expired");
  });
});
