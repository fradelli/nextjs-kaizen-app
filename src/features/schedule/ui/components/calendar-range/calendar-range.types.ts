import type { TrainingCalendarDayDto } from "@/features/training/application/training-calendar-dto";
import type { TrainingDayDto } from "@/features/training/application/training-dto";
import type { TrainingDayDateResolution } from "@/features/training/application/resolve-training-day-date.types";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";
import type { ScheduleRange } from "../../../application/schedule-range";
import type { ScheduleTag } from "../../../application/schedule-command";
import type { TodoListPage, TodoPage } from "../../../application/todo-list-page";
import type { ScheduleWorkspaceProps } from "../schedule-workspace/schedule-workspace.types";

export type CalendarDay = (TrainingDayDto | TrainingCalendarDayDto) & { schedule?: ScheduleRange };
export type CalendarRangeProps = {
  initialDays: readonly CalendarDay[];
  resolution: Extract<TrainingDayDateResolution, { status: "valid" }>;
  actions: TrainingDayFormActions;
  loadTrainingDay: (date: string) => Promise<TrainingDayDto | null>;
  initialLists: TodoListPage;
  initialTodos: { listId: string; page: TodoPage } | null;
  tags: ScheduleTag[];
  mutate: (
    command: Parameters<ScheduleWorkspaceProps["mutate"]>[0],
    cachedDates?: string[],
  ) => ReturnType<ScheduleWorkspaceProps["mutate"]>;
  loadLists: ScheduleWorkspaceProps["loadLists"];
  loadTodos: ScheduleWorkspaceProps["loadTodos"];
};
