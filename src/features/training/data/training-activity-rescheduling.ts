import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { toCivilDateDatabaseValue } from "../domain/training-day.rules";
import type { CivilDate } from "../domain/training-day.types";

export const activityScheduleInclude = {
  session: true,
  preparationSession: true,
  preparations: {
    where: { deletedAt: null },
  },
} satisfies Prisma.TrainingDayActivityInclude;

type ActivityScheduleRow = Prisma.TrainingDayActivityGetPayload<{
  include: typeof activityScheduleInclude;
}>;

export async function recordTrainingActivityReschedule(
  transaction: Prisma.TransactionClient,
  original: ActivityScheduleRow,
  targetDate: CivilDate,
): Promise<void> {
  // A deleted source marker prevents automatic planning from recreating the moved activity.
  // The real activity retains its ID; the legacy assignment stays associated with its source date.
  await transaction.trainingDayActivity.create({
    data: {
      workspaceId: original.workspaceId,
      civilDate: original.civilDate,
      type: original.type,
      source: original.source,
      role: "primary",
      name: original.name,
      sport: original.sport,
      assignmentId: original.assignmentId,
      trainingPlanVersionId: original.trainingPlanVersionId,
      sessionDefinitionId: original.sessionDefinitionId,
      preparationSessionDefinitionId: original.preparationSessionDefinitionId,
      plannedStartMinute: original.plannedStartMinute,
      plannedEndMinute: original.plannedEndMinute,
      deletedAt: new Date(),
    },
  });
  await transaction.trainingDayActivity.updateMany({
    where: { workspaceId: original.workspaceId, parentActivityId: original.id, deletedAt: null },
    data: { civilDate: toCivilDateDatabaseValue(targetDate), revision: { increment: 1 } },
  });
}
