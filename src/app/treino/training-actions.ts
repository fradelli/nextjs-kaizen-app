"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import {
  addTrainingActivity,
  controlTrainingActivity,
  deleteTrainingActivity,
  saveTrainingActivityExercise,
  updateTrainingActivity,
} from "@/features/training/application/mutate-training-day";
import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import type { TrainingMutationResult } from "@/features/training/application/training-mutation.types";
import type { TrainingActionState } from "@/features/training/ui/training-action.types";
import { PrismaTrainingRepository } from "@/features/training/data/prisma-training-repository";
import { getDatabaseClient } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";
import { assertSameOriginRequest, InvalidRequestOriginError } from "@/lib/security/request-origin";
import { resolveFixedWorkspace } from "@/lib/security/workspace";

const activitySchema = z.object({
  civilDate: z.iso.date(),
  type: z.enum(["structured_training", "sport_practice", "specific_training", "mobility"]),
  name: z.string().trim().min(1).max(120),
  sport: z.preprocess(nullableFormValue, z.string().trim().max(80).nullable()),
  sessionId: z.preprocess(nullableFormValue, z.string().min(1).nullable()),
  preparationSessionId: z.preprocess(
    (value) =>
      value === "automatic" ? undefined : value === "none" || value === "" ? null : value,
    z.string().min(1).nullable().optional(),
  ),
  plannedStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  plannedEndTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
});
const activityControlSchema = z.object({
  civilDate: z.iso.date(),
  activityId: z.uuid(),
  action: z.enum(["complete", "record_completed", "update_feedback"]),
  intensity: z.preprocess(nullableFormValue, z.enum(["low", "moderate", "high"]).nullable()),
  energy: z.preprocess(nullableFormValue, z.enum(["tired", "normal", "energized"]).nullable()),
  comment: z.preprocess(nullableFormValue, z.string().max(1000).nullable()),
  expectedRevision: z.coerce.number().int().nonnegative(),
  executionDraft: z.preprocess(
    parseJsonFormValue,
    z
      .object({
        version: z.literal(1),
        activityId: z.uuid(),
        civilDate: z.iso.date(),
        expectedRevision: z.number().int().nonnegative(),
        status: z.enum(["in_progress", "paused"]),
        startedAt: z.iso.datetime({ offset: true }),
        intervals: z
          .array(
            z.object({
              startedAt: z.iso.datetime({ offset: true }),
              endedAt: z.iso.datetime({ offset: true }).nullable(),
            }),
          )
          .min(1)
          .max(100),
        exercises: z.record(
          z.string(),
          z.object({
            sessionId: z.string().min(1),
            exerciseId: z.string().min(1),
            role: z.enum(["main", "preparation"]),
            completed: z.boolean(),
            comment: z.string().max(1000),
            sets: z
              .array(
                z.object({
                  setNumber: z.number().int().positive(),
                  value: z.string().max(16),
                  leftValue: z.string().max(16),
                  rightValue: z.string().max(16),
                  directionValues: z.record(z.string(), z.string().max(16)),
                  loadKg: z.string().max(32),
                }),
              )
              .max(100),
          }),
        ),
      })
      .nullable()
      .optional()
      .transform((value) => value ?? null),
  ),
});
const activityExerciseSchema = z.object({
  civilDate: z.iso.date(),
  activityId: z.uuid(),
  sessionId: z.string().min(1),
  exerciseId: z.string().min(1),
  role: z.enum(["main", "preparation", "mobility"]),
  completed: z.preprocess((value) => value === "true", z.boolean()),
  comment: z.preprocess(nullableFormValue, z.string().max(1000).nullable()),
  expectedRevision: z.preprocess(
    nullableFormValue,
    z.coerce.number().int().nonnegative().nullable(),
  ),
  sets: z.preprocess(
    parseJsonFormValue,
    z.array(
      z.object({
        setNumber: z.number().int().positive(),
        value: z.number().int().nonnegative(),
        leftValue: z.number().int().nonnegative().nullable(),
        rightValue: z.number().int().nonnegative().nullable(),
        directionValues: z.record(z.string(), z.number().int().nonnegative()).nullable(),
        loadKg: z.string().max(32).nullable(),
      }),
    ),
  ),
});
const existingActivitySchema = activitySchema.extend({
  targetCivilDate: z.iso.date().optional(),
  activityId: z.uuid(),
  expectedRevision: z.coerce.number().int().nonnegative(),
});
const deleteActivitySchema = z.object({
  civilDate: z.iso.date(),
  activityId: z.uuid(),
  expectedRevision: z.coerce.number().int().nonnegative(),
});

export async function addTrainingActivityAction(
  _previous: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  return executeMutation(activitySchema, formData, (input) =>
    addTrainingActivity(dependencies(), { ...input, environment: getServerEnvironment().APP_ENV }),
  );
}

export async function updateTrainingActivityAction(
  _previous: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  return executeMutation(existingActivitySchema, formData, (input) =>
    updateTrainingActivity(dependencies(), {
      ...input,
      environment: getServerEnvironment().APP_ENV,
    }),
  );
}

export async function controlTrainingActivityAction(
  _previous: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  return executeMutation(activityControlSchema, formData, (input) =>
    controlTrainingActivity(dependencies(), input),
  );
}

export async function saveTrainingActivityExerciseAction(
  _previous: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  return executeMutation(activityExerciseSchema, formData, (input) =>
    saveTrainingActivityExercise(dependencies(), input),
  );
}

export async function deleteTrainingActivityAction(
  _previous: TrainingActionState,
  formData: FormData,
): Promise<TrainingActionState> {
  return executeMutation(deleteActivitySchema, formData, (input) =>
    deleteTrainingActivity(dependencies(), input),
  );
}

async function executeMutation<Schema extends z.ZodType<Record<string, unknown>>>(
  schema: Schema,
  formData: FormData,
  mutation: (input: z.output<Schema>) => Promise<TrainingMutationResult>,
): Promise<TrainingActionState> {
  try {
    assertSameOriginRequest(await headers());
  } catch (error) {
    if (error instanceof InvalidRequestOriginError) {
      return { status: "invalid", message: error.message };
    }
    throw error;
  }
  if (formData.has("workspaceId") || formData.has("workspace_id")) {
    return { status: "invalid", message: "O workspace é resolvido exclusivamente pelo servidor." };
  }
  const parsed = schema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      status: "invalid",
      message: "Revise os campos informados e tente novamente.",
      ...(issue?.path[0] ? { field: String(issue.path[0]) } : {}),
    };
  }
  const dateResolution = resolveTrainingDayDate({ rawDate: String(parsed.data.civilDate) });
  if (dateResolution.status === "invalid") {
    return {
      status: "invalid",
      message:
        dateResolution.reason === "future_date_out_of_range"
          ? `Só é possível alterar a programação até ${dateResolution.maximumFutureDate}.`
          : "A data informada é inválida.",
      field: "civilDate",
    };
  }
  const result = await mutation(parsed.data);
  if (result.status === "saved") revalidatePath("/treino");
  return result;
}

function dependencies() {
  return {
    repository: new PrismaTrainingRepository(getDatabaseClient()),
    resolveWorkspace: resolveFixedWorkspace,
  };
}

function nullableFormValue(value: unknown): unknown {
  return value === "" || value === undefined ? null : value;
}

function parseJsonFormValue(value: unknown): unknown {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
