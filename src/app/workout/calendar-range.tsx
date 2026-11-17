"use client";

import { useEffect, useMemo, useReducer } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import type { TrainingDayDto } from "@/features/training/application/training-dto";
import type { TrainingDayDateResolution } from "@/features/training/application/resolve-training-day-date.types";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";
import { TrainingDayPage } from "@/features/training/ui/components/training-day-page/training-day-page";
import { TrainingWeekGrid } from "@/features/training/ui/components/training-week-grid/training-week-grid";
import { TrainingActivityEditor } from "@/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor";
import { shiftTrainingDate } from "@/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.utils";

type DateKey = TrainingDayDto["civilDate"];

export function CalendarRange({
  initialDays,
  resolution,
  actions,
}: {
  initialDays: readonly TrainingDayDto[];
  resolution: Extract<TrainingDayDateResolution, { status: "valid" }>;
  actions: TrainingDayFormActions;
}) {
  const params = useSearchParams();
  const t = useTranslations("training");
  const requested = Number(params.get("days") ?? initialDays.length);
  const count =
    params.get("view") === "day"
      ? 1
      : Number.isInteger(requested) && requested >= 1 && requested <= 14
        ? requested
        : initialDays.length;
  const start = initialDays[0]!.civilDate;
  const dates = useMemo(
    () => Array.from({ length: count }, (_, offset) => shiftTrainingDate(start, offset)),
    [start, count],
  );
  // A fresh server snapshot supersedes local entries after an edit or refresh.
  const cache = useMemo(
    () => ({
      days: new Map(initialDays.map((day) => [day.civilDate, day])),
      pending: new Set<DateKey>(),
      failed: new Set<DateKey>(),
    }),
    [initialDays],
  );
  const [revision, redraw] = useReducer((n) => n + 1, 0);
  useEffect(() => {
    for (const date of dates) {
      if (cache.days.has(date) || cache.pending.has(date) || cache.failed.has(date)) continue;
      cache.pending.add(date);
      void fetch(`/workout/calendar-day?date=${date}`)
        .then(async (response) => {
          if (!response.ok) throw new Error("Calendar day unavailable");
          const day: TrainingDayDto = await response.json();
          cache.days.set(date, day);
        })
        .catch(() => cache.failed.add(date))
        .finally(() => {
          cache.pending.delete(date);
          redraw();
        });
    }
  }, [dates, cache, revision]);
  const days = dates.map(
    (civilDate) =>
      cache.days.get(civilDate) ?? {
        state: "loading" as const,
        civilDate,
        activities: [] as const,
      },
  );
  const selectedDate =
    dates.includes(resolution.civilDate) && params.get("date") === resolution.civilDate
      ? resolution.civilDate
      : start;
  const selected = cache.days.get(selectedDate);
  const activeResolution =
    selectedDate === resolution.civilDate
      ? resolution
      : {
          ...resolution,
          civilDate: selectedDate,
          previousDate: shiftTrainingDate(selectedDate, -1),
          nextDate: shiftTrainingDate(selectedDate, 1),
          isToday: selectedDate === resolution.todayDate,
        };
  const view = count === 1 ? "day" : "week";
  function changeCount(next: number) {
    const url = new URL(window.location.href);
    url.searchParams.set("date", start);
    url.searchParams.set("view", next === 1 ? "day" : "week");
    url.searchParams.set("days", String(next));
    window.history.replaceState(null, "", url);
  }
  return (
    <TrainingDayPage
      dateResolution={activeResolution}
      view={view}
      onCountChange={changeCount}
      controls={
        selected && (
          <TrainingActivityEditor
            shortcutOnly
            civilDate={selectedDate}
            availablePlan={"availablePlan" in selected ? selected.availablePlan : null}
            actions={actions}
          />
        )
      }
    >
      {dates.some((date) => cache.failed.has(date)) && (
        <Button
          onClick={() => {
            cache.failed.clear();
            redraw();
          }}
        >
          {t("retry")}
        </Button>
      )}
      <TrainingWeekGrid days={days} selectedDate={selectedDate} view={view} actions={actions} />
    </TrainingDayPage>
  );
}
