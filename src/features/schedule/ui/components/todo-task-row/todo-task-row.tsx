"use client";
import { useState } from "react";
import { TodoInlineName } from "../todo-inline-name/todo-inline-name";
import { Button } from "@fradelli/ui/button";
import { Checkbox } from "@fradelli/ui/checkbox";
import { useTranslations } from "next-intl";
import type { TodoPage } from "../../../application/todo-list-page";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import styles from "./todo-task-row.module.css";

export function TodoTaskRow({ todo }: { todo: TodoPage["items"][number] }) {
  const [editing, setEditing] = useState(false);
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  return (
    <div className={`${styles.row} relative flex min-h-7 w-full min-w-0 items-center rounded-sm`}>
      {editing ? (
        <div className="flex w-full items-center gap-2 pl-6">
          <TodoInlineName todo={todo} listId={todo.listId} done={() => setEditing(false)} />
        </div>
      ) : (
        <Button
          variant="ghost"
          className="h-7 w-full min-w-0 justify-start rounded-sm pl-6 pr-1 text-xs font-normal hover:bg-transparent dark:hover:bg-transparent"
          onClick={() => setEditing(true)}
        >
          <span
            className={
              todo.completedAt ? "truncate line-through text-muted-foreground" : "truncate"
            }
          >
            {todo.title}
          </span>
        </Button>
      )}
      <Checkbox
        className="absolute left-1 z-10 size-3.5 border-muted-foreground"
        checked={todo.completedAt !== null}
        disabled={s.pending}
        aria-label={t("completeNamed", { name: todo.title })}
        onCheckedChange={(completed) =>
          s.submit(
            { kind: "complete", todoId: todo.id, expectedRevision: todo.revision, completed },
            false,
          )
        }
      />
    </div>
  );
}
