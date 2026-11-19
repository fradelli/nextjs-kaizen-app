"use client";
import { memo, useLayoutEffect, useMemo, useState } from "react";
import { TrainingCalendarEvent } from "@/features/training/ui/components/training-calendar-event/training-calendar-event";
import { TrainingGridEvent } from "../../../../../../training/ui/components/training-grid-event/training-grid-event";
import {
  isBriefTrainingActivity,
  isFullTrainingActivity,
} from "@/features/training/ui/training-calendar";
import { scheduleGridEntries } from "../../calendar-grid.entries";
import styles from "../../calendar-grid.module.css";
import { ScheduleCard } from "@/features/schedule/ui/components/schedule-card/schedule-card";

import type { DayColumnProps } from "./calendar-day-column.types";
export const CalendarDayColumn = memo(function CalendarDayColumn({
  item,
  selected,
  clock,
  actions,
  label,
  loadTrainingDay,
  onTrainingChanged,
}: DayColumnProps) {
  const [range, setRange] = useState<{
    date: string;
    anchor: number;
    slot: number;
    pointer: number;
  } | null>(null);
  const selecting = range !== null;
  useLayoutEffect(() => {
    if (!selecting) return;
    const cancel = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRange(null);
    };
    window.addEventListener("keydown", cancel);
    return () => window.removeEventListener("keydown", cancel);
  }, [selecting]);
  const slotAt = (column: HTMLElement, y: number) => {
    const rect = column.getBoundingClientRect();
    return Math.max(0, Math.min(95, Math.floor(((y - rect.top) * 96) / rect.height)));
  };
  const formatSlot = (slot: number) =>
    [Math.floor(slot / 4), (slot % 4) * 15].map((n) => String(n).padStart(2, "0")).join(":");
  const past = Boolean(clock && item.civilDate < clock.date);
  const today = clock?.date === item.civilDate;
  const timed = useMemo(
    () => scheduleGridEntries(item.civilDate, item.activities, item.schedule),
    [item.civilDate, item.activities, item.schedule],
  );
  return (
    <div
      key={item.civilDate}
      className={`${styles.day} ${selected ? styles.selectedDay : styles.unselectedDay}`}
      onPointerDown={(event) => {
        if (
          item.state === "loading" ||
          event.button !== 0 ||
          !event.isPrimary ||
          event.target !== event.currentTarget
        )
          return;
        const slot = slotAt(event.currentTarget, event.clientY);
        if (slot >= 95) return;
        event.currentTarget.setPointerCapture(event.pointerId);
        setRange({ date: item.civilDate, anchor: slot, slot, pointer: event.pointerId });
      }}
      onPointerMove={(event) => {
        if (!range || range.pointer !== event.pointerId) return;
        const slot = Math.min(94, slotAt(event.currentTarget, event.clientY));
        if (slot !== range.slot) setRange({ ...range, slot });
      }}
      onPointerCancel={() => setRange(null)}
      onLostPointerCapture={() => setRange(null)}
      onPointerUp={(event) => {
        if (!range || range.pointer !== event.pointerId) return;
        setRange(null);
        const rect = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < rect.left ||
          event.clientX >= rect.right ||
          event.clientY < rect.top ||
          event.clientY >= rect.bottom
        )
          return;
        const slot = Math.min(94, slotAt(event.currentTarget, event.clientY));
        window.dispatchEvent(
          new CustomEvent("schedule-select-period", {
            detail: {
              civilDate: item.civilDate,
              availablePlan: "availablePlan" in item ? item.availablePlan : null,
              selectedPeriod: {
                start: formatSlot(Math.min(range.anchor, slot)),
                end: formatSlot(Math.max(range.anchor, slot) + 1),
              },
            },
          }),
        );
      }}
      data-today={today || undefined}
      data-weekend={new Date(`${item.civilDate}T00:00:00Z`).getUTCDay() % 6 === 0 || undefined}
      aria-label={label}
    >
      {range?.date === item.civilDate && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bg-muted-foreground/25"
          style={{
            top: (Math.min(range.anchor, range.slot) / 96) * 100 + "%",
            height: ((Math.abs(range.anchor - range.slot) + 1) / 96) * 100 + "%",
          }}
        />
      )}
      {timed.map(({ item: entry, id, start, end, lane, laneCount }) => (
        <div
          key={id}
          className={styles.slot}
          data-elapsed={past || (today && clock && end <= clock.minute) || undefined}
          style={{
            top: `${(start / 1440) * 100}%`,
            height: `${((end - start) / 1440) * 100}%`,
            left: `calc(${(lane / laneCount) * 100}% + 3px)`,
            width: `calc(${100 / laneCount}% - 6px)`,
          }}
        >
          {entry.kind === "training" ? (
            loadTrainingDay && onTrainingChanged ? (
              <TrainingCalendarEvent
                activity={entry.activity}
                civilDate={item.civilDate}
                actions={actions}
                loadTrainingDay={loadTrainingDay}
                onTrainingChanged={onTrainingChanged}
                compact={end - start < 40}
                markerOnly={isBriefTrainingActivity(entry.activity)}
              />
            ) : isFullTrainingActivity(entry.activity) ? (
              <TrainingGridEvent
                activity={entry.activity}
                civilDate={item.civilDate}
                actions={actions}
                availablePlan={"availablePlan" in item ? item.availablePlan : null}
                compact={end - start < 40}
                markerOnly={isBriefTrainingActivity(entry.activity)}
              />
            ) : null
          ) : entry.kind === "activity" ? (
            <ScheduleCard activity={entry.activity} date={item.civilDate} />
          ) : (
            <ScheduleCard reservation={entry.reservation} date={item.civilDate} />
          )}
        </div>
      ))}
      {clock ? (
        <div className={styles.nowLine} style={{ top: `${(clock.minute / 1440) * 100}%` }} />
      ) : null}
    </div>
  );
});
