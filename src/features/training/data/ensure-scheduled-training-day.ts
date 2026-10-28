import "server-only";
import { isTrainingExecutionDateEditable } from "../domain/training-edit-window";

import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import { z } from "zod";

import type { FindTrainingDayInput } from "../application/training-repository";
import { resolveTrainingDayDate } from "../application/resolve-training-day-date";
import { toCivilDateDatabaseValue } from "../domain/training-day.rules";
import { TrainingProjectionError } from "../domain/training-projection.error";
import {
  legacyScheduledEntriesForDate,
  scheduledEntriesForDate,
} from "../domain/training-weekly-schedule";
import type {
  LegacyTrainingWeeklyScheduleEntry,
  TrainingWeeklyScheduleEntry,
} from "../domain/training-weekly-schedule.types";
import { trainingPlanInclude } from "./prisma-training-repository.types";

const clockSchema = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const scheduleEntrySchema = z.object({
  day: z.enum(["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]),
  time: clockSchema.nullable(),
  session: z.string().min(1),
});
const legacyScheduleSchema = z.object({
  weekend_game: z.object({
    enabled: z.boolean(),
    day: z.enum(["saturday", "sunday"]).nullable(),
    start_time: clockSchema.nullable(),
  }),
  planning_defaults: z.object({ footvolley_duration_minutes: z.number().int().min(1).max(720) }),
  models: z.object({
    saturday_game: z.array(scheduleEntrySchema),
    sunday_game: z.array(scheduleEntrySchema),
  }),
});
const weeklyEntrySchema = z.object({
  day: scheduleEntrySchema.shape.day,
  type: z.enum(["structured_training", "specific_training", "sport_practice", "mobility", "rest"]),
  start_time: clockSchema.nullable(),
  end_time: clockSchema.nullable(),
  session_id: z.string().min(1).optional(),
  preparation_session_id: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  sport: z.string().min(1).optional(),
});
const weeklyScheduleSchema = z.object({
  schema_version: z.literal("2.0.0"),
  entries: z.array(weeklyEntrySchema),
});
const persistedScheduleSchema = z.union([weeklyScheduleSchema, legacyScheduleSchema]);

type ActiveTrainingPlan = NonNullable<
  NonNullable<Awaited<ReturnType<typeof loadActiveTrainingPlanForSchedule>>>
>;
type ScheduledActivityInput = Prisma.TrainingDayActivityUncheckedCreateInput;

export async function ensureScheduledTrainingDay(
  client: PrismaClient,
  input: FindTrainingDayInput,
  now: Date = new Date(),
): Promise<void> {
  const dateResolution = resolveTrainingDayDate({ rawDate: input.civilDate, now });
  if (
    dateResolution.status !== "valid" ||
    (input.civilDate < dateResolution.todayDate &&
      !isTrainingExecutionDateEditable(input.civilDate, now))
  )
    return;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      await client.$transaction(
        (transaction) => ensureScheduledTrainingDayInTransaction(transaction, input),
        { isolationLevel: Prisma.TransactionIsolationLevel.Serializable },
      );
      return;
    } catch (error) {
      if (isConcurrentMaterialization(error) && attempt < 2) continue;
      throw error;
    }
  }
}

export async function ensureScheduledTrainingDayInTransaction(
  transaction: Prisma.TransactionClient,
  input: FindTrainingDayInput,
): Promise<void> {
  const civilDate = toCivilDateDatabaseValue(input.civilDate);
  const existingAssignment = await transaction.dailyTrainingAssignment.findUnique({
    where: { workspaceId_civilDate: { workspaceId: input.workspaceId, civilDate } },
    select: { id: true },
  });
  if (existingAssignment) return;

  // Include logically deleted rows: an intentional deletion must not recreate the plan.
  const existingActivity = await transaction.trainingDayActivity.findFirst({
    where: { workspaceId: input.workspaceId, civilDate },
    select: { id: true },
  });
  if (existingActivity) return;

  const plan = await loadActiveTrainingPlanForSchedule(transaction, input.environment);
  if (!plan) return;
  if (!plan.weeklySchedule) return;

  const parsed = persistedScheduleSchema.safeParse(plan.weeklySchedule);
  if (!parsed.success) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "A agenda semanal importada está inválida.",
    );
  }
  const weeklySchedule = "entries" in parsed.data ? parsed.data : null;
  const legacySchedule = "models" in parsed.data ? parsed.data : null;
  const modern = Boolean(weeklySchedule);
  const entries = weeklySchedule
    ? scheduledEntriesForDate(weeklySchedule, input.civilDate)
    : legacyScheduledEntriesForDate(legacySchedule!, input.civilDate);
  if (!entries) return;
  if (!entries.length) {
    if (modern) return;
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "A agenda semanal não define esta data.",
    );
  }
  const restEntry = entries.find((entry) =>
    "type" in entry ? entry.type === "rest" : isRestEntry(entry.session),
  );
  if (restEntry && entries.length !== 1) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "Descanso não pode coexistir com treino programado.",
    );
  }
  const plannedActivities = restEntry
    ? []
    : weeklySchedule
      ? scheduledEntriesForDate(weeklySchedule, input.civilDate).map((entry) =>
          buildWeeklyActivity(input.workspaceId, civilDate, plan, entry),
        )
      : (legacyScheduledEntriesForDate(legacySchedule!, input.civilDate) ?? []).map((entry) =>
          buildPlannedActivity(
            input.workspaceId,
            civilDate,
            plan,
            entry,
            legacySchedule!.planning_defaults.footvolley_duration_minutes,
          ),
        );

  await transaction.dailyTrainingAssignment.create({
    data: {
      workspaceId: input.workspaceId,
      civilDate,
      kind: restEntry ? "rest" : "unassigned",
      reason:
        restEntry && "session" in restEntry && restEntry.session === "rest_or_light_mobility"
          ? "Descanso ou mobilidade leve"
          : restEntry
            ? "Descanso previsto no plano semanal"
            : null,
    },
  });
  for (const activity of plannedActivities) {
    const created = await transaction.trainingDayActivity.create({ data: activity });
    if ((activity.type === "specific_training" || activity.type === "sport_practice") && !modern) {
      await transaction.trainingDayActivity.create({
        data: {
          workspaceId: input.workspaceId,
          civilDate,
          type: "mobility",
          source: "plan",
          role: "preparation",
          parentActivityId: created.id,
          name: "Aquecimento de futevôlei",
          sport: "Futevôlei",
          plannedStartMinute:
            typeof activity.plannedStartMinute !== "number"
              ? null
              : Math.max(0, activity.plannedStartMinute - 10),
          plannedEndMinute: activity.plannedStartMinute ?? null,
          trainingPlanVersionId: plan.id,
        },
      });
    }
  }
}

async function loadActiveTrainingPlanForSchedule(
  client: Prisma.TransactionClient,
  environment: FindTrainingDayInput["environment"],
) {
  const activation = await client.planActivation.findFirst({
    where: { domain: "training", logicalEnvironment: environment, supersededAt: null },
    orderBy: { activatedAt: "desc" },
    include: { trainingPlan: { include: trainingPlanInclude } },
  });
  return activation?.trainingPlan ?? null;
}

function buildPlannedActivity(
  workspaceId: string,
  civilDate: Date,
  plan: ActiveTrainingPlan,
  entry: LegacyTrainingWeeklyScheduleEntry,
  footvolleyDurationMinutes: number,
): ScheduledActivityInput {
  const plannedStartMinute = entry.time === null ? null : parseClockMinute(entry.time);
  if (entry.session === "footvolley" || entry.session === "footvolley_only") {
    const plannedEndMinute =
      plannedStartMinute === null ? null : plannedStartMinute + footvolleyDurationMinutes;
    if (plannedEndMinute !== null && plannedEndMinute > 1440) {
      throw new TrainingProjectionError(
        "TRAINING_DEFINITION_INVALID",
        "O treino de futevôlei planejado ultrapassa o fim da data civil.",
      );
    }
    return {
      workspaceId,
      civilDate,
      type: "specific_training",
      source: "plan",
      name: "Treino de futevôlei",
      sport: "Futevôlei",
      plannedStartMinute,
      plannedEndMinute,
      trainingPlanVersionId: plan.id,
    };
  }
  if (entry.session === "game") {
    return {
      workspaceId,
      civilDate,
      type: "sport_practice",
      source: "plan",
      name: "Jogo de futevôlei",
      sport: "Futevôlei",
      plannedStartMinute,
      plannedEndMinute: null,
      trainingPlanVersionId: plan.id,
    };
  }
  const session = plan.trainingSessionDefinition_plan.find(
    (candidate) => candidate.sessionId === entry.session && candidate.assignmentRole === "main",
  );
  if (!session || plannedStartMinute === null) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      `A sessão ${entry.session} não corresponde ao plano ativo ou está sem horário.`,
    );
  }
  const plannedEndMinute = plannedStartMinute + session.targetDurationMinutes;
  if (plannedEndMinute > 1440) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "A sessão planejada ultrapassa o fim da data civil.",
    );
  }
  const preparationIds = Array.isArray(session.compatiblePreparationSessionIds)
    ? session.compatiblePreparationSessionIds
    : [];
  const preparation = plan.trainingSessionDefinition_plan.find(
    (candidate) =>
      candidate.assignmentRole === "preparation" && preparationIds.includes(candidate.sessionId),
  );
  return {
    workspaceId,
    civilDate,
    type: "structured_training",
    source: "plan",
    name: session.name,
    plannedStartMinute,
    plannedEndMinute,
    trainingPlanVersionId: plan.id,
    sessionDefinitionId: session.id,
    preparationSessionDefinitionId: preparation?.id ?? null,
  };
}

function buildWeeklyActivity(
  workspaceId: string,
  civilDate: Date,
  plan: ActiveTrainingPlan,
  entry: TrainingWeeklyScheduleEntry,
): ScheduledActivityInput {
  if (entry.type === "rest") {
    throw new TrainingProjectionError("TRAINING_DEFINITION_INVALID", "Descanso não é atividade.");
  }
  const start = entry.start_time === null ? null : parseClockMinute(entry.start_time);
  const end = entry.end_time === null ? null : parseClockMinute(entry.end_time);
  const session = entry.session_id
    ? plan.trainingSessionDefinition_plan.find(
        (item) => item.sessionId === entry.session_id && item.assignmentRole === "main",
      )
    : null;
  const preparationId =
    entry.preparation_session_id ??
    (Array.isArray(session?.compatiblePreparationSessionIds)
      ? session.compatiblePreparationSessionIds[0]
      : undefined);
  const preparation = preparationId
    ? plan.trainingSessionDefinition_plan.find(
        (item) => item.sessionId === preparationId && item.assignmentRole === "preparation",
      )
    : null;
  if (
    start === null ||
    (end !== null && end <= start) ||
    (entry.type === "structured_training" && !session) ||
    (preparationId && !preparation) ||
    (preparationId && entry.type === "mobility") ||
    (entry.type !== "structured_training" && (!entry.name || end === null))
  ) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "A atividade semanal está incompleta ou referencia uma sessão inválida.",
    );
  }
  const plannedEndMinute = end ?? start + session!.targetDurationMinutes;
  if (plannedEndMinute > 1440) {
    throw new TrainingProjectionError(
      "TRAINING_DEFINITION_INVALID",
      "A atividade planejada ultrapassa o fim da data civil.",
    );
  }
  return {
    workspaceId,
    civilDate,
    type: entry.type,
    source: "plan",
    name: session?.name ?? entry.name!,
    sport: entry.sport ?? null,
    plannedStartMinute: start,
    plannedEndMinute,
    trainingPlanVersionId: plan.id,
    sessionDefinitionId: session?.id ?? null,
    preparationSessionDefinitionId: preparation?.id ?? null,
  };
}

function parseClockMinute(clock: string): number {
  const [hours, minutes] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}

function isRestEntry(session: string): boolean {
  return session === "rest" || session === "rest_or_light_mobility";
}

function isConcurrentMaterialization(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error.code === "P2002" || error.code === "P2034")
  );
}
