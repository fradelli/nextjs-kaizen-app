import { describe, it, expect } from "vitest";
import {
  previousTrainingSet,
  hasPerformedTrainingSetMeasures,
} from "./training-set-execution.rules";
const set = { value: "8", leftValue: "8", rightValue: "", directionValues: {} };
const dose = {
  sourceText: "12",
  minimum: 12,
  maximum: 12,
  unit: "repetitions",
  scope: "total",
  qualifier: null,
};
describe("performed set measures", () => {
  it("records less than prescription without inventing fulfillment", () =>
    expect(hasPerformedTrainingSetMeasures(set, dose)).toBe(true));
  it("requires both sides", () =>
    expect(hasPerformedTrainingSetMeasures(set, { ...dose, scope: "each_side" })).toBe(false));
  it("rejects blank zero fractional and nonfinite measures", () => {
    for (const value of ["", "0", "1.5", "Infinity", "-2"])
      expect(hasPerformedTrainingSetMeasures({ ...set, value }, dose)).toBe(false);
  });
  it("requires all prescribed directions", () => {
    expect(
      hasPerformedTrainingSetMeasures(
        { ...set, directionValues: { forward: 2, backward: 0 } },
        { ...dose, scope: "two_directions" },
      ),
    ).toBe(false);
  });
});

it("uses separate sessions by type without shifting work ordinals or filling historical gaps", () => {
  const set = {
    setNumber: 1,
    kind: "work" as const,
    confirmed: true,
    status: "completed" as const,
    value: 8,
    leftValue: null,
    rightValue: null,
    directionValues: null,
    loadKg: "40",
    revision: 0,
  };
  const history = [
    {
      date: "2026-10-27",
      exerciseId: "bench",
      unit: "repetitions",
      scope: "total",
      loadApplicable: true,
      sets: [set],
    },
    {
      date: "2026-10-22",
      exerciseId: "bench",
      unit: "repetitions",
      scope: "total",
      loadApplicable: true,
      sets: [
        { ...set, kind: "warmup" as const, loadKg: "20" },
        { ...set, kind: "warmup" as const, setNumber: 2, loadKg: "30" },
        { ...set, setNumber: 3 },
      ],
    },
  ];
  expect(previousTrainingSet(history, "work", 1)?.date).toBe("2026-10-27");
  expect(previousTrainingSet(history, "warmup", 2)?.set.loadKg).toBe("30");
  expect(previousTrainingSet(history, "work", 2)).toBeNull();
});
