"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
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
  const civilDate =
    dateResolution.status === "valid" ? dateResolution.civilDate : dateResolution.todayDate;
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
        router.push(createTrainingDateHref(dateResolution.todayDate, view));
      } else if ((key === "d" || key === "w") && window.matchMedia("(min-width: 48rem)").matches) {
        event.preventDefault();
        router.push(createTrainingDateHref(civilDate, key === "d" ? "day" : "week"));
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [civilDate, dateResolution.todayDate, router, view]);
  const weekStart =
    dateResolution.status === "valid" ? getTrainingWeekStart(dateResolution.civilDate) : null;
  const previousWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, -1)
      : shiftTrainingDate(weekStart, -7)
    : null;
  const nextWeek = weekStart
    ? view === "day"
      ? shiftTrainingDate(civilDate, 1)
      : shiftTrainingDate(weekStart, 7)
    : null;

  if (dateResolution.status === "invalid") {
    return (
      <nav className={trainingDateNavigationStyles.root} aria-label={t("dateNavigation")}>
        <Button size="icon" variant="ghost" tone="neutral" aria-label={t("previous")} disabled>
          <ChevronLeft size={12} aria-hidden="true" />
        </Button>
        <Button variant="secondary" tone="neutral" asChild>
          <Link prefetch={false} href={createTrainingDateHref(dateResolution.todayDate)}>
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
                  router.push(createTrainingDateHref(civilDate, option));
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
          href={createTrainingDateHref(dateResolution.previousDate, view)}
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
          href={createTrainingDateHref(previousWeek!, view)}
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
            href={createTrainingDateHref(dateResolution.todayDate, view)}
            title={`${t("today")} · T`}
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
              href={createTrainingDateHref(dateResolution.nextDate, view)}
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
            <Link
              prefetch={false}
              href={createTrainingDateHref(nextWeek!, view)}
              aria-label={t("next")}
            >
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
    </nav>
  );
}
