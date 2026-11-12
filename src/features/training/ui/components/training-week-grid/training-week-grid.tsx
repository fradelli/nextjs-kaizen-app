"use client";
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

export function TrainingWeekGrid({ days, actions }: TrainingWeekGridProps) {
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
  const scrollKey = `kaizen:training-grid-scroll:v1:${days[0]?.civilDate ?? ""}`;
  const formatDay = (date: string) =>
    new Intl.DateTimeFormat(locale, {
      timeZone: "UTC",
      weekday: "short",
      day: "numeric",
    }).format(new Date(`${date}T12:00:00Z`));
  useLayoutEffect(() => {
    const element = scroller.current;
    if (!element || restoredKey.current === scrollKey) return;
    restoredKey.current = scrollKey;
    const current = trainingGridClock(new Date());
    const minute =
      days[0]?.civilDate === current.date
        ? current.minute
        : (days[0]?.activities.map(trainingActivityMinutes).find((item) => item !== null)?.start ??
          480);
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
  }, [days, scrollKey]);
  return (
    <>
      {days.some(
        (item) =>
          item.plannedRestReason ||
          item.activities.some(
            (activity) => !trainingActivityMinutes(activity) || isBriefTrainingActivity(activity),
          ),
      ) ? (
        <div className={styles.dayNotes} style={{ "--day-count": days.length } as CSSProperties}>
          <span />
          {days.map((item, index) => {
            const count = item.activities.filter(
              (activity) => !trainingActivityMinutes(activity),
            ).length;
            const briefCount = item.activities.filter(isBriefTrainingActivity).length;
            return (
              <div key={item.civilDate} className={index ? styles.futureDay : undefined}>
                {item.plannedRestReason ? <p>{item.plannedRestReason}</p> : null}
                {count ? (
                  <button
                    type="button"
                    className={styles.dayNote}
                    onClick={() => setSelectedDay({ index })}
                  >
                    {t("withoutTimeRange", { count })}
                  </button>
                ) : null}
                {briefCount ? (
                  <button
                    type="button"
                    className={styles.dayNote}
                    onClick={() => setSelectedDay({ index, briefOnly: true })}
                  >
                    {t("briefActivities", { count: briefCount })}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
      <div
        ref={scroller}
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
          {days.map((item, index) => (
            <button
              key={item.civilDate}
              type="button"
              className={index ? styles.futureDay : undefined}
              aria-label={t("showDayActivities", { date: formatDay(item.civilDate) })}
              aria-current={clock?.date === item.civilDate ? "date" : undefined}
              onClick={() => setSelectedDay({ index })}
            >
              {formatDay(item.civilDate)}
            </button>
          ))}
        </div>
        <div className={styles.columns}>
          <div className={styles.axis}>
            {Array.from({ length: 25 }, (_, hour) => (
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
          {days.map((item, index) => {
            const past = Boolean(clock && item.civilDate < clock.date);
            const today = clock?.date === item.civilDate;
            const timed = positionTrainingActivities(item.activities);
            return (
              <div
                key={item.civilDate}
                className={`${styles.day} ${index ? styles.futureDay : ""}`}
                data-today={today || undefined}
                data-past={past || undefined}
                aria-label={formatDay(item.civilDate)}
              >
                {today && clock ? (
                  <div
                    className={styles.elapsedArea}
                    style={{ height: `${(clock.minute / 1440) * 100}%` }}
                  />
                ) : null}
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
