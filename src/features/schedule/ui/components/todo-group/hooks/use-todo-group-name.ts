import { isScheduleColor } from "../../../../domain/schedule-colors";
import type { ScheduleCommandInput } from "../../../../application/schedule-command";
import { useEffect, useRef, useState } from "react";
import type { TodoListPage } from "../../../../application/todo-list-page";
import { useScheduleWorkspace } from "../../schedule-workspace/schedule-workspace";

// Typing stays local. A single confirmed command creates OR renames the group.
export function useTodoGroupName({
  list,
  initialEditing,
  createOperationId,
  onCreated,
}: {
  list: TodoListPage["items"][number];
  initialEditing: boolean;
  createOperationId?: string;
  onCreated?: (id: string) => void;
}) {
  const { saveMutation, upsertGroup } = useScheduleWorkspace();
  const [editing, setEditing] = useState(initialEditing);
  const [name, setName] = useState(list.name);
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const running = useRef(false);
  const finished = useRef(false);
  const attempt = useRef<{ json: string; id: string } | null>(null);
  useEffect(() => {
    if (!editing) return;
    input.current?.scrollIntoView?.({ block: "nearest" });
    input.current?.focus({ preventScroll: true });
    input.current?.select();
  }, [editing]);
  function rename() {
    finished.current = false;
    attempt.current = null;
    setName(list.name);
    setEditing(true);
  }
  async function commit(value: string) {
    if (running.current || finished.current) return;
    const next = value.trim() || list.name;
    if (!createOperationId && next === list.name) {
      finished.current = true;
      setName(list.name);
      setEditing(false);
      return;
    }
    const command: ScheduleCommandInput = createOperationId
      ? { kind: "create_list", name: next, colorKey: null }
      : {
          kind: "update_list",
          listId: list.id,
          expectedRevision: list.revision,
          name: next,
          colorKey: isScheduleColor(list.colorKey) ? list.colorKey : null,
        };
    const json = JSON.stringify(command);
    if (attempt.current?.json !== json) attempt.current = { json, id: crypto.randomUUID() };
    running.current = true;
    setSaving(true);
    setName(next);
    try {
      const saved = await saveMutation(command, attempt.current.id);
      if (!saved) {
        setFailed(true);
        return;
      }
      finished.current = true;
      setFailed(false);
      setEditing(false);
      if (!saved.patch)
        upsertGroup({ ...list, id: saved.id, revision: saved.revision, name: next });
      onCreated?.(saved.id);
    } finally {
      running.current = false;
      setSaving(false);
    }
  }
  return {
    editing,
    name: editing ? name : list.name,
    setName,
    saving,
    failed,
    input,
    commit,
    rename,
  };
}
