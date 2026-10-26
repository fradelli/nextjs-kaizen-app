import { describe, expect, it } from "vitest";
import { isValidPlannedInterval, suggestPlannedEnd } from "./training-activity-form.utils";

describe("planned training end suggestion", () => {
  it.each([
    ["18:00", 40, "18:40"],
    ["00:00", 5, "00:05"],
    ["23:00", 59, "23:59"],
    ["09:45", 90, "11:15"],
  ])("adds civil minutes for %s", (start, duration, end) => {
    expect(suggestPlannedEnd(start as string, duration as number)).toMatchObject({
      status: "ready",
      time: end,
    });
  });
  it.each(["", "18:", "24:00", "1:30", "18:60"])("waits for a valid complete start %s", (start) => {
    expect(suggestPlannedEnd(start, 40)).toEqual({ status: "incomplete" });
  });
  it.each([undefined, 0, -1, 1.5, NaN, Infinity])(
    "does not invent an invalid duration %s",
    (duration) => {
      expect(suggestPlannedEnd("18:00", duration)).toEqual({ status: "duration_unavailable" });
    },
  );
  it.each([
    ["23:20", 40],
    ["23:59", 2],
    ["00:00", 1440],
  ])("rejects midnight and overflow", (start, duration) => {
    expect(suggestPlannedEnd(start as string, duration as number)).toEqual({ status: "next_day" });
  });
  it("requires a valid ordered interval in the same day", () => {
    expect(isValidPlannedInterval("18:00", "18:40")).toBe(true);
    for (const end of ["", "17:59", "18:00", "24:00", "00:40"])
      expect(isValidPlannedInterval("18:00", end)).toBe(false);
  });
});
