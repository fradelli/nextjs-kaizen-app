import { describe, expect, it } from "vitest";
import type { TrainingPlanSnapshot } from "../domain/training-day.types";
import { getPublicTrainingPlan } from "./get-public-training-plan";
import type { TrainingRepository } from "./training-repository";

describe("getPublicTrainingPlan", () => {
  it("returns an explicit unavailable state when there is no active plan", async () => {
    const repository = createRepository(null);

    await expect(getPublicTrainingPlan({ repository, environment: "local" })).resolves.toEqual({
      status: "unavailable",
      reason: "active_plan_not_found",
    });
  });

  it("projects only public plan definitions", async () => {
    const repository = createRepository(trainingPlanFixture());

    await expect(getPublicTrainingPlan({ repository, environment: "local" })).resolves.toEqual({
      status: "available",
      planId: "plan-v1",
      version: "1",
      sourceStatus: "active",
      preparationSuggestions: [],
      sessions: [
        expect.objectContaining({
          sessionId: "session-a",
          exercises: [
            expect.objectContaining({
              exerciseId: "squat",
              prescribedSets: 2,
              loadApplicable: true,
            }),
          ],
        }),
      ],
    });
  });
});

function createRepository(activePlan: TrainingPlanSnapshot | null): TrainingRepository {
  return {
    findActiveTrainingPlan: async () => activePlan,
    ensureScheduledTrainingDay: async () => {},
    findTrainingDay: async () => ({ activePlan, assignment: null, activities: [] }),
  };
}

export function trainingPlanFixture(): TrainingPlanSnapshot {
  return {
    databaseId: "plan-db-v1",
    planId: "plan-v1",
    version: "1",
    sourceStatus: "active",
    sessions: [
      {
        databaseId: "session-db-a",
        sessionId: "session-a",
        name: "Sessão A",
        targetDurationMinutes: 40,
        shortDurationMinutes: null,
        intensity: "moderate",
        notes: null,
        assignmentRole: "main",
        compatiblePreparationSessionIds: [],
        exercises: [
          {
            prescriptionId: "prescription-squat",
            ordinal: 1,
            sets: 2,
            prescribedText: "4-6",
            restSeconds: 90,
            priority: null,
            notes: null,
            dose: {
              sourceText: "4-6",
              minimum: 4,
              maximum: 6,
              unit: "repetitions",
              scope: "total",
              qualifier: null,
            },
            exercise: {
              exerciseId: "squat",
              name: "Agachamento",
              measurementType: "repetitions",
              loadApplicable: true,
              loadUnit: "kg",
              instructions: ["Agache com controle."],
              cues: ["Pés firmes."],
              risks: null,
            },
          },
        ],
      },
    ],
  };
}
