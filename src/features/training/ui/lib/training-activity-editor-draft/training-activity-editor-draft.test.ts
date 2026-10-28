import { describe, it, expect } from "vitest";
import {
  activityEditorDraftKey,
  activityEditorContext,
  initialActivityEditorValues,
  createActivityEditorDraft,
  parseActivityEditorDraft,
  sameActivityEditorValues,
} from "./training-activity-editor-draft.utils";
const date = "2026-10-27";
const context = activityEditorContext(date, undefined, null);
const values = initialActivityEditorValues(date, undefined, null);
const now = new Date("2026-10-27T15:00:00Z");
const draft = () =>
  createActivityEditorDraft(context, { ...values, name: "Futevôlei" }, crypto.randomUUID(), now);
describe("activity editor draft codec", () => {
  it("isolates dates and uses the stable activity ID for editing", () => {
    expect(activityEditorDraftKey(context)).not.toBe(
      activityEditorDraftKey({ ...context, sourceCivilDate: "2026-10-28" }),
    );
    const edit = { ...context, mode: "edit" as const, activityId: "real-id" };
    expect(activityEditorDraftKey(edit)).toBe(
      activityEditorDraftKey({ ...edit, sourceCivilDate: "2026-10-28" }),
    );
    expect(activityEditorDraftKey(context)).not.toContain("training-draft:v1");
  });
  it("accepts incomplete values and preserves manual intent", () => {
    const d = draft();
    expect(parseActivityEditorDraft(JSON.stringify(d), context, now)).toEqual({
      status: "restored",
      draft: d,
    });
    expect(sameActivityEditorValues(values, { ...values, automaticEnd: false })).toBe(false);
  });
  it.each(["{", JSON.stringify({ version: 2 }), "x".repeat(32769)])(
    "rejects malformed storage safely",
    (raw) => expect(parseActivityEditorDraft(raw, context, now).status).toBe("invalid"),
  );
  it("does not refresh expiration during reading", () => {
    const d = draft();
    expect(
      parseActivityEditorDraft(JSON.stringify(d), context, new Date("2026-11-03T15:00:00Z")),
    ).toEqual({ status: "expired" });
    expect(d.expiresAt).toBe("2026-11-03T15:00:00.000Z");
  });
  it.each(["baseFingerprint", "planFingerprint", "sourceCivilDate"] as const)(
    "blocks changed %s",
    (key) => {
      expect(
        parseActivityEditorDraft(JSON.stringify(draft()), { ...context, [key]: "changed" }, now)
          .status,
      ).toBe("stale");
    },
  );
  it("rejects invalid type and keep in a new activity", () => {
    expect(
      parseActivityEditorDraft(
        JSON.stringify({ ...draft(), values: { ...values, type: "other" } }),
        context,
        now,
      ).status,
    ).toBe("invalid");
    expect(
      parseActivityEditorDraft(
        JSON.stringify({ ...draft(), values: { ...values, preparationChoice: "keep" } }),
        context,
        now,
      ).status,
    ).toBe("invalid");
  });
  it("rejects foreign fields and incoherent identity", () => {
    expect(
      parseActivityEditorDraft(JSON.stringify({ ...draft(), secret: true }), context, now).status,
    ).toBe("invalid");
    expect(
      parseActivityEditorDraft(
        JSON.stringify({ ...draft(), context: { ...context, activityId: "fake" } }),
        context,
        now,
      ).status,
    ).toBe("invalid");
  });
});
