import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import { PrismaTrainingRepository } from "@/features/training/data/prisma-training-repository";
import { ensureScheduledTrainingDay } from "@/features/training/data/ensure-scheduled-training-day";
import type { CivilDate } from "@/features/training/domain/training-day.types";
import { createDatabaseFixture } from "./fixtures/database.fixture";
import { withImportDatabase } from "./fixtures/import-database.fixture";

describe("training mutations with PostgreSQL", () => {
  it.each(["same-minute", "midnight"])("preserves real timestamps across %s clock labels", (kind) =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const activity = await client.trainingDayActivity.create({
        data: {
          workspaceId: fixture.workspace.id,
          civilDate: fixture.date,
          type: "mobility",
          name: "Short execution",
        },
      });
      const base = new Date(Date.now() - 86_400_000);
      base.setUTCHours(3, 0, 0, 0);
      const start = kind === "midnight" ? base.getTime() - 1000 : base.getTime() + 10_000;
      const end = start + 1000;
      const repository = new PrismaTrainingRepository(client);
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate: "2026-09-13" as CivilDate,
          activityId: activity.id,
          action: "complete",
          intensity: null,
          energy: null,
          comment: null,
          expectedRevision: 0,
          completionRequestedAt: new Date(end).toISOString(),
          executionDraft: {
            version: 1,
            activityId: activity.id,
            civilDate: "2026-09-13",
            expectedRevision: 0,
            status: "paused",
            startedAt: new Date(start).toISOString(),
            intervals: [
              { startedAt: new Date(start).toISOString(), endedAt: new Date(end).toISOString() },
            ],
            exercises: {},
          },
        }),
      ).resolves.toMatchObject({ status: "saved" });
      const saved = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: activity.id },
      });
      if (kind === "midnight") {
        expect(saved.actualStartMinute).toBe(1439);
        expect(saved.actualEndMinute).toBe(0);
      } else expect(saved.actualEndMinute).toBe(saved.actualStartMinute);
      const interval = await client.trainingActivityExecutionInterval.findFirstOrThrow({
        where: { activityId: activity.id },
      });
      expect(interval.endedAt!.getTime() - interval.startedAt.getTime()).toBe(1000);
    }),
  );

  it("uses the explicit stop time without counting the modal and rejects invalid stop snapshots atomically", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      const activity = await client.trainingDayActivity.create({
        data: {
          workspaceId: fixture.workspace.id,
          civilDate: fixture.date,
          type: "mobility",
          name: "Stop fixture",
        },
      });
      const referenceTime = Date.now();
      const startedAt = new Date(referenceTime - 600_000).toISOString();
      const stoppedAt = new Date(referenceTime - 300_000).toISOString();
      const command = {
        workspaceId: fixture.workspace.id,
        civilDate: "2026-09-13" as CivilDate,
        activityId: activity.id,
        action: "complete" as const,
        intensity: null,
        energy: null,
        comment: "After stop",
        expectedRevision: 0,
        completionRequestedAt: stoppedAt,
        executionDraft: {
          version: 1 as const,
          activityId: activity.id,
          civilDate: "2026-09-13",
          expectedRevision: 0,
          status: "paused" as const,
          startedAt,
          intervals: [{ startedAt, endedAt: stoppedAt }],
          exercises: {},
        },
      };
      for (const completionRequestedAt of [
        "not-a-date",
        new Date(Date.parse(startedAt) - 1000).toISOString(),
        new Date(Date.now() + 180_000).toISOString(),
        new Date(Date.parse(stoppedAt) - 1000).toISOString(),
      ]) {
        await expect(
          repository.controlTrainingActivity({ ...command, completionRequestedAt }),
        ).resolves.toMatchObject({ status: "invalid" });
      }
      await expect(
        repository.controlTrainingActivity({
          ...command,
          executionDraft: {
            ...command.executionDraft,
            status: "in_progress",
            intervals: [{ startedAt, endedAt: null }],
          },
        }),
      ).resolves.toMatchObject({ status: "invalid" });
      await expect(
        repository.controlTrainingActivity({
          ...command,
          workspaceId: fixture.anotherWorkspace.id,
        }),
      ).resolves.toMatchObject({ status: "not_found" });
      await expect(
        repository.controlTrainingActivity({
          ...command,
          expectedRevision: 1,
          executionDraft: { ...command.executionDraft, expectedRevision: 1 },
        }),
      ).resolves.toMatchObject({ status: "conflict" });
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: activity.id },
        }),
      ).toBe(0);
      expect(
        (await client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } })).status,
      ).toBe("scheduled");
      const beforeSave = Date.now();
      await expect(repository.controlTrainingActivity(command)).resolves.toMatchObject({
        status: "saved",
        revision: 1,
      });
      const saved = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: activity.id },
      });
      const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "America/Sao_Paulo",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .format(new Date(stoppedAt))
        .split(":")
        .map(Number);
      expect(saved.actualEndMinute).toBe(parts[0]! * 60 + parts[1]!);
      expect(saved.completedAt!.getTime()).toBeGreaterThanOrEqual(beforeSave);
      expect(saved.completedAt!.getTime()).toBeGreaterThan(Date.parse(stoppedAt));
      const interval = await client.trainingActivityExecutionInterval.findFirstOrThrow({
        where: { activityId: activity.id },
      });
      expect(interval.endedAt!.getTime() - interval.startedAt.getTime()).toBe(300_000);
      expect(saved.intensity).toBeNull();
      expect(saved.energy).toBeNull();
    }));

  it("preserves the historical session when updating hours after a new plan activation", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      await client.trainingSessionDefinition.create({
        data: {
          trainingPlanVersionId: fixture.otherTrainingPlan.id,
          sessionId: fixture.mainSession.sessionId,
          name: "Sessão nova",
          targetDurationMinutes: 90,
          assignmentRole: "main",
        },
      });
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: fixture.otherTrainingPlan.id,
          pointerImportBatchId: fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      const activity = await client.trainingDayActivity.create({
        data: {
          workspaceId: fixture.workspace.id,
          civilDate: fixture.date,
          type: "structured_training",
          name: "Treino anterior",
          trainingPlanVersionId: fixture.trainingPlan.id,
          sessionDefinitionId: fixture.mainSession.id,
          preparationSessionDefinitionId: fixture.preparationSession.id,
          plannedStartMinute: 1080,
          plannedEndMinute: 1110,
        },
      });
      const repository = new PrismaTrainingRepository(client);
      const command = {
        workspaceId: fixture.workspace.id,
        environment: "local" as const,
        civilDate: "2026-09-13" as CivilDate,
        activityId: activity.id,
        expectedRevision: 0,
        type: "structured_training" as const,
        name: "Treino do plano",
        sport: null,
        sessionId: fixture.mainSession.sessionId,
        plannedStartTime: "19:00",
        plannedEndTime: "19:30",
      };
      await expect(repository.updateTrainingActivity(command)).resolves.toEqual({
        status: "saved",
        revision: 1,
      });
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } }),
      ).resolves.toMatchObject({
        trainingPlanVersionId: fixture.trainingPlan.id,
        sessionDefinitionId: fixture.mainSession.id,
        preparationSessionDefinitionId: fixture.preparationSession.id,
        name: "Treino anterior",
        plannedStartMinute: 1140,
        plannedEndMinute: 1170,
      });
      await expect(repository.updateTrainingActivity(command)).resolves.toMatchObject({
        status: "conflict",
      });
      await expect(
        repository.updateTrainingActivity({ ...command, workspaceId: fixture.anotherWorkspace.id }),
      ).resolves.toMatchObject({ status: "not_found" });
      await expect(
        repository.updateTrainingActivity({
          ...command,
          expectedRevision: 1,
          plannedEndTime: "18:00",
        }),
      ).resolves.toMatchObject({ status: "invalid" });
    }));

  it.each(["sport_practice", "specific_training"] as const)(
    "records %s retrospectively without fabricating execution or preparation",
    (type) =>
      withImportDatabase(async (client) => {
        const fixture = await client.$transaction(createDatabaseFixture);
        const repository = new PrismaTrainingRepository(client);
        const civilDate = "2026-09-16" as CivilDate;
        const activity = await client.trainingDayActivity.create({
          data: {
            workspaceId: fixture.workspace.id,
            civilDate: new Date(`${civilDate}T00:00:00Z`),
            type,
            name: "Atividade externa",
            plannedStartMinute: 540,
            plannedEndMinute: 600,
          },
        });
        const command = {
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          expectedRevision: 0,
          action: "record_completed" as const,
          intensity: "high" as const,
          energy: "energized" as const,
          comment: "Prática realizada.",
        };
        await expect(
          repository.controlTrainingActivity({ ...command, intensity: null }),
        ).resolves.toMatchObject({ status: "invalid" });
        await expect(
          repository.controlTrainingActivity({ ...command, comment: "x".repeat(1001) }),
        ).resolves.toMatchObject({ status: "invalid", field: "comment" });
        const otherWorkspace = await client.workspace.create({ data: {} });
        await expect(
          repository.controlTrainingActivity({ ...command, workspaceId: otherWorkspace.id }),
        ).resolves.toMatchObject({ status: "not_found" });
        const outcomes = await Promise.all([
          repository.controlTrainingActivity(command),
          repository.controlTrainingActivity(command),
        ]);
        expect(outcomes.map((outcome) => outcome.status).sort()).toEqual(["conflict", "saved"]);
        await expect(repository.controlTrainingActivity(command)).resolves.toMatchObject({
          status: "conflict",
        });
        await expect(
          client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } }),
        ).resolves.toMatchObject({
          status: "completed",
          revision: 1,
          startedAt: null,
          completedAt: null,
          actualStartMinute: null,
          actualEndMinute: null,
          plannedStartMinute: 540,
          plannedEndMinute: 600,
          intensity: "high",
          energy: "energized",
          comment: "Prática realizada.",
        });
        expect(
          await client.trainingActivityExecutionInterval.count({
            where: { activityId: activity.id },
          }),
        ).toBe(0);
        expect(
          await client.trainingActivityExerciseExecution.count({
            where: { activityId: activity.id },
          }),
        ).toBe(0);
        expect(
          await client.trainingDayActivity.count({ where: { parentActivityId: activity.id } }),
        ).toBe(0);
        await expect(
          repository.controlTrainingActivity({
            ...command,
            action: "update_feedback",
            expectedRevision: 1,
            comment: "Corrigido.",
          }),
        ).resolves.toMatchObject({ status: "saved", revision: 2 });
        await expect(
          client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } }),
        ).resolves.toMatchObject({ startedAt: null, completedAt: null, comment: "Corrigido." });
      }),
  );

  it("rejects retrospective recording for guided activities and persisted timers", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      for (const type of ["structured_training", "mobility", "sport_practice"] as const) {
        const activity = await client.trainingDayActivity.create({
          data: {
            workspaceId: fixture.workspace.id,
            civilDate: new Date("2026-09-16T00:00:00Z"),
            type,
            name: "Atividade",
            ...(type === "structured_training"
              ? {
                  trainingPlanVersionId: fixture.trainingPlan.id,
                  sessionDefinitionId: fixture.mainSession.id,
                }
              : {}),
            ...(type === "sport_practice" ? { status: "paused", startedAt: new Date() } : {}),
          },
        });
        await expect(
          repository.controlTrainingActivity({
            workspaceId: fixture.workspace.id,
            civilDate: "2026-09-16" as CivilDate,
            activityId: activity.id,
            expectedRevision: 0,
            action: "record_completed",
            intensity: "moderate",
            energy: "normal",
            comment: null,
          }),
        ).resolves.toMatchObject({ status: "invalid" });
        if (type !== "sport_practice") {
          await expect(
            client.trainingDayActivity.update({
              where: { id: activity.id },
              data: { status: "completed" },
            }),
          ).rejects.toThrow();
        }
      }
    }));
  it("keeps an intentionally removed planned activity hidden without masking missing data", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      const civilDate = "2026-09-16" as CivilDate;
      const date = new Date("2026-09-16T00:00:00.000Z");
      const assignment = await client.dailyTrainingAssignment.create({
        data: {
          workspaceId: fixture.workspace.id,
          civilDate: date,
          kind: "training",
          trainingPlanVersionId: fixture.trainingPlan.id,
          mainSessionId: fixture.mainSession.id,
        },
      });
      await expect(
        repository.findTrainingDay({
          workspaceId: fixture.workspace.id,
          civilDate,
          environment: "local",
        }),
      ).rejects.toMatchObject({ code: "TRAINING_REFERENCE_INVALID" });

      const activity = await client.trainingDayActivity.create({
        data: {
          workspaceId: fixture.workspace.id,
          civilDate: date,
          type: "structured_training",
          source: "plan",
          name: fixture.mainSession.name,
          plannedStartMinute: 540,
          plannedEndMinute: 575,
          assignmentId: assignment.id,
          trainingPlanVersionId: fixture.trainingPlan.id,
          sessionDefinitionId: fixture.mainSession.id,
        },
      });
      await expect(
        repository.deleteTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          expectedRevision: activity.revision,
        }),
      ).resolves.toMatchObject({ status: "saved" });
      await repository.ensureScheduledTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate,
        environment: "local",
      });
      const day = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate,
        environment: "local",
      });
      expect(day.assignment?.id).toBe(assignment.id);
      expect(day.activities).toHaveLength(0);
      expect(
        await client.trainingDayActivity.count({ where: { assignmentId: assignment.id } }),
      ).toBe(1);
    }));

  it("finalizes a previously started activity without replacing persisted history", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: fixture.trainingPlan.id,
          pointerImportBatchId: fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      const civilDate = "2026-09-16" as CivilDate;
      await repository.addTrainingActivity({
        workspaceId: fixture.workspace.id,
        environment: "local",
        civilDate,
        type: "structured_training",
        name: "Treino do plano",
        sport: null,
        sessionId: fixture.mainSession.sessionId,
        plannedStartTime: "09:00",
        plannedEndTime: "09:35",
      });
      const day = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate,
        environment: "local",
      });
      const activity = day.activities.find((item) => item.type === "structured_training")!;
      const definitions = await client.trainingExerciseDefinition.findMany({
        where: { trainingPlanVersionId: fixture.trainingPlan.id },
        include: { exercise: true, session: true },
      });
      const main = definitions.find((definition) => definition.session.assignmentRole === "main")!;
      const startedAt = new Date(Date.now() - 120_000);
      const pausedAt = new Date(Date.now() - 60_000);
      await client.trainingDayActivity.update({
        where: { id: activity.id },
        data: { status: "paused", startedAt, revision: 1 },
      });
      const oldInterval = await client.trainingActivityExecutionInterval.create({
        data: {
          workspaceId: fixture.workspace.id,
          activityId: activity.id,
          startedAt,
          endedAt: pausedAt,
        },
      });
      const oldExercise = await client.trainingActivityExerciseExecution.create({
        data: {
          workspaceId: fixture.workspace.id,
          activityId: activity.id,
          trainingPlanVersionId: fixture.trainingPlan.id,
          sessionDefinitionId: main.session.id,
          exerciseDefinitionId: main.id,
          role: "main",
          completedAt: pausedAt,
        },
      });
      const oldSet = await client.trainingActivitySetExecution.create({
        data: {
          workspaceId: fixture.workspace.id,
          exerciseExecutionId: oldExercise.id,
          setNumber: 1,
          value: 5,
        },
      });
      const exercises = Object.fromEntries(
        definitions.map((definition) => {
          const role: "preparation" | "main" =
            definition.session.assignmentRole === "preparation" ? "preparation" : "main";
          return [
            `${role}:${definition.exercise.exerciseId}`,
            {
              sessionId: definition.session.sessionId,
              exerciseId: definition.exercise.exerciseId,
              role,
              completed: role === "main" && definition.id === main.id,
              comment: "",
              sets: Array.from({ length: role === "main" ? definition.sets : 0 }, (_, index) => ({
                setNumber: index + 1,
                value: role === "main" && definition.id === main.id && index === 0 ? "8" : "",
                leftValue: "",
                rightValue: "",
                directionValues: {},
                loadKg: "",
              })),
            },
          ];
        }),
      );
      expect(
        (await client.trainingActivitySetExecution.findUniqueOrThrow({ where: { id: oldSet.id } }))
          .value,
      ).toBe(5);
      const resumedAt = new Date(Date.now() - 30_000).toISOString();
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          action: "complete",
          intensity: "moderate",
          energy: "normal",
          comment: null,
          expectedRevision: 1,
          executionDraft: {
            version: 1,
            activityId: activity.id,
            civilDate,
            expectedRevision: 1,
            status: "in_progress",
            startedAt: startedAt.toISOString(),
            intervals: [
              { startedAt: startedAt.toISOString(), endedAt: pausedAt.toISOString() },
              { startedAt: resumedAt, endedAt: null },
            ],
            exercises,
          },
        }),
      ).resolves.toEqual({ status: "saved", revision: 2 });
      expect(
        (
          await client.trainingActivityExecutionInterval.findUniqueOrThrow({
            where: { id: oldInterval.id },
          })
        ).endedAt,
      ).toEqual(pausedAt);
      expect(
        (
          await client.trainingActivityExerciseExecution.findUniqueOrThrow({
            where: { id: oldExercise.id },
          })
        ).id,
      ).toBe(oldExercise.id);
      expect(
        (await client.trainingActivitySetExecution.findUniqueOrThrow({ where: { id: oldSet.id } }))
          .value,
      ).toBe(8);
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: activity.id },
        }),
      ).toBe(2);
    }));

  it("commits the browser draft, intervals and every structured set only on finalization", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: fixture.trainingPlan.id,
          pointerImportBatchId: fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      const civilDate = "2026-09-16" as CivilDate;
      await repository.addTrainingActivity({
        workspaceId: fixture.workspace.id,
        environment: "local",
        civilDate,
        type: "structured_training",
        name: "Treino do plano",
        sport: null,
        sessionId: fixture.mainSession.sessionId,
        plannedStartTime: "09:00",
        plannedEndTime: "09:35",
      });
      const day = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate,
        environment: "local",
      });
      const activity = day.activities.find(
        (candidate) => candidate.type === "structured_training",
      )!;
      const definitions = await client.trainingExerciseDefinition.findMany({
        where: { trainingPlanVersionId: fixture.trainingPlan.id },
        include: { exercise: true, session: true },
      });
      const exercises = Object.fromEntries(
        definitions.map((definition) => {
          const role: "preparation" | "main" =
            definition.session.assignmentRole === "preparation" ? "preparation" : "main";
          return [
            `${role}:${definition.exercise.exerciseId}`,
            {
              sessionId: definition.session.sessionId,
              exerciseId: definition.exercise.exerciseId,
              role,
              completed: role === "main" && definition.ordinal === 1,
              comment: "",
              sets: Array.from({ length: role === "main" ? definition.sets : 0 }, (_, index) => ({
                setNumber: index + 1,
                value: role === "main" && definition.ordinal === 1 && index === 0 ? "6" : "",
                leftValue: "",
                rightValue: "",
                directionValues: {},
                loadKg: "",
              })),
            },
          ];
        }),
      );
      const startedAt = new Date(Date.now() - 60_000).toISOString();
      const pausedAt = new Date(Date.now() - 40_000).toISOString();
      const resumedAt = new Date(Date.now() - 20_000).toISOString();
      const executionDraft = {
        version: 1 as const,
        activityId: activity.id,
        civilDate,
        expectedRevision: activity.revision,
        status: "in_progress" as const,
        startedAt,
        intervals: [
          { startedAt, endedAt: pausedAt },
          { startedAt: resumedAt, endedAt: null },
        ],
        exercises,
      };
      expect(
        await client.trainingActivityExerciseExecution.count({
          where: { activityId: activity.id },
        }),
      ).toBe(0);
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: activity.id },
        }),
      ).toBe(0);
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          action: "complete",
          intensity: "moderate",
          energy: "normal",
          comment: null,
          expectedRevision: activity.revision,
        }),
      ).resolves.toMatchObject({ status: "invalid" });
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          action: "complete",
          intensity: "moderate",
          energy: "normal",
          comment: null,
          expectedRevision: activity.revision,
          executionDraft: {
            ...executionDraft,
            exercises: {
              ...executionDraft.exercises,
              "main:unknown": {
                ...Object.values(executionDraft.exercises)[0]!,
                exerciseId: "unknown",
              },
            },
          },
        }),
      ).resolves.toMatchObject({ status: "invalid" });
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: activity.id },
        }),
      ).toBe(0);
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate,
          activityId: activity.id,
          action: "complete",
          intensity: "moderate",
          energy: "normal",
          comment: null,
          expectedRevision: activity.revision,
          executionDraft,
        }),
      ).resolves.toEqual({ status: "saved", revision: activity.revision + 1 });
      expect(
        await client.trainingActivityExerciseExecution.count({
          where: { activityId: activity.id },
        }),
      ).toBe(definitions.length);
      expect(
        await client.trainingActivitySetExecution.count({
          where: { exerciseExecution: { activityId: activity.id } },
        }),
      ).toBe(8);
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: activity.id },
        }),
      ).toBe(2);
      expect(
        (await client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } })).status,
      ).toBe("completed");

      const completedActivity = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: activity.id },
      });
      const firstMainExercise = definitions.find(
        (definition) =>
          definition.session.assignmentRole === "main" &&
          definition.exercise.exerciseId === "test_total",
      )!;
      const recordedExercise = await client.trainingActivityExerciseExecution.findFirstOrThrow({
        where: { activityId: activity.id, exerciseDefinitionId: firstMainExercise.id },
      });
      const correction = {
        workspaceId: fixture.workspace.id,
        civilDate,
        activityId: activity.id,
        sessionId: firstMainExercise.session.sessionId,
        exerciseId: firstMainExercise.exercise.exerciseId,
        role: "main" as const,
        completed: true,
        comment: "Carga corrigida após o treino.",
        expectedRevision: recordedExercise.revision,
        sets: [
          {
            setNumber: 1,
            value: 7,
            leftValue: null,
            rightValue: null,
            directionValues: null,
            loadKg: "12.5",
          },
          {
            setNumber: 2,
            value: 0,
            leftValue: null,
            rightValue: null,
            directionValues: null,
            loadKg: null,
          },
        ],
      };
      await expect(repository.saveTrainingActivityExercise(correction)).resolves.toMatchObject({
        status: "saved",
      });
      await expect(repository.saveTrainingActivityExercise(correction)).resolves.toMatchObject({
        status: "conflict",
      });
      const afterCorrection = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: activity.id },
      });
      expect(afterCorrection.startedAt).toEqual(completedActivity.startedAt);
      expect(afterCorrection.completedAt).toEqual(completedActivity.completedAt);
      expect(afterCorrection.actualStartMinute).toBe(completedActivity.actualStartMinute);
      expect(afterCorrection.actualEndMinute).toBe(completedActivity.actualEndMinute);
    }));

  it("materializes only the selected Saturday-game day once per workspace", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction((tx) =>
        createDatabaseFixture(tx, {
          weekend_game: { enabled: true, day: "saturday", start_time: null },
          planning_defaults: { footvolley_duration_minutes: 90 },
          models: {
            saturday_game: [
              { day: "wednesday", time: "09:00", session: "test_main" },
              { day: "wednesday", time: "16:00", session: "footvolley" },
              { day: "friday", time: null, session: "rest_or_light_mobility" },
              { day: "saturday", time: null, session: "game" },
            ],
            sunday_game: [{ day: "sunday", time: null, session: "game" }],
          },
        }),
      );
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: fixture.trainingPlan.id,
          pointerImportBatchId: fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      const wednesday = {
        workspaceId: fixture.anotherWorkspace.id,
        civilDate: "2026-09-23" as CivilDate,
        environment: "local" as const,
      };
      const now = new Date("2026-09-22T12:00:00.000Z");
      await ensureScheduledTrainingDay(client, wednesday, now);
      await ensureScheduledTrainingDay(client, wednesday, now);
      const activities = await client.trainingDayActivity.findMany({
        where: { workspaceId: wednesday.workspaceId, civilDate: new Date("2026-09-23") },
      });
      expect(activities.filter((activity) => activity.role === "primary")).toHaveLength(2);
      expect(activities.filter((activity) => activity.role === "preparation")).toHaveLength(1);
      expect(activities.find((activity) => activity.type === "structured_training")).toMatchObject({
        plannedStartMinute: 540,
        plannedEndMinute: 570,
        trainingPlanVersionId: fixture.trainingPlan.id,
      });
      expect(activities.find((activity) => activity.type === "specific_training")).toMatchObject({
        plannedStartMinute: 960,
        plannedEndMinute: 1050,
      });

      const saturday = { ...wednesday, civilDate: "2026-09-26" as CivilDate };
      await ensureScheduledTrainingDay(client, saturday, now);
      const game = await client.trainingDayActivity.findFirstOrThrow({
        where: {
          workspaceId: saturday.workspaceId,
          civilDate: new Date("2026-09-26"),
          role: "primary",
        },
      });
      expect(game).toMatchObject({
        type: "sport_practice",
        plannedStartMinute: null,
        plannedEndMinute: null,
      });

      const friday = { ...wednesday, civilDate: "2026-09-25" as CivilDate };
      await ensureScheduledTrainingDay(client, friday, now);
      const rest = await client.dailyTrainingAssignment.findUniqueOrThrow({
        where: {
          workspaceId_civilDate: {
            workspaceId: friday.workspaceId,
            civilDate: new Date("2026-09-25"),
          },
        },
      });
      expect(rest).toMatchObject({ kind: "rest", reason: "Descanso ou mobilidade leve" });
    }));

  it("links the plan warmup when the manual sport label is Portuguese and the plan is English", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction((tx) =>
        createDatabaseFixture(tx, {
          entries: [{ sport: "Footvolley", preparation_session_id: "test_preparation" }],
        }),
      );
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: fixture.trainingPlan.id,
          pointerImportBatchId: fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      const repository = new PrismaTrainingRepository(client);
      await expect(
        repository.addTrainingActivity({
          workspaceId: fixture.workspace.id,
          environment: "local",
          civilDate: "2026-09-16" as CivilDate,
          type: "sport_practice",
          name: "Jogo extra",
          sport: "Futevôlei",
          sessionId: null,
          plannedStartTime: "18:00",
          plannedEndTime: "20:00",
        }),
      ).resolves.toMatchObject({ status: "saved" });
      const day = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate: "2026-09-16" as CivilDate,
        environment: "local",
      });
      expect(day.activities[0]?.preparationSession?.sessionId).toBe("test_preparation");
      expect(day.activities[0]?.sport).toBe("Futevôlei");
    }));

  it("persists an extra activity independently from the planned training", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);

      await expect(
        repository.addTrainingActivity({
          workspaceId: fixture.workspace.id,
          environment: "local",
          civilDate: "2026-09-16" as CivilDate,
          type: "sport_practice",
          name: "Jogo extra",
          sport: "Futevôlei",
          sessionId: null,
          plannedStartTime: "18:00",
          plannedEndTime: "20:00",
        }),
      ).resolves.toEqual({ status: "saved", revision: 0 });

      const day = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate: "2026-09-16" as CivilDate,
        environment: "local",
      });
      expect(day.activities).toEqual([
        expect.objectContaining({
          type: "sport_practice",
          name: "Jogo extra",
          sport: "Futevôlei",
          status: "scheduled",
          plannedStartMinute: 1080,
          plannedEndMinute: 1200,
          intensity: null,
          preparations: [
            expect.objectContaining({
              type: "mobility",
              role: "preparation",
              status: "scheduled",
              plannedStartMinute: 1070,
              plannedEndMinute: 1080,
            }),
          ],
        }),
      ]);

      const activity = day.activities[0]!;
      await expect(
        repository.controlTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate: "2026-09-16" as CivilDate,
          activityId: activity.id,
          action: "record_completed",
          intensity: "high",
          energy: "energized",
          comment: "Boa energia durante o jogo.",
          expectedRevision: activity.revision,
        }),
      ).resolves.toEqual({ status: "saved", revision: 1 });
      await expect(
        repository.deleteTrainingActivity({
          workspaceId: fixture.workspace.id,
          civilDate: "2026-09-16" as CivilDate,
          activityId: activity.id,
          expectedRevision: 1,
        }),
      ).resolves.toEqual({
        status: "invalid",
        message: "Uma atividade concluída não pode ser excluída.",
      });
      const afterDeletion = await repository.findTrainingDay({
        workspaceId: fixture.workspace.id,
        civilDate: "2026-09-16" as CivilDate,
        environment: "local",
      });
      expect(afterDeletion.activities).toHaveLength(1);
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } }),
      ).resolves.toMatchObject({ deletedAt: null, status: "completed" });
    }));

  it("rejects an invalid activity interval and unnamed activity", () =>
    withImportDatabase(async (client) => {
      const fixture = await client.$transaction(createDatabaseFixture);
      const repository = new PrismaTrainingRepository(client);
      const common = {
        workspaceId: fixture.workspace.id,
        environment: "local" as const,
        civilDate: "2026-09-16" as CivilDate,
        type: "specific_training" as const,
        sport: "Futevôlei",
        sessionId: null,
      };

      await expect(
        repository.addTrainingActivity({
          ...common,
          name: "Treino técnico",
          plannedStartTime: "20:00",
          plannedEndTime: "18:00",
        }),
      ).resolves.toMatchObject({ status: "invalid", field: "plannedEndTime" });
      await expect(
        repository.addTrainingActivity({
          ...common,
          name: " ",
          plannedStartTime: "18:00",
          plannedEndTime: "19:00",
        }),
      ).resolves.toMatchObject({ status: "invalid", field: "name" });
    }));
});
