import { describe, expect, it } from "vitest";
import {
  isTrainingAgendaDateEditable,
  isTrainingExecutionDateEditable,
} from "./training-edit-window";

describe("training edit window", () => {
  it("allows agenda changes on any valid civil date", () => {
    expect(isTrainingAgendaDateEditable("2026-09-25")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-09-26")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-09-27")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-09-30")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-09-24")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-10-01")).toBe(true);
  });

  it("allows execution only today and yesterday", () => {
    const now = new Date("2026-09-26T15:00:00Z");
    expect(isTrainingExecutionDateEditable("2026-09-26", now)).toBe(true);
    expect(isTrainingExecutionDateEditable("2026-09-25", now)).toBe(true);
    expect(isTrainingExecutionDateEditable("2026-09-24", now)).toBe(false);
    expect(isTrainingExecutionDateEditable("2026-09-27", now)).toBe(false);
  });
  it("uses São Paulo dates at the UTC midnight boundary", () => {
    const now = new Date("2026-10-01T01:00:00Z");
    expect(isTrainingExecutionDateEditable("2026-09-30", now)).toBe(true);
    expect(isTrainingExecutionDateEditable("2026-09-29", now)).toBe(true);
    expect(isTrainingExecutionDateEditable("2026-10-01", now)).toBe(false);
    expect(isTrainingAgendaDateEditable("2026-10-04")).toBe(true);
    expect(isTrainingAgendaDateEditable("2026-10-05")).toBe(true);
  });

  it.each(["invalid", "2026-02-29"])("rejects invalid civil date %s", (civilDate) => {
    const now = new Date("2026-02-26T15:00:00Z");
    expect(isTrainingAgendaDateEditable(civilDate)).toBe(false);
    expect(isTrainingExecutionDateEditable(civilDate, now)).toBe(false);
  });
});
