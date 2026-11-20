import "server-only";
import { Prisma, type PrismaClient } from "@/generated/prisma/client";
import type { ScheduleRange } from "../application/schedule-range";
import { civilDate } from "../domain/schedule-time";

export async function readScheduleRange(
  db: PrismaClient,
  workspaceId: string,
  start: Date,
  end: Date,
): Promise<ScheduleRange> {
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || end <= start) {
    throw new RangeError("Invalid schedule range");
  }
  return db.$transaction((tx) => readRange(tx, workspaceId, start, end), {
    isolationLevel: Prisma.TransactionIsolationLevel.RepeatableRead,
  });
}

async function readRange(
  db: Prisma.TransactionClient,
  workspaceId: string,
  start: Date,
  end: Date,
): Promise<ScheduleRange> {
  const activityIds = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM agenda_activity
      WHERE workspace_id = ${workspaceId}::uuid AND removed_at IS NULL
        AND starts_at IS NOT NULL AND ends_at IS NOT NULL
        AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${start}, ${end}, '[)')
      UNION ALL
      SELECT id FROM agenda_activity
      WHERE workspace_id = ${workspaceId}::uuid AND removed_at IS NULL
        AND scheduled_date >= ${civilDate(start)}::date
        AND scheduled_date <= ${civilDate(new Date(end.getTime() - 1))}::date
    `;
  const reservationIds = await db.$queryRaw<{ id: string }[]>`
      SELECT id FROM todo_reservation
      WHERE workspace_id = ${workspaceId}::uuid AND removed_at IS NULL
        AND tstzrange(starts_at, ends_at, '[)') && tstzrange(${start}, ${end}, '[)')
    `;
  const activities = await db.agendaActivity.findMany({
    where: { workspaceId, id: { in: activityIds.map((row) => row.id) } },
    include: {
      tag: true,
      _count: {
        select: {
          children: { where: { removedAt: null } },
          reservations: { where: { removedAt: null } },
        },
      },
    },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
  });
  const reservations = await db.todoReservation.findMany({
    where: { workspaceId, id: { in: reservationIds.map((row) => row.id) } },
    include: { todo: true, parent: { select: { title: true, startsAt: true, endsAt: true } } },
    orderBy: [{ startsAt: "asc" }, { id: "asc" }],
  });
  return {
    activities: activities.map((row) => ({
      id: row.id,
      revision: row.revision,
      title: row.title,
      startsAt: row.startsAt?.toISOString() ?? null,
      endsAt: row.endsAt?.toISOString() ?? null,
      scheduledDate: row.scheduledDate?.toISOString().slice(0, 10) ?? null,
      parentActivityId: row.parentActivityId,
      colorKey: row.colorKey,
      tagId: row.tagId,
      linkedCount: row._count.children + row._count.reservations,
    })),
    reservations: reservations.map((row) => ({
      id: row.id,
      revision: row.revision,
      todoId: row.todoId,
      todoRevision: row.todo.revision,
      title: row.todo.title,
      completed: row.todo.completedAt !== null,
      startsAt: row.startsAt.toISOString(),
      endsAt: row.endsAt.toISOString(),
      parentActivityId: row.parentActivityId,
      parentTitle: row.parent?.title ?? null,
      parentStartsAt: row.parent?.startsAt?.toISOString() ?? null,
      parentEndsAt: row.parent?.endsAt?.toISOString() ?? null,
      colorKey: row.colorKey,
    })),
  };
}
