import type { TrainingExerciseHistory, NormalizedTrainingDose } from "./training-day.types";

type SetMeasures = Readonly<{
  value: string | number | null;
  leftValue: string | number | null;
  rightValue: string | number | null;
  directionValues?: Readonly<Record<string, string | number>> | null;
}>;

export function hasPerformedTrainingSetMeasures(
  set: SetMeasures,
  dose: NormalizedTrainingDose,
): boolean {
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
