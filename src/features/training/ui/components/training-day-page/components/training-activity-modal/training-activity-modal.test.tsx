import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, describe, it, expect, vi } from "vitest";
import { TrainingActivityModal } from "./training-activity-modal";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("activity modal", () => {
  it("labels the dialog, focuses its title and restores focus and scrolling", async () => {
    const trigger = document.createElement("button");
    document.body.append(trigger);
    trigger.focus();
    const { unmount } = render(
      <TrainingActivityModal
        title="Editar atividade"
        description="Dados"
        busy={false}
        onRequestClose={vi.fn()}
        footer={<button>Salvar</button>}
      >
        <input aria-label="Nome" />
      </TrainingActivityModal>,
    );
    expect(screen.getByRole("dialog", { name: "Editar atividade" })).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole("heading")).toHaveFocus());
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(document.body.style.overflow).toBe("");
    trigger.remove();
  });
  it("routes escape through the close guard and blocks it while busy", () => {
    const close = vi.fn();
    const props = {
      title: "Adicionar atividade",
      description: "Dados",
      footer: null,
      onRequestClose: close,
      children: null,
    };
    const { rerender } = render(<TrainingActivityModal {...props} busy={false} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
    rerender(<TrainingActivityModal {...props} busy />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    expect(close).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "Fechar formulário" })).toBeDisabled();
  });
  it("only closes interactions which start and finish on the backdrop", () => {
    const close = vi.fn();
    render(
      <TrainingActivityModal
        title="Modal"
        description="Dados"
        busy={false}
        onRequestClose={close}
        footer={null}
      >
        <button>Campo</button>
      </TrainingActivityModal>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Campo" }));
    expect(close).not.toHaveBeenCalled();
    const backdrop = document.querySelector('[data-slot="dialog-overlay"]')!;
    fireEvent.pointerDown(backdrop, { button: 0, pointerType: "mouse" });
    fireEvent.pointerUp(backdrop, { button: 0, pointerType: "mouse" });
    fireEvent.click(backdrop);
    expect(close).toHaveBeenCalledTimes(1);
  });
});
