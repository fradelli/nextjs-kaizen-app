import { describe, expect, it } from "vitest";
import {
  parseCivilDate,
  parseDirectionValues,
  parseNormalizedTrainingDose,
  readStringArrayProperty,
  readNullableStringProperty,
  parseStringArray,
} from "./training-day.rules";

describe("training day rules", () => {
  it("accepts an existing ISO civil date", () => {
    expect(parseCivilDate("2026-09-15")).toBe("2026-09-15");
  });

  it.each(["15/09/2026", "2026-02-29", "2026-13-01"])("rejects invalid civil date %s", (value) => {
    expect(() => parseCivilDate(value)).toThrowError(
      expect.objectContaining({ code: "TRAINING_CIVIL_DATE_INVALID" }),
    );
  });

  it("maps the persisted normalized dose without inferring values", () => {
    expect(
      parseNormalizedTrainingDose({
        source_text: "4-6",
        minimum: 4,
        maximum: 6,
        unit: "repetitions",
        scope: "total",
        qualifier: null,
      }),
    ).toEqual({
      sourceText: "4-6",
      minimum: 4,
      maximum: 6,
      unit: "repetitions",
      scope: "total",
      qualifier: null,
    });
  });

  it("rejects malformed definition fields", () => {
    expect(() => readStringArrayProperty({ how_to: ["ok", 1] }, "how_to")).toThrowError(
      expect.objectContaining({ code: "TRAINING_DEFINITION_INVALID" }),
    );
    expect(() => parseDirectionValues({ front: "3" })).toThrowError(
      expect.objectContaining({ code: "TRAINING_DEFINITION_INVALID" }),
    );
  });
});

describe("persisted training definition boundaries", () => {
  const definitionError = expect.objectContaining({ code: "TRAINING_DEFINITION_INVALID" });
  const dose = {
    source_text: "4-6",
    minimum: 4,
    maximum: 6,
    unit: "repetitions",
    scope: "total",
    qualifier: null,
  };

  it.each([null, undefined, [], "invalid", 1])("rejects missing dose records %j", (value) => {
    expect(() => parseNormalizedTrainingDose(value)).toThrowError(definitionError);
  });

  it.each([
    { source_text: null },
    { minimum: "4" },
    { minimum: NaN },
    { maximum: null },
    { maximum: Infinity },
    { minimum: 7 },
    { unit: null },
    { scope: null },
    { qualifier: 1 },
  ])("rejects malformed persisted doses %j", (fields) => {
    expect(() => parseNormalizedTrainingDose({ ...dose, ...fields })).toThrowError(definitionError);
  });

  it("preserves an optional qualifier and freezes parsed definitions", () => {
    const parsed = parseNormalizedTrainingDose({ ...dose, qualifier: "per side" });
    expect(parsed.qualifier).toBe("per side");
    expect(Object.isFrozen(parsed)).toBe(true);
  });

  it.each([null, [], "invalid"])("rejects non-record exercise fields %j", (value) => {
    expect(() => readStringArrayProperty(value, "tips")).toThrowError(definitionError);
    expect(() => readNullableStringProperty(value, "note")).toThrowError(definitionError);
  });

  it("preserves absent, null and empty optional text distinctly", () => {
    expect(readNullableStringProperty({}, "note")).toBeNull();
    expect(readNullableStringProperty({ note: null }, "note")).toBeNull();
    expect(readNullableStringProperty({ note: "" }, "note")).toBe("");
    expect(readNullableStringProperty({ note: "tip" }, "note")).toBe("tip");
    expect(() => readNullableStringProperty({ note: 1 }, "note")).toThrowError(definitionError);
  });

  it.each([null, undefined, "tip", [1]])("rejects malformed text lists %j", (value) => {
    expect(() => parseStringArray(value, "tips")).toThrowError(definitionError);
    expect(() => readStringArrayProperty({ tips: value }, "tips")).toThrowError(definitionError);
  });

  it("copies and freezes text lists instead of sharing mutable persisted arrays", () => {
    const values = ["first"];
    const parsed = parseStringArray(values, "tips");
    const property = readStringArrayProperty({ tips: values }, "tips");
    values.push("second");
    expect(parsed).toEqual(["first"]);
    expect(property).toEqual(["first"]);
    expect(Object.isFrozen(parsed)).toBe(true);
    expect(Object.isFrozen(property)).toBe(true);
  });

  it.each([null, undefined])("accepts absent directional measurements %j", (value) => {
    expect(parseDirectionValues(value)).toBeNull();
  });

  it.each([[], 1, "invalid", { front: NaN }, { front: Infinity }])(
    "rejects malformed directional measurements %j",
    (value) => {
      expect(() => parseDirectionValues(value)).toThrowError(definitionError);
    },
  );

  it("preserves zero directional measurements and freezes the result", () => {
    const values = { front: 0, back: 2 };
    const parsed = parseDirectionValues(values);
    values.front = 9;
    expect(parsed).toEqual({ front: 0, back: 2 });
    expect(Object.isFrozen(parsed)).toBe(true);
  });
});
