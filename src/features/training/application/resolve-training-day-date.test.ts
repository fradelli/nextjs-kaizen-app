import { describe, expect, it } from "vitest";

import { resolveTrainingDayDate } from "./resolve-training-day-date";

const saoPauloMorning = new Date("2026-09-16T12:00:00.000Z");

describe("resolveTrainingDayDate", () => {
  it("resolves the current civil date in America/Sao_Paulo and requests a canonical URL", () => {
    expect(resolveTrainingDayDate({ rawDate: undefined, now: saoPauloMorning })).toEqual({
      status: "valid",
      civilDate: "2026-09-16",
      previousDate: "2026-09-15",
      nextDate: "2026-09-17",
      canNavigateNext: true,
      maximumFutureDate: "2026-09-20",
      todayDate: "2026-09-16",
      isToday: true,
      requiresCanonicalRedirect: true,
    });
  });

  it("uses Sao Paulo rather than UTC near midnight", () => {
    const resolution = resolveTrainingDayDate({
      rawDate: undefined,
      now: new Date("2026-09-17T01:30:00.000Z"),
    });

    expect(resolution.status === "valid" && resolution.civilDate).toBe("2026-09-16");
  });

  it("crosses month, year and leap-day boundaries with civil arithmetic", () => {
    expect(
      resolveTrainingDayDate({ rawDate: "2028-02-29", now: new Date("2028-02-28T12:00:00Z") }),
    ).toMatchObject({
      status: "valid",
      previousDate: "2028-02-28",
      nextDate: "2028-03-01",
    });
    expect(
      resolveTrainingDayDate({ rawDate: "2026-12-31", now: new Date("2026-12-30T12:00:00Z") }),
    ).toMatchObject({
      status: "valid",
      previousDate: "2026-12-30",
      nextDate: "2027-01-01",
    });
  });

  it("permite consultar os dias futuros além da janela de edição", () => {
    expect(resolveTrainingDayDate({ rawDate: "2026-09-20", now: saoPauloMorning })).toMatchObject({
      status: "valid",
      canNavigateNext: true,
      maximumFutureDate: "2026-09-20",
    });
    expect(resolveTrainingDayDate({ rawDate: "2026-09-21", now: saoPauloMorning })).toMatchObject({
      status: "valid",
      civilDate: "2026-09-21",
      canNavigateNext: true,
    });
  });

  it("rejects an impossible civil date without normalizing it", () => {
    expect(resolveTrainingDayDate({ rawDate: "2026-02-29", now: saoPauloMorning })).toEqual({
      status: "invalid",
      reason: "invalid_date",
      todayDate: "2026-09-16",
    });
  });

  it("rejects repeated date parameters", () => {
    expect(
      resolveTrainingDayDate({
        rawDate: ["2026-09-15", "2026-09-16"],
        now: saoPauloMorning,
      }),
    ).toEqual({
      status: "invalid",
      reason: "repeated_date",
      todayDate: "2026-09-16",
    });
  });
});
