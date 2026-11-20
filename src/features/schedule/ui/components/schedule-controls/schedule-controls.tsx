"use client";
import { ControlTooltip } from "@/components/shared/control-tooltip/control-tooltip";

import { Button } from "@fradelli/ui/button";
import { PanelRight, ListTodo } from "lucide-react";
import { useTranslations } from "next-intl";
import { useScheduleWorkspace } from "../schedule-workspace/schedule-workspace";

export function ScheduleControls() {
  const s = useScheduleWorkspace();
  const t = useTranslations("schedule");
  return !s.panelOpen ? (
    <ControlTooltip label={t("tasks")} shortcut="Ctrl+B">
      <Button
        variant="ghost"
        tone="neutral"
        size="icon"
        aria-label={t("tasks")}
        aria-keyshortcuts="Control+B"
        onClick={() => s.setPanelOpen(true)}
      >
        <PanelRight className="max-md:hidden" aria-hidden="true" />
        <ListTodo className="md:hidden" aria-hidden="true" />
      </Button>
    </ControlTooltip>
  ) : null;
}
