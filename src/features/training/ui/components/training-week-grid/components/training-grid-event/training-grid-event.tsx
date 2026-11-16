"use client";
import { Item, ItemContent, ItemTitle } from "@fradelli/ui/item";
import { Button } from "@fradelli/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useTrainingActivityDraft } from "../../../../hooks/use-training-activity-draft/use-training-activity-draft";
import { TrainingActivityControls } from "../../../training-day-page/components/training-activity-controls/training-activity-controls";
import { TrainingActivityEditor } from "../../../training-day-page/components/training-activity-editor/training-activity-editor";
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
  if (markerOnly)
    return <span className={styles.briefMarker} data-kind={activity.type} aria-hidden="true" />;
  const start = activity.actualStartTime ?? activity.plannedStartTime;
  if (!inList) {
    const content = (
      <ItemContent className={styles.eventContent}>
        {!compact && <span className={styles.eventTime}>{start ?? t("timeUnknown")}</span>}
        <ItemTitle className={styles.gridTitle}>{activity.name}</ItemTitle>
      </ItemContent>
    );
    return (
      <Item
        role="article"
        size="xs"
        variant="outline"
        className={styles.event}
        data-kind={activity.type}
      >
        <TrainingActivityEditor
          activity={activity}
          civilDate={civilDate}
          actions={actions}
          availablePlan={availablePlan}
          triggerContent={content}
          triggerClassName={styles.eventLink}
        />
      </Item>
    );
  }
  return (
    <ListedActivity
      activity={activity}
      civilDate={civilDate}
      actions={actions}
      availablePlan={availablePlan}
      compact={compact}
    />
  );
}

function ListedActivity({
  activity,
  civilDate,
  actions,
  availablePlan,
  compact,
}: TrainingGridEventProps) {
  const t = useTranslations("training");
  const execution = useTrainingActivityDraft({ activity, civilDate });
  const start = activity.actualStartTime ?? activity.plannedStartTime;
  const end = activity.actualEndTime ?? activity.plannedEndTime;
  const label = `${activity.name} · ${start ?? t("timeUnknown")}`;
  const status =
    activity.status === "completed"
      ? activity.status
      : (execution.draft?.status ?? activity.status);
  const hasSession = Boolean(activity.structured || activity.preparationSession);
  return (
    <Card
      role="article"
      surface="solid"
      size="sm"
      className={styles.listItem}
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
        ) : (
          <CardTitle className={styles.eventTitle}>{activity.name}</CardTitle>
        )}

        <TrainingActivityMenu
          civilDate={civilDate}
          activity={activity}
          availablePlan={availablePlan}
          actions={actions}
        />
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
    </Card>
  );
}
