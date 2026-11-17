import type { TrainingExerciseHistory, NormalizedTrainingDose } from "./training-day.types";

type SetMeasures = Readonly<{
  kind?: "work" | "warmup";
  value: string | number | null;
  leftValue: string | number | null;
  rightValue: string | number | null;
  loadKg?: string | number | null;
  directionValues?: Readonly<Record<string, string | number>> | null;
}>;

export function trainingSetVolumeKg(
  set: SetMeasures,
  dose: NormalizedTrainingDose,
  loadApplicable: boolean,
): number {
  if (
    set.kind === "warmup" ||
    !loadApplicable ||
    dose.unit !== "repetitions" ||
    !hasPerformedTrainingSetMeasures(set, dose, loadApplicable)
  )
    return 0;
  const repetitions =
    dose.scope === "each_side" ? Number(set.leftValue) + Number(set.rightValue) : Number(set.value);
  return Number(String(set.loadKg).replace(",", ".")) * repetitions;
}

export function hasPerformedTrainingSetMeasures(
  set: SetMeasures,
  dose: NormalizedTrainingDose,
  loadApplicable = false,
): boolean {
  if (
    loadApplicable &&
    (set.loadKg === null ||
      set.loadKg === undefined ||
      !/^\d+(?:[.,]\d{1,3})?$/.test(String(set.loadKg)) ||
      !Number.isFinite(Number(String(set.loadKg).replace(",", "."))) ||
      Number(String(set.loadKg).replace(",", ".")) < 0)
  )
    return false;
  const positive = (value: string | number | null | undefined) =>
    value !== null && value !== undefined && Number.isInteger(Number(value)) && Number(value) > 0;
  if (dose.scope === "total") return positive(set.value);
  if (dose.scope === "each_side") return positive(set.leftValue) && positive(set.rightValue);
  const directions = requiredDirections(dose.scope);
  return (
    directions.length > 0 &&
    directions.every((direction) => positive(set.directionValues?.[direction]))
  );
}

export function previousTrainingSet(
  history: readonly TrainingExerciseHistory[],
  kind: "work" | "warmup",
  ordinal: number,
) {
  const session = history.find((item) => item.sets.some((set) => (set.kind ?? "work") === kind));
  const set = session?.sets.filter((set) => (set.kind ?? "work") === kind)[ordinal - 1];
  return session && set?.status === "completed" ? { date: session.date, set } : null;
}

export function requiredDirections(
  scope: string,
): readonly ("forward" | "backward" | "flexion" | "extension" | "left" | "right")[] {
  if (scope === "two_directions") return ["forward", "backward"];
  if (scope === "four_directions") return ["flexion", "extension", "left", "right"];
  return [];
}
