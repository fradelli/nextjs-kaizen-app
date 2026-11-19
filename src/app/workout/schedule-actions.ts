"use server";

import { headers } from "next/headers";
import { scheduleCommandSchema } from "@/features/schedule/application/schedule-command";
import { readScheduleMutationPatch } from "@/features/schedule/data/read-schedule-mutation-patch";
import { getDatabaseClient } from "@/lib/db/client";
import { resolveFixedWorkspace } from "@/lib/security/workspace";
import { assertSameOriginRequest, InvalidRequestOriginError } from "@/lib/security/request-origin";
import { PrismaScheduleRepository } from "@/features/schedule/data/prisma-schedule-repository";
import type { ScheduleResult } from "@/features/schedule/application/schedule-command";
import { z } from "zod";
import { readTodoLists, readTodos } from "@/features/schedule/data/read-todo-lists";

export async function mutateScheduleAction(
  input: unknown,
  cachedDates: string[] = [],
): Promise<ScheduleResult> {
  try {
    assertSameOriginRequest(await headers());
  } catch (error) {
    if (error instanceof InvalidRequestOriginError)
      return { status: "invalid", code: "invalid_origin" };
    throw error;
  }
  const dates = z.array(z.iso.date()).max(84).parse(cachedDates);
  const { workspaceId } = resolveFixedWorkspace();
  const mutationStarted = performance.now();
  const result = await new PrismaScheduleRepository(getDatabaseClient(), workspaceId).execute(
    input,
  );
  const mutationMs = Math.round(performance.now() - mutationStarted);
  const parsed = scheduleCommandSchema.safeParse(input);
  if (!parsed.success) return result;
  const command = parsed.data;
  if (result.status !== "saved") {
    if (result.status !== "conflict" && result.status !== "missing") return result;
    const id =
      "todoId" in command
        ? command.todoId
        : "listId" in command
          ? command.listId
          : "activityId" in command
            ? command.activityId
            : "tagId" in command
              ? command.tagId
              : "reservationId" in command
                ? command.reservationId
                : "";
    if (!id) return result;
    return {
      ...result,
      patch: await readScheduleMutationPatch(
        getDatabaseClient(),
        workspaceId,
        command,
        {
          id,
          affectedDates: dates,
          affectedTodoIds: "todoId" in command ? [command.todoId] : [],
          affectedGroupIds: "listId" in command && command.listId ? [command.listId] : [],
        },
        dates,
        true,
      ),
    };
  }
  const patchStarted = performance.now();
  const patch = await readScheduleMutationPatch(
    getDatabaseClient(),
    workspaceId,
    command,
    result,
    dates,
  );
  if (process.env.NODE_ENV === "development" && command.kind === "delete_list") {
    console.info("[schedule.delete-group.response]", {
      mutationMs,
      patchMs: Math.round(performance.now() - patchStarted),
      affectedTodos: result.affectedTodoIds?.length ?? 0,
      affectedDates: result.affectedDates.length,
    });
  }
  return { ...result, patch };
}

export async function loadTodoLists(after: string | null = null) {
  z.uuid().nullable().parse(after);
  return readTodoLists(getDatabaseClient(), resolveFixedWorkspace().workspaceId, after);
}

export async function loadTodos(listId: string, after: string | null = null) {
  z.uuid().parse(listId);
  z.uuid().nullable().parse(after);
  return readTodos(getDatabaseClient(), resolveFixedWorkspace().workspaceId, listId, after);
}

export async function loadCalendarTrainingDay(civilDate: string) {
  const { parseCivilDate } = await import("@/features/training/domain/training-day.rules");
  const { queryFixedWorkspaceTrainingDayPage } =
    await import("@/features/training/data/training-queries");
  const result = await queryFixedWorkspaceTrainingDayPage(parseCivilDate(civilDate));
  return result.status === "ready" ? result.day : null;
}
