"use client";
import { Button } from "@fradelli/ui/button";
import { useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { useLocale, useTranslations } from "next-intl";
import { TrainingActivityModal } from "../../../../training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal";
import { TrainingCalendarEvent } from "@/features/training/ui/components/training-calendar-event/training-calendar-event";
import { TrainingGridEvent } from "../../../../training/ui/components/training-grid-event/training-grid-event";
import { useCalendarClock } from "./hooks/use-calendar-clock";
import {
  isBriefTrainingActivity,
  isFullTrainingActivity,
  trainingActivityMinutes,
  trainingGridClock,
} from "@/features/training/ui/training-calendar";
import type { CalendarGridProps } from "./calendar-grid.types";
import styles from "./calendar-grid.module.css";
import { CalendarDayColumn } from "./components/calendar-day-column/calendar-day-column";
import { ScheduleCard } from "@/features/schedule/ui/components/schedule-card/schedule-card";

export function CalendarGrid({
  days,
  selectedDate,
  view = "week",
  actions,
  loadTrainingDay,
  onTrainingChanged,
}: CalendarGridProps) {
  const t = useTranslations("training");
  const locale = useLocale();
  const clock = useCalendarClock();
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
  const dayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short", day: "numeric" }),
    [locale],
  );
  const weekdayFormatter = useMemo(
    () => new Intl.DateTimeFormat(locale, { timeZone: "UTC", weekday: "short" }),
    [locale],
  );
  const formatDay = (date: string) => dayFormatter.format(new Date(`${date}T12:00:00Z`));
  const formatWeekday = (date: string) => weekdayFormatter.format(new Date(`${date}T12:00:00Z`));
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
        {days.some((item) => item.schedule?.activities.some((row) => row.scheduledDate)) && (
          <div className={styles.untimedRow}>
            <span />
            {days.map((item) => (
              <div key={item.civilDate} className={styles.untimedDay}>
                {item.schedule?.activities
                  .filter((row) => row.scheduledDate)
                  .map((activity) => (
                    <div key={activity.id} className={styles.untimedCard}>
                      <ScheduleCard activity={activity} date={item.civilDate} />
                    </div>
                  ))}
              </div>
            ))}
          </div>
        )}
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
          {days.map((item) => (
            <CalendarDayColumn
              key={item.civilDate}
              item={item}
              selected={item.civilDate === selectedDate}
              clock={clock}
              actions={actions}
              loadTrainingDay={loadTrainingDay}
              onTrainingChanged={onTrainingChanged}
              label={formatDay(item.civilDate)}
            />
          ))}
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
              listedActivities.map((activity) =>
                loadTrainingDay && onTrainingChanged ? (
                  <TrainingCalendarEvent
                    key={activity.id}
                    activity={activity}
                    civilDate={day.civilDate}
                    actions={actions}
                    loadTrainingDay={loadTrainingDay}
                    onTrainingChanged={onTrainingChanged}
                    inList
                  />
                ) : isFullTrainingActivity(activity) ? (
                  <TrainingGridEvent
                    key={activity.id}
                    activity={activity}
                    civilDate={day.civilDate}
                    actions={actions}
                    availablePlan={"availablePlan" in day ? day.availablePlan : null}
                    inList
                  />
                ) : null,
              )
            ) : (
              <p>{day.plannedRestReason ?? t("noActivities")}</p>
            )}
          </div>
        </TrainingActivityModal>
      ) : null}
    </>
  );
}
