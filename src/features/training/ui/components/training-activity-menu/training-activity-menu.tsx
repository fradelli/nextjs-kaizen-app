"use client";
import { useId, useState, type CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import { DotsThreeIcon } from "@fradelli/ui/icons/DotsThree";
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
  if (
    !isTrainingAgendaDateEditable(civilDate) ||
    activity.status === "completed" ||
    activity.status === "skipped"
  )
    return null;
  const blocked =
    Boolean(execution.draft) || activity.status === "in_progress" || activity.status === "paused";
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        popoverTarget={id}
        className="min-h-11 min-w-11"
        aria-label={t("activityOptions", { name: activity.name })}
        onClick={(event) => {
          const bounds = event.currentTarget.getBoundingClientRect();
          setPosition({
            left: Math.max(8, Math.min(bounds.right - 240, window.innerWidth - 248)),
            top: Math.max(8, Math.min(bounds.bottom + 4, window.innerHeight - 160)),
          });
        }}
      >
        <DotsThreeIcon size={20} aria-hidden="true" />
      </Button>
      <div
        id={id}
        popover="auto"
        className={styles.panel}
        style={
          {
            "--menu-left": `${position.left}px`,
            "--menu-top": `${position.top}px`,
          } as CSSProperties
        }
        aria-label={t("activityOptions", { name: activity.name })}
      >
        {!execution.ready ? (
          <p>{t("checkingExecution")}</p>
        ) : blocked ? (
          <p>{t("activeWorkoutBeforeChanges")}</p>
        ) : (
          <>
            <TrainingActivityEditor
              activity={activity}
              civilDate={civilDate}
              actions={actions}
              availablePlan={availablePlan}
              triggerLabel={t("moveWorkout")}
            />
            <TrainingActivityDeleteForm
              activity={activity}
              civilDate={civilDate}
              action={actions.deleteActivity}
              triggerLabel={t("deleteActivity")}
            />
          </>
        )}
      </div>
    </>
  );
}
