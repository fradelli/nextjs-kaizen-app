"use client";
import { MoreHorizontal } from "lucide-react";
import { useId, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@fradelli/ui/card";
import { Button } from "@fradelli/ui/button";
import { isTrainingAgendaDateEditable } from "../../../domain/training-edit-window";
import { useTrainingActivityDraft } from "../../hooks/use-training-activity-draft/use-training-activity-draft";
import { TrainingActivityEditor } from "../training-day-page/components/training-activity-editor/training-activity-editor";
import { TrainingActivityDeleteForm } from "../training-day-page/components/training-activity-delete-form/training-activity-delete-form";
import type { TrainingActivityCardProps } from "../training-day-page/components/training-activity-card/training-activity-card.types";
import styles from "./training-activity-menu.module.css";

export function TrainingActivityMenu({
  activity,
  civilDate,
  actions,
  availablePlan = null,
}: TrainingActivityCardProps) {
  const t = useTranslations("training");
  const id = useId();
  const execution = useTrainingActivityDraft({ activity, civilDate });
  const [position, setPosition] = useState({ left: 0, top: 0 });
  if (!isTrainingAgendaDateEditable(civilDate)) return null;
  const blocked =
    Boolean(execution.draft) || activity.status === "in_progress" || activity.status === "paused";
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        popoverTarget={id}
        aria-label={t("activityOptions", { name: activity.name })}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setPosition({
            left: Math.max(8, Math.min(bounds.right - 240, window.innerWidth - 248)),
            top: Math.max(8, Math.min(bounds.bottom + 4, window.innerHeight - 160)),
          });
        }}
      >
        <MoreHorizontal size={20} aria-hidden="true" />
      </Button>
      <Card
        surface="solid"
        size="sm"
        id={id}
        popover="auto"
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest("button")) event.currentTarget.hidePopover();
        }}
        className={styles.panel}
        style={
          {
            "--menu-left": `${position.left}px`,
            "--menu-top": `${position.top}px`,
          } as CSSProperties
        }
        aria-label={t("activityOptions", { name: activity.name })}
      >
        <TrainingActivityEditor
          activity={activity}
          civilDate={civilDate}
          actions={actions}
          availablePlan={availablePlan}
          triggerLabel={t("moveWorkout")}
        />
        {execution.ready && !blocked && (
          <TrainingActivityDeleteForm
            activity={activity}
            civilDate={civilDate}
            action={actions.deleteActivity}
            triggerLabel={t("deleteActivity")}
          />
        )}
      </Card>
    </>
  );
}
