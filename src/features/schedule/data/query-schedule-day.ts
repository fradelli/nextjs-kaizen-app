import "server-only";
import { getDatabaseClient } from "@/lib/db/client";
import { resolveFixedWorkspace } from "@/lib/security/workspace";
import { readScheduleRange } from "./read-schedule-range";

export function queryScheduleDay(date: string) {
  const start = new Date(date + "T00:00:00-03:00");
  const end = new Date(start.getTime() + 86400000);
  return readScheduleRange(getDatabaseClient(), resolveFixedWorkspace().workspaceId, start, end);
}
