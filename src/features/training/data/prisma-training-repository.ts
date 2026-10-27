import { ensureScheduledTrainingDayInTransaction } from "./ensure-scheduled-training-day";
import {
  activityScheduleInclude,
  hasTrainingActivityProgress,
  recordTrainingActivityReschedule,
} from "./training-activity-rescheduling";
import { parseTrainingExerciseBlock } from "./parse-training-exercise-block";
import "server-only";

import { isSameTrainingSport } from "../domain/training-sport.rules";
import { supportsRetrospectiveTrainingRecord } from "../domain/training-retrospective-record.rules";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import {
  parseDirectionValues,
  parseNormalizedTrainingDose,
  readNullableStringProperty,
  readStringArrayProperty,
  toCivilDateDatabaseValue,
} from "../domain/training-day.rules";
import type {
  CivilDate,
  TrainingActivitySnapshot,
  TrainingDaySnapshot,
  TrainingEnvironment,
  TrainingPlanSnapshot,
  TrainingSessionSnapshot,
  NormalizedTrainingDose,
} from "../domain/training-day.types";
import type {
  TrainingMutationResult,
  AddTrainingActivityCommand,
  ControlTrainingActivityCommand,
  TrainingActivityExecutionInput,
  DeleteTrainingActivityCommand,
  SaveTrainingActivityExerciseCommand,
  UpdateTrainingActivityCommand,
} from "../application/training-mutation.types";
import { TrainingProjectionError } from "../domain/training-projection.error";
import type { FindTrainingDayInput, TrainingRepository } from "../application/training-repository";
import { mapPrismaTrainingAssignment, mapPrismaTrainingPlan } from "./prisma-training.mapper";
import { trainingAssignmentInclude, trainingPlanInclude } from "./prisma-training-repository.types";
import { ensureScheduledTrainingDay } from "./ensure-scheduled-training-day";

type TrainingReadClient = PrismaClient | Prisma.TransactionClient;
type TrainingDayActivityRow = Prisma.TrainingDayActivityGetPayload<{
  include: {
    plan: { include: typeof trainingPlanInclude };
    session: {
      include: { trainingExerciseDefinition_session: { include: { exercise: true } } };
    };
    preparationSession: {
      include: { trainingExerciseDefinition_session: { include: { exercise: true } } };
    };
    intervals: true;
    exerciseExecutions: { include: { sets: true } };
    preparations: true;
  };
}>;

export class PrismaTrainingRepository implements TrainingRepository {
  constructor(private readonly client: PrismaClient) {}

  async ensureScheduledTrainingDay(input: FindTrainingDayInput): Promise<void> {
    await ensureScheduledTrainingDay(this.client, input);
  }

  async findActiveTrainingPlan(
    environment: TrainingEnvironment,
  ): Promise<TrainingPlanSnapshot | null> {
    return findActiveTrainingPlan(this.client, environment);
  }

  async findTrainingDay(input: FindTrainingDayInput): Promise<TrainingDaySnapshot> {
    return this.client.$transaction(
      async (transaction) => {
        const activePlan = await findActiveTrainingPlan(transaction, input.environment);
        const assignment = await transaction.dailyTrainingAssignment.findUnique({
          where: {
            workspaceId_civilDate: {
              workspaceId: input.workspaceId,
              civilDate: toCivilDateDatabaseValue(input.civilDate),
            },
          },
          include: trainingAssignmentInclude,
        });
        const activities = await transaction.trainingDayActivity.findMany({
          where: {
            workspaceId: input.workspaceId,
            civilDate: toCivilDateDatabaseValue(input.civilDate),
            deletedAt: null,
            role: "primary",
          },
          orderBy: [{ plannedStartMinute: "asc" }, { createdAt: "asc" }],
          include: {
            plan: { include: trainingPlanInclude },
            session: {
              include: {
                trainingExerciseDefinition_session: {
                  orderBy: { ordinal: "asc" },
                  include: { exercise: true },
                },
              },
            },
            preparationSession: {
              include: {
                trainingExerciseDefinition_session: {
                  orderBy: { ordinal: "asc" },
                  include: { exercise: true },
                },
              },
            },
            intervals: { orderBy: { startedAt: "asc" } },
            exerciseExecutions: {
              include: { sets: { orderBy: { setNumber: "asc" } } },
            },
            preparations: {
              where: { deletedAt: null },
              orderBy: [{ plannedStartMinute: "asc" }, { createdAt: "asc" }],
            },
          },
        });

        if (
          assignment &&
          (assignment.kind === "training" || assignment.kind === "mobility") &&
          activities.length === 0
        ) {
          const removedActivity = await transaction.trainingDayActivity.findFirst({
            where: {
              workspaceId: input.workspaceId,
              civilDate: toCivilDateDatabaseValue(input.civilDate),
              role: "primary",
              deletedAt: { not: null },
            },
            select: { id: true },
          });
          if (!removedActivity) {
            throw new TrainingProjectionError(
              "TRAINING_REFERENCE_INVALID",
              "A programação atribuída não possui atividade correspondente.",
            );
          }
        }

        return Object.freeze({
          activePlan,
          assignment: assignment ? mapPrismaTrainingAssignment(assignment) : null,
          activities: Object.freeze(activities.map(mapTrainingActivity)),
        });
      },
      { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead },
    );
  }

  async addTrainingActivity(input: AddTrainingActivityCommand): Promise<TrainingMutationResult> {
    return executePrismaMutation(async () => {
      const activityData = validateActivitySchedule(input);
      if ("status" in activityData) return activityData;
      return this.client.$transaction(async (transaction) => {
        const definition = await resolveActivityDefinition(transaction, input);
        if ("status" in definition) return definition;
        const activity = await transaction.trainingDayActivity.create({
          data: {
            workspaceId: input.workspaceId,
            civilDate: toCivilDateDatabaseValue(input.civilDate),
            source: "manual",
            ...activityData,
            ...definition,
          },
        });
        if (
          input.type !== "mobility" &&
          input.type !== "structured_training" &&
          !definition.preparationSessionDefinitionId &&
          input.preparationSessionId === undefined
        ) {
          const preparationEnd = activityData.plannedStartMinute;
          await transaction.trainingDayActivity.create({
            data: {
              workspaceId: input.workspaceId,
              civilDate: toCivilDateDatabaseValue(input.civilDate),
              type: "mobility",
              role: "preparation",
              parentActivityId: activity.id,
              name: input.sport ? `Aquecimento de ${input.sport}` : "Mobilidade pré-treino",
              sport: input.sport,
              plannedStartMinute: Math.max(0, preparationEnd - 10),
              plannedEndMinute: preparationEnd,
            },
          });
        }
        return saved(activity.revision);
      });
    });
  }

  async updateTrainingActivity(
    input: UpdateTrainingActivityCommand,
  ): Promise<TrainingMutationResult> {
    return executePrismaMutation(async () => {
      const activityData = validateActivitySchedule(input);
      if ("status" in activityData) return activityData;
      return this.client.$transaction(
        async (transaction) => {
          const existing = await transaction.trainingDayActivity.findFirst({
            where: { ...activityMutationWhere(input), role: "primary" },
            include: activityScheduleInclude,
          });
          if (!existing) return conflictOrMissingActivity(transaction, input);
          const targetDate = input.targetCivilDate ?? input.civilDate;
          const moving = targetDate !== input.civilDate;
          if (moving && hasTrainingActivityProgress(existing)) {
            return invalid(
              "Só é possível mudar a data de atividades ainda não iniciadas, incluindo o aquecimento.",
              "targetCivilDate",
            );
          }
          const preservePreparation =
            input.type === existing.type &&
            input.type !== "structured_training" &&
            (input.preparationSessionId === "keep" ||
              (typeof input.preparationSessionId === "string" &&
                input.preparationSessionId === existing.preparationSession?.sessionId) ||
              (input.preparationSessionId === undefined && input.sport === existing.sport));
          const preserveSession =
            input.type === "structured_training" &&
            existing.type === input.type &&
            existing.session?.sessionId === input.sessionId;
          const definition = preserveSession
            ? {
                name: existing.name,
                trainingPlanVersionId: existing.trainingPlanVersionId,
                sessionDefinitionId: existing.sessionDefinitionId,
                preparationSessionDefinitionId: existing.preparationSessionDefinitionId,
              }
            : preservePreparation
              ? {
                  trainingPlanVersionId: existing.trainingPlanVersionId,
                  sessionDefinitionId: existing.sessionDefinitionId,
                  preparationSessionDefinitionId: existing.preparationSessionDefinitionId,
                }
              : await resolveActivityDefinition(transaction, input);
          if ("status" in definition) return definition;
          const removingGenericPreparation =
            input.preparationSessionId === null && existing.preparations.length > 0;
          if (
            (definition.preparationSessionDefinitionId !==
              existing.preparationSessionDefinitionId ||
              removingGenericPreparation) &&
            hasTrainingActivityProgress(existing)
          ) {
            return invalid(
              "O aquecimento de uma atividade já iniciada deve ser preservado.",
              "preparationSessionId",
            );
          }
          if (moving)
            await ensureScheduledTrainingDayInTransaction(transaction, {
              workspaceId: input.workspaceId,
              civilDate: targetDate,
              environment: input.environment,
            });
          const result = await transaction.trainingDayActivity.updateMany({
            where: { ...activityMutationWhere(input), role: "primary" },
            data: {
              ...activityData,
              ...definition,
              ...(input.preparationSessionId === null &&
              input.type === existing.type &&
              (input.type === "specific_training" || input.type === "sport_practice")
                ? { trainingPlanVersionId: existing.trainingPlanVersionId }
                : {}),
              revision: { increment: 1 },
              ...(moving
                ? { civilDate: toCivilDateDatabaseValue(targetDate), assignmentId: null }
                : {}),
            },
          });
          if (!result.count) return conflictOrMissingActivity(transaction, input);
          const preparationEnd = activityData.plannedStartMinute;
          if (
            input.type === "mobility" ||
            input.type === "structured_training" ||
            definition.preparationSessionDefinitionId ||
            input.preparationSessionId === null ||
            (input.preparationSessionId === "keep" && existing.preparations.length === 0)
          ) {
            await transaction.trainingDayActivity.updateMany({
              where: {
                workspaceId: input.workspaceId,
                parentActivityId: input.activityId,
                deletedAt: null,
              },
              data: { deletedAt: new Date(), revision: { increment: 1 } },
            });
          } else {
            const preparation = await transaction.trainingDayActivity.findFirst({
              where: {
                workspaceId: input.workspaceId,
                parentActivityId: input.activityId,
                deletedAt: null,
              },
            });
            const preparationData = {
              name: input.sport ? `Aquecimento de ${input.sport}` : "Mobilidade pré-treino",
              sport: input.sport,
              plannedStartMinute: Math.max(0, preparationEnd - 10),
              plannedEndMinute: preparationEnd,
            };
            if (preparation) {
              await transaction.trainingDayActivity.update({
                where: { id: preparation.id },
                data: { ...preparationData, revision: { increment: 1 } },
              });
            } else {
              await transaction.trainingDayActivity.create({
                data: {
                  workspaceId: input.workspaceId,
                  civilDate: toCivilDateDatabaseValue(input.civilDate),
                  type: "mobility",
                  role: "preparation",
                  parentActivityId: input.activityId,
                  ...preparationData,
                },
              });
            }
          }
          if (moving) await recordTrainingActivityReschedule(transaction, existing, targetDate);
          return saved(input.expectedRevision + 1);
        },
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
    });
  }

  async controlTrainingActivity(
    input: ControlTrainingActivityCommand,
  ): Promise<TrainingMutationResult> {
    return executePrismaMutation(() =>
      this.client.$transaction(async (transaction) => {
        if (input.action === "record_completed") {
          return recordCompletedExternalActivity(transaction, input);
        }
        if (input.action === "complete") {
          if (!input.executionDraft) {
            return invalid("A finalização exige o rascunho completo da atividade.");
          }
          return completeTrainingActivityFromDraft(
            transaction,
            input,
            input.executionDraft,
            new Date(),
          );
        }

        const activity = await transaction.trainingDayActivity.findFirst({
          where: activityMutationWhere(input),
          select: { status: true, type: true },
        });
        if (!activity) return conflictOrMissingActivity(transaction, input);
        if (activity.status !== "completed") {
          return invalid("Somente uma atividade concluída aceita correção da avaliação.");
        }
        if (activity.type !== "mobility" && (!input.intensity || !input.energy)) {
          return invalid("Informe a intensidade e a energia percebidas.");
        }
        const comment = normalizeComment(input.comment);
        if (comment && comment.length > 1000) {
          return invalid("O comentário deve ter no máximo 1.000 caracteres.", "comment");
        }
        const updated = await transaction.trainingDayActivity.updateMany({
          where: activityMutationWhere(input),
          data: {
            intensity: activity.type === "mobility" ? null : input.intensity,
            energy: activity.type === "mobility" ? null : input.energy,
            comment,
            revision: { increment: 1 },
          },
        });
        return updated.count ? saved(input.expectedRevision + 1) : conflict();
      }),
    );
  }

  async saveTrainingActivityExercise(
    input: SaveTrainingActivityExerciseCommand,
  ): Promise<TrainingMutationResult> {
    return executePrismaMutation(() =>
      this.client.$transaction(async (transaction) => {
        const resolved = await resolveActivityPrescription(transaction, input);
        if ("status" in resolved) return resolved;
        const comment = normalizeComment(input.comment);
        if (comment && comment.length > 1000) {
          return invalid("O comentário deve ter no máximo 1.000 caracteres.", "comment");
        }
        const setValidation = validateCompleteExerciseSetInput(
          input,
          resolved.prescription.sets,
          parseNormalizedTrainingDose(resolved.prescription.normalizedDose),
        );
        if (setValidation) return setValidation;
        const normalizedSets = [];
        for (const setInput of input.sets) {
          const loadKg = normalizeLoad(
            setInput.loadKg,
            resolved.prescription.exercise.loadApplicable,
          );
          if ("status" in loadKg) return loadKg;
          normalizedSets.push({ setInput, loadKg: loadKg.value });
        }
        const existing = await transaction.trainingActivityExerciseExecution.findUnique({
          where: {
            workspaceId_activityId_exerciseDefinitionId_role: {
              workspaceId: input.workspaceId,
              activityId: input.activityId,
              exerciseDefinitionId: resolved.prescription.id,
              role: input.role,
            },
          },
        });
        if (existing && existing.revision !== input.expectedRevision) return conflict();
        if (!existing && input.expectedRevision !== null) return conflict();
        const execution = existing
          ? await transaction.trainingActivityExerciseExecution.update({
              where: { id: existing.id },
              data: {
                completedAt: input.completed ? new Date() : null,
                comment,
                revision: { increment: 1 },
              },
            })
          : await transaction.trainingActivityExerciseExecution.create({
              data: {
                workspaceId: input.workspaceId,
                activityId: input.activityId,
                trainingPlanVersionId: resolved.activity.trainingPlanVersionId!,
                sessionDefinitionId: resolved.session.id,
                exerciseDefinitionId: resolved.prescription.id,
                role: input.role,
                completedAt: input.completed ? new Date() : null,
                comment,
              },
            });
        for (const { setInput, loadKg } of normalizedSets) {
          const data = {
            value: setInput.value,
            leftValue: setInput.leftValue,
            rightValue: setInput.rightValue,
            directionValues: setInput.directionValues
              ? (setInput.directionValues as Prisma.InputJsonValue)
              : Prisma.DbNull,
            loadKg,
          };
          await transaction.trainingActivitySetExecution.upsert({
            where: {
              workspaceId_exerciseExecutionId_setNumber: {
                workspaceId: input.workspaceId,
                exerciseExecutionId: execution.id,
                setNumber: setInput.setNumber,
              },
            },
            create: {
              workspaceId: input.workspaceId,
              exerciseExecutionId: execution.id,
              setNumber: setInput.setNumber,
              ...data,
            },
            update: { ...data, revision: { increment: 1 } },
          });
        }
        return saved(execution.revision);
      }),
    );
  }

  async deleteTrainingActivity(
    input: DeleteTrainingActivityCommand,
  ): Promise<TrainingMutationResult> {
    return executePrismaMutation(async () => {
      return this.client.$transaction(async (transaction) => {
        const activity = await transaction.trainingDayActivity.findFirst({
          where: activityMutationWhere(input),
          select: { status: true },
        });
        if (!activity) return conflictOrMissingActivity(transaction, input);
        if (activity.status === "completed") {
          return invalid("Uma atividade concluída não pode ser excluída.");
        }
        const result = await transaction.trainingDayActivity.updateMany({
          where: activityMutationWhere(input),
          data: { deletedAt: new Date(), revision: { increment: 1 } },
        });
        if (!result.count) return conflictOrMissingActivity(transaction, input);
        await transaction.trainingDayActivity.updateMany({
          where: {
            workspaceId: input.workspaceId,
            parentActivityId: input.activityId,
            deletedAt: null,
          },
          data: { deletedAt: new Date(), revision: { increment: 1 } },
        });
        return saved(input.expectedRevision + 1);
      });
    });
  }
}

async function findActiveTrainingPlanRow(
  client: TrainingReadClient,
  environment: TrainingEnvironment,
) {
  const activation = await client.planActivation.findFirst({
    where: { domain: "training", logicalEnvironment: environment, supersededAt: null },
    orderBy: { activatedAt: "desc" },
    include: { trainingPlan: { include: trainingPlanInclude } },
  });
  return activation?.trainingPlan ?? null;
}

async function recordCompletedExternalActivity(
  transaction: Prisma.TransactionClient,
  input: ControlTrainingActivityCommand,
): Promise<TrainingMutationResult> {
  const activity = await transaction.trainingDayActivity.findFirst({
    where: activityMutationWhere(input),
    select: { type: true, status: true, role: true, startedAt: true },
  });
  if (!activity) return conflictOrMissingActivity(transaction, input);
  if (!supportsRetrospectiveTrainingRecord(activity.type) || activity.role !== "primary") {
    return invalid(
      "Somente práticas esportivas e treinos específicos aceitam registro retrospectivo.",
    );
  }
  if (activity.status !== "scheduled" || activity.startedAt || input.executionDraft) {
    return invalid(
      "O registro retrospectivo exige uma atividade ainda não iniciada, sem rascunho.",
    );
  }
  if (!input.intensity || !input.energy) {
    return invalid("Informe a intensidade e a disposição para registrar.");
  }
  const comment = normalizeComment(input.comment);
  if (comment && comment.length > 1000) {
    return invalid("O comentário deve ter no máximo 1.000 caracteres.", "comment");
  }
  const updated = await transaction.trainingDayActivity.updateMany({
    where: { ...activityMutationWhere(input), status: "scheduled" },
    data: {
      status: "completed",
      intensity: input.intensity,
      energy: input.energy,
      comment,
      revision: { increment: 1 },
    },
  });
  return updated.count ? saved(input.expectedRevision + 1) : conflict();
}

async function completeTrainingActivityFromDraft(
  transaction: Prisma.TransactionClient,
  input: ControlTrainingActivityCommand,
  draft: TrainingActivityExecutionInput,
  now: Date,
): Promise<TrainingMutationResult> {
  if (
    draft.activityId !== input.activityId ||
    draft.civilDate !== input.civilDate ||
    draft.expectedRevision !== input.expectedRevision
  ) {
    return invalid("O rascunho não pertence a esta atividade.");
  }
  const activity = await loadActivityForMutation(
    transaction,
    input.workspaceId,
    input.civilDate,
    input.activityId,
  );
  if (!activity) return notFound("A atividade não foi encontrada.");
  if (activity.revision !== input.expectedRevision) return conflict();
  if (supportsRetrospectiveTrainingRecord(activity.type) && activity.status === "scheduled") {
    return invalid("Use o registro retrospectivo para esta atividade externa.");
  }
  if (
    activity.status !== "scheduled" &&
    activity.status !== "in_progress" &&
    activity.status !== "paused"
  )
    return invalid("Esta atividade não pode ser finalizada novamente.");
  const persistedIntervals =
    activity.status === "scheduled"
      ? []
      : await transaction.trainingActivityExecutionInterval.findMany({
          where: { workspaceId: input.workspaceId, activityId: activity.id },
          orderBy: { startedAt: "asc" },
        });
  if (activity.type !== "mobility" && (!input.intensity || !input.energy)) {
    return invalid("Informe a intensidade e a disposição para finalizar.");
  }

  const start = Date.parse(draft.startedAt);
  const limit = now.getTime() + 120_000;
  if (
    !Number.isFinite(start) ||
    start > limit ||
    (activity.status === "scheduled" && start < now.getTime() - 7 * 86_400_000) ||
    (activity.status !== "scheduled" && start !== activity.startedAt?.getTime())
  ) {
    return invalid("O horário inicial do rascunho é inválido.");
  }
  if (persistedIntervals.length > draft.intervals.length) {
    return invalid("O rascunho não preserva o histórico do cronômetro.");
  }
  for (const [index, persisted] of persistedIntervals.entries()) {
    const candidate = draft.intervals[index];
    if (
      !candidate ||
      Date.parse(candidate.startedAt) !== persisted.startedAt.getTime() ||
      (persisted.endedAt && Date.parse(candidate.endedAt ?? "") !== persisted.endedAt.getTime()) ||
      (!persisted.endedAt &&
        candidate.endedAt !== null &&
        Date.parse(candidate.endedAt) < persisted.startedAt.getTime())
    )
      return invalid("O histórico anterior do cronômetro foi alterado.");
  }
  let previousEnd = start;
  const intervals: { startedAt: Date; endedAt: Date }[] = [];
  for (const [index, interval] of draft.intervals.entries()) {
    const intervalStart = Date.parse(interval.startedAt);
    const intervalEnd = interval.endedAt === null ? now.getTime() : Date.parse(interval.endedAt);
    if (
      !Number.isFinite(intervalStart) ||
      !Number.isFinite(intervalEnd) ||
      intervalStart < previousEnd ||
      intervalEnd < intervalStart ||
      intervalEnd > limit ||
      (interval.endedAt === null &&
        (draft.status !== "in_progress" || index !== draft.intervals.length - 1))
    ) {
      return invalid("Os intervalos do cronômetro são inválidos.");
    }
    intervals.push({ startedAt: new Date(intervalStart), endedAt: new Date(intervalEnd) });
    previousEnd = intervalEnd;
  }
  if (
    intervals[0]?.startedAt.getTime() !== start ||
    (draft.status === "paused" && draft.intervals.some((interval) => interval.endedAt === null))
  ) {
    return invalid("O início ou estado do cronômetro é inválido.");
  }

  const prescriptions = [
    ...(activity.preparationSession?.trainingExerciseDefinition_session.map((prescription) => ({
      prescription,
      session: activity.preparationSession!,
      role: "preparation" as const,
    })) ?? []),
    ...(activity.session?.trainingExerciseDefinition_session.map((prescription) => ({
      prescription,
      session: activity.session!,
      role: "main" as const,
    })) ?? []),
  ];
  if (Object.keys(draft.exercises).length !== prescriptions.length) {
    return invalid("O rascunho não contém todos os exercícios previstos.");
  }
  const exercisesToSave = [];
  for (const { prescription, session, role } of prescriptions) {
    const key = `${role}:${prescription.exercise.exerciseId}`;
    const exercise = draft.exercises[key];
    if (
      !exercise ||
      exercise.role !== role ||
      exercise.exerciseId !== prescription.exercise.exerciseId ||
      exercise.sessionId !== session.sessionId
    ) {
      return invalid("O rascunho contém um exercício que não pertence a esta atividade.");
    }
    const dose = parseNormalizedTrainingDose(prescription.normalizedDose);
    const sets = [];
    for (const set of exercise.sets) {
      const value = parseDraftInteger(set.value);
      const leftValue = parseDraftInteger(set.leftValue);
      const rightValue = parseDraftInteger(set.rightValue);
      const directionValues: Record<string, number> = {};
      for (const [direction, rawValue] of Object.entries(set.directionValues)) {
        const parsed = parseDraftInteger(rawValue);
        if (parsed === null) return invalid("Revise os valores das séries.");
        directionValues[direction] = parsed;
      }
      if (value === null || leftValue === null || rightValue === null)
        return invalid("Revise os valores das séries.");
      sets.push({
        setNumber: set.setNumber,
        value,
        leftValue: dose.scope === "each_side" ? leftValue : set.leftValue === "" ? null : leftValue,
        rightValue:
          dose.scope === "each_side" ? rightValue : set.rightValue === "" ? null : rightValue,
        directionValues: Object.keys(directionValues).length ? directionValues : null,
        loadKg: set.loadKg.trim() || null,
      });
    }
    const command: SaveTrainingActivityExerciseCommand = {
      workspaceId: input.workspaceId,
      civilDate: input.civilDate,
      activityId: input.activityId,
      sessionId: session.sessionId,
      exerciseId: exercise.exerciseId,
      role,
      completed: exercise.completed,
      comment: exercise.comment,
      expectedRevision: null,
      sets,
    };
    const setError =
      role === "main"
        ? validateCompleteExerciseSetInput(
            command,
            prescription.sets,
            parseNormalizedTrainingDose(prescription.normalizedDose),
          )
        : sets.length
          ? invalid("Aquecimento não aceita séries.", "sets")
          : null;
    if (setError) return setError;
    const normalizedSets = [];
    for (const set of sets) {
      const load = normalizeLoad(set.loadKg, prescription.exercise.loadApplicable);
      if ("status" in load) return load;
      normalizedSets.push({ ...set, loadKg: load.value });
    }
    exercisesToSave.push({ prescription, session, role, exercise, sets: normalizedSets });
  }

  for (const [index, persisted] of persistedIntervals.entries()) {
    if (persisted.endedAt) continue;
    await transaction.trainingActivityExecutionInterval.update({
      where: { id: persisted.id },
      data: { endedAt: intervals[index]!.endedAt },
    });
  }
  await transaction.trainingActivityExecutionInterval.createMany({
    data: intervals.slice(persistedIntervals.length).map((interval) => ({
      workspaceId: input.workspaceId,
      activityId: activity.id,
      ...interval,
    })),
  });
  for (const item of exercisesToSave) {
    const existing = await transaction.trainingActivityExerciseExecution.findUnique({
      where: {
        workspaceId_activityId_exerciseDefinitionId_role: {
          workspaceId: input.workspaceId,
          activityId: activity.id,
          exerciseDefinitionId: item.prescription.id,
          role: item.role,
        },
      },
    });
    const execution = existing
      ? await transaction.trainingActivityExerciseExecution.update({
          where: { id: existing.id },
          data: {
            completedAt: item.exercise.completed ? now : null,
            comment: normalizeComment(item.exercise.comment),
            revision: { increment: 1 },
          },
        })
      : await transaction.trainingActivityExerciseExecution.create({
          data: {
            workspaceId: input.workspaceId,
            activityId: activity.id,
            trainingPlanVersionId: activity.trainingPlanVersionId!,
            sessionDefinitionId: item.session.id,
            exerciseDefinitionId: item.prescription.id,
            role: item.role,
            completedAt: item.exercise.completed ? now : null,
            comment: normalizeComment(item.exercise.comment),
          },
        });
    for (const set of item.sets) {
      const data = {
        value: set.value,
        leftValue: set.leftValue,
        rightValue: set.rightValue,
        directionValues: set.directionValues
          ? (set.directionValues as Prisma.InputJsonValue)
          : Prisma.DbNull,
        loadKg: set.loadKg,
      };
      await transaction.trainingActivitySetExecution.upsert({
        where: {
          workspaceId_exerciseExecutionId_setNumber: {
            workspaceId: input.workspaceId,
            exerciseExecutionId: execution.id,
            setNumber: set.setNumber,
          },
        },
        update: { ...data, revision: { increment: 1 } },
        create: {
          workspaceId: input.workspaceId,
          exerciseExecutionId: execution.id,
          setNumber: set.setNumber,
          ...data,
        },
      });
    }
  }
  const result = await transaction.trainingDayActivity.updateMany({
    where: activityMutationWhere(input),
    data: {
      status: "completed",
      startedAt: new Date(start),
      completedAt: now,
      actualStartMinute: saoPauloClockMinute(new Date(start)),
      actualEndMinute: saoPauloClockMinute(now),
      intensity: activity.type === "mobility" ? null : input.intensity,
      energy: activity.type === "mobility" ? null : input.energy,
      comment: normalizeComment(input.comment),
      revision: { increment: 1 },
    },
  });
  return result.count ? saved(input.expectedRevision + 1) : conflict();
}

function parseDraftInteger(value: string): number | null {
  if (value === "") return 0;
  if (!/^(0|[1-9]\d*)$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

function saoPauloClockMinute(value: Date): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(value);
  const hour = Number(parts.find((part) => part.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((part) => part.type === "minute")?.value ?? "0");
  return hour * 60 + minute;
}

async function resolveActivityPrescription(
  client: Prisma.TransactionClient,
  input: SaveTrainingActivityExerciseCommand,
): Promise<
  | Readonly<{
      activity: NonNullable<Awaited<ReturnType<typeof loadActivityForMutation>>>;
      session: NonNullable<
        NonNullable<Awaited<ReturnType<typeof loadActivityForMutation>>>["session"]
      >;
      prescription: NonNullable<
        NonNullable<
          NonNullable<Awaited<ReturnType<typeof loadActivityForMutation>>>["session"]
        >["trainingExerciseDefinition_session"][number]
      >;
    }>
  | TrainingMutationResult
> {
  const activity = await loadActivityForMutation(
    client,
    input.workspaceId,
    input.civilDate,
    input.activityId,
  );
  if (!activity) return notFound("A atividade não foi encontrada.");
  if (activity.status !== "completed") {
    return invalid("Exercícios só podem ser corrigidos depois de finalizar a atividade.");
  }
  const session = input.role === "preparation" ? activity.preparationSession : activity.session;
  if (!session || session.sessionId !== input.sessionId || session.assignmentRole !== input.role) {
    return invalid("O exercício não pertence a esta atividade.");
  }
  const prescription = session.trainingExerciseDefinition_session.find(
    (candidate) => candidate.exercise.exerciseId === input.exerciseId,
  );
  if (!prescription) return invalid("O exercício não pertence a esta sessão.");
  return { activity, session, prescription };
}

function loadActivityForMutation(
  client: Prisma.TransactionClient,
  workspaceId: string,
  civilDate: CivilDate,
  activityId: string,
) {
  return client.trainingDayActivity.findFirst({
    where: {
      id: activityId,
      workspaceId,
      civilDate: toCivilDateDatabaseValue(civilDate),
      deletedAt: null,
      role: "primary",
    },
    include: {
      session: {
        include: {
          trainingExerciseDefinition_session: { include: { exercise: true } },
        },
      },
      preparationSession: {
        include: {
          trainingExerciseDefinition_session: { include: { exercise: true } },
        },
      },
      intervals: { orderBy: { startedAt: "asc" } },
    },
  });
}

function normalizeLoad(
  value: string | null,
  loadApplicable: boolean,
): Readonly<{ value: string | null }> | TrainingMutationResult {
  if (!loadApplicable && value !== null) {
    return invalid("Este exercício não aceita carga.", "loadKg");
  }
  if (
    value !== null &&
    (!/^\d+(?:[.,]\d{1,3})?$/.test(value) || Number(value.replace(",", ".")) < 0)
  ) {
    return invalid("Informe uma carga válida.", "loadKg");
  }
  return { value: value?.replace(",", ".") ?? null };
}

function readStringIds(value: Prisma.JsonValue): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function normalizeComment(value: string | null): string | null {
  const normalized = value?.trim() ?? "";
  return normalized.length ? normalized : null;
}

function parseClockMinute(value: string): number | null {
  const match = /^(?<hour>\d{2}):(?<minute>\d{2})$/.exec(value);
  if (!match?.groups) return null;
  const hour = Number(match.groups.hour);
  const minute = Number(match.groups.minute);
  return hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59 ? hour * 60 + minute : null;
}

function mapTrainingActivity(activity: TrainingDayActivityRow): TrainingActivitySnapshot {
  return Object.freeze({
    id: activity.id,
    type: activity.type,
    source: activity.source,
    role: activity.role,
    name: activity.name,
    sport: activity.sport,
    status: activity.status,
    plannedStartMinute: activity.plannedStartMinute,
    plannedEndMinute: activity.plannedEndMinute,
    actualStartMinute: activity.actualStartMinute,
    actualEndMinute: activity.actualEndMinute,
    startedAt: activity.startedAt?.toISOString() ?? null,
    completedAt: activity.completedAt?.toISOString() ?? null,
    intensity: activity.intensity,
    energy: activity.energy,
    comment: activity.comment,
    revision: activity.revision,
    plan: activity.plan ? mapPrismaTrainingPlan(activity.plan) : null,
    session: activity.session ? mapActivitySession(activity.session) : null,
    preparationSession: activity.preparationSession
      ? mapActivitySession(activity.preparationSession)
      : null,
    exerciseExecutions: Object.freeze(
      activity.exerciseExecutions.map((execution) =>
        Object.freeze({
          id: execution.id,
          prescriptionId: execution.exerciseDefinitionId,
          sessionDatabaseId: execution.sessionDefinitionId,
          role: execution.role,
          itemStatus: execution.completedAt
            ? execution.sets.some(hasSetExecutionMeasurement)
              ? ("completed" as const)
              : ("skipped" as const)
            : ("pending" as const),
          comment: execution.comment,
          revision: execution.revision,
          sets: Object.freeze(
            execution.sets.map((set) =>
              Object.freeze({
                setNumber: set.setNumber,
                status: hasSetExecutionMeasurement(set)
                  ? ("completed" as const)
                  : ("skipped" as const),
                value: set.value,
                leftValue: set.leftValue,
                rightValue: set.rightValue,
                directionValues: parseDirectionValues(set.directionValues),
                loadKg: set.loadKg?.toString() ?? null,
                revision: set.revision,
              }),
            ),
          ),
        }),
      ),
    ),
    intervals: Object.freeze(
      activity.intervals.map((interval) =>
        Object.freeze({
          startedAt: interval.startedAt.toISOString(),
          endedAt: interval.endedAt?.toISOString() ?? null,
        }),
      ),
    ),
    preparations: Object.freeze(
      activity.preparations.map((preparation) =>
        mapTrainingActivity({
          ...preparation,
          plan: null,
          session: null,
          preparationSession: null,
          intervals: [],
          exerciseExecutions: [],
          preparations: [],
        }),
      ),
    ),
  });
}

function mapActivitySession(
  session: NonNullable<TrainingDayActivityRow["session"]>,
): TrainingSessionSnapshot {
  return Object.freeze({
    databaseId: session.id,
    sessionId: session.sessionId,
    name: session.name,
    targetDurationMinutes: session.targetDurationMinutes,
    shortDurationMinutes: session.shortDurationMinutes,
    intensity: session.intensity,
    notes: session.notes,
    assignmentRole: session.assignmentRole,
    compatiblePreparationSessionIds: readStringIds(session.compatiblePreparationSessionIds),
    exercises: Object.freeze(
      session.trainingExerciseDefinition_session.map((prescription) =>
        Object.freeze({
          prescriptionId: prescription.id,
          ordinal: prescription.ordinal,
          sets: prescription.sets,
          prescribedText: prescription.prescribedText,
          restSeconds: prescription.restSeconds,
          priority: prescription.priority,
          notes: prescription.notes,
          block: parseTrainingExerciseBlock(prescription),
          dose: parseNormalizedTrainingDose(prescription.normalizedDose),
          exercise: Object.freeze({
            exerciseId: prescription.exercise.exerciseId,
            name: prescription.exercise.namePt,
            measurementType: prescription.exercise.measurementType,
            loadApplicable: prescription.exercise.loadApplicable,
            loadUnit: prescription.exercise.loadUnit,
            instructions: readStringArrayProperty(prescription.exercise.definition, "how_to"),
            cues: readStringArrayProperty(prescription.exercise.definition, "cues"),
            risks: readNullableStringProperty(prescription.exercise.definition, "risks"),
          }),
        }),
      ),
    ),
  });
}

function validateActivitySchedule(
  input: AddTrainingActivityCommand | UpdateTrainingActivityCommand,
):
  | Readonly<{
      type: AddTrainingActivityCommand["type"];
      name: string;
      sport: string | null;
      plannedStartMinute: number;
      plannedEndMinute: number;
    }>
  | TrainingMutationResult {
  const name = input.name.trim();
  const sport = normalizeComment(input.sport);
  if (!name || name.length > 120) {
    return invalid("Informe um nome com até 120 caracteres.", "name");
  }
  if (sport && sport.length > 80) {
    return invalid("O esporte deve ter no máximo 80 caracteres.", "sport");
  }
  if ((input.type === "sport_practice" || input.type === "specific_training") && !sport) {
    return invalid("Informe o esporte relacionado à atividade.", "sport");
  }
  const plannedStartMinute = parseClockMinute(input.plannedStartTime);
  const plannedEndMinute = parseClockMinute(input.plannedEndTime);
  if (
    plannedStartMinute === null ||
    plannedEndMinute === null ||
    plannedEndMinute <= plannedStartMinute
  ) {
    return invalid("O horário planejado final deve ser posterior ao inicial.", "plannedEndTime");
  }
  return { type: input.type, name, sport, plannedStartMinute, plannedEndMinute };
}

async function resolveActivityDefinition(
  client: TrainingReadClient,
  input: AddTrainingActivityCommand | UpdateTrainingActivityCommand,
): Promise<
  | Readonly<{
      name?: string;
      trainingPlanVersionId: string | null;
      sessionDefinitionId: string | null;
      preparationSessionDefinitionId: string | null;
    }>
  | TrainingMutationResult
> {
  if (input.type !== "structured_training") {
    const sportName = input.sport;
    if (input.sessionId) {
      return invalid("Somente treino estruturado aceita uma sessão do plano.", "sessionId");
    }
    if (input.preparationSessionId !== undefined) {
      if (input.preparationSessionId === null)
        return {
          trainingPlanVersionId: null,
          sessionDefinitionId: null,
          preparationSessionDefinitionId: null,
        };
      if (input.type === "mobility")
        return invalid("Mobilidade não recebe aquecimento separado.", "preparationSessionId");
      const selectedPlan = await findActiveTrainingPlanRow(client, input.environment);
      const selectedPreparation = selectedPlan?.trainingSessionDefinition_plan.find(
        (session) =>
          session.sessionId === input.preparationSessionId &&
          session.assignmentRole === "preparation",
      );
      if (!selectedPlan || !selectedPreparation)
        return invalid("Selecione um aquecimento válido do plano ativo.", "preparationSessionId");
      return {
        trainingPlanVersionId: selectedPlan.id,
        sessionDefinitionId: null,
        preparationSessionDefinitionId: selectedPreparation.id,
      };
    }
    const plan =
      sportName && (input.type === "sport_practice" || input.type === "specific_training")
        ? await findActiveTrainingPlanRow(client, input.environment)
        : null;
    const entries =
      plan?.weeklySchedule &&
      typeof plan.weeklySchedule === "object" &&
      !Array.isArray(plan.weeklySchedule) &&
      "entries" in plan.weeklySchedule
        ? plan.weeklySchedule.entries
        : null;
    const matching = Array.isArray(entries)
      ? entries.find(
          (entry) =>
            typeof entry === "object" &&
            entry !== null &&
            "sport" in entry &&
            sportName !== null &&
            typeof entry.sport === "string" &&
            isSameTrainingSport(entry.sport, sportName) &&
            "preparation_session_id" in entry &&
            typeof entry.preparation_session_id === "string",
        )
      : null;
    const preparationId =
      matching && typeof matching === "object" && "preparation_session_id" in matching
        ? matching.preparation_session_id
        : null;
    const preparation =
      typeof preparationId === "string"
        ? plan?.trainingSessionDefinition_plan.find(
            (session) =>
              session.sessionId === preparationId && session.assignmentRole === "preparation",
          )
        : null;
    return {
      trainingPlanVersionId: preparation ? plan!.id : null,
      sessionDefinitionId: null,
      preparationSessionDefinitionId: preparation?.id ?? null,
    };
  }

  if (!input.sessionId) {
    return invalid("Selecione um treino estruturado.", "sessionId");
  }
  const plan = await findActiveTrainingPlanRow(client, input.environment);
  const session = plan?.trainingSessionDefinition_plan.find(
    (candidate) => candidate.sessionId === input.sessionId && candidate.assignmentRole === "main",
  );
  if (!plan || !session) {
    return invalid("O treino selecionado não pertence ao plano ativo.", "sessionId");
  }
  const compatiblePreparationIds = readStringIds(session.compatiblePreparationSessionIds);
  const preparation = plan.trainingSessionDefinition_plan.find(
    (candidate) =>
      candidate.assignmentRole === "preparation" &&
      compatiblePreparationIds.includes(candidate.sessionId),
  );
  return {
    name: session.name,
    trainingPlanVersionId: plan.id,
    sessionDefinitionId: session.id,
    preparationSessionDefinitionId: preparation?.id ?? null,
  };
}

function activityMutationWhere(input: {
  workspaceId: string;
  civilDate: CivilDate;
  activityId: string;
  expectedRevision: number;
}) {
  return {
    id: input.activityId,
    workspaceId: input.workspaceId,
    civilDate: toCivilDateDatabaseValue(input.civilDate),
    revision: input.expectedRevision,
    deletedAt: null,
  } as const;
}

async function conflictOrMissingActivity(
  client: TrainingReadClient,
  input: { workspaceId: string; civilDate: CivilDate; activityId: string },
): Promise<TrainingMutationResult> {
  const exists = await client.trainingDayActivity.findFirst({
    where: {
      id: input.activityId,
      workspaceId: input.workspaceId,
      civilDate: toCivilDateDatabaseValue(input.civilDate),
      deletedAt: null,
    },
    select: { id: true },
  });
  return exists ? conflict() : notFound("A atividade não foi encontrada.");
}

function validateCompleteExerciseSetInput(
  input: SaveTrainingActivityExerciseCommand,
  prescribedSetCount: number,
  dose: NormalizedTrainingDose,
): TrainingMutationResult | null {
  if (input.sets.length !== prescribedSetCount) {
    return invalid("Envie todas as séries prescritas ao salvar o exercício.", "sets");
  }
  const orderedSets = [...input.sets].sort((first, second) => first.setNumber - second.setNumber);
  if (orderedSets.some((set, index) => set.setNumber !== index + 1)) {
    return invalid("As séries devem ser únicas, consecutivas e começar em 1.", "sets");
  }
  let foundUnperformedSet = false;
  for (const set of orderedSets) {
    const performed = isSetResultPerformed(set, dose);
    if (performed && foundUnperformedSet) {
      return invalid("Uma série posterior não pode ser realizada antes da série anterior.", "sets");
    }
    if (!performed) foundUnperformedSet = true;
  }
  return null;
}

function isSetResultPerformed(
  set: SaveTrainingActivityExerciseCommand["sets"][number],
  dose: NormalizedTrainingDose,
): boolean {
  if (dose.scope === "total") return set.value > 0;
  if (dose.scope === "each_side") {
    return (set.leftValue ?? 0) > 0 && (set.rightValue ?? 0) > 0;
  }
  const requiredDirections =
    dose.scope === "two_directions"
      ? ["forward", "backward"]
      : dose.scope === "four_directions"
        ? ["flexion", "extension", "left", "right"]
        : [];
  return (
    requiredDirections.length > 0 &&
    requiredDirections.every((direction) => (set.directionValues?.[direction] ?? 0) > 0)
  );
}

function hasSetExecutionMeasurement(set: {
  value: number;
  leftValue: number | null;
  rightValue: number | null;
  directionValues: unknown;
}): boolean {
  if (set.value > 0 || (set.leftValue ?? 0) > 0 || (set.rightValue ?? 0) > 0) return true;
  const directions = parseDirectionValues(set.directionValues);
  return Object.values(directions ?? {}).some((value) => value > 0);
}

function saved(revision: number): TrainingMutationResult {
  return { status: "saved", revision };
}
function conflict(): TrainingMutationResult {
  return {
    status: "conflict",
    message: "Este registro foi alterado em outra aba. Recarregue antes de tentar novamente.",
  };
}
function invalid(message: string, field?: string): TrainingMutationResult {
  return { status: "invalid", message, ...(field ? { field } : {}) };
}
function notFound(
  message = "A programação desta data não foi encontrada.",
): TrainingMutationResult {
  return { status: "not_found", message };
}

async function executePrismaMutation(
  mutation: () => Promise<TrainingMutationResult>,
): Promise<TrainingMutationResult> {
  try {
    return await mutation();
  } catch (error) {
    const code = readErrorCode(error);
    if (code === "P2002" || code === "P2034") return conflict();
    if (code === "P2039" && readDatabaseErrorCode(error) === "23514") {
      return invalid("A gravação não atende às regras da prescrição atual.");
    }
    throw error;
  }
}

function readErrorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

function readDatabaseErrorCode(error: unknown): string | null {
  if (typeof error !== "object" || error === null || !("meta" in error)) return null;
  const meta = error.meta;
  if (typeof meta !== "object" || meta === null || !("driverAdapterError" in meta)) return null;
  const adapterError = meta.driverAdapterError;
  if (typeof adapterError !== "object" || adapterError === null || !("cause" in adapterError))
    return null;
  const cause = adapterError.cause;
  return typeof cause === "object" && cause !== null && "originalCode" in cause
    ? String(cause.originalCode)
    : null;
}

async function findActiveTrainingPlan(
  client: TrainingReadClient,
  environment: TrainingEnvironment,
): Promise<TrainingPlanSnapshot | null> {
  const activation = await client.planActivation.findFirst({
    where: {
      domain: "training",
      logicalEnvironment: environment,
      supersededAt: null,
    },
    orderBy: { activatedAt: "desc" },
    include: { trainingPlan: { include: trainingPlanInclude } },
  });

  if (!activation) {
    return null;
  }

  if (!activation.trainingPlan) {
    throw new TrainingProjectionError(
      "TRAINING_REFERENCE_INVALID",
      "A ativação de treino não referencia uma versão válida.",
    );
  }

  return mapPrismaTrainingPlan(activation.trainingPlan);
}
