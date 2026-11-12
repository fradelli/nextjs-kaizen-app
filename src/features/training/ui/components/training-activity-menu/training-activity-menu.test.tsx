import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../../../tests/support/render-localized";
import type { TrainingActivityDto } from "../../../application/training-dto";
import { TrainingActivityMenu } from "./training-activity-menu";

const state = vi.hoisted(() => ({ active: false, ready: true }));
vi.mock("../../hooks/use-training-activity-draft/use-training-activity-draft", () => ({
  useTrainingActivityDraft: () => ({ ready: state.ready, draft: state.active ? {} : null }),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));
const action = vi.fn();
const actions = {
  addActivity: action,
  updateActivity: action,
  controlActivity: action,
  saveActivityExercise: action,
  deleteActivity: action,
};
const activity: TrainingActivityDto = {
  id: "activity",
  type: "sport_practice",
  source: "manual",
  role: "primary",
  name: "Vôlei",
  sport: "Vôlei",
  status: "scheduled",
  plannedStartTime: "12:00",
  plannedEndTime: "13:00",
  plannedDurationMinutes: 60,
  actualStartTime: null,
  actualEndTime: null,
  actualDurationMinutes: null,
  startedAt: null,
  completedAt: null,
  accumulatedActiveSeconds: 0,
  currentIntervalStartedAt: null,
  intervals: [],
  intensity: null,
  energy: null,
  comment: null,
  revision: 0,
  structured: null,
  preparations: [],
};
afterEach(() => {
  cleanup();
  state.active = false;
  state.ready = true;
  vi.useRealTimers();
});
describe("TrainingActivityMenu", () => {
  it("indica a leitura do rascunho antes de disponibilizar ações", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T15:00:00Z"));
    state.ready = false;
    render(<TrainingActivityMenu activity={activity} civilDate="2026-11-11" actions={actions} />);
    expect(screen.getByText("Verificando execução local...")).toBeInTheDocument();
    expect(screen.queryByText(/Finalize ou descarte/)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Excluir atividade", hidden: true }),
    ).not.toBeInTheDocument();
  });
  it("reúne mover e remover no menu da ocorrência", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T15:00:00Z"));
    render(<TrainingActivityMenu activity={activity} civilDate="2026-11-11" actions={actions} />);
    expect(screen.getByRole("button", { name: "Opções de Vôlei" })).toHaveAttribute(
      "popovertarget",
    );
    fireEvent.click(screen.getByRole("button", { name: "Opções de Vôlei" }));
    // JSDOM keeps native popovers hidden; verify their actions without simulating the browser primitive.
    expect(
      screen.getByRole("button", { name: "Mudar dia ou horário", hidden: true }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Excluir atividade", hidden: true }),
    ).toBeInTheDocument();
  });
  it("bloqueia as ações para uma execução local ativa", () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(new Date("2026-11-11T15:00:00Z"));
    state.active = true;
    render(<TrainingActivityMenu activity={activity} civilDate="2026-11-11" actions={actions} />);
    fireEvent.click(screen.getByRole("button", { name: "Opções de Vôlei" }));
    expect(screen.getByText(/Finalize ou descarte/)).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Mudar dia ou horário", hidden: true }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Excluir atividade", hidden: true }),
    ).not.toBeInTheDocument();
    expect(action).not.toHaveBeenCalled();
  });
});
