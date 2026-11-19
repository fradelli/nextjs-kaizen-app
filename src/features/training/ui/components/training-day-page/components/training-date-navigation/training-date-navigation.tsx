"use client";
import { useCallback, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";

import { PopoverRoot, PopoverTrigger, PopoverContent } from "@fradelli/ui/popover";
import { ControlTooltip } from "@/components/shared/control-tooltip/control-tooltip";
import { Button } from "@fradelli/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuShortcut,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
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
  onCountChange,
  onNavigate,
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
      return range === 7 && !params?.has("days") ? href : href + "&days=" + range;
    },
    [count, view, params],
  );
  const weekStart =
    dateResolution.status === "valid" ? getTrainingWeekStart(dateResolution.civilDate) : null;
  const previousWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, -1)
      : shiftTrainingDate(count === 7 && !params?.has("days") ? weekStart : civilDate, -count)
    : null;
  const nextWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, 1)
      : shiftTrainingDate(count === 7 && !params?.has("days") ? weekStart : civilDate, count)
    : null;

  const visibleCount = view === "day" ? 1 : count;
  const changeCount = useCallback(
    (value: number) => {
      if (onCountChange) return onCountChange(value);
      const next = new URLSearchParams(params?.toString());
      next.set("days", String(value));
      next.set("view", value === 1 ? "day" : "week");
      next.set("date", civilDate);
      startRangeChange(() => router.push(`/workout?${next}`));
    },
    [onCountChange, params, civilDate, router],
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
        if (onNavigate) onNavigate(hrefForDate(dateResolution.todayDate, view));
        else router.push(hrefForDate(dateResolution.todayDate, view));
      } else if ((key === "d" || key === "w") && window.matchMedia("(min-width: 48rem)").matches) {
        event.preventDefault();
        changeCount(key === "d" ? 1 : 7);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [civilDate, dateResolution.todayDate, router, view, hrefForDate, changeCount, onNavigate]);

  if (dateResolution.status === "invalid") {
    return (
      <nav
        className={trainingDateNavigationStyles.root}
        aria-label={t("dateNavigation")}
        onClick={(event) => {
          if (
            !onNavigate ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey ||
            event.altKey
          )
            return;
          const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
          if (!link || link.target || link.origin !== window.location.origin) return;
          event.preventDefault();
          onNavigate(link.pathname + link.search);
        }}
      >
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
    <nav
      className={trainingDateNavigationStyles.root}
      aria-label={t("dateNavigation")}
      onClick={(event) => {
        if (
          !onNavigate ||
          event.defaultPrevented ||
          event.button !== 0 ||
          event.ctrlKey ||
          event.metaKey ||
          event.shiftKey ||
          event.altKey
        )
          return;
        const link = (event.target as Element).closest<HTMLAnchorElement>("a[href]");
        if (!link || link.target || link.origin !== window.location.origin) return;
        event.preventDefault();
        onNavigate(link.pathname + link.search);
      }}
    >
      <div className="hidden md:block">
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="secondary" tone="neutral" />}>
            {visibleCount === 1
              ? t("dayView")
              : visibleCount === 7
                ? t("weekView")
                : t("daysView", { count: visibleCount })}{" "}
            <ChevronDown aria-hidden />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="min-w-44" aria-label={t("calendarView")}>
            <DropdownMenuRadioGroup
              value={visibleCount === 1 ? "day" : visibleCount === 7 ? "week" : "custom"}
              onValueChange={(option) => {
                if (option === "day" || option === "week") changeCount(option === "day" ? 1 : 7);
              }}
            >
              {(["day", "week"] as const).map((option) => (
                <DropdownMenuRadioItem key={option} value={option}>
                  {t(option === "day" ? "dayView" : "weekView")}
                  <DropdownMenuShortcut>{option === "day" ? "D" : "W"}</DropdownMenuShortcut>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>{t("displayedDays")}</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuRadioGroup
                  value={String(visibleCount)}
                  onValueChange={(value) => changeCount(Number(value))}
                >
                  {[2, 3, 4, 5, 6, 7, 8, 9, 10, 14].map((days) => (
                    <DropdownMenuRadioItem key={days} value={String(days)}>
                      {t("daysView", { count: days })}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
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
      <ControlTooltip label={t("today")} shortcut="T">
        {dateResolution.isToday ? (
          <Button type="button" tone="neutral" variant="default" disabled aria-current="date">
            {t("today")}
          </Button>
        ) : (
          <Button variant="secondary" tone="neutral" asChild>
            <Link
              prefetch={false}
              href={hrefForDate(dateResolution.todayDate, view)}
              aria-keyshortcuts="T"
            >
              {t("today")}
            </Link>
          </Button>
        )}
      </ControlTooltip>
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
          <ControlTooltip label={t("displayedDays")}>
            <Button size="icon" variant="ghost" tone="neutral" aria-label={t("displayedDays")}>
              &plusmn;
            </Button>
          </ControlTooltip>
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
            &minus;
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
