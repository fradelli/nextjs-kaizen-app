import "server-only";

import { getDatabaseClient } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";
import { resolveFixedWorkspace } from "@/lib/security/workspace";
import { getPublicTrainingPlan } from "../application/get-public-training-plan";
import { getTrainingDay } from "../application/get-training-day";
import { getTrainingWeek } from "../application/get-training-week";
import type {
  PublicTrainingPlanDto,
  TrainingDayDto,
  TrainingDayPageQueryResult,
} from "../application/training-dto";
import { TrainingProjectionError } from "../domain/training-projection.error";
import { PrismaTrainingRepository } from "./prisma-training-repository";

export async function queryPublicTrainingPlan(): Promise<PublicTrainingPlanDto> {
  const environment = getServerEnvironment();

  return getPublicTrainingPlan({
    repository: new PrismaTrainingRepository(getDatabaseClient()),
    environment: environment.APP_ENV,
  });
}

export async function queryFixedWorkspaceTrainingDay(civilDate: string): Promise<TrainingDayDto> {
  const environment = getServerEnvironment();

  return getTrainingDay(
    {
      repository: new PrismaTrainingRepository(getDatabaseClient()),
      environment: environment.APP_ENV,
      resolveWorkspace: resolveFixedWorkspace,
    },
    { civilDate },
  );
}

export async function queryFixedWorkspaceTrainingWeek(civilDate: string) {
  const environment = getServerEnvironment();
  return getTrainingWeek(
    {
      repository: new PrismaTrainingRepository(getDatabaseClient(), environment.APP_ENV),
      environment: environment.APP_ENV,
      resolveWorkspace: resolveFixedWorkspace,
    },
    { civilDate },
  );
}

export async function queryFixedWorkspaceTrainingDayPage(
  civilDate: string,
): Promise<TrainingDayPageQueryResult> {
  try {
    return { status: "ready", day: await queryFixedWorkspaceTrainingDay(civilDate) };
  } catch (error) {
    return trainingProjectionFailure(error);
  }
}

export async function queryFixedWorkspaceTrainingWeekPage(civilDate: string) {
  try {
    return { status: "ready" as const, week: await queryFixedWorkspaceTrainingWeek(civilDate) };
  } catch (error) {
    return trainingProjectionFailure(error);
  }
}

function trainingProjectionFailure(
  error: unknown,
): Extract<TrainingDayPageQueryResult, { status: "invalid_data" }> {
  if (error instanceof TrainingProjectionError) {
    if (error.code === "TRAINING_DEFINITION_INVALID") {
      return { status: "invalid_data", reason: "definition_invalid" };
    }

    if (error.code === "TRAINING_REFERENCE_INVALID") {
      return { status: "invalid_data", reason: "reference_invalid" };
    }
  }

  throw error;
}
