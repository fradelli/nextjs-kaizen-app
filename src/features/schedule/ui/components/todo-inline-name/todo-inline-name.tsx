"use client";
import type { ScheduleCommandInput } from "../../../application/schedule-command";
import { useEffect, useRef, useState } from "react";
import { Input } from "@fradelli/ui/input";
import { Button } from "@fradelli/ui/button";
import { useTranslations } from "next-intl";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import type { TodoInlineNameProps } from "./todo-inline-name.types";

export function TodoInlineName({ listId, todo, done }: TodoInlineNameProps) {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const fallback = todo?.title ?? t("defaultTodoName");
  const [name, setName] = useState(fallback);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const busy = useRef(false);
  const finished = useRef(false);
  const attempt = useRef<{ json: string; id: string } | null>(null);
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
    input.current?.select();
    input.current?.scrollIntoView?.({ block: "nearest" });
  }, []);
  async function commit(value: string) {
    if (busy.current || finished.current) return;
    const title = value.trim() || fallback;
    if (todo && title === todo.title) {
      finished.current = true;
      done();
      return;
    }
    const command: ScheduleCommandInput = todo
      ? {
          kind: "update_todo",
          todoId: todo.id,
          expectedRevision: todo.revision,
          title,
          estimatedMinutes: todo.estimatedMinutes,
        }
      : { kind: "create_todo", listId, title, estimatedMinutes: null };
    const json = JSON.stringify(command);
    if (attempt.current?.json !== json) attempt.current = { json, id: crypto.randomUUID() };
    busy.current = true;
    setSaving(true);
    try {
      const result = await s.saveMutation(command, attempt.current.id);
      if (!result) {
        setFailed(true);
        return;
      }
      const target = result.group?.id ?? listId;
      if (!target) return;
      if (!result.patch) {
        if (result.group)
          s.upsertGroup({
            ...result.group,
            incompleteCount: s.lists.items.find((list) => list.id === target)?.incompleteCount ?? 0,
          });
        s.upsertTodo({
          id: result.id,
          listId: target,
          title,
          revision: result.revision,
          estimatedMinutes: todo?.estimatedMinutes ?? null,
          completedAt: todo?.completedAt ?? null,
        });
      }
      finished.current = true;
      done();
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1">
      <Input
        ref={input}
        aria-label={t("todoName")}
        className="h-6 min-w-0 flex-1 px-1 text-xs"
        value={name}
        maxLength={200}
        readOnly={saving}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => void commit(name)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === "Escape") {
            e.stopPropagation();
            e.preventDefault();
            void commit(e.key === "Escape" ? fallback : name);
          }
        }}
      />
      {failed && (
        <Button variant="ghost" onClick={() => void commit(name)}>
          {t("retry")}
        </Button>
      )}
    </div>
  );
}
