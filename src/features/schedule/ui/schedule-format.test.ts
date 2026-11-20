import { describe, expect, it } from "vitest";
import { localParts, toInstant } from "./schedule-format";
describe("schedule civil times", () => {
  it.each(["00:00", "09:15", "23:45"])("round trips %s in Sao Paulo", (time) => {
    expect(localParts(toInstant("2026-11-17", time))).toEqual({ date: "2026-11-17", time });
  });
});
