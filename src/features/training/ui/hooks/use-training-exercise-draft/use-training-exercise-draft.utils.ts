import type { NormalizedTrainingDose } from "@/features/training/domain/training-day.types";
import type { TrainingDayExerciseDto } from "@/features/training/application/training-dto";

import type { TrainingSetDraft } from "./use-training-exercise-draft.types";

export function createTrainingSetDrafts(
  exercise: TrainingDayExerciseDto,
): readonly TrainingSetDraft[] {
  return exercise.sets.map((set) => ({
    setNumber: set.setNumber,
    value: displayValue(set.value),
    leftValue: displayValue(set.leftValue),
    rightValue: displayValue(set.rightValue),
    directionValues: Object.fromEntries(
      Object.entries(set.directionValues ?? {}).map(([direction, value]) => [
        direction,
        displayValue(value),
      ]),
    ),
    loadKg: set.loadKg ?? "",
  }));
}

export function isTrainingSetPerformed(
  set: TrainingSetDraft,
  dose: NormalizedTrainingDose,
): boolean {
  if (dose.scope === "total") return positive(set.value);
  if (dose.scope === "each_side") return positive(set.leftValue) && positive(set.rightValue);

  const directions = requiredDirections(dose.scope);
  return (
    directions.length > 0 &&
    directions.every((direction) => positive(set.directionValues[direction] ?? ""))
  );
}

export function hasTrainingSetData(set: TrainingSetDraft): boolean {
  return [
    set.value,
    set.leftValue,
    set.rightValue,
    set.loadKg,
    ...Object.values(set.directionValues),
  ].some((value) => value.trim() !== "" && Number(value) !== 0);
}

export function serializeTrainingSetDrafts(drafts: readonly TrainingSetDraft[]): string {
  return JSON.stringify(
    drafts.map((set) => ({
      setNumber: set.setNumber,
      value: integerOrZero(set.value),
      leftValue: nullableInteger(set.leftValue),
      rightValue: nullableInteger(set.rightValue),
      directionValues: Object.fromEntries(
        Object.entries(set.directionValues).map(([direction, value]) => [
          direction,
          integerOrZero(value),
        ]),
      ),
      loadKg: set.loadKg.trim() || null,
    })),
  );
}

export function requiredDirections(
  scope: string,
): readonly ("forward" | "backward" | "flexion" | "extension" | "left" | "right")[] {
  if (scope === "two_directions") return ["forward", "backward"];
  if (scope === "four_directions") return ["flexion", "extension", "left", "right"];
  return [];
}

function displayValue(value: number | null): string {
  return value === null || value === 0 ? "" : String(value);
}

function positive(value: string): boolean {
  return Number(value) > 0;
}

function integerOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function nullableInteger(value: string): number | null {
  return value.trim() === "" ? null : integerOrZero(value);
}
