import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import type { PrismaClient } from "@/generated/prisma/client";
import { parseCivilDate } from "@/features/training/domain/training-day.rules";
import { getTrainingWeek } from "@/features/training/application/get-training-week";
import { PrismaTrainingRepository } from "@/features/training/data/prisma-training-repository";
import type { ControlTrainingActivityCommand } from "@/features/training/application/training-mutation.types";
import { createDatabaseFixture } from "./fixtures/database.fixture";
import { withImportDatabase } from "./fixtures/import-database.fixture";

async function prepareWeek(client: PrismaClient) {
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const schedule = {
    schema_version: "2.0.0",
    entries: weekdays.flatMap((day) => [
      {
        day,
        type: "structured_training",
        session_id: "week_main",
        start_time: "09:00",
        end_time: "09:30",
      },
      {
        day,
        type: "sport_practice",
        name: "Vôlei",
        sport: "Vôlei",
        start_time: "17:00",
        end_time: "18:00",
      },
    ]),
  };
  const fixture = await client.$transaction((tx) => createDatabaseFixture(tx, schedule));
  const session = await client.trainingSessionDefinition.create({
    data: {
      trainingPlanVersionId: fixture.trainingPlan.id,
      sessionId: "week_main",
      name: "Treino semanal",
      targetDurationMinutes: 30,
      assignmentRole: "main",
      compatiblePreparationSessionIds: [],
    },
  });
  const prescription = await client.trainingExerciseDefinition.create({
    data: {
      trainingPlanVersionId: fixture.trainingPlan.id,
      sessionDefinitionId: session.id,
      exerciseDefinitionId: fixture.prescriptions[0]!.exerciseDefinitionId,
      ordinal: 1,
      sets: 2,
      prescribedText: "test_total",
      normalizedDose: {
        source_text: "test_total",
        minimum: 4,
        maximum: 6,
        unit: "repetitions",
        scope: "total",
        qualifier: null,
      },
    },
    include: { exercise: true },
  });
  await client.planActivation.create({
    data: {
      domain: "training",
      logicalEnvironment: "local",
      trainingPlanVersionId: fixture.trainingPlan.id,
      pointerImportBatchId: fixture.trainingPointer.id,
      activatedAt: new Date(),
    },
  });
  const civilDate = parseCivilDate(
    new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date()),
  );
  const input = { workspaceId: fixture.workspace.id, civilDate, environment: "local" as const };
  const repository = new PrismaTrainingRepository(client);
  const query = () => repository.findTrainingDay(input);
  const snapshot = await query();
  const activity = snapshot.activities.find((item) => item.type === "structured_training")!;
  const startedAt = new Date(Date.now() - 600_000).toISOString();
  const stoppedAt = new Date(Date.now() - 300_000).toISOString();
  const command: ControlTrainingActivityCommand = {
    workspaceId: input.workspaceId,
    civilDate,
    activityId: activity.id,
    action: "complete",
    intensity: "moderate",
    energy: "normal",
    comment: null,
    expectedRevision: 0,
    completionRequestedAt: stoppedAt,
    executionDraft: {
      version: 1,
      activityId: activity.id,
      civilDate,
      expectedRevision: 0,
      status: "paused",
      startedAt,
      intervals: [{ startedAt, endedAt: stoppedAt }],
      exercises: {
        [`main:${prescription.exercise.exerciseId}`]: {
          sessionId: session.sessionId,
          exerciseId: prescription.exercise.exerciseId,
          role: "main",
          completed: true,
          comment: "",
          sets: [1, 2].map((setNumber) => ({
            setNumber,
            kind: "work",
            confirmed: true,
            value: "5",
            leftValue: "",
            rightValue: "",
            directionValues: {},
            loadKg: "20",
          })),
        },
      },
    },
  };
  return { fixture, input, repository, query, snapshot, command };
}

describe("consulta semanal e ocorrências projetadas no PostgreSQL", () => {
  it("recusa excluir uma execução persistida em andamento", () =>
    withImportDatabase(async (client) => {
      const f = await prepareWeek(client);
      const activity = await client.trainingDayActivity.create({
        data: {
          workspaceId: f.input.workspaceId,
          civilDate: new Date(f.input.civilDate),
          type: "mobility",
          name: "Execução em andamento",
          status: "paused",
          startedAt: new Date(Date.now() - 60_000),
        },
      });
      await expect(
        f.repository.deleteTrainingActivity({
          workspaceId: f.input.workspaceId,
          civilDate: f.input.civilDate,
          activityId: activity.id,
          expectedRevision: 0,
        }),
      ).resolves.toMatchObject({ status: "invalid" });
      expect(
        await client.trainingDayActivity.findUniqueOrThrow({ where: { id: activity.id } }),
      ).toMatchObject({ deletedAt: null, revision: 0, status: "paused" });
    }));
  it("consulta a semana repetidamente sem gravar e mantém avulsas após trocar o plano", () =>
    withImportDatabase(async (client) => {
      const f = await prepareWeek(client);
      const avulsa = await client.trainingDayActivity.create({
        data: {
          workspaceId: f.input.workspaceId,
          civilDate: new Date(f.input.civilDate),
          type: "sport_practice",
          source: "manual",
          name: "Futebol avulso",
        },
      });
      const before = await Promise.all([
        client.trainingDayActivity.count(),
        client.dailyTrainingAssignment.count(),
      ]);
      const deps = {
        repository: f.repository,
        environment: "local" as const,
        resolveWorkspace: () => ({ workspaceId: f.input.workspaceId }),
      };
      const first = await getTrainingWeek(deps, f.input);
      const second = await getTrainingWeek(deps, f.input);
      expect(second).toEqual(first);
      expect(
        first.days.find((day) => day.civilDate === f.input.civilDate)?.activities,
      ).toHaveLength(3);
      expect(
        await Promise.all([
          client.trainingDayActivity.count(),
          client.dailyTrainingAssignment.count(),
        ]),
      ).toEqual(before);
      await client.planActivation.updateMany({
        where: { supersededAt: null },
        data: { supersededAt: new Date() },
      });
      await client.planActivation.create({
        data: {
          domain: "training",
          logicalEnvironment: "local",
          trainingPlanVersionId: f.fixture.otherTrainingPlan.id,
          pointerImportBatchId: f.fixture.trainingPointer.id,
          activatedAt: new Date(),
        },
      });
      expect((await f.query()).activities.map((item) => item.id)).toContain(avulsa.id);
    }));

  it("reverte finalização inválida e preserva o resultado numa repetição após resposta perdida", () =>
    withImportDatabase(async (client) => {
      const f = await prepareWeek(client);
      await expect(
        f.repository.controlTrainingActivity({ ...f.command, intensity: null }),
      ).resolves.toMatchObject({ status: "invalid" });
      expect(await client.trainingDayActivity.count({ where: { id: f.command.activityId } })).toBe(
        0,
      );
      await expect(f.repository.controlTrainingActivity(f.command)).resolves.toEqual({
        status: "saved",
        revision: 1,
      });
      const stored = await client.trainingDayActivity.findUniqueOrThrow({
        where: { id: f.command.activityId },
      });
      await expect(f.repository.controlTrainingActivity(f.command)).resolves.toMatchObject({
        status: "saved",
        revision: 1,
      });
      await expect(
        f.repository.controlTrainingActivity({ ...f.command, comment: "Alteração posterior" }),
      ).resolves.toMatchObject({ status: "conflict" });
      const draft = f.command.executionDraft!;
      const changed = Object.fromEntries(
        Object.entries(draft.exercises).map(([key, exercise]) => [
          key,
          { ...exercise, sets: exercise.sets.map((set) => ({ ...set, value: "6" })) },
        ]),
      );
      await expect(
        f.repository.controlTrainingActivity({
          ...f.command,
          executionDraft: { ...draft, exercises: changed },
        }),
      ).resolves.toMatchObject({ status: "conflict" });
      expect(
        await client.trainingDayActivity.findUniqueOrThrow({ where: { id: stored.id } }),
      ).toEqual(stored);
      expect(
        await client.trainingActivityExecutionInterval.count({ where: { activityId: stored.id } }),
      ).toBe(1);
      expect(
        await client.trainingActivitySetExecution.count({
          where: { exerciseExecution: { activityId: stored.id } },
        }),
      ).toBe(2);
      expect((await f.query()).activities.filter((item) => item.id === stored.id)).toHaveLength(1);
      expect((await f.query()).activities).toHaveLength(2);
    }));

  it("grava uma única execução em duas finalizações concorrentes", () =>
    withImportDatabase(async (client, context) => {
      const f = await prepareWeek(client);
      const outcomes = await Promise.all([
        f.repository.controlTrainingActivity(f.command),
        new PrismaTrainingRepository(context.createConnection()).controlTrainingActivity(f.command),
      ]);
      expect(outcomes.some((item) => item.status === "saved")).toBe(true);
      expect(outcomes.every((item) => item.status === "saved" || item.status === "conflict")).toBe(
        true,
      );
      expect(await client.trainingDayActivity.count({ where: { id: f.command.activityId } })).toBe(
        1,
      );
      expect(
        await client.trainingActivityExecutionInterval.count({
          where: { activityId: f.command.activityId },
        }),
      ).toBe(1);
    }));

  it("mantém a exclusão de uma ocorrência sem ocultar as demais atividades do plano", () =>
    withImportDatabase(async (client) => {
      const f = await prepareWeek(client);
      await expect(
        f.repository.deleteTrainingActivity({
          workspaceId: f.input.workspaceId,
          civilDate: f.input.civilDate,
          activityId: f.command.activityId,
          expectedRevision: 0,
        }),
      ).resolves.toMatchObject({ status: "saved" });
      expect((await f.query()).activities.map((item) => item.type)).toEqual(["sport_practice"]);
      expect(
        await client.dailyTrainingAssignment.count({
          where: { workspaceId: f.input.workspaceId, civilDate: new Date(f.input.civilDate) },
        }),
      ).toBe(0);
    }));
});
