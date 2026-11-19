import "server-only";
import type { Prisma } from "@/generated/prisma/client";

type RevisionRow = { id: string; revision: number };
function snapshots(workspaceId: string, rows: readonly RevisionRow[]) {
  return rows.map((row) => ({
    workspaceId,
    entityId: row.id,
    revision: row.revision,
    snapshot: JSON.parse(JSON.stringify(row)),
  }));
}
export async function recordTodoRows(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  rows: readonly Prisma.TodoGetPayload<object>[],
) {
  if (rows.length) await tx.todoRevision.createMany({ data: snapshots(workspaceId, rows) });
}
export async function recordReservationRows(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  rows: readonly Prisma.TodoReservationGetPayload<object>[],
) {
  if (rows.length)
    await tx.todoReservationRevision.createMany({ data: snapshots(workspaceId, rows) });
}
export async function recordActivityRows(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  rows: readonly Prisma.AgendaActivityGetPayload<object>[],
) {
  if (rows.length)
    await tx.agendaActivityRevision.createMany({ data: snapshots(workspaceId, rows) });
}
export async function touchActivityParents(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  ids: readonly string[],
) {
  if (!ids.length) return;
  const rows = await tx.agendaActivity.updateManyAndReturn({
    where: { workspaceId, id: { in: [...new Set(ids)].sort() } },
    data: { revision: { increment: 1 } },
  });
  await tx.agendaActivityRevision.createMany({ data: snapshots(workspaceId, rows) });
}

export async function recordTodo(tx: Prisma.TransactionClient, workspaceId: string, id: string) {
  const row = await tx.todo.findUniqueOrThrow({ where: { workspaceId_id: { workspaceId, id } } });
  await tx.todoRevision.create({
    data: {
      workspaceId,
      entityId: id,
      revision: row.revision,
      snapshot: JSON.parse(JSON.stringify(row)),
    },
  });
}

export async function recordActivity(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  id: string,
) {
  const row = await tx.agendaActivity.findUniqueOrThrow({
    where: { workspaceId_id: { workspaceId, id } },
  });
  await tx.agendaActivityRevision.create({
    data: {
      workspaceId,
      entityId: id,
      revision: row.revision,
      snapshot: JSON.parse(JSON.stringify(row)),
    },
  });
}

export async function recordReservation(
  tx: Prisma.TransactionClient,
  workspaceId: string,
  id: string,
) {
  const row = await tx.todoReservation.findUniqueOrThrow({
    where: { workspaceId_id: { workspaceId, id } },
  });
  await tx.todoReservationRevision.create({
    data: {
      workspaceId,
      entityId: id,
      revision: row.revision,
      snapshot: JSON.parse(JSON.stringify(row)),
    },
  });
}
