import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { getDatabaseClient } from "@/lib/db/client";
import { getServerEnvironment } from "@/lib/env/server";
import { resolveFixedWorkspace } from "@/lib/security/workspace";
import { parseCivilDate, toCivilDateString } from "../domain/training-day.rules";
import { projectTrainingCalendarActivity } from "../application/project-training-calendar-activity";
import type { TrainingCalendarDayDto } from "../application/training-calendar-dto";
import {
  loadActiveTrainingPlanForSchedule,
  readScheduledTrainingDay,
} from "./ensure-scheduled-training-day";

export async function queryTrainingCalendar(civilDate: string, count = 7, alignWeek = true) {
  const parsed = parseCivilDate(civilDate);
  if (!Number.isInteger(count) || count < 1 || count > 14)
    throw new RangeError("Invalid day count");
  const start = new Date(parsed + "T00:00:00Z");
  if (alignWeek && count === 7) start.setUTCDate(start.getUTCDate() - start.getUTCDay());
  const dates = Array.from({ length: count }, (_, offset) =>
    toCivilDateString(new Date(start.getTime() + offset * 86_400_000)),
  );
  const { workspaceId } = resolveFixedWorkspace();
  const environment = getServerEnvironment().APP_ENV;
  const days = await getDatabaseClient().$transaction(
    async (tx) => {
      const plan = await loadActiveTrainingPlanForSchedule(tx, environment);
      const persisted = await tx.trainingDayActivity.findMany({
        where: {
          workspaceId,
          civilDate: { gte: start, lt: new Date(start.getTime() + count * 86_400_000) },
          deletedAt: null,
          role: "primary",
        },
        select: {
          id: true,
          civilDate: true,
          type: true,
          name: true,
          status: true,
          revision: true,
          plannedStartMinute: true,
          plannedEndMinute: true,
          actualStartMinute: true,
          actualEndMinute: true,
          intervals: { select: { startedAt: true, endedAt: true }, orderBy: { startedAt: "asc" } },
        },
        orderBy: [{ plannedStartMinute: "asc" }, { createdAt: "asc" }, { id: "asc" }],
      });
      const assignments = await tx.dailyTrainingAssignment.findMany({
        where: {
          workspaceId,
          civilDate: { gte: start, lt: new Date(start.getTime() + count * 86_400_000) },
        },
        select: { civilDate: true, kind: true, reason: true },
      });
      const result: TrainingCalendarDayDto[] = [];
      for (const date of dates) {
        const projected = await readScheduledTrainingDay(
          tx,
          { workspaceId, civilDate: date, environment },
          new Date(),
          plan,
        );
        const assignment = assignments.find(
          (row) => row.civilDate.toISOString().slice(0, 10) === date,
        );
        const activities = persisted
          .filter((row) => row.civilDate.toISOString().slice(0, 10) === date)
          .map((row) =>
            projectTrainingCalendarActivity({
              ...row,
              intervals: row.intervals.map((interval) => ({
                startedAt: interval.startedAt.toISOString(),
                endedAt: interval.endedAt?.toISOString() ?? null,
              })),
            }),
          );
        for (const row of projected?.activities ?? [])
          activities.push(
            projectTrainingCalendarActivity({
              id: row.id,
              type: row.type,
              name: row.name,
              status: "scheduled",
              revision: 0,
              plannedStartMinute: row.plannedStartMinute ?? null,
              plannedEndMinute: row.plannedEndMinute ?? null,
              actualStartMinute: null,
              actualEndMinute: null,
              intervals: [],
            }),
          );
        activities.sort(
          (a, b) =>
            (a.plannedStartTime ?? "24:00").localeCompare(b.plannedStartTime ?? "24:00") ||
            a.id.localeCompare(b.id),
        );
        result.push({
          state: "ready",
          civilDate: date,
          hasActivePlan: plan !== null,
          plannedRestReason:
            assignment?.kind === "rest"
              ? assignment.reason
              : (projected?.assignment.reason ?? null),
          activities,
        });
      }
      return result;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead, timeout: 15_000 },
  );
  return { startDate: dates[0]!, endDate: dates.at(-1)!, days };
}
