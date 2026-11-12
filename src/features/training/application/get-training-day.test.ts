import { describe, expect, it, vi } from "vitest";
import type {
  TrainingAssignmentSnapshot,
  TrainingDaySnapshot,
  TrainingActivitySnapshot,
  TrainingPlanSnapshot,
} from "../domain/training-day.types";
import { getTrainingDay } from "./get-training-day";
import type { TrainingRepository } from "./training-repository";
import { trainingPlanFixture } from "./get-public-training-plan.test";

describe("getTrainingDay", () => {
  it("consulta o dia sem materializar a programação", async () => {
    const repository = repositoryWith(async () => ({
      activePlan: null,
      assignment: null,
      activities: [],
    }));
    const materialize = vi.spyOn(repository, "ensureScheduledTrainingDay");
    await getTrainingDay(
      {
        repository,
        environment: "local",
        resolveWorkspace: () => ({ workspaceId: "workspace-server" }),
      },
      { civilDate: "2026-11-10" },
    );
    expect(materialize).not.toHaveBeenCalled();
  });
  it.each(["pending", "completed", "skipped"] as const)(
    "preserves the exercise toggle state %s independently of set measurements",
    async (itemStatus) => {
      const plan = trainingPlanFixture();
      const assignment = trainingAssignmentFixture(plan);
      const execution = assignment.execution!;
      const recorded = execution.exercises[0]!;
      const result = await getTrainingDay(
        dependencies({
          activePlan: plan,
          assignment: {
            ...assignment,
            execution: {
              ...execution,
              exercises: [
                {
                  ...recorded,
                  itemStatus,
                  sets: [1, 2].map((setNumber) => ({ ...recorded.sets[0]!, setNumber })),
                },
              ],
            },
          },
        }),
        { civilDate: "2026-09-16" },
      );
      expect(result.state).toBe("training");
      if (result.state !== "training") throw new Error("Expected a training day");
      expect(result.main.exercises[0]?.status).toBe(itemStatus);
    },
  );
  it("resolves the workspace on the server and returns choices for an unassigned day", async () => {
    const plan = trainingPlanFixture();
    const findTrainingDay = vi.fn(async (): Promise<TrainingDaySnapshot> => ({
      activePlan: plan,
      assignment: null,
      activities: [],
    }));

    const result = await getTrainingDay(
      {
        repository: repositoryWith(findTrainingDay),
        environment: "local",
        resolveWorkspace: () => ({ workspaceId: "workspace-server" }),
      },
      { civilDate: "2026-09-16" },
    );

    expect(findTrainingDay).toHaveBeenCalledWith({
      workspaceId: "workspace-server",
      civilDate: "2026-09-16",
      environment: "local",
    });
    expect(result).toMatchObject({
      state: "unassigned",
      assignmentId: null,
      availablePlan: { planId: "plan-v1" },
    });
  });

  it("uses the assigned historical plan and overlays partial execution", async () => {
    const activePlan = { ...trainingPlanFixture(), databaseId: "plan-db-v2", version: "2" };
    const assignment = trainingAssignmentFixture(trainingPlanFixture());

    const result = await getTrainingDay(dependencies({ activePlan, assignment }), {
      civilDate: "2026-09-16",
    });

    expect(result).toMatchObject({
      state: "training",
      planVersion: "1",
      main: {
        exercises: [
          {
            executionId: "exercise-execution",
            status: "pending",
            sets: [
              { setNumber: 1, status: "completed", value: 5, loadKg: "20" },
              { setNumber: 2, status: "pending", value: null, loadKg: null },
            ],
          },
        ],
      },
    });
  });

  it("returns rest without requiring an active plan", async () => {
    const result = await getTrainingDay(
      dependencies({
        activePlan: null,
        assignment: {
          ...trainingAssignmentFixture(null),
          kind: "rest",
          mainSessionDatabaseId: null,
          reason: "Recuperação",
          execution: null,
        },
      }),
      { civilDate: "2026-09-16" },
    );

    expect(result).toEqual({
      state: "rest",
      civilDate: "2026-09-16",
      assignmentId: "assignment",
      assignmentRevision: 3,
      availablePlan: null,
      reason: "Recuperação",
      execution: null,
      activities: [],
    });
  });

  it("projects extra activity times and duration for the selected civil day", async () => {
    const activity: TrainingActivitySnapshot = {
      id: "activity-1",
      type: "sport_practice",
      source: "manual",
      role: "primary",
      name: "Jogo de futevôlei",
      sport: "Futevôlei",
      status: "completed",
      plannedStartMinute: 1080,
      plannedEndMinute: 1200,
      actualStartMinute: 1100,
      actualEndMinute: 1220,
      startedAt: "2026-09-16T21:20:00.000Z",
      completedAt: "2026-09-16T23:20:00.000Z",
      intensity: "high",
      energy: "energized",
      comment: null,
      revision: 0,
      plan: null,
      session: null,
      preparationSession: null,
      exerciseExecutions: [],
      intervals: [],
      preparations: [],
    };
    const result = await getTrainingDay(
      dependencies({
        activePlan: trainingPlanFixture(),
        assignment: null,
        activities: [activity],
      }),
      { civilDate: "2026-09-16" },
    );

    expect(result.activities).toEqual([
      {
        id: "activity-1",
        type: "sport_practice",
        source: "manual",
        role: "primary",
        name: "Jogo de futevôlei",
        sport: "Futevôlei",
        status: "completed",
        plannedStartTime: "18:00",
        plannedEndTime: "20:00",
        plannedDurationMinutes: 120,
        actualStartTime: "18:20",
        actualEndTime: "20:20",
        actualDurationMinutes: 120,
        startedAt: "2026-09-16T21:20:00.000Z",
        completedAt: "2026-09-16T23:20:00.000Z",
        accumulatedActiveSeconds: 0,
        currentIntervalStartedAt: null,
        intervals: [],
        intensity: "high",
        energy: "energized",
        comment: null,
        revision: 0,
        structured: null,
        preparations: [],
      },
    ]);

    const unknownSchedule = await getTrainingDay(
      dependencies({
        activePlan: trainingPlanFixture(),
        assignment: null,
        activities: [{ ...activity, plannedStartMinute: null, plannedEndMinute: null }],
      }),
      { civilDate: "2026-09-16" },
    );
    expect(unknownSchedule.activities[0]).toMatchObject({
      plannedStartTime: null,
      plannedEndTime: null,
      plannedDurationMinutes: null,
      actualStartTime: "18:20",
      actualEndTime: "20:20",
    });

    const startOnlySchedule = await getTrainingDay(
      dependencies({
        activePlan: trainingPlanFixture(),
        assignment: null,
        activities: [{ ...activity, plannedEndMinute: null }],
      }),
      { civilDate: "2026-09-16" },
    );
    expect(startOnlySchedule.activities[0]).toMatchObject({
      plannedStartTime: "18:00",
      plannedEndTime: null,
      plannedDurationMinutes: null,
    });
  });

  it("rejects an execution bound to an incompatible role", async () => {
    const assignment = trainingAssignmentFixture(trainingPlanFixture());
    const incompatibleAssignment: TrainingAssignmentSnapshot = {
      ...assignment,
      execution: assignment.execution
        ? {
            ...assignment.execution,
            exercises: assignment.execution.exercises.map((exercise) => ({
              ...exercise,
              role: "mobility",
            })),
          }
        : null,
    };

    await expect(
      getTrainingDay(
        dependencies({ activePlan: trainingPlanFixture(), assignment: incompatibleAssignment }),
        {
          civilDate: "2026-09-16",
        },
      ),
    ).rejects.toMatchObject({ code: "TRAINING_REFERENCE_INVALID" });
  });

  it("rejects an invalid date before reading the repository", async () => {
    const findTrainingDay = vi.fn();

    await expect(
      getTrainingDay(
        {
          repository: repositoryWith(findTrainingDay),
          environment: "local",
          resolveWorkspace: () => ({ workspaceId: "workspace-server" }),
        },
        { civilDate: "2026-02-29" },
      ),
    ).rejects.toMatchObject({ code: "TRAINING_CIVIL_DATE_INVALID" });
    expect(findTrainingDay).not.toHaveBeenCalled();
  });
});

function dependencies(
  snapshot: Omit<TrainingDaySnapshot, "activities"> &
    Partial<Pick<TrainingDaySnapshot, "activities">>,
) {
  return {
    repository: repositoryWith(async () => ({
      ...snapshot,
      activities: snapshot.activities ?? [],
    })),
    environment: "local" as const,
    resolveWorkspace: () => ({ workspaceId: "workspace-server" }),
  };
}

function repositoryWith(
  findTrainingDay: TrainingRepository["findTrainingDay"],
): TrainingRepository {
  return {
    findActiveTrainingPlan: async () => null,
    ensureScheduledTrainingDay: async () => {},
    findTrainingDay,
  };
}

function trainingAssignmentFixture(plan: TrainingPlanSnapshot | null): TrainingAssignmentSnapshot {
  return {
    id: "assignment",
    civilDate: "2026-09-16" as TrainingAssignmentSnapshot["civilDate"],
    kind: "training",
    mainSessionDatabaseId: plan?.sessions[0]?.databaseId ?? null,
    preparationSessionDatabaseId: null,
    plannedStartMinute: 540,
    plannedEndMinute: 605,
    reason: null,
    revision: 3,
    plan,
    execution: plan
      ? {
          id: "execution",
          status: "in_progress",
          comment: null,
          intensity: null,
          energy: null,
          actualStartMinute: null,
          actualEndMinute: null,
          startedAt: "2026-09-16T10:00:00.000Z",
          completedAt: null,
          revision: 2,
          exercises: [
            {
              id: "exercise-execution",
              prescriptionId: "prescription-squat",
              sessionDatabaseId: "session-db-a",
              role: "main",
              itemStatus: "pending",
              comment: null,
              revision: 1,
              sets: [
                {
                  setNumber: 1,
                  status: "completed",
                  value: 5,
                  leftValue: null,
                  rightValue: null,
                  directionValues: null,
                  loadKg: "20",
                  revision: 1,
                },
              ],
            },
          ],
        }
      : null,
  };
}
