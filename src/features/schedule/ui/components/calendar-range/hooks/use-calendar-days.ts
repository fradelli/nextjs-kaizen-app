import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import type { SchedulePatch } from "../../../../application/schedule-command";
import type { CalendarDay } from "../calendar-range.types";
import { scheduleForDate } from "../../../../application/schedule-range.utils";

const MAX_CACHED_DAYS = 84;
const MAX_CONCURRENT_READS = 4;

// The cache belongs to the open agenda, never to Next's shared server cache.
export function useCalendarDays(initialDays: readonly CalendarDay[], dates: readonly string[]) {
  const [cache] = useState(() => ({
    days: new Map(initialDays.map((day) => [day.civilDate as string, day])),
    pending: new Map<string, AbortController>(),
    failed: new Set<string>(),
    epochs: new Map<string, number>(),
  }));
  const initialSnapshot = useRef(initialDays);
  const visible = useRef(dates);
  useEffect(() => {
    visible.current = dates;
  }, [dates]);
  const [snapshot, redraw] = useReducer(
    () => new Map(cache.days),
    cache.days,
    (days) => new Map(days),
  );
  const prune = useCallback(() => {
    for (const key of cache.days.keys()) {
      if (cache.days.size <= MAX_CACHED_DAYS) break;
      if (!visible.current.includes(key)) {
        cache.days.delete(key);
        cache.epochs.delete(key);
      }
    }
  }, [cache]);
  useEffect(() => {
    if (initialSnapshot.current === initialDays) return;
    initialSnapshot.current = initialDays;
    for (const day of initialDays) {
      cache.epochs.set(day.civilDate, (cache.epochs.get(day.civilDate) ?? 0) + 1);
      cache.days.set(day.civilDate, day);
    }
    prune();
    redraw();
  }, [initialDays, cache, prune]);
  useEffect(() => {
    for (const date of dates) {
      if (cache.pending.size >= MAX_CONCURRENT_READS) break;
      if (cache.days.has(date) || cache.pending.has(date) || cache.failed.has(date)) continue;
      const controller = new AbortController();
      const epoch = cache.epochs.get(date) ?? 0;
      cache.pending.set(date, controller);
      void fetch(`/workout/calendar-day?date=${date}`, {
        signal: controller.signal,
        cache: "no-store",
      })
        .then(async (response) => {
          if (!response.ok) throw new Error("Calendar day unavailable");
          const day: CalendarDay = await response.json();
          if (day.civilDate !== date) throw new Error("Unexpected calendar date");
          if (!controller.signal.aborted && epoch === (cache.epochs.get(date) ?? 0)) {
            cache.days.set(date, day);
            prune();
          }
        })
        .catch(() => {
          if (!controller.signal.aborted) cache.failed.add(date);
        })
        .finally(() => {
          if (cache.pending.get(date) === controller) cache.pending.delete(date);
          redraw();
        });
    }
  }, [dates, cache, snapshot, prune]);
  useEffect(
    () => () => {
      cache.pending.forEach((controller) => controller.abort());
      cache.pending.clear();
    },
    [cache],
  );
  const retry = useCallback(() => {
    cache.failed.clear();
    redraw();
  }, [cache]);
  const invalidate = useCallback(
    (date: string) => {
      cache.epochs.set(date, (cache.epochs.get(date) ?? 0) + 1);
      cache.days.delete(date);
      cache.failed.delete(date);
      cache.pending.get(date)?.abort();
      cache.pending.delete(date);
      redraw();
    },
    [cache],
  );
  const applyCalendarPatch = useCallback(
    (patch: NonNullable<SchedulePatch["calendar"]>) => {
      for (const date of patch.dates) {
        const day = cache.days.get(date);
        // A pending full-day read must not overwrite a newer mutation response.
        cache.epochs.set(date, (cache.epochs.get(date) ?? 0) + 1);
        cache.pending.get(date)?.abort();
        cache.pending.delete(date);
        if (day) {
          if (!patch.refreshedDates || patch.refreshedDates.includes(date))
            cache.days.set(date, { ...day, schedule: scheduleForDate(patch.range, date) });
          else cache.days.delete(date);
        }
      }
      redraw();
    },
    [cache],
  );
  const days = useMemo(
    () =>
      dates.map(
        (civilDate) =>
          snapshot.get(civilDate) ?? {
            state: "loading" as const,
            civilDate: civilDate as CalendarDay["civilDate"],
            activities: [] as const,
          },
      ),
    [dates, snapshot],
  );
  return { cache, days, retry, invalidate, applyCalendarPatch };
}
