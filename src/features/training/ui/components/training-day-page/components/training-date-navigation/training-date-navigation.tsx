"use client";
import { useCallback, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { PopoverRoot, PopoverTrigger, PopoverContent } from "@fradelli/ui/popover";
import { Button } from "@fradelli/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
} from "@fradelli/ui/dropdown-menu";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { trainingDateNavigationStyles } from "./training-date-navigation.styles";
import type { TrainingDateNavigationProps } from "./training-date-navigation.types";
import {
  createTrainingDateHref,
  getTrainingWeekStart,
  shiftTrainingDate,
} from "./training-date-navigation.utils";

export function TrainingDateNavigation({
  dateResolution,
  view = "week",
}: TrainingDateNavigationProps) {
  const t = useTranslations("training");
  const router = useRouter();
  const params = useSearchParams();
  const civilDate =
    dateResolution.status === "valid" ? dateResolution.civilDate : dateResolution.todayDate;
  const [changingCount, startRangeChange] = useTransition();
  const requestedCount = Number(params?.get("days") ?? 7);
  const count =
    Number.isInteger(requestedCount) && requestedCount >= 1 && requestedCount <= 14
      ? requestedCount
      : 7;
  const hrefForDate = useCallback(
    (date: Parameters<typeof createTrainingDateHref>[0], mode: "day" | "week" = view) => {
      const href = createTrainingDateHref(date, mode);
      const range = mode === "day" ? 1 : count === 1 ? 7 : count;
      return range === 7 ? href : href + "&days=" + range;
    },
    [count, view],
  );
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      if (
        event.defaultPrevented ||
        event.repeat ||
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        target?.closest(
          'input, textarea, select, [contenteditable="true"], [role="dialog"], dialog, [role="menu"]',
        )
      )
        return;
      const key = event.key.toLowerCase();
      if (key === "t") {
        event.preventDefault();
        router.push(hrefForDate(dateResolution.todayDate, view));
      } else if ((key === "d" || key === "w") && window.matchMedia("(min-width: 48rem)").matches) {
        event.preventDefault();
        router.push(hrefForDate(civilDate, key === "d" ? "day" : "week"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [civilDate, dateResolution.todayDate, router, view, hrefForDate]);
  const weekStart =
    dateResolution.status === "valid" ? getTrainingWeekStart(dateResolution.civilDate) : null;
  const previousWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, -1)
      : shiftTrainingDate(count === 7 ? weekStart : civilDate, -count)
    : null;
  const nextWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, 1)
      : shiftTrainingDate(count === 7 ? weekStart : civilDate, count)
    : null;

  const visibleCount = view === "day" ? 1 : count;
  function changeCount(value: number) {
    const next = new URLSearchParams(params?.toString());
    next.set("days", String(value));
    next.set("view", value === 1 ? "day" : "week");
    next.set("date", civilDate);
    startRangeChange(() => router.push(`/workout?${next}`));
  }

  if (dateResolution.status === "invalid") {
    return (
      <nav className={trainingDateNavigationStyles.root} aria-label={t("dateNavigation")}>
        <Button size="icon" variant="ghost" tone="neutral" aria-label={t("previous")} disabled>
          <ChevronLeft size={12} aria-hidden="true" />
        </Button>
        <Button variant="secondary" tone="neutral" asChild>
          <Link prefetch={false} href={hrefForDate(dateResolution.todayDate)}>
            {t("today")}
          </Link>
        </Button>
        <Button size="icon" variant="ghost" tone="neutral" aria-label={t("next")} disabled>
          <ChevronRight size={12} aria-hidden="true" />
        </Button>
      </nav>
    );
  }

  return (
    <nav className={trainingDateNavigationStyles.root} aria-label={t("dateNavigation")}>
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" tone="neutral" />}>
            {t(view === "day" ? "dayView" : "weekView")} <ChevronDown aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" aria-label={t("calendarView")}>
            <DropdownMenuRadioGroup
              value={view}
              onValueChange={(option) => {
                if (option === "day" || option === "week")
                  router.push(hrefForDate(civilDate, option));
              }}
            >
              {(["day", "week"] as const).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {t(option === "day" ? "dayView" : "weekView")}
                  <DropdownMenuShortcut>{option === "day" ? "D" : "W"}</DropdownMenuShortcut>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        size="icon"
        className={trainingDateNavigationStyles.mobileOnly}
        variant="ghost"
        tone="neutral"
        asChild
      >
        <Link
          prefetch={false}
          href={hrefForDate(dateResolution.previousDate, view)}
          aria-label={t("previous")}
        >
          <ChevronLeft size={12} aria-hidden="true" />
        </Link>
      </Button>
      <Button
        size="icon"
        className={trainingDateNavigationStyles.desktopOnly}
        variant="ghost"
        tone="neutral"
        asChild
      >
        <Link
          prefetch={false}
          href={hrefForDate(previousWeek!, view)}
          aria-label={t("openPreviousDay")}
        >
          <ChevronLeft size={12} aria-hidden="true" />
        </Link>
      </Button>
      {dateResolution.isToday ? (
        <Button type="button" tone="neutral" variant="default" disabled aria-current="date">
          {t("today")}
        </Button>
      ) : (
        <Button variant="secondary" tone="neutral" asChild>
          <Link
            prefetch={false}
            href={hrefForDate(dateResolution.todayDate, view)}
            title={`${t("today")} Ã‚Â· T`}
          >
            {t("today")}
          </Link>
        </Button>
      )}
      {dateResolution.canNavigateNext ? (
        <>
          <Button
            size="icon"
            className={trainingDateNavigationStyles.mobileOnly}
            variant="ghost"
            tone="neutral"
            asChild
          >
            <Link
              prefetch={false}
              href={hrefForDate(dateResolution.nextDate, view)}
              aria-label={t("next")}
            >
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </Button>
          <Button
            size="icon"
            className={trainingDateNavigationStyles.desktopOnly}
            variant="ghost"
            tone="neutral"
            asChild
          >
            <Link prefetch={false} href={hrefForDate(nextWeek!, view)} aria-label={t("next")}>
              <ChevronRight size={12} aria-hidden="true" />
            </Link>
          </Button>
        </>
      ) : (
        <Button
          size="icon"
          variant="ghost"
          tone="neutral"
          aria-label={t("nextDayUnavailable")}
          disabled
        >
          <ChevronRight size={12} aria-hidden="true" />
        </Button>
      )}
      <PopoverRoot>
        <PopoverTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            tone="neutral"
            aria-label={t("displayedDays")}
            title={t("displayedDays")}
          >
            ±
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="flex w-auto items-center gap-1 p-1">
          <Button
            size="icon"
            variant="ghost"
            tone="neutral"
            disabled={visibleCount <= 1 || changingCount}
            aria-label={t("fewerDays")}
            onClick={() => changeCount(visibleCount - 1)}
          >
            −
          </Button>
          <output aria-live="polite" className="min-w-5 text-center tabular-nums">
            {visibleCount}
          </output>
          <Button
            size="icon"
            variant="ghost"
            tone="neutral"
            disabled={visibleCount >= 14 || changingCount}
            aria-label={t("moreDays")}
            onClick={() => changeCount(visibleCount + 1)}
          >
            +
          </Button>
        </PopoverContent>
      </PopoverRoot>
    </nav>
  );
}
