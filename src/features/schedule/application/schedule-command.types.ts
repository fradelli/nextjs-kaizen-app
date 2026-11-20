import type { z } from "zod";
import type { scheduleCommandSchema } from "./schedule-command";
import type { TodoListPage, TodoPage } from "./todo-list-page";
import type { ScheduleRange } from "./schedule-range";
export type ScheduleTag = {
  id: string;
  name: string;
  colorKey: string;
  revision: number;
  systemKey: string | null;
};
export type SchedulePatch = {
  groups: TodoListPage["items"];
  removedGroupIds: string[];
  todos: TodoPage["items"];
  removedTodoIds: string[];
  tags: ScheduleTag[];
  calendar?: { dates: string[]; range: ScheduleRange; refreshedDates?: string[] };
};
export type ScheduleCommand = z.infer<typeof scheduleCommandSchema>;
type WithoutOperation<T> = T extends { operationId: string } ? Omit<T, "operationId"> : never;
export type ScheduleCommandInput = WithoutOperation<ScheduleCommand>;
export type ScheduleSaved = {
  status: "saved";
  id: string;
  revision: number;
  affectedDates: string[];
  affectedGroupIds?: string[];
  affectedTodoIds?: string[];
  patch?: SchedulePatch;
  group?: {
    id: string;
    name: string;
    colorKey: string | null;
    revision: number;
    systemKey?: string | null;
  };
};
export type ScheduleResult =
  | ScheduleSaved
  | {
      status: "invalid" | "conflict" | "missing";
      code: string;
      patch?: SchedulePatch;
    };
