"use client";
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
  const structured = activity.type === "structured_training" && activity.structured;
  const start = activity.actualStartTime ?? activity.plannedStartTime;
  const end = activity.actualEndTime ?? activity.plannedEndTime;
  const label = `${activity.name} · ${start ?? t("timeUnknown")}`;
  return (
    <article className={inList ? styles.listItem : styles.event} data-kind={activity.type}>
      <div className={styles.eventHeading}>
        {structured ? (
          <Link
            prefetch={false}
            className={styles.eventTitle}
            href={`/workout/activity/${encodeURIComponent(activity.id)}?date=${civilDate}`}
            aria-label={label}
          >
            {activity.name}
          </Link>
        ) : inList ? (
          <strong>{activity.name}</strong>
        ) : (
          <button
            ref={trigger}
            type="button"
            className={styles.eventTitle}
            aria-label={label}
            onClick={() => setOpen(true)}
          >
            {activity.name}
          </button>
        )}
        {inList || !compact ? (
          <TrainingActivityMenu
            civilDate={civilDate}
            activity={activity}
            availablePlan={availablePlan}
            actions={actions}
          />
        ) : null}
      </div>
      {!compact && (
        <div className={styles.metadata}>
          <span>
            {start ?? t("timeUnknown")}
            {end ? `–${end}` : ""}
          </span>
          <span>{t(statusKeys[status])}</span>
          {activity.source === "manual" ? <span>{t("outsidePlan")}</span> : null}
        </div>
      )}
      {!structured && !compact ? (
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
    </article>
  );
}
