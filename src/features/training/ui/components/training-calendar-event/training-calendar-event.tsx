"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Item, ItemContent, ItemTitle } from "@fradelli/ui/item";
import { Button } from "@fradelli/ui/button";
import { toast } from "@fradelli/ui/toast";
import type { TrainingDayDto } from "../../../application/training-dto";
import { TrainingGridEvent } from "../training-grid-event/training-grid-event";
import { TrainingActivityEditorContent } from "../training-day-page/components/training-activity-editor-content/training-activity-editor-content";
import type { TrainingCalendarEventProps } from "./training-calendar-event.types";
import styles from "../training-calendar-event/training-calendar-event.module.css";

export function TrainingCalendarEvent({
  activity,
  civilDate,
  actions,
  compact,
  markerOnly,
  inList,
  loadTrainingDay,
  onTrainingChanged,
}: TrainingCalendarEventProps) {
  const t = useTranslations("training");
  const errors = useTranslations("schedule");
  const [day, setDay] = useState<TrainingDayDto | null>(null);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const trigger = useRef<HTMLButtonElement>(null);
  const requestId = useRef(0);
  const load = useCallback(async () => {
    const id = ++requestId.current;
    setPending(true);
    try {
      const result = await loadTrainingDay(civilDate);
      if (requestId.current !== id) return null;
      if (!result?.activities.some((row) => row.id === activity.id))
        throw new Error("Activity unavailable");
      setDay(result);
      return result;
    } catch {
      if (requestId.current === id)
        toast.add({ title: errors("errors.unavailable"), type: "error" });
      return null;
    } finally {
      if (requestId.current === id) setPending(false);
    }
  }, [loadTrainingDay, civilDate, activity.id, errors]);
  useEffect(() => {
    if (!inList) return;
    let cancelled = false;
    const id = requestId.current;
    void loadTrainingDay(civilDate)
      .then((result) => {
        if (!cancelled && requestId.current === id) {
          if (!result?.activities.some((row) => row.id === activity.id))
            throw new Error("Activity unavailable");
          setDay(result);
        }
      })
      .catch(() => {
        if (!cancelled) toast.add({ title: errors("errors.unavailable"), type: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [inList, loadTrainingDay, civilDate, activity.id, errors]);
  const full = day?.activities.find((row) => row.id === activity.id);
  const availablePlan = day && "availablePlan" in day ? day.availablePlan : null;
  if (markerOnly)
    return <span className={styles.briefMarker} data-kind={activity.type} aria-hidden />;
  if (inList && full)
    return (
      <TrainingGridEvent
        activity={full}
        civilDate={civilDate}
        actions={actions}
        availablePlan={availablePlan}
        inList
      />
    );
  return (
    <>
      <Item
        role="article"
        size="xs"
        variant="outline"
        className={styles.event}
        data-kind={activity.type}
      >
        <Button
          ref={trigger}
          className={styles.eventLink}
          variant="ghost"
          aria-busy={pending || undefined}
          disabled={pending}
          aria-label={t("editNamedActivity", { name: activity.name })}
          onClick={() => {
            void load().then((result) => {
              if (result) setOpen(true);
            });
          }}
        >
          <ItemContent className={styles.eventContent}>
            {!compact && (
              <span className={styles.eventTime}>
                {activity.actualStartTime ?? activity.plannedStartTime ?? t("timeUnknown")}
              </span>
            )}
            <ItemTitle className={styles.gridTitle}>{activity.name}</ItemTitle>
          </ItemContent>
        </Button>
      </Item>
      {open && full && (
        <TrainingActivityEditorContent
          activity={full}
          civilDate={civilDate}
          availablePlan={availablePlan}
          actions={actions}
          triggerRef={trigger}
          onClose={() => setOpen(false)}
          onCommitted={(target) => {
            setOpen(false);
            setDay(null);
            onTrainingChanged([...new Set([civilDate, target])]);
          }}
        />
      )}
    </>
  );
}
