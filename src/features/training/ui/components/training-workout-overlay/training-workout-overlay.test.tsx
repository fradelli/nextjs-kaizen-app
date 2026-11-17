import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../../../tests/support/render-localized";
import { TrainingWorkoutOverlay } from "./training-workout-overlay";
import { TrainingRestTimer } from "../training-day-page/components/training-rest-timer/training-rest-timer";
import { TrainingActivityModal } from "../training-day-page/components/training-activity-modal/training-activity-modal";

const back = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ back }) }));
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-11-11T15:00:00Z"));
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  back.mockClear();
});

describe("TrainingWorkoutOverlay", () => {
  it("libera a rolagem ao desmontar a sobreposição junto com um diálogo interno", () => {
    document.body.style.overflow = "scroll";
    const page = render(
      <TrainingWorkoutOverlay>
        <TrainingActivityModal
          title="Avaliação"
          busy={false}
          footer={null}
          onRequestClose={vi.fn()}
        >
          <p>Avaliação do treino</p>
        </TrainingActivityModal>
      </TrainingWorkoutOverlay>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    page.unmount();
    expect(document.body.style.overflow).toBe("scroll");
  });
  it("fecha pela navegação de retorno e restaura a rolagem do documento", () => {
    document.body.style.overflow = "auto";
    const page = render(
      <TrainingWorkoutOverlay>
        <p>Treino</p>
      </TrainingWorkoutOverlay>,
    );
    expect(document.body.style.overflow).toBe("hidden");
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(back).toHaveBeenCalledTimes(1);
    page.unmount();
    expect(document.body.style.overflow).toBe("auto");
  });
  it("mantém o painel de descanso dentro do diálogo ativo", () => {
    render(
      <TrainingWorkoutOverlay>
        <TrainingRestTimer endsAt={Date.now() + 90_000} onAdjust={vi.fn()} onSkip={vi.fn()} />
      </TrainingWorkoutOverlay>,
    );
    act(() => vi.advanceTimersByTime(250));
    expect(screen.getByRole("region", { name: "Descanso" }).closest('[role="dialog"]')).toBe(
      screen.getByRole("dialog"),
    );
  });
});
