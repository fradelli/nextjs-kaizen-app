"use client";
import { ControlTooltip } from "@/components/shared/control-tooltip/control-tooltip";

import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import { TodoGroup } from "../todo-group/todo-group";

export function TodoPanel() {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const { groupDraft: draft, setGroupDraft: setDraft } = s;
  return (
    <section aria-label={t("tasks")}>
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-xs font-medium">{t("tasks")}</span>
        <div className="flex items-center gap-1">
          <ControlTooltip label={t("newTodo")} shortcut="Ctrl+Enter">
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              aria-label={t("newTodo")}
              aria-keyshortcuts="Control+Enter"
              onClick={() =>
                s.setTodoDraft((draft) => draft ?? { key: crypto.randomUUID(), listId: null })
              }
            >
              <Plus className="size-3" />
            </Button>
          </ControlTooltip>
          <ControlTooltip label={t("newList")} shortcut="Ctrl+Shift+Enter">
            <Button
              size="icon"
              variant="ghost"
              className="size-6"
              aria-label={t("newList")}
              aria-keyshortcuts="Control+Shift+Enter"
              disabled={draft !== null}
              onClick={() => setDraft(crypto.randomUUID())}
            >
              <FolderPlus className="size-3" />
            </Button>
          </ControlTooltip>
        </div>
      </div>
      {s.todoDraft?.listId === null &&
        !s.lists.items.some((list) => list.systemKey === "inbox") && (
          <TodoGroup
            list={{
              id: "inbox-preview",
              name: t("inbox"),
              systemKey: "inbox",
              colorKey: null,
              revision: 0,
              incompleteCount: 0,
            }}
            virtual
          />
        )}
      {s.lists.items.map((list) => (
        <TodoGroup key={list.id} list={list} />
      ))}
      {draft && (
        <TodoGroup
          key={draft}
          initialEditing
          createOperationId={draft}
          list={{ id: draft, name: t("defaultGroupName"), colorKey: null, revision: 0 }}
          onCreated={() => setDraft(null)}
        />
      )}
      {s.lists.nextCursor && (
        <Button variant="ghost" onClick={s.loadMoreLists}>
          {t("more")}
        </Button>
      )}
    </section>
  );
}
