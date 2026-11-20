import { roundUpToQuarterHour } from "../domain/training-schedule-time";
import "server-only";
import { createHash } from "node:crypto";
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
    input.civilDate > dateResolution.maximumFutureDate ||
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

export async function readScheduledTrainingDay(
  transaction: Prisma.TransactionClient,
  input: FindTrainingDayInput,
  now: Date = new Date(),
  activePlan?: ActiveTrainingPlan | null,
) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  if (input.civilDate < today && !isTrainingExecutionDateEditable(input.civilDate, now)) return;
  return loadScheduledTrainingDay(transaction, input, activePlan);
}

async function loadScheduledTrainingDay(
  transaction: Prisma.TransactionClient,
  input: FindTrainingDayInput,
  activePlan?: ActiveTrainingPlan | null,
) {
  const civilDate = toCivilDateDatabaseValue(input.civilDate);
  const existingAssignment = await transaction.dailyTrainingAssignment.findUnique({
    where: { workspaceId_civilDate: { workspaceId: input.workspaceId, civilDate } },
    select: { id: true },
  });
  if (existingAssignment) return;

  const plan =
    activePlan === undefined
      ? await loadActiveTrainingPlanForSchedule(transaction, input.environment)
      : activePlan;
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

  const activities = plannedActivities.map((activity, ordinal) => {
    const hash = createHash("sha256")
      .update(JSON.stringify([input.workspaceId, input.civilDate, plan.id, ordinal]))
      .digest("hex");
    const id = `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
    return { ...activity, id };
  });
  // Include tombstones so a removed occurrence stays absent on the next visit.
  const existing = await transaction.trainingDayActivity.findMany({
    where: { workspaceId: input.workspaceId, id: { in: activities.map((item) => item.id) } },
    select: { id: true },
  });
  const persistedIds = new Set(existing.map((item) => item.id));
  return {
    plan,
    legacy: !modern,
    activities: activities.filter((item) => !persistedIds.has(item.id)),
    assignment: {
      workspaceId: input.workspaceId,
      civilDate,
      kind: restEntry ? ("rest" as const) : ("unassigned" as const),
      reason:
        restEntry && "session" in restEntry && restEntry.session === "rest_or_light_mobility"
          ? "Descanso ou mobilidade leve"
          : restEntry
            ? "Descanso previsto no plano semanal"
            : null,
    },
  };
}

export async function ensureScheduledTrainingDayInTransaction(
  transaction: Prisma.TransactionClient,
  input: FindTrainingDayInput,
): Promise<void> {
  const existing = await transaction.trainingDayActivity.findFirst({
    where: { workspaceId: input.workspaceId, civilDate: toCivilDateDatabaseValue(input.civilDate) },
    select: { id: true },
  });
  if (existing) return;
  const schedule = await loadScheduledTrainingDay(transaction, input);
  if (!schedule) return;
  await transaction.dailyTrainingAssignment.create({ data: schedule.assignment });
  for (const data of schedule.activities) {
    const created = await transaction.trainingDayActivity.create({ data });
    if (schedule.legacy && (data.type === "specific_training" || data.type === "sport_practice")) {
      await transaction.trainingDayActivity.create({
        data: {
          workspaceId: input.workspaceId,
          civilDate: toCivilDateDatabaseValue(input.civilDate),
          type: "mobility",
          source: "plan",
          role: "preparation",
          parentActivityId: created.id,
          name: "Aquecimento de futevôlei",
          sport: "Futevôlei",
          plannedStartMinute:
            typeof data.plannedStartMinute === "number"
              ? Math.max(0, data.plannedStartMinute - 15)
              : null,
          plannedEndMinute: data.plannedStartMinute ?? null,
          trainingPlanVersionId: schedule.plan.id,
        },
      });
    }
  }
}

export async function loadActiveTrainingPlanForSchedule(
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
  const scheduledStart = entry.time === null ? null : parseClockMinute(entry.time);
  const plannedStartMinute = scheduledStart === null ? null : roundUpToQuarterHour(scheduledStart);
  if (entry.session === "footvolley" || entry.session === "footvolley_only") {
    const plannedEndMinute =
      plannedStartMinute === null
        ? null
        : plannedStartMinute + roundUpToQuarterHour(footvolleyDurationMinutes);
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
  const plannedEndMinute = plannedStartMinute + roundUpToQuarterHour(session.targetDurationMinutes);
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
  const plannedStartMinute = roundUpToQuarterHour(start);
  const plannedEndMinute =
    plannedStartMinute +
    roundUpToQuarterHour(end === null ? session!.targetDurationMinutes : end - start);
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
    plannedStartMinute,
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
