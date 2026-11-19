"use client";
import { Button } from "@fradelli/ui/button";
import { Checkbox } from "@fradelli/ui/checkbox";
import { Card, CardTitle } from "@fradelli/ui/card";
import { useTranslations } from "next-intl";
import type { CSSProperties } from "react";
import { useScheduleData, useScheduleEditorAction } from "../schedule-workspace/schedule-workspace";
import type {
  ScheduleActivity,
  ScheduleReservation,
} from "../schedule-workspace/schedule-workspace.types";
import { localParts } from "../../schedule-format";
import { clipToDay } from "../../schedule-layout";
import { scheduleColors } from "../../../domain/schedule-colors";
import styles from "./schedule-card.module.css";

function colors(key: string | null): CSSProperties {
  if (!key || !scheduleColors.includes(key as (typeof scheduleColors)[number])) return {};
  const pastel = ["lilac", "sage", "peach", "sky", "rose"].includes(key);
  return {
    "--event-background": pastel
      ? `color-mix(in srgb, var(--fd-primitive-color-${key}-400) 35%, var(--fd-color-surface-elevated))`
      : `var(--fd-primitive-color-${key}-subtle)`,
    "--event-border": `var(--fd-primitive-color-${key}-${pastel ? "400" : "solid"})`,
    "--event-edge": "3px",
  } as CSSProperties;
}

export function ScheduleCard({
  activity: originalActivity,
  reservation: originalReservation,
  date,
  nested = false,
}: {
  activity?: ScheduleActivity;
  reservation?: ScheduleReservation;
  date: string;
  nested?: boolean;
}) {
  const s = useScheduleData();
  const activity = originalActivity
    ? (s.activitiesById.get(originalActivity.id) ?? originalActivity)
    : undefined;
  const reservation = originalReservation
    ? (s.reservationsById.get(originalReservation.id) ?? originalReservation)
    : undefined;
  const setEditor = useScheduleEditorAction();
  const t = useTranslations("schedule");
  const row = activity ?? reservation!;
  const elapsed = row.endsAt
    ? new Date(row.endsAt) < new Date()
    : date < localParts(new Date().toISOString()).date;
  const open = () =>
    activity
      ? setEditor({ kind: "activity", id: activity.id, date })
      : setEditor({
          kind: "reserve",
          id: reservation!.id,
        });
  const inside =
    activity?.startsAt && activity.endsAt
      ? (s.reservationsByParent.get(activity.id) ?? []).filter(
          (item) =>
            item.parentActivityId === activity.id &&
            item.startsAt >= activity.startsAt! &&
            item.endsAt <= activity.endsAt!,
        )
      : [];
  const parentClip =
    activity?.startsAt && activity.endsAt
      ? clipToDay(date, activity.startsAt, activity.endsAt)
      : null;
  return (
    <Card
      size="sm"
      surface="solid"
      className={styles.card}
      style={colors(row.colorKey)}
      data-elapsed={elapsed || undefined}
    >
      <div className="flex h-full min-w-0">
        {reservation && (
          <div className="pl-1 pt-1">
            <Checkbox
              disabled={s.pending}
              checked={reservation.completed}
              aria-label={t("completeNamed", { name: row.title })}
              onCheckedChange={(completed) =>
                s.submit(
                  {
                    kind: "complete",
                    todoId: reservation.todoId,
                    expectedRevision: reservation.todoRevision,
                    completed,
                  },
                  false,
                )
              }
            />
          </div>
        )}
        <Button variant="ghost" className={styles.open} onClick={open}>
          {!nested && row.startsAt && (
            <span className={styles.time}>{localParts(row.startsAt).time}</span>
          )}
          <CardTitle className={styles.title}>{row.title}</CardTitle>
        </Button>
      </div>
      {parentClip &&
        inside.map((item) => {
          const clipped = clipToDay(date, item.startsAt, item.endsAt);
          const duration = parentClip.end - parentClip.start;
          if (clipped.end <= clipped.start) return null;
          return (
            <div
              key={item.id}
              className={styles.nested}
              style={{
                top: ((clipped.start - parentClip.start) / duration) * 100 + "%",
                height: ((clipped.end - clipped.start) / duration) * 100 + "%",
              }}
            >
              <ScheduleCard reservation={item} date={date} nested />
            </div>
          );
        })}
    </Card>
  );
}
