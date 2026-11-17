import { describe, expect, it } from "vitest";
import { formatTrainingExerciseBlockLabel } from "./format-training-exercise-block-label";

describe("training exercise block labels", () => {
  it("distinguishes the first and second exercises in an alternating block", () => {
    const block = { id: "paired-block", mode: "alternating" as const, ordinal: 2 };
    expect(formatTrainingExerciseBlockLabel({ ...block, position: 1 })).toBe("Bloco 2A");
    expect(formatTrainingExerciseBlockLabel({ ...block, position: 2 })).toBe("Bloco 2B");
  });

  it("omits the paired label for individual exercises and missing legacy blocks", () => {
    expect(formatTrainingExerciseBlockLabel(null)).toBeNull();
    expect(formatTrainingExerciseBlockLabel(undefined)).toBeNull();
    expect(
      formatTrainingExerciseBlockLabel({
        id: "individual",
        mode: "single",
        ordinal: 1,
        position: 1,
      }),
    ).toBeNull();
  });
});
