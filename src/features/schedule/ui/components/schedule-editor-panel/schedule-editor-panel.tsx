"use client";
import { ControlTooltip } from "@/components/shared/control-tooltip/control-tooltip";

import { Button } from "@fradelli/ui/button";
import { PanelRight, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { SchedulePanel } from "../schedule-panel/schedule-panel";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";
import { ScheduleActivityEditor } from "../schedule-activity-editor/schedule-activity-editor";
import { TodoPanel } from "../todo-panel/todo-panel";
import { ReservationEditor } from "../reservation-editor/reservation-editor";

export function ScheduleEditorPanel() {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  const editor = s.editor;
  const reservation =
    editor?.kind === "reserve"
      ? s.range.reservations.find((row) => row.id === editor.id)
      : undefined;
  const close = () => {
    s.setEditor(null);
    s.setPanelOpen(false);
  };
  return (
    <SchedulePanel title={t(editor ? "activityPanel" : "tasks")} close={close}>
      <div className="mb-3 flex h-7 items-center justify-end">
        <ControlTooltip label={t("close")} shortcut="Ctrl+B">
          <Button
            className="shrink-0"
            type="button"
            variant="ghost"
            size="icon"
            disabled={s.pending}
            aria-label={t("close")}
            aria-keyshortcuts="Control+B"
            onClick={close}
          >
            <PanelRight className="max-md:hidden" aria-hidden="true" />
            <X className="md:hidden" aria-hidden="true" />
          </Button>
        </ControlTooltip>
      </div>
      <div>
        {editor?.kind === "activity" && (
          <ScheduleActivityEditor
            key={JSON.stringify(editor)}
            activity={s.range.activities.find((row) => row.id === editor.id)}
            date={editor.date}
            initialStart={editor.start}
            initialEnd={editor.end}
          />
        )}
        {editor?.kind === "reserve" && reservation && (
          <ReservationEditor key={JSON.stringify(editor)} reservation={reservation} />
        )}
      </div>
      <div className={editor ? "mt-4 border-t border-border pt-3" : ""}>
        <TodoPanel />
      </div>
    </SchedulePanel>
  );
}
