import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "../../../../../../tests/support/render-localized";
import { ActiveTrainingBar } from "./active-training-bar";
import { readActiveTrainingDrafts } from "./active-training-bar.utils";
import { trainingActivityDraftKey } from "../../hooks/use-training-activity-draft/use-training-activity-draft.utils";
import type { TrainingActivityExecutionDraft } from "../../hooks/use-training-activity-draft/use-training-activity-draft.types";

let pathname = "/nutrition";
vi.mock("next/navigation", () => ({ usePathname: () => pathname }));
const draft: TrainingActivityExecutionDraft = {
  version: 1,
  activityId: "one",
  civilDate: "2026-11-11",
  activityName: "Superiores",
  expectedRevision: 0,
  status: "in_progress",
  startedAt: "2026-11-11T12:00:00Z",
  intervals: [{ startedAt: "2026-11-11T12:00:00Z", endedAt: null }],
  exercises: {},
};
const key = trainingActivityDraftKey(draft.civilDate, draft.activityId);
beforeEach(() => {
  pathname = "/nutrition";
  localStorage.clear();
  localStorage.setItem(key, JSON.stringify(draft));
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

async function openDiscard() {
  await screen.findByRole("link", { name: /Voltar ao treino/ });
  fireEvent.click(screen.getByRole("button", { name: "Descartar execução" }));
  return within(screen.getByRole("dialog"));
}

describe("ActiveTrainingBar", () => {
  it("recupera o treino após remontagem em outra página com a data de origem", async () => {
    const first = render(<ActiveTrainingBar />);
    expect(await screen.findByRole("link", { name: /Voltar ao treino/ })).toHaveAttribute(
      "href",
      "/workout/activity/one?date=2026-11-11",
    );
    first.unmount();
    pathname = "/workout";
    render(<ActiveTrainingBar />);
    expect(await screen.findByText(/Superiores/)).toBeInTheDocument();
  });
  it("mantém o rascunho ao cancelar e remove somente a execução após confirmar", async () => {
    localStorage.setItem("other-app", "keep");
    render(<ActiveTrainingBar />);
    let dialog = await openDiscard();
    fireEvent.click(dialog.getByRole("button", { name: "Manter execução" }));
    expect(localStorage.getItem(key)).not.toBeNull();
    dialog = await openDiscard();
    fireEvent.click(dialog.getByRole("button", { name: "Descartar execução" }));
    await waitFor(() =>
      expect(screen.queryByRole("link", { name: /Voltar ao treino/ })).not.toBeInTheDocument(),
    );
    expect(localStorage.getItem(key)).toBeNull();
    expect(localStorage.getItem("other-app")).toBe("keep");
  });
  it("mantém o card e permite tentar novamente quando o armazenamento falha", async () => {
    render(<ActiveTrainingBar />);
    const dialog = await openDiscard();
    vi.spyOn(Storage.prototype, "removeItem").mockImplementationOnce(() => {
      throw new Error("blocked");
    });
    fireEvent.click(dialog.getByRole("button", { name: "Descartar execução" }));
    expect(dialog.getByRole("alert")).toHaveTextContent("Não foi possível remover");
    expect(localStorage.getItem(key)).not.toBeNull();
    fireEvent.click(dialog.getByRole("button", { name: "Descartar execução" }));
    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());
  });
  it("exige nova confirmação se o rascunho mudar durante o diálogo", async () => {
    render(<ActiveTrainingBar />);
    const dialog = await openDiscard();
    localStorage.setItem(key, JSON.stringify({ ...draft, activityName: "Atualizado" }));
    fireEvent.click(dialog.getByRole("button", { name: "Descartar execução" }));
    expect(dialog.getByRole("alert")).toHaveTextContent("atualizada em outra tela");
    expect(localStorage.getItem(key)).not.toBeNull();
    fireEvent.click(dialog.getByRole("button", { name: "Descartar execução" }));
    await waitFor(() => expect(localStorage.getItem(key)).toBeNull());
  });
  it("ignora dados inválidos e prioriza a execução em andamento sobre rascunhos pausados", () => {
    localStorage.setItem(
      trainingActivityDraftKey(draft.civilDate, "paused"),
      JSON.stringify({
        ...draft,
        activityId: "paused",
        status: "paused",
        startedAt: "2026-11-11T13:00:00Z",
      }),
    );
    localStorage.setItem("kaizen:training-draft:v1:invalid", "{");
    expect(readActiveTrainingDrafts(localStorage).map((item) => item.activityId)).toEqual([
      "one",
      "paused",
    ]);
  });
});
