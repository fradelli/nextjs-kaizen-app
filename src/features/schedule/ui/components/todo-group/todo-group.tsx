"use client";
import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import { ColorSwatch } from "@fradelli/ui/color-swatch";
import { Input } from "@fradelli/ui/input";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@fradelli/ui/collapsible";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@fradelli/ui/context-menu";
import { ChevronRight, Plus } from "lucide-react";
import { TodoInlineName } from "../todo-inline-name/todo-inline-name";
import { TodoTaskRow } from "../todo-task-row/todo-task-row";
import { DeleteTodoGroup } from "../delete-todo-group/delete-todo-group";
import { useTodoGroupName } from "./hooks/use-todo-group-name";
import { scheduleColors } from "../../../domain/schedule-colors";
import type { TodoGroupProps } from "./todo-group.types";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import styles from "./todo-group.module.css";

export function TodoGroup({
  list,
  initialEditing = false,
  createOperationId,
  onCreated,
  virtual = false,
}: TodoGroupProps) {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const [open, setOpen] = useState(
    initialEditing ||
      virtual ||
      s.cache.todos.has(list.id) ||
      [...s.todoChanges.values()].some((todo) => todo.listId === list.id),
  );
  const [deleting, setDeleting] = useState(false);
  const { cache, loadTasks } = s;
  const page = cache.todos.get(list.id);
  const todos = useMemo(() => {
    const rows = new Map(page?.items.map((todo) => [todo.id, todo]));
    for (const todo of s.todoChanges.values()) if (todo.listId === list.id) rows.set(todo.id, todo);
    return [...rows.values()].filter((todo) => !cache.removedTodos.has(todo.id));
  }, [page, cache, s.todoChanges, list.id]);
  const draft = s.todoDraft;
  const hasDraft = Boolean(
    draft && (draft.listId === list.id || (draft.listId === null && list.systemKey === "inbox")),
  );
  const expanded = open || hasDraft;
  const displayList = {
    ...list,
    name: list.systemKey === "inbox" && list.name === "Inbox" ? t("inbox") : list.name,
  };
  const editor = useTodoGroupName({
    list: displayList,
    initialEditing,
    createOperationId,
    onCreated,
  });
  const { editing, name, saving, failed, input, commit, rename } = editor;
  useEffect(() => {
    if (expanded && !virtual && !createOperationId && !cache.todos.has(list.id))
      void loadTasks(list.id);
  }, [expanded, virtual, createOperationId, list.id, cache, loadTasks]);
  return (
    <>
      <Collapsible
        open={expanded}
        onOpenChange={setOpen}
        className={`${styles.group} my-1 rounded-sm`}
        style={
          list.colorKey
            ? ({
                "--todo-group-color": `var(--fd-primitive-color-${list.colorKey}-${["lilac", "sage", "peach", "sky", "rose"].includes(list.colorKey) ? "400" : "solid"})`,
              } as CSSProperties)
            : undefined
        }
      >
        <ContextMenu>
          <ContextMenuTrigger
            render={
              <div className={`${styles.heading} relative flex min-w-0 items-center rounded-sm`} />
            }
          >
            {editing ? (
              <Input
                ref={input}
                aria-label={t("groupName")}
                value={name}
                maxLength={200}
                className="h-6 min-w-0 flex-1 px-1 text-xs"
                readOnly={saving}
                onChange={(e) => editor.setName(e.target.value)}
                onBlur={() => void commit(name)}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter" || e.key === "Escape") {
                    e.preventDefault();
                    void commit(e.key === "Escape" ? displayList.name : name);
                  }
                }}
              />
            ) : (
              <CollapsibleTrigger
                aria-label={name}
                className="relative flex h-7 w-full min-w-0 items-center gap-1 rounded-sm pl-1 pr-12 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring"
              >
                <span className="min-w-0 truncate">{name}</span>
                <span className="text-[10px] text-muted-foreground">
                  {list.incompleteCount ?? 0}
                </span>
                <ChevronRight
                  aria-hidden="true"
                  className={`absolute right-1 size-3 shrink-0 transition-transform ${expanded ? "rotate-90" : ""}`}
                />
              </CollapsibleTrigger>
            )}
            {!editing && !virtual && !createOperationId && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-5 size-6"
                aria-label={t("addTodoToGroup", { name: displayList.name })}
                onClick={() => {
                  setOpen(true);
                  s.setTodoDraft((draft) => draft ?? { key: crypto.randomUUID(), listId: list.id });
                }}
              >
                <Plus className="size-3" />
              </Button>
            )}
          </ContextMenuTrigger>
          {!virtual && !createOperationId && (
            <ContextMenuContent finalFocus={() => input.current ?? (deleting ? false : true)}>
              <ContextMenuItem onClick={rename}>{t("renameGroup")}</ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger>{t("color")}</ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {[null, ...scheduleColors].map((color) => (
                    <ContextMenuItem
                      key={color ?? "neutral"}
                      onClick={() =>
                        s.submit(
                          {
                            kind: "update_list",
                            listId: list.id,
                            expectedRevision: list.revision,
                            name: list.name,
                            colorKey: color,
                          },
                          false,
                        )
                      }
                    >
                      <ColorSwatch color={color ?? "neutral"} />
                      {color ? t(`colors.${color}`) : t("neutral")}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
              {list.systemKey !== "inbox" && (
                <>
                  <ContextMenuSeparator />
                  <ContextMenuItem variant="destructive" onClick={() => setDeleting(true)}>
                    {t("delete")}
                  </ContextMenuItem>
                </>
              )}
            </ContextMenuContent>
          )}
        </ContextMenu>
        {failed && (
          <Button variant="ghost" size="sm" onClick={() => void commit(name)}>
            {t("retry")}
          </Button>
        )}
        <CollapsibleContent>
          <div className="flex flex-col gap-1 py-1 empty:hidden">
            {todos.map((todo) => (
              <TodoTaskRow key={todo.id} todo={todo} />
            ))}
            {hasDraft && draft && (
              <TodoInlineName
                key={draft.key}
                listId={virtual ? null : list.id}
                done={() => s.setTodoDraft(null)}
              />
            )}
            {page?.nextCursor && (
              <Button variant="ghost" onClick={() => s.loadTasks(list.id, true)}>
                {t("more")}
              </Button>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
      {deleting && <DeleteTodoGroup list={list} close={() => setDeleting(false)} />}
    </>
  );
}
