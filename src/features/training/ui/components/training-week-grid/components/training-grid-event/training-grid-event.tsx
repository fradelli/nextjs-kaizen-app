"use client";
import { Button } from "@fradelli/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import { useRef, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTrainingActivityDraft } from "../../../../hooks/use-training-activity-draft/use-training-activity-draft";
import { TrainingActivityModal } from "../../../training-day-page/components/training-activity-modal/training-activity-modal";
import { TrainingActivityControls } from "../../../training-day-page/components/training-activity-controls/training-activity-controls";
import { TrainingActivityMenu } from "../../../training-activity-menu/training-activity-menu";
import type { TrainingGridEventProps } from "./training-grid-event.types";
import styles from "../../training-week-grid.module.css";

const statusKeys = {
  scheduled: "notStarted",
  in_progress: "inProgress",
  paused: "paused",
  completed: "completed",
  skipped: "skipped",
} as const;

export function TrainingGridEvent({
  activity,
  civilDate,
  actions,
  availablePlan = null,
  compact = false,
  inList = false,
  markerOnly = false,
}: TrainingGridEventProps) {
  const t = useTranslations("training");
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const execution = useTrainingActivityDraft({ activity, civilDate });
  if (markerOnly)
    return <span className={styles.briefMarker} data-kind={activity.type} aria-hidden="true" />;
  const status =
    activity.status === "completed"
      ? activity.status
      : (execution.draft?.status ?? activity.status);
  const hasSession = Boolean(activity.structured || activity.preparationSession);
  const start = activity.actualStartTime ?? activity.plannedStartTime;
  const end = activity.actualEndTime ?? activity.plannedEndTime;
  const label = `${activity.name} · ${start ?? t("timeUnknown")}`;
  return (
    <Card
      role="article"
      surface="solid"
      size="sm"
      className={inList ? styles.listItem : styles.event}
      data-kind={activity.type}
    >
      <CardHeader className={styles.eventHeading}>
        {hasSession ? (
          <CardTitle asChild>
            <Button variant="ghost" asChild className={styles.eventTitle}>
              <Link
                prefetch={false}
                href={`/workout/activity/${encodeURIComponent(activity.id)}?date=${civilDate}`}
                aria-label={label}
              >
                {activity.name}
              </Link>
            </Button>
          </CardTitle>
        ) : inList ? (
          <CardTitle className={styles.eventTitle}>{activity.name}</CardTitle>
        ) : (
          <CardTitle asChild>
            <Button
              ref={trigger}
              type="button"
              variant="ghost"
              aria-label={label}
              className={styles.eventTitle}
              onClick={() => setOpen(true)}
            >
              {activity.name}
            </Button>
          </CardTitle>
        )}
        {inList || !compact ? (
          <TrainingActivityMenu
            civilDate={civilDate}
            activity={activity}
            availablePlan={availablePlan}
            actions={actions}
          />
        ) : null}
      </CardHeader>
      {!compact && (
        <CardDescription className={styles.metadata}>
          <span>
            {start ?? t("timeUnknown")}
            {end ? `–${end}` : ""}
          </span>
          <span>{t(statusKeys[status])}</span>
          {activity.source === "manual" ? <span>{t("outsidePlan")}</span> : null}
        </CardDescription>
      )}
      {!hasSession && !compact ? (
        <TrainingActivityControls
          civilDate={civilDate}
          activity={activity}
          action={actions.controlActivity}
          showLabel
        />
      ) : null}
      {open ? (
        <TrainingActivityModal
          title={activity.name}
          busy={false}
          footer={null}
          restoreFocusRef={trigger}
          onRequestClose={() => setOpen(false)}
        >
          <TrainingGridEvent
            activity={activity}
            civilDate={civilDate}
            availablePlan={availablePlan}
            actions={actions}
            inList
          />
        </TrainingActivityModal>
      ) : null}
    </Card>
  );
}
