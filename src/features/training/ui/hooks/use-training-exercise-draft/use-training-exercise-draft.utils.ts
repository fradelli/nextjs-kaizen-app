import { hasPerformedTrainingSetMeasures } from "@/features/training/domain/training-set-execution.rules";
import type { NormalizedTrainingDose } from "@/features/training/domain/training-day.types";
import type { TrainingDayExerciseDto } from "@/features/training/application/training-dto";

import type { TrainingSetDraft } from "./use-training-exercise-draft.types";

export function createTrainingSetDrafts(
  exercise: TrainingDayExerciseDto,
): readonly TrainingSetDraft[] {
  return exercise.sets.map((set) => ({
    setNumber: set.setNumber,
    kind: set.kind ?? "work",
    confirmed: set.confirmed === undefined ? set.status === "completed" : set.confirmed,
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
  return hasPerformedTrainingSetMeasures(set, dose);
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
      kind: set.kind ?? "work",
      confirmed: set.confirmed,
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

export { requiredDirections } from "@/features/training/domain/training-set-execution.rules";

function displayValue(value: number | null): string {
  return value === null || value === 0 ? "" : String(value);
}

function integerOrZero(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0;
}

function nullableInteger(value: string): number | null {
  return value.trim() === "" ? null : integerOrZero(value);
}
