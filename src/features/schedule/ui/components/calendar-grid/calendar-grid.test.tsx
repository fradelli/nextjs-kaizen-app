import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "../../../../../../tests/support/render-localized";
import { parseCivilDate } from "../../../../training/domain/training-day.rules";
import { CalendarGrid } from "./calendar-grid";
import type { TrainingActivityDto } from "../../../../training/application/training-dto";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
const action = vi.fn(async () => ({ status: "saved" as const, revision: 1 }));
const actions = {
  addActivity: action,
  updateActivity: action,
  controlActivity: action,
  saveActivityExercise: action,
  deleteActivity: action,
};
const days = ["2026-11-10", "2026-11-11"].map((date) => ({
  civilDate: parseCivilDate(date),
  state: "unavailable" as const,
  reason: "active_plan_not_found" as const,
  activities: [],
}));

beforeEach(() => {
  sessionStorage.clear();
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-10T15:08:00Z"));
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("CalendarGrid", () => {
  it("selects a period while the tasks panel is open", () => {
    const panel = document.createElement("div");
    panel.id = "schedule-editor-panel";
    panel.appendChild(document.createElement("aside"));
    document.body.appendChild(panel);
    const selected = vi.fn();
    window.addEventListener("schedule-select-period", selected);
    try {
      const view = render(
        <CalendarGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />,
      );
      const column =
        view.container.querySelector('[aria-label="ter., 10"]') ??
        view.container.querySelector("[data-weekend]");
      const day =
        column ??
        [...view.container.querySelectorAll("div[aria-label]")].find((el) =>
          el.getAttribute("aria-label")?.includes("10"),
        );
      if (!day) throw new Error("Day column missing");
      Object.defineProperty(day, "setPointerCapture", { value: vi.fn(), configurable: true });
      vi.spyOn(day, "getBoundingClientRect").mockReturnValue({
        top: 0,
        left: 0,
        right: 200,
        bottom: 1440,
        width: 200,
        height: 1440,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      const pointer = (type: string, y: number) => {
        const event = new Event(type, { bubbles: true });
        Object.defineProperties(event, {
          button: { value: 0 },
          isPrimary: { value: true },
          pointerId: { value: 1 },
          clientX: { value: 50 },
          clientY: { value: y },
        });
        fireEvent(day, event);
      };
      pointer("pointerdown", 540);
      pointer("pointermove", 585);
      pointer("pointerup", 585);
      expect(selected).toHaveBeenCalledOnce();
      expect(selected.mock.calls[0][0].detail).toMatchObject({
        civilDate: "2026-11-10",
        selectedPeriod: { start: "09:00", end: "10:00" },
      });
    } finally {
      panel.remove();
      window.removeEventListener("schedule-select-period", selected);
    }
  });
  it("marca a sessão de segundos no horário e oferece o detalhe na lista acessível", () => {
    const brief: TrainingActivityDto = {
      id: "brief",
      type: "structured_training",
      source: "plan",
      role: "primary",
      name: "Sessão breve",
      sport: null,
      status: "completed",
      plannedStartTime: "09:00",
      plannedEndTime: "09:30",
      plannedDurationMinutes: 30,
      actualStartTime: "12:08",
      actualEndTime: "12:08",
      actualDurationMinutes: 0,
      startedAt: "2026-11-10T15:08:20Z",
      completedAt: "2026-11-10T15:08:30Z",
      accumulatedActiveSeconds: 10,
      currentIntervalStartedAt: null,
      intervals: [{ startedAt: "2026-11-10T15:08:20Z", endedAt: "2026-11-10T15:08:30Z" }],
      intensity: "moderate",
      energy: "normal",
      comment: null,
      revision: 1,
      structured: {
        preparation: null,
        main: {
          role: "main",
          sessionId: "short",
          name: "Sessão breve",
          targetDurationMinutes: 30,
          shortDurationMinutes: null,
          intensity: null,
          notes: null,
          exercises: [],
        },
      },
      preparations: [],
    };
    const normal = {
      ...brief,
      id: "normal",
      name: "Sessão longa",
      actualDurationMinutes: 30,
      intervals: [],
    };
    const view = render(
      <CalendarGrid
        days={[{ ...days[0]!, activities: [brief, normal] }]}
        selectedDate={days[0]!.civilDate}
        actions={actions}
      />,
    );
    const marker = view.container.querySelector(
      '[aria-hidden="true"][data-kind="structured_training"]',
    );
    expect(marker).not.toBeNull();
    const slot = marker!.parentElement!;
    expect(parseFloat(slot.style.top)).toBeCloseTo(((728 + 20 / 60) / 1440) * 100);
    expect(parseFloat(slot.style.height)).toBeCloseTo((10 / 60 / 1440) * 100);
    expect(
      screen.queryByRole("button", { name: /Sem intervalo de horário/ }),
    ).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Menos de 1 min (1)" }));
    const dialog = within(screen.getByRole("dialog"));
    expect(dialog.getByRole("link", { name: "Sessão breve · 12:08" })).toHaveAttribute(
      "href",
      "/workout/activity/brief?date=2026-11-10",
    );
    expect(dialog.queryByText("Sessão longa")).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });
  it("recupera a posição da agenda da mesma data depois de voltar do treino", () => {
    const style = document.createElement("div").style;
    style.setProperty("--hour-height", "64");
    vi.spyOn(window, "getComputedStyle").mockReturnValue(style);
    const first = render(
      <CalendarGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />,
    );
    act(() => vi.advanceTimersByTime(1));
    const scroller = screen.getByLabelText("Grade de horários da Agenda");
    scroller.scrollTop = 640;
    fireEvent.scroll(scroller);
    first.unmount();
    render(<CalendarGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByLabelText("Grade de horários da Agenda").scrollTop).toBe(640);
  });
  it("atualiza a hora atual sem perder a posição escolhida na grade", () => {
    render(<CalendarGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("12:08")).toBeInTheDocument();
    const scroller = screen.getByLabelText("Grade de horários da Agenda");
    scroller.scrollTop = 456;
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("12:09")).toBeInTheDocument();
    expect(scroller.scrollTop).toBe(456);
    expect(action).not.toHaveBeenCalled();
  });
  it("exibe na escala apenas os hor�rios internos do dia", () => {
    render(<CalendarGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    expect(screen.queryByText("00:00")).not.toBeInTheDocument();
    expect(screen.getByText("01:00")).toBeInTheDocument();
    expect(screen.getByText("23:00")).toBeInTheDocument();
    expect(screen.queryByText("24:00")).not.toBeInTheDocument();
  });
});
