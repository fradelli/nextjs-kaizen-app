import { describe, expect, it } from "vitest";
import {
  validatePrescribedSets,
  type PrescriptionContract,
  type PrescribedSet,
} from "./workout-prescription";

const contract: PrescriptionContract = {
  loadApplicable: true,
  measures: [
    { key: "left", unit: "repetitions" },
    { key: "right", unit: "repetitions" },
  ],
};
const set: PrescribedSet = {
  id: "set",
  kind: "work",
  restSeconds: 90,
  stages: [
    {
      id: "stage",
      loadKg: "0",
      targets: [
        { key: "left", unit: "repetitions", target: 8 },
        { key: "right", unit: "repetitions", target: 10 },
      ],
    },
  ],
};

describe("prescrição individual de séries", () => {
  it("aceita carga zero e doses assimétricas por lado", () => {
    expect(validatePrescribedSets(contract, [set])).toEqual([]);
  });
  it("permite carga alvo em aberto e exige o outro lado", () => {
    const stage = { ...set.stages[0], loadKg: null, targets: set.stages[0].targets.slice(0, 1) };
    expect(validatePrescribedSets(contract, [{ ...set, stages: [stage] }])).toEqual([
      { itemId: "stage", field: "right", code: "required" },
    ]);
  });
  it("rejeita carga informada para movimento sem carga aplicável", () => {
    expect(validatePrescribedSets({ ...contract, loadApplicable: false }, [set])).toEqual([
      { itemId: "stage", field: "loadKg", code: "not_applicable" },
    ]);
  });
  it("aceita etapas do drop e rejeita múltiplas etapas numa série comum", () => {
    const stages = [...set.stages, { ...set.stages[0], id: "reduction", loadKg: "5.125" }];
    expect(validatePrescribedSets(contract, [{ ...set, kind: "drop", stages }])).toEqual([]);
    expect(validatePrescribedSets(contract, [{ ...set, stages }])).toContainEqual({
      itemId: "set",
      field: "stages",
      code: "invalid",
    });
  });
  it("rejeita IDs duplicados, dose zero e descanso negativo", () => {
    const invalid = { ...set, restSeconds: -1 };
    const issues = validatePrescribedSets(contract, [invalid, invalid]);
    expect(issues).toContainEqual({ itemId: "set", field: "id", code: "duplicate" });
    expect(issues).toContainEqual({ itemId: "set", field: "restSeconds", code: "invalid" });
    const stage = {
      ...set.stages[0],
      targets: [{ key: "left", unit: "repetitions" as const, target: 0 }],
    };
    expect(validatePrescribedSets(contract, [{ ...set, stages: [stage] }])).toContainEqual({
      itemId: "stage",
      field: "left",
      code: "invalid",
    });
  });
});
