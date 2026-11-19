import type { ReactNode } from "react";
import type {
  ScheduleCommand,
  ScheduleResult,
  SchedulePatch,
  ScheduleTag,
} from "../../../application/schedule-command";
import type { ScheduleRange } from "../../../application/schedule-range";
import type { TodoListPage, TodoPage } from "../../../application/todo-list-page";

export type ScheduleActivity = ScheduleRange["activities"][number];
export type ScheduleReservation = ScheduleRange["reservations"][number];
export type ScheduleTodo = TodoPage["items"][number];
export type ScheduleEditor =
  | { kind: "activity"; id?: string; date: string; start?: string; end?: string }
  | { kind: "reserve"; id: string }
  | null;
export type ScheduleWorkspaceProps = {
  children: ReactNode;
  initialLists: TodoListPage;
  initialTodos: { listId: string; page: TodoPage } | null;
  tags: ScheduleTag[];
  onCalendarPatch?: (patch: NonNullable<SchedulePatch["calendar"]>) => void;
  range: ScheduleRange;
  date: string;
  requestTraining?: (date: string, start: string, end: string) => void;
  mutate: (input: ScheduleCommand) => Promise<ScheduleResult>;
  loadLists: (after?: string | null) => Promise<TodoListPage>;
  loadTodos: (listId: string, after?: string | null) => Promise<TodoPage>;
};
