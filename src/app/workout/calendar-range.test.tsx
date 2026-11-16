import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { useSyncExternalStore } from "react";
import { CalendarRange } from "./calendar-range";
import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import type { TrainingDayDto } from "@/features/training/application/training-dto";
import type { TrainingDayFormActions } from "@/features/training/ui/training-action.types";

vi.mock("next/navigation", () => ({
  useSearchParams: () =>
    new URLSearchParams(
      useSyncExternalStore(
        (listener) => {
          window.addEventListener("range-test", listener);
          return () => window.removeEventListener("range-test", listener);
        },
        () => location.search,
      ),
    ),
}));
vi.mock("next-intl", () => ({ useTranslations: () => (key: string) => key }));
vi.mock(
  "@/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor",
  () => ({ TrainingActivityEditor: () => null }),
);
vi.mock("@/features/training/ui/components/training-day-page/training-day-page", () => ({
  TrainingDayPage: ({
    onCountChange,
    children,
  }: {
    onCountChange: (n: number) => void;
    children: React.ReactNode;
  }) => (
    <>
      <button onClick={() => onCountChange(7)}>seven</button>
      <button onClick={() => onCountChange(8)}>eight</button>
      {children}
    </>
  ),
}));
vi.mock("@/features/training/ui/components/training-week-grid/training-week-grid", () => ({
  TrainingWeekGrid: ({ days }: { days: TrainingDayDto[] }) => (
    <output>{days.map((d) => d.civilDate).join(",")}</output>
  ),
}));

it("extends and shrinks the visible range while fetching the eighth day only once", async () => {
  const replace = window.history.replaceState.bind(window.history);
  replace(null, "", "/workout?date=2026-11-15&days=7");
  const history = vi.spyOn(window.history, "replaceState").mockImplementation((...args) => {
    replace(...args);
    window.dispatchEvent(new Event("range-test"));
  });
  const request = vi
    .fn()
    .mockResolvedValue(Response.json({ civilDate: "2026-11-22", activities: [] }));
  vi.stubGlobal("fetch", request);
  try {
    const resolution = resolveTrainingDayDate({ rawDate: "2026-11-15" });
    if (resolution.status !== "valid") throw new Error("Invalid fixture");
    const days = Array.from({ length: 7 }, (_, i) => ({
      civilDate: `2026-11-${15 + i}` as TrainingDayDto["civilDate"],
      state: "unavailable",
      reason: "active_plan_not_found",
      activities: [],
    })) as TrainingDayDto[];
    render(
      <CalendarRange
        initialDays={days}
        resolution={resolution}
        actions={{} as TrainingDayFormActions}
      >
        {null}
      </CalendarRange>,
    );
    for (const label of ["eight", "seven", "eight"]) {
      fireEvent.click(screen.getByText(label));
      expect(screen.getByRole("status").textContent?.split(",")).toHaveLength(
        label === "seven" ? 7 : 8,
      );
    }
    await waitFor(() => expect(request).toHaveBeenCalledTimes(1));
    expect(request).toHaveBeenCalledWith("/workout/calendar-day?date=2026-11-22");
  } finally {
    history.mockRestore();
    vi.unstubAllGlobals();
  }
});
