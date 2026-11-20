"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { CivilDate } from "@/features/training/domain/training-day.types";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "@fradelli/ui/toast";
import { Button } from "@fradelli/ui/button";
import { TrainingDayPage } from "@/features/training/ui/components/training-day-page/training-day-page";
import { CalendarGrid } from "@/features/schedule/ui/components/calendar-grid/calendar-grid";
import { shiftTrainingDate } from "@/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.utils";
import type { ScheduleRange } from "@/features/schedule/application/schedule-range";
import { ScheduleWorkspace } from "@/features/schedule/ui/components/schedule-workspace/schedule-workspace";
import { ScheduleControls } from "@/features/schedule/ui/components/schedule-controls/schedule-controls";
import { TrainingActivityEditorContent } from "@/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content";
import type { AvailablePublicTrainingPlanDto } from "@/features/training/application/training-dto";

import type { CalendarRangeProps } from "./calendar-range.types";
import { useCalendarDays } from "./hooks/use-calendar-days";
import { getTrainingWeekStart } from "@/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.utils";

export function CalendarRange({
  initialDays,
  resolution,
  actions,
  initialLists,
  initialTodos,
  tags,
  mutate,
  loadLists,
  loadTodos,
  loadTrainingDay,
}: CalendarRangeProps) {
  const params = useSearchParams();
  const trainingTrigger = useRef<HTMLButtonElement>(null);
  const [trainingEditor, setTrainingEditor] = useState<{
    civilDate: string;
    selectedPeriod: { start: string; end: string };
    availablePlan: AvailablePublicTrainingPlanDto;
  } | null>(null);
  const t = useTranslations("training");
  const errors = useTranslations("schedule");
  const requested = Number(params.get("days") ?? initialDays.length);
  const count =
    params.get("view") === "day"
      ? 1
      : Number.isInteger(requested) && requested >= 1 && requested <= 14
        ? requested
        : initialDays.length;
  const requestedDate = params.get("date");
  const selectedDate =
    requestedDate &&
    /^\d{4}-\d{2}-\d{2}$/.test(requestedDate) &&
    !Number.isNaN(Date.parse(requestedDate))
      ? requestedDate
      : resolution.civilDate;
  const start =
    count === 7 && !params.has("days")
      ? getTrainingWeekStart(selectedDate as CivilDate)
      : selectedDate;
  const dates = useMemo(
    () =>
      Array.from({ length: count }, (_, offset) => shiftTrainingDate(start as CivilDate, offset)),
    [start, count],
  );
  const { cache, days, retry, invalidate, applyCalendarPatch } = useCalendarDays(
    initialDays,
    dates,
  );
  const range = useMemo<ScheduleRange>(
    () => ({
      activities: [
        ...new Map(
          days.flatMap((day) =>
            "schedule" in day
              ? (day.schedule?.activities ?? []).map((row) => [row.id, row] as const)
              : [],
          ),
        ).values(),
      ],
      reservations: [
        ...new Map(
          days.flatMap((day) =>
            "schedule" in day
              ? (day.schedule?.reservations ?? []).map((row) => [row.id, row] as const)
              : [],
          ),
        ).values(),
      ],
    }),
    [days],
  );
  const requestTraining = useCallback(
    (date: string, start: string, end: string) => {
      void loadTrainingDay(date)
        .then((day) => {
          if (day && "availablePlan" in day && day.availablePlan)
            setTrainingEditor({
              civilDate: date,
              selectedPeriod: { start, end },
              availablePlan: day.availablePlan,
            });
        })
        .catch(() => {
          toast.add({ title: errors("errors.unavailable"), type: "error" });
        });
    },
    [loadTrainingDay, errors],
  );
  const trainingChanged = useCallback((dates: string[]) => dates.forEach(invalidate), [invalidate]);
  const mutateLoadedDates = useCallback(
    (command: Parameters<typeof mutate>[0]) => mutate(command, [...cache.days.keys()]),
    [mutate, cache],
  );
  const navigate = useCallback((href: string) => window.history.pushState(null, "", href), []);
  const activeResolution =
    selectedDate === resolution.civilDate
      ? resolution
      : {
          ...resolution,
          civilDate: selectedDate as CivilDate,
          previousDate: shiftTrainingDate(selectedDate as CivilDate, -1),
          nextDate: shiftTrainingDate(selectedDate as CivilDate, 1),
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
    <ScheduleWorkspace
      initialLists={initialLists}
      initialTodos={initialTodos}
      tags={tags}
      date={selectedDate}
      mutate={mutateLoadedDates}
      loadLists={loadLists}
      loadTodos={loadTodos}
      requestTraining={
        days.some(
          (day) =>
            ("hasActivePlan" in day && day.hasActivePlan) ||
            ("availablePlan" in day && day.availablePlan),
        )
          ? requestTraining
          : undefined
      }
      range={range}
      onCalendarPatch={applyCalendarPatch}
    >
      <TrainingDayPage
        dateResolution={activeResolution}
        view={view}
        onCountChange={changeCount}
        onNavigate={navigate}
        controls={<ScheduleControls />}
      >
        {dates.some((date) => cache.failed.has(date)) && (
          <Button
            onClick={() => {
              retry();
            }}
          >
            {t("retry")}
          </Button>
        )}
        <CalendarGrid
          days={days}
          selectedDate={selectedDate}
          view={view}
          actions={actions}
          loadTrainingDay={loadTrainingDay}
          onTrainingChanged={trainingChanged}
        />
      </TrainingDayPage>
      {trainingEditor && (
        <TrainingActivityEditorContent
          {...trainingEditor}
          actions={actions}
          triggerRef={trainingTrigger}
          onClose={() => setTrainingEditor(null)}
          onCommitted={() => {
            setTrainingEditor(null);
            invalidate(trainingEditor.civilDate);
          }}
        />
      )}
    </ScheduleWorkspace>
  );
}
