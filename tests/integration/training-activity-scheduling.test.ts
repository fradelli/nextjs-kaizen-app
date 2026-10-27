import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { PrismaTrainingRepository } from "@/features/training/data/prisma-training-repository";
import { ensureScheduledTrainingDay } from "@/features/training/data/ensure-scheduled-training-day";
import type { CivilDate } from "@/features/training/domain/training-day.types";
import { createDatabaseFixture } from "./fixtures/database.fixture";
import { withImportDatabase } from "./fixtures/import-database.fixture";

const sourceDate = "2026-09-16" as CivilDate;
const destinationDate = "2026-09-17" as CivilDate;
const now = new Date("2026-09-17T15:00:00Z");
const schedule = {
  schema_version: "2.0.0",
  entries: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"].map(
    (day) => ({
      day,
      type: "specific_training",
      name: "Atividade prevista",
      sport: "Footvolley",
      start_time: "12:00",
      end_time: "13:00",
      preparation_session_id: "test_preparation",
    }),
  ),
};

describe("manual preparation and activity rescheduling with PostgreSQL", () => {
  it("validates an explicit preparation, supports no preparation and never accepts a main session as a warmup", () =>
    withImportDatabase(async (client) => {
      const f = await client.$transaction(createDatabaseFixture);
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: f.trainingPlan.id,
          pointerImportBatchId: f.trainingPointer.id,
          activatedAt: now,
        },
      });
      const repo = new PrismaTrainingRepository(client);
      const command = {
        workspaceId: f.workspace.id,
        environment: "local" as const,
        civilDate: sourceDate,
        type: "specific_training" as const,
        name: "Manual",
        sport: "Esporte livre",
        sessionId: null,
        plannedStartTime: "18:00",
        plannedEndTime: "19:00",
      };
      for (const preparationSessionId of [f.mainSession.sessionId, "invalid", "keep"])
        await expect(
          repo.addTrainingActivity({ ...command, preparationSessionId }),
        ).resolves.toMatchObject({ status: "invalid", field: "preparationSessionId" });
      expect(await client.trainingDayActivity.count()).toBe(0);
      await expect(
        repo.addTrainingActivity({
          ...command,
          preparationSessionId: f.preparationSession.sessionId,
        }),
      ).resolves.toMatchObject({ status: "saved" });
      const selected = await client.trainingDayActivity.findFirstOrThrow({
        where: { name: "Manual" },
        include: { preparations: true },
      });
      expect(selected.preparationSessionDefinitionId).toBe(f.preparationSession.id);
      expect(selected.preparations).toHaveLength(0);
      await expect(
        repo.updateTrainingActivity({
          ...command,
          activityId: selected.id,
          expectedRevision: 0,
          preparationSessionId: null,
        }),
      ).resolves.toMatchObject({ status: "saved" });
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: selected.id } }),
      ).resolves.toMatchObject({
        preparationSessionDefinitionId: null,
        trainingPlanVersionId: f.trainingPlan.id,
      });

      await expect(
        repo.addTrainingActivity({
          ...command,
          name: "Sem aquecimento",
          preparationSessionId: null,
        }),
      ).resolves.toMatchObject({ status: "saved" });
      const without = await client.trainingDayActivity.findFirstOrThrow({
        where: { name: "Sem aquecimento" },
        include: { preparations: true },
      });
      expect(without.preparationSessionDefinitionId).toBeNull();
      expect(without.preparations).toHaveLength(0);
      await expect(
        repo.updateTrainingActivity({
          ...command,
          activityId: without.id,
          expectedRevision: 0,
          name: without.name,
          preparationSessionId: "keep",
          plannedStartTime: "18:15",
        }),
      ).resolves.toMatchObject({ status: "saved" });
      expect(
        await client.trainingDayActivity.count({
          where: { parentActivityId: without.id, deletedAt: null },
        }),
      ).toBe(0);

      const publicPlan = await repo.findActiveTrainingPlan("local");
      expect(publicPlan?.sessions.some((session) => session.assignmentRole === "preparation")).toBe(
        true,
      );
    }));
  it("moves the same activity, preserves preparation and materializes the destination without recreating the source", () =>
    withImportDatabase(async (client) => {
      const f = await client.$transaction((tx) => createDatabaseFixture(tx, schedule));
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: f.trainingPlan.id,
          pointerImportBatchId: f.trainingPointer.id,
          activatedAt: now,
        },
      });
      const repo = new PrismaTrainingRepository(client);
      const command = {
        workspaceId: f.workspace.id,
        environment: "local" as const,
        civilDate: sourceDate,
        type: "specific_training" as const,
        name: "Manual remarcado",
        sport: "Footvolley",
        sessionId: null,
        preparationSessionId: f.preparationSession.sessionId,
        plannedStartTime: "18:00",
        plannedEndTime: "19:00",
      };
      await repo.addTrainingActivity(command);
      const original = await client.trainingDayActivity.findFirstOrThrow({
        where: { name: command.name, deletedAt: null },
      });
      const update = {
        ...command,
        activityId: original.id,
        expectedRevision: 0,
        targetCivilDate: destinationDate,
        preparationSessionId: "keep",
      };
      await expect(repo.updateTrainingActivity(update)).resolves.toEqual({
        status: "saved",
        revision: 1,
      });
      const moved = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: original.id },
      });
      expect(moved).toMatchObject({
        civilDate: new Date(`${destinationDate}T00:00:00Z`),
        preparationSessionDefinitionId: f.preparationSession.id,
        trainingPlanVersionId: f.trainingPlan.id,
        plannedStartMinute: 1080,
        plannedEndMinute: 1140,
      });
      await ensureScheduledTrainingDay(
        client,
        { workspaceId: f.workspace.id, environment: "local", civilDate: sourceDate },
        now,
      );
      await ensureScheduledTrainingDay(
        client,
        { workspaceId: f.workspace.id, environment: "local", civilDate: destinationDate },
        now,
      );
      expect(
        await client.trainingDayActivity.count({
          where: { workspaceId: f.workspace.id, civilDate: original.civilDate, deletedAt: null },
        }),
      ).toBe(0);
      expect(
        await client.trainingDayActivity.count({
          where: {
            workspaceId: f.workspace.id,
            civilDate: moved.civilDate,
            role: "primary",
            deletedAt: null,
          },
        }),
      ).toBe(2);
      expect((await repo.findActiveTrainingPlan("local"))?.preparationSuggestions).toEqual([
        { sport: "Footvolley", sessionId: "test_preparation" },
      ]);
      await expect(repo.updateTrainingActivity(update)).resolves.not.toMatchObject({
        status: "saved",
      });
      await expect(
        repo.updateTrainingActivity({
          ...update,
          civilDate: destinationDate,
          targetCivilDate: sourceDate,
          workspaceId: f.anotherWorkspace.id,
          expectedRevision: 1,
        }),
      ).resolves.toMatchObject({ status: "not_found" });
    }));
  it("moves a generic preparation with its original ID and blocks further moves after preparation progress", () =>
    withImportDatabase(async (client) => {
      const f = await client.$transaction(createDatabaseFixture);
      const repo = new PrismaTrainingRepository(client);
      const command = {
        workspaceId: f.workspace.id,
        environment: "local" as const,
        civilDate: sourceDate,
        type: "specific_training" as const,
        name: "Treino",
        sport: "Outro esporte",
        sessionId: null,
        plannedStartTime: "18:00",
        plannedEndTime: "19:00",
      };
      await repo.addTrainingActivity(command);
      const original = await client.trainingDayActivity.findFirstOrThrow({
        where: { role: "primary" },
        include: { preparations: true },
      });
      const preparation = original.preparations[0];
      await expect(
        repo.updateTrainingActivity({
          ...command,
          activityId: original.id,
          expectedRevision: 0,
          targetCivilDate: destinationDate,
          preparationSessionId: "keep",
        }),
      ).resolves.toMatchObject({ status: "saved" });
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: preparation.id } }),
      ).resolves.toMatchObject({
        civilDate: new Date(`${destinationDate}T00:00:00Z`),
        parentActivityId: original.id,
        deletedAt: null,
      });
      await client.trainingActivityExecutionInterval.create({
        data: {
          workspaceId: f.workspace.id,
          activityId: preparation.id,
          startedAt: now,
          endedAt: now,
        },
      });
      await expect(
        repo.updateTrainingActivity({
          ...command,
          civilDate: destinationDate,
          activityId: original.id,
          expectedRevision: 1,
          targetCivilDate: sourceDate,
          preparationSessionId: "keep",
        }),
      ).resolves.toMatchObject({ status: "invalid", field: "targetCivilDate" });
      await expect(
        repo.updateTrainingActivity({
          ...command,
          civilDate: destinationDate,
          activityId: original.id,
          expectedRevision: 1,
          preparationSessionId: null,
        }),
      ).resolves.toMatchObject({ status: "invalid", field: "preparationSessionId" });
    }));
  it("preserves a legacy assignment in the source while moving the real activity with the same ID", () =>
    withImportDatabase(async (client) => {
      const f = await client.$transaction(createDatabaseFixture);
      const repo = new PrismaTrainingRepository(client);
      const original = await client.trainingDayActivity.create({
        data: {
          workspaceId: f.workspace.id,
          civilDate: f.date,
          type: "structured_training",
          name: "Legado",
          assignmentId: f.assignment.id,
          trainingPlanVersionId: f.trainingPlan.id,
          sessionDefinitionId: f.mainSession.id,
          preparationSessionDefinitionId: f.preparationSession.id,
          plannedStartMinute: 1080,
          plannedEndMinute: 1110,
        },
      });
      await expect(
        repo.updateTrainingActivity({
          workspaceId: f.workspace.id,
          environment: "local",
          civilDate: "2026-09-13" as CivilDate,
          targetCivilDate: destinationDate,
          activityId: original.id,
          expectedRevision: 0,
          type: "structured_training",
          name: "Legado",
          sport: null,
          sessionId: f.mainSession.sessionId,
          plannedStartTime: "18:00",
          plannedEndTime: "18:30",
        }),
      ).resolves.toMatchObject({ status: "saved" });
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: original.id } }),
      ).resolves.toMatchObject({
        assignmentId: null,
        civilDate: new Date(`${destinationDate}T00:00:00Z`),
      });
      const marker = await client.trainingDayActivity.findFirstOrThrow({
        where: { assignmentId: f.assignment.id },
      });
      expect(marker.deletedAt).not.toBeNull();
      expect(marker.civilDate).toEqual(f.date);
    }));
  it("allows only one concurrent move and preserves the original when destination materialization fails", () =>
    withImportDatabase(async (client) => {
      const f = await client.$transaction(createDatabaseFixture);
      const repo = new PrismaTrainingRepository(client);
      const original = await client.trainingDayActivity.create({
        data: {
          workspaceId: f.workspace.id,
          civilDate: f.date,
          type: "mobility",
          name: "Mobilidade",
          plannedStartMinute: 1080,
          plannedEndMinute: 1110,
        },
      });
      const command = {
        workspaceId: f.workspace.id,
        environment: "local" as const,
        civilDate: "2026-09-13" as CivilDate,
        activityId: original.id,
        expectedRevision: 0,
        type: "mobility" as const,
        name: "Mobilidade",
        sport: null,
        sessionId: null,
        plannedStartTime: "18:00",
        plannedEndTime: "18:30",
      };
      const outcomes = await Promise.all([
        repo.updateTrainingActivity({ ...command, targetCivilDate: destinationDate }),
        repo.updateTrainingActivity({ ...command, targetCivilDate: sourceDate }),
      ]);
      expect(outcomes.filter((result) => result.status === "saved")).toHaveLength(1);
      expect(
        await client.trainingDayActivity.count({
          where: { workspaceId: f.workspace.id, deletedAt: { not: null } },
        }),
      ).toBe(1);
      const current = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: original.id },
      });
      await client.trainingPlanVersion.update({
        where: { id: f.trainingPlan.id },
        data: { weeklySchedule: { entries: [{ broken: true }] } },
      });
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: f.trainingPlan.id,
          pointerImportBatchId: f.trainingPointer.id,
          activatedAt: now,
        },
      });
      const currentDate = current.civilDate.toISOString().slice(0, 10) as CivilDate;
      await expect(
        repo.updateTrainingActivity({
          ...command,
          civilDate: currentDate,
          expectedRevision: 1,
          targetCivilDate: "2026-09-18" as CivilDate,
        }),
      ).rejects.toThrow();
      await expect(
        client.trainingDayActivity.findUniqueOrThrow({ where: { id: original.id } }),
      ).resolves.toMatchObject({ civilDate: current.civilDate, revision: 1 });
    }));
});
