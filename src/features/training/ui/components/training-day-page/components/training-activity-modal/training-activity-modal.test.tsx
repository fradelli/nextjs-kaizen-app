import {
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../../../../../tests/support/render-localized";
import { afterEach, beforeEach, describe, it, expect, vi } from "vitest";
import { TrainingActivityModal } from "./training-activity-modal";
beforeEach(() => {
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
});
describe("activity modal", () => {
  it("wraps Tab and Shift+Tab within the visible modal controls", () => {
    render(
      <TrainingActivityModal
        title="Modal"
        description="Dados"
        busy={false}
        onRequestClose={vi.fn()}
        footer={<button>Salvar</button>}
      >
        <input aria-label="Nome" />
      </TrainingActivityModal>,
    );
    const close = screen.getByRole("button", { name: "Fechar formulário" }),
      save = screen.getByRole("button", { name: "Salvar" });
    for (const element of [close, save, screen.getByLabelText("Nome")])
      vi.spyOn(element, "getClientRects").mockReturnValue([{}] as unknown as DOMRectList);
    save.focus();
    fireEvent.keyDown(save, { key: "Tab" });
    expect(close).toHaveFocus();
    fireEvent.keyDown(close, { key: "Tab", shiftKey: true });
    expect(save).toHaveFocus();
  });

  it("labels the dialog, focuses its title and restores focus and scrolling", () => {
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
    expect(screen.getByRole("heading")).toHaveFocus();
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(trigger).toHaveFocus();
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
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true, bubbles: true }));
    expect(close).toHaveBeenCalledTimes(1);
    rerender(<TrainingActivityModal {...props} busy />);
    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true, bubbles: true }));
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
    const dialog = screen.getByRole("dialog");
    vi.spyOn(dialog, "getBoundingClientRect").mockReturnValue({
      left: 20,
      top: 20,
      right: 200,
      bottom: 300,
    } as DOMRect);
    fireEvent(dialog, new MouseEvent("pointerdown", { bubbles: true, clientX: 40, clientY: 40 }));
    fireEvent.click(dialog, { clientX: 5, clientY: 5 });
    expect(close).not.toHaveBeenCalled();
    fireEvent(dialog, new MouseEvent("pointerdown", { bubbles: true, clientX: 5, clientY: 5 }));
    fireEvent.click(dialog, { clientX: 5, clientY: 5 });
    expect(close).toHaveBeenCalledTimes(1);
  });
});
