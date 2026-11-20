import { z } from "zod";
import { scheduleColors } from "../domain/schedule-colors";

const id = z.uuid();
const revision = z.number().int().nonnegative();
const title = z.string().trim().min(1).max(200);
const instant = z.iso.datetime({ offset: true });
const envelope = { operationId: id };
const colorKey = z.enum(scheduleColors).nullable();

export const scheduleCommandSchema = z.discriminatedUnion("kind", [
  z.object({
    ...envelope,
    kind: z.literal("delete_list"),
    listId: id,
    expectedRevision: revision,
    policy: z.enum(["keep", "remove"]),
  }),
  z.object({
    ...envelope,
    kind: z.literal("create_list"),
    name: title,
    colorKey,
  }),
  z.object({
    ...envelope,
    kind: z.literal("create_todo"),
    listId: id.nullable(),
    title,
    estimatedMinutes: z.number().int().positive().multipleOf(15).nullable(),
  }),
  z.object({
    ...envelope,
    kind: z.literal("create_activity"),
    title,
    startsAt: instant.nullable().optional(),
    endsAt: instant.nullable().optional(),
    scheduledDate: z.iso.date().nullable().optional(),
    tagId: id.nullable().optional(),
  }),
  z.object({
    ...envelope,
    kind: z.literal("update_activity"),
    activityId: id,
    expectedRevision: revision,
    title,
    startsAt: instant.nullable(),
    endsAt: instant.nullable(),
    scheduledDate: z.iso.date().nullable(),
    tagId: id.nullable(),
    policy: z.enum(["shift", "keep"]),
  }),
  z.object({
    ...envelope,
    kind: z.literal("create_tag"),
    name: title,
    colorKey: z.enum(scheduleColors),
  }),
  z.object({
    ...envelope,
    kind: z.literal("update_tag"),
    tagId: id,
    expectedRevision: revision,
    name: title,
    colorKey: z.enum(scheduleColors),
  }),
  z.object({
    ...envelope,
    kind: z.literal("update_list"),
    listId: id,
    expectedRevision: revision,
    name: title,
    colorKey,
  }),
  z.object({
    ...envelope,
    kind: z.literal("update_todo"),
    todoId: id,
    expectedRevision: revision,
    title,
    estimatedMinutes: z.number().int().positive().multipleOf(15).nullable(),
  }),
  z.object({
    ...envelope,
    kind: z.literal("remove_reservation"),
    reservationId: id,
    expectedRevision: revision,
  }),
  z.object({
    ...envelope,
    kind: z.literal("reserve"),
    todoId: id,
    expectedRevision: revision,
    parentActivityId: id,
    expectedParentRevision: revision,
    startsAt: instant,
  }),
  z.object({
    ...envelope,
    kind: z.literal("reserve_new"),
    todoId: id,
    expectedRevision: revision,
    startsAt: instant,
  }),
  z.object({
    ...envelope,
    kind: z.literal("complete"),
    todoId: id,
    expectedRevision: revision,
    completed: z.boolean(),
  }),
  z.object({
    ...envelope,
    kind: z.literal("change_list"),
    todoId: id,
    expectedRevision: revision,
    listId: id,
  }),
  z.object({
    ...envelope,
    kind: z.literal("move_activity"),
    activityId: id,
    expectedRevision: revision,
    startsAt: instant,
    policy: z.enum(["shift", "keep"]),
  }),
  z.object({
    ...envelope,
    kind: z.literal("delete_activity"),
    activityId: id,
    expectedRevision: revision,
    policy: z.enum(["keep", "remove"]),
  }),
]);

export type {
  ScheduleCommand,
  ScheduleCommandInput,
  ScheduleSaved,
  ScheduleResult,
  SchedulePatch,
  ScheduleTag,
} from "./schedule-command.types";

export class ScheduleMutationError extends Error {
  constructor(
    readonly status: "invalid" | "conflict" | "missing",
    readonly code: string,
  ) {
    super(code);
  }
}
