"use client";
import { Button } from "@fradelli/ui/button";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TrainingActivityModal } from "../training-day-page/components/training-activity-modal/training-activity-modal";
import { TrainingGridEvent } from "./components/training-grid-event/training-grid-event";
import { useTrainingGridClock } from "./hooks/use-training-grid-clock";
import {
  isBriefTrainingActivity,
  positionTrainingActivities,
  trainingActivityMinutes,
  trainingGridClock,
} from "./training-week-grid.utils";
import type { TrainingWeekGridProps } from "./training-week-grid.types";
import styles from "./training-week-grid.module.css";

export function TrainingWeekGrid({
  days,
  selectedDate,
  view = "week",
  actions,
}: TrainingWeekGridProps) {
  const t = useTranslations("training");
  const locale = useLocale();
  const clock = useTrainingGridClock();
  const scroller = useRef<HTMLDivElement>(null);
  const restoredKey = useRef<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<{ index: number; briefOnly?: boolean } | null>(
    null,
  );
  const day = selectedDay === null ? null : days[selectedDay.index];
  const listedActivities =
    day?.activities.filter(
      (activity) => !selectedDay?.briefOnly || isBriefTrainingActivity(activity),
    ) ?? [];
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
  const scrollKey = `kaizen:training-grid-scroll:v1:${days[0]?.civilDate ?? ""}`;
  const formatDay = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  const formatWeekday = (date: string) =>
    new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }).format(
      new Date(`${date}T12:00:00Z`),
    );
  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element || restoredKey.current === scrollKey) return;
    restoredKey.current = scrollKey;
    const current = trainingGridClock(new Date());
    const todayIsVisible = days.some((item) => item.civilDate === current.date);
    const selectedDayData = days.find((item) => item.civilDate === selectedDate);
    const minute = todayIsVisible
      ? current.minute
      : (selectedDayData?.activities.map(trainingActivityMinutes).find((item) => item !== null)
          ?.start ?? 480);
    const hourHeight = parseFloat(getComputedStyle(element).getPropertyValue("--hour-height"));
    let target = Math.max(0, minute - 120);
    try {
      const stored = window.sessionStorage.getItem(scrollKey);
      if (stored !== null && Number.isFinite(Number(stored)) && Number(stored) >= 0) {
        target = Number(stored);
      }
    } catch {
      /* Fall back to the current hour when session storage is unavailable. */
    }
    element.scrollTop = (target / 60) * hourHeight;
    element.dataset.positioned = "true";
  }, [days, scrollKey, selectedDate]);
  return (
    <>
      {days.some(
        (item) =>
          item.plannedRestReason ||
          item.activities.some(
            (activity) => !trainingActivityMinutes(activity) || isBriefTrainingActivity(activity),
          ),
      ) ? (
        <div
          className={styles.dayNotes}
          data-view={view}
          style={{ "--day-count": days.length } as CSSProperties}
        >
          <span />
          {days.map((item, index) => {
            const count = item.activities.filter(
              (activity) => !trainingActivityMinutes(activity),
            ).length;
            const briefCount = item.activities.filter(isBriefTrainingActivity).length;
            return (
              <div
                key={item.civilDate}
                className={
                  item.civilDate === selectedDate ? styles.selectedDay : styles.unselectedDay
                }
              >
                {item.plannedRestReason ? <p>{item.plannedRestReason}</p> : null}
                {count ? (
                  <Button
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                    type="button"

                    onClick={() => setSelectedDay({ index })}
                  >
                    {t("withoutTimeRange", { count })}
                  </Button>
                ) : null}
                {briefCount ? (
                  <Button
                    variant="ghost"
                    tone="neutral"
                    size="sm"
                    type="button"

                    onClick={() => setSelectedDay({ index, briefOnly: true })}
                  >
                    {t("briefActivities", { count: briefCount })}
                  </Button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      <div
        ref={scroller}
        data-view={view}
        className={styles.scroller}
        tabIndex={0}
        onScroll={(event) => {
          const element = event.currentTarget;
          const step = parseFloat(getComputedStyle(element).getPropertyValue("--hour-height"));
          if (!Number.isFinite(step) || step <= 0) return;
          try {
            window.sessionStorage.setItem(scrollKey, String((element.scrollTop / step) * 60));
          } catch {
            /* Scrolling remains available without storing its position. */
          }
        }}
        aria-label={t("dayTimeline")}
        style={{ "--day-count": days.length } as CSSProperties}
      >
        <div className={styles.dayHeaders}>
          <span aria-hidden="true" />
          {days.map((item) => (
            <time
              key={item.civilDate}
              dateTime={item.civilDate}
              className={
                item.civilDate === selectedDate ? styles.selectedDay : styles.unselectedDay
              }
              data-future={Boolean(clock && item.civilDate > clock.date) || undefined}
              aria-current={clock?.date === item.civilDate ? "date" : undefined}
            >
              <span className={styles.weekday}>{formatWeekday(item.civilDate)}</span>
              <span className={styles.dayNumber}>{Number(item.civilDate.slice(-2))}</span>
            </time>
          ))}
        </div>
        <div className={styles.columns}>
          <div className={styles.axis}>
            {Array.from({ length: 23 }, (_, index) => index + 1).map((hour) => (
              <span
                key={hour}
                style={{ top: `${(hour / 24) * 100}%` }}
                className={clock && hour * 60 < clock.minute ? styles.elapsedHour : undefined}
                hidden={Boolean(clock && Math.abs(hour * 60 - clock.minute) < 12)}
              >
                {String(hour).padStart(2, "0")}:00
              </span>
            ))}
            {clock ? (
              <time className={styles.nowLabel} style={{ top: `${(clock.minute / 1440) * 100}%` }}>
                {clock.label}
              </time>
            ) : null}
          </div>
          {days.map((item) => {
            const past = Boolean(clock && item.civilDate < clock.date);
            const today = clock?.date === item.civilDate;
            const timed = positionTrainingActivities(item.activities);
            return (
              <div
                key={item.civilDate}
                className={`${styles.day} ${item.civilDate === selectedDate ? styles.selectedDay : styles.unselectedDay}`}
                onPointerDown={(event) => {
                  if (
                    event.button !== 0 ||
                    !event.isPrimary ||
                    event.target !== event.currentTarget ||
                    document.querySelector("#schedule-editor-panel > aside")
                  )
                    return;
                  const slot = slotAt(event.currentTarget, event.clientY);
                  if (slot >= 95) return;
                  event.currentTarget.setPointerCapture(event.pointerId);
                  setRange({ date: item.civilDate, anchor: slot, slot, pointer: event.pointerId });
                }}
                onPointerMove={(event) => {
                  if (!range || range.pointer !== event.pointerId) return;
                  setRange({
                    ...range,
                    slot: Math.min(94, slotAt(event.currentTarget, event.clientY)),
                  });
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
                data-weekend={
                  new Date(`${item.civilDate}T00:00:00Z`).getUTCDay() % 6 === 0 || undefined
                }
                aria-label={formatDay(item.civilDate)}
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
                {timed.map(({ activity, start, end, lane, laneCount }) => (
                  <div
                    key={activity.id}
                    className={styles.slot}
                    data-elapsed={past || (today && clock && end <= clock.minute) || undefined}
                    style={{
                      top: `${(start / 1440) * 100}%`,
                      height: `${((end - start) / 1440) * 100}%`,
                      left: `calc(${(lane / laneCount) * 100}% + 3px)`,
                      width: `calc(${100 / laneCount}% - 6px)`,
                    }}
                  >
                    <TrainingGridEvent
                      activity={activity}
                      civilDate={item.civilDate}
                      actions={actions}
                      availablePlan={"availablePlan" in item ? item.availablePlan : null}
                      compact={end - start < 40}
                      markerOnly={isBriefTrainingActivity(activity)}
                    />
                  </div>
                ))}
                {clock ? (
                  <div
                    className={styles.nowLine}
                    style={{ top: `${(clock.minute / 1440) * 100}%` }}
                  />
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
      {day ? (
        <TrainingActivityModal
          busy={false}
          title={
            selectedDay?.briefOnly
              ? t("briefActivitiesTitle", { date: formatDay(day.civilDate) })
              : formatDay(day.civilDate)
          }
          footer={null}
          onRequestClose={() => setSelectedDay(null)}
        >
          <div className={styles.dayList}>
            {listedActivities.length ? (
              listedActivities.map((activity) => (
                <TrainingGridEvent
                  key={activity.id}
                  activity={activity}
                  civilDate={day.civilDate}
                  actions={actions}
                  availablePlan={"availablePlan" in day ? day.availablePlan : null}
                  inList
                />
              ))
            ) : (
              <p>{day.plannedRestReason ?? t("noActivities")}</p>
            )}
          </div>
        </TrainingActivityModal>
      ) : null}
    </>
  );
}
