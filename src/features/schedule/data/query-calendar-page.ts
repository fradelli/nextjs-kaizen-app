import "server-only";
import { getDatabaseClient } from "@/lib/db/client";
import { resolveFixedWorkspace } from "@/lib/security/workspace";
import { queryTrainingCalendar } from "@/features/training/data/query-training-calendar";
import { readScheduleRange } from "./read-schedule-range";
import { readTodoLists, readTodos } from "./read-todo-lists";
import { scheduleForDate } from "../application/schedule-range.utils";

export async function queryCalendarPage(date: string, count: number, alignWeek: boolean) {
  const db = getDatabaseClient();
  const { workspaceId } = resolveFixedWorkspace();
  const [week, initialLists, tags] = await Promise.all([
    queryTrainingCalendar(date, count, alignWeek),
    readTodoLists(db, workspaceId),
    db.agendaTag.findMany({
      where: { workspaceId, archivedAt: null },
      select: { id: true, name: true, colorKey: true, revision: true, systemKey: true },
      orderBy: [{ systemKey: "asc" }, { name: "asc" }],
    }),
  ]);
  const first = new Date(week.startDate + "T00:00:00-03:00");
  const end = new Date(first.getTime() + week.days.length * 86_400_000);
  const firstList = initialLists.items[0];
  const [schedule, page] = await Promise.all([
    readScheduleRange(db, workspaceId, first, end),
    firstList ? readTodos(db, workspaceId, firstList.id) : null,
  ]);
  return {
    initialDays: week.days.map((day) => ({
      ...day,
      schedule: scheduleForDate(schedule, day.civilDate),
    })),
    initialLists,
    initialTodos: firstList && page ? { listId: firstList.id, page } : null,
    tags,
  };
}
