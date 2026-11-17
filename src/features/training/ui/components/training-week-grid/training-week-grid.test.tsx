import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "../../../../../../tests/support/render-localized";
import { parseCivilDate } from "../../../domain/training-day.rules";
import { TrainingWeekGrid } from "./training-week-grid";
import type { TrainingActivityDto } from "../../../application/training-dto";

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

describe("TrainingWeekGrid", () => {
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
      <TrainingWeekGrid
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
      <TrainingWeekGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />,
    );
    act(() => vi.advanceTimersByTime(1));
    const scroller = screen.getByLabelText("Grade de horários da Agenda");
    scroller.scrollTop = 640;
    fireEvent.scroll(scroller);
    first.unmount();
    render(<TrainingWeekGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByLabelText("Grade de horários da Agenda").scrollTop).toBe(640);
  });
  it("atualiza a hora atual sem perder a posição escolhida na grade", () => {
    render(<TrainingWeekGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    act(() => vi.advanceTimersByTime(1));
    expect(screen.getByText("12:08")).toBeInTheDocument();
    const scroller = screen.getByLabelText("Grade de horários da Agenda");
    scroller.scrollTop = 456;
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("12:09")).toBeInTheDocument();
    expect(scroller.scrollTop).toBe(456);
    expect(action).not.toHaveBeenCalled();
  });
  it("abre a lista do dia pelo cabeçalho e representa as extremidades de 24 horas", () => {
    render(<TrainingWeekGrid days={days} selectedDate={days[0]!.civilDate} actions={actions} />);
    expect(screen.getByText("00:00")).toBeInTheDocument();
    expect(screen.getByText("24:00")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Ver atividades de.*11/ }));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Nenhuma atividade programada")).toBeInTheDocument();
  });
});
