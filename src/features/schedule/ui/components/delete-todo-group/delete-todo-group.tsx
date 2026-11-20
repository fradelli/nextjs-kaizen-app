"use client";
import { useRef, useState } from "react";
import { Button } from "@fradelli/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@fradelli/ui/dialog";
import { useTranslations } from "next-intl";
import type { TodoListPage } from "../../../application/todo-list-page";
import { ScheduleSelect } from "../schedule-select/schedule-select";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
export function DeleteTodoGroup({
  list,
  close,
}: {
  list: TodoListPage["items"][number];
  close: () => void;
}) {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const [policy, setPolicy] = useState<"keep" | "remove">("keep");
  const [deleting, setDeleting] = useState(false);
  const deletionInFlight = useRef(false);
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !deletionInFlight.current) close();
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-md:top-auto max-md:bottom-0 max-md:left-0 max-md:translate-x-0 max-md:translate-y-0 max-md:max-w-none max-md:rounded-b-none"
      >
        <DialogTitle>{t("deleteTitle", { name: list.name })}</DialogTitle>
        <DialogDescription>{t("deleteGroupDescription")}</DialogDescription>
        <ScheduleSelect
          label={t("tasks")}
          value={policy}
          onChange={(value) => setPolicy(value === "remove" ? "remove" : "keep")}
          items={[
            { value: "keep", label: t("keepTasks") },
            { value: "remove", label: t("deleteTasks") },
          ]}
        />
        <DialogFooter>
          <Button variant="outline" disabled={deleting} onClick={close}>
            {t("cancel")}
          </Button>
          <Button
            tone="danger"
            disabled={deleting}
            onClick={async () => {
              if (deletionInFlight.current) return;
              deletionInFlight.current = true;
              setDeleting(true);
              try {
                const saved = await s.saveMutation({
                  kind: "delete_list",
                  listId: list.id,
                  expectedRevision: list.revision,
                  policy,
                });
                if (saved) close();
              } finally {
                deletionInFlight.current = false;
                setDeleting(false);
              }
            }}
          >
            {t("delete")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
