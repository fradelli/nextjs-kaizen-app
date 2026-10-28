import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, it, expect, vi } from "vitest";
import { useTrainingActivityCompletionDraft } from "./use-training-activity-completion-draft";
const input = {
  key: "kaizen:training-completion-draft:v1:complete:2026-10-28:review",
  revision: 0,
  action: "complete" as const,
  initialValues: { intensity: "" as const, energy: "" as const, comment: "" },
  executionSignature: "paused",
  completionRequestedAt: "2026-10-28T15:00:00.000Z",
};
async function open(extra = {}) {
  const h = renderHook(() => useTrainingActivityCompletionDraft({ ...input, ...extra }));
  await waitFor(() => expect(h.result.current.ready).toBe(true));
  return h;
}
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  sessionStorage.clear();
  localStorage.clear();
});
it("discarding feedback must preserve the recovered stop instant", async () => {
  const first = await open();
  act(() => first.result.current.flush());
  first.unmount();
  const second = await open({ completionRequestedAt: "2026-10-28T15:05:00.000Z" });
  expect(second.result.current.completionRequestedAt).toBe(input.completionRequestedAt);
  act(() => second.result.current.discard());
  expect(second.result.current.completionRequestedAt).toBe(input.completionRequestedAt);
});
it("localStorage events must not invalidate a sessionStorage draft", async () => {
  const h = await open();
  act(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: input.key,
        newValue: "legacy change",
        storageArea: localStorage,
      }),
    ),
  );
  expect(h.result.current.blocked).toBe(false);
});
it("legacy cleanup failure must not hide a valid session draft", async () => {
  const first = await open();
  act(() => {
    first.result.current.update({ ...input.initialValues, comment: "saved session value" });
    first.result.current.flush();
  });
  first.unmount();
  const remove = Storage.prototype.removeItem;
  vi.spyOn(Storage.prototype, "removeItem").mockImplementation(function (
    this: Storage,
    key: string,
  ) {
    if (this === localStorage) throw Error("legacy unavailable");
    return remove.call(this, key);
  });
  const second = await open();
  expect(second.result.current.values.comment).toBe("saved session value");
});
