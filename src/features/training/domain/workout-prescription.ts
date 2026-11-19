export type PrescriptionMeasure = Readonly<{
  key: string;
  unit: "repetitions" | "seconds" | "contacts";
  target: number;
}>;

export type PrescriptionContract = Readonly<{
  measures: readonly Readonly<{ key: string; unit: PrescriptionMeasure["unit"] }>[];
  loadApplicable: boolean;
}>;

export type PrescribedStage = Readonly<{
  id: string;
  targets: readonly PrescriptionMeasure[];
  loadKg: string | null;
}>;

export type PrescribedSet = Readonly<{
  id: string;
  kind: "warmup" | "work" | "drop";
  restSeconds: number;
  stages: readonly PrescribedStage[];
}>;

export type PrescriptionIssue = Readonly<{
  itemId: string;
  field: string;
  code: "required" | "invalid" | "duplicate" | "not_applicable";
}>;

/** A blank target load is allowed. Actual completion has its own validation. */
export function validatePrescribedSets(
  contract: PrescriptionContract,
  sets: readonly PrescribedSet[],
): PrescriptionIssue[] {
  const issues: PrescriptionIssue[] = [];
  const identities = new Set<string>();
  function identify(id: string) {
    if (!id || identities.has(id)) {
      issues.push({ itemId: id, field: "id", code: id ? "duplicate" : "required" });
    }
    identities.add(id);
  }
  for (const set of sets) {
    identify(set.id);
    if (!Number.isSafeInteger(set.restSeconds) || set.restSeconds < 0) {
      issues.push({ itemId: set.id, field: "restSeconds", code: "invalid" });
    }
    if (set.stages.length === 0 || (set.kind !== "drop" && set.stages.length !== 1)) {
      issues.push({ itemId: set.id, field: "stages", code: "invalid" });
    }
    for (const stage of set.stages) {
      identify(stage.id);
      const keys = new Set<string>();
      for (const target of stage.targets) {
        const expected = contract.measures.find((measure) => measure.key === target.key);
        if (keys.has(target.key)) {
          issues.push({ itemId: stage.id, field: target.key, code: "duplicate" });
        }
        keys.add(target.key);
        if (
          !expected ||
          target.unit !== expected.unit ||
          !Number.isSafeInteger(target.target) ||
          target.target <= 0
        ) {
          issues.push({ itemId: stage.id, field: target.key, code: "invalid" });
        }
      }
      for (const measure of contract.measures) {
        if (!keys.has(measure.key)) {
          issues.push({ itemId: stage.id, field: measure.key, code: "required" });
        }
      }
      if (!contract.loadApplicable && stage.loadKg !== null) {
        issues.push({ itemId: stage.id, field: "loadKg", code: "not_applicable" });
      }
      if (stage.loadKg !== null && !/^\d{1,7}(\.\d{1,3})?$/.test(stage.loadKg)) {
        issues.push({ itemId: stage.id, field: "loadKg", code: "invalid" });
      }
    }
  }
  return issues;
}
