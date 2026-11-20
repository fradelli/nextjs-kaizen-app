import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "../../../../../../tests/support/render-localized";
import { ScheduleWorkspace } from "./schedule-workspace";
import { ScheduleControls } from "../schedule-controls/schedule-controls";
import type { ScheduleWorkspaceProps } from "./schedule-workspace.types";

const { refresh, notify } = vi.hoisted(() => ({ refresh: vi.fn(), notify: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@fradelli/ui/toast", () => ({ toast: { add: notify }, Toaster: () => null }));
vi.mock("../schedule-panel/schedule-panel", () => ({
  SchedulePanel: ({ title, children }: { title: string; children: React.ReactNode }) => (
    <aside aria-label={title}>{children}</aside>
  ),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
function props(): ScheduleWorkspaceProps {
  return {
    children: <ScheduleControls />,
    initialLists: {
      items: [{ id: "list", name: "Trabalho", colorKey: "purple", revision: 0 }],
      nextCursor: null,
    },
    initialTodos: { listId: "list", page: { items: [], nextCursor: null } },
    tags: [],
    range: { activities: [], reservations: [] },
    date: "2026-11-17",
    mutate: vi.fn(async () => ({
      status: "saved" as const,
      id: "new",
      revision: 0,
      affectedDates: [],
    })),
    loadLists: vi.fn(),
    loadTodos: vi.fn(async () => ({ items: [], nextCursor: null })),
  };
}

describe("schedule panels", () => {
  it("creates a task inline in Inbox and retries the same operation after failure", async () => {
    const input = props();
    const mutate = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({
        status: "saved",
        id: "task",
        revision: 0,
        affectedDates: [],
        group: { id: "inbox", name: "Inbox", systemKey: "inbox", colorKey: null, revision: 0 },
      });
    render(<ScheduleWorkspace {...input} mutate={mutate} />);
    fireEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    fireEvent.click(screen.getByRole("button", { name: "Nova tarefa" }));
    const name = screen.getByRole("textbox", { name: "Nome da tarefa" }) as HTMLInputElement;
    expect(name).toHaveFocus();
    expect(name.selectionEnd).toBe("Nova tarefa".length);
    expect(mutate).not.toHaveBeenCalled();
    fireEvent.change(name, { target: { value: "Revisar PR" } });
    fireEvent.keyDown(name, { key: "Enter" });
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument(),
    );
    expect(name).toHaveValue("Revisar PR");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(screen.getByText("Revisar PR")).toBeInTheDocument());
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[0][0]).toEqual(mutate.mock.calls[1][0]);
    expect(mutate.mock.calls[1][0]).toMatchObject({
      kind: "create_todo",
      listId: null,
      title: "Revisar PR",
      estimatedMinutes: null,
    });
  });

  it("toggles from the group heading and adds a task without toggling it closed", () => {
    render(<ScheduleWorkspace {...props()} />);
    fireEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    const group = screen.getByRole("button", { name: "Trabalho" });
    expect(group).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByText("Trabalho", { exact: true }));
    expect(group).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(screen.getByText("Trabalho", { exact: true }));
    expect(group).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getByRole("button", { name: "Adicionar tarefa em Trabalho" }));
    expect(group).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("textbox", { name: "Nome da tarefa" })).toHaveFocus();
  });
  it("keeps checkbox completion separate from inline task renaming", async () => {
    const input = props();
    input.initialTodos!.page.items = [
      {
        id: "task",
        listId: "list",
        title: "Review code",
        revision: 0,
        estimatedMinutes: null,
        completedAt: null,
      },
    ];
    render(<ScheduleWorkspace {...input} />);
    fireEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Review code/ }));
    expect(screen.queryByRole("textbox", { name: "Nome da tarefa" })).not.toBeInTheDocument();
    await waitFor(() => expect(input.mutate).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole("button", { name: "Review code" }));
    expect(screen.getByRole("textbox", { name: "Nome da tarefa" })).toHaveFocus();
  });

  it("creates a group inline, selects its default name and saves the replacement once", async () => {
    const input = props();
    render(<ScheduleWorkspace {...input} />);
    fireEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    fireEvent.click(screen.getByRole("button", { name: "Novo grupo" }));
    const name = screen.getByRole("textbox", { name: "Nome do grupo" }) as HTMLInputElement;
    expect(name).toHaveFocus();
    expect(name.selectionStart).toBe(0);
    expect(name.selectionEnd).toBe("Novo grupo".length);
    vi.useFakeTimers();
    act(() => vi.advanceTimersByTime(60_000));
    vi.useRealTimers();
    expect(input.mutate).not.toHaveBeenCalled();
    expect(name).toHaveFocus();
    fireEvent.change(name, { target: { value: "English" } });
    fireEvent.keyDown(name, { key: "Enter" });
    await waitFor(() =>
      expect(screen.queryByRole("textbox", { name: "Nome do grupo" })).not.toBeInTheDocument(),
    );
    expect(screen.getByText("English")).toBeInTheDocument();
    expect(input.mutate).toHaveBeenCalledTimes(1);
    expect(input.mutate).toHaveBeenLastCalledWith(
      expect.objectContaining({ kind: "create_list", name: "English" }),
    );
  });

  it("keeps a failed group name and retries without duplicating the creation", async () => {
    const input = props();
    const mutate = vi
      .fn()
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue({ status: "saved", id: "group", revision: 0, affectedDates: [] });
    render(<ScheduleWorkspace {...input} mutate={mutate} />);
    fireEvent.click(screen.getByRole("button", { name: "Tarefas" }));
    fireEvent.click(screen.getByRole("button", { name: "Novo grupo" }));
    const name = screen.getByRole("textbox", { name: "Nome do grupo" });
    fireEvent.change(name, { target: { value: "Reading" } });
    fireEvent.blur(name);
    await waitFor(() =>
      expect(screen.getByRole("button", { name: "Tentar novamente" })).toBeInTheDocument(),
    );
    expect(name).toHaveValue("Reading");
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    await waitFor(() => expect(screen.getByText("Reading")).toBeInTheDocument());
    expect(mutate).toHaveBeenCalledTimes(2);
    expect(mutate.mock.calls[0][0]).toEqual(mutate.mock.calls[1][0]);
  });

  it("toggles the panel and opens task or group creation with keyboard shortcuts", () => {
    render(<ScheduleWorkspace {...props()} />);
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.getByRole("button", { name: "Novo grupo" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "b", ctrlKey: true });
    expect(screen.queryByRole("button", { name: "Novo grupo" })).not.toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true });
    expect(screen.getByRole("textbox", { name: "Nome da tarefa" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    fireEvent.keyDown(window, { key: "Enter", ctrlKey: true, shiftKey: true });
    const group = screen.getByRole("textbox", { name: "Nome do grupo" });
    expect(group).toHaveFocus();
    fireEvent.keyDown(group, { key: "b", ctrlKey: true });
    expect(group).toBeInTheDocument();
  });

  it("opens tasks without a form and creates an activity only after selecting a period", async () => {
    const input = props();
    render(<ScheduleWorkspace {...input} />);
    fireEvent.keyDown(window, { ctrlKey: true, code: "Slash" });
    expect(screen.queryByRole("textbox", { name: "T\u00edtulo" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo grupo" })).toBeInTheDocument();
    fireEvent(
      window,
      new CustomEvent("schedule-select-period", {
        detail: { civilDate: "2026-11-17", selectedPeriod: { start: "09:00", end: "10:00" } },
      }),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "T\u00edtulo" }), {
      target: { value: "Buscar encomenda" },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: "Sem hor\u00e1rio" }));
    fireEvent.click(screen.getByRole("button", { name: "Adicionar" }));
    await waitFor(() => expect(input.mutate).toHaveBeenCalledOnce());
    expect(vi.mocked(input.mutate).mock.calls[0][0]).toMatchObject({
      kind: "create_activity",
      title: "Buscar encomenda",
      startsAt: null,
      endsAt: null,
      scheduledDate: "2026-11-17",
      tagId: null,
    });
  });

  it("hides the creation form on Escape while keeping tasks in the same panel", () => {
    render(<ScheduleWorkspace {...props()} />);
    fireEvent(
      window,
      new CustomEvent("schedule-select-period", {
        detail: { civilDate: "2026-11-17", selectedPeriod: { start: "09:00", end: "10:00" } },
      }),
    );
    expect(screen.getByRole("textbox", { name: "T\u00edtulo" })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "Escape" });
    expect(screen.queryByRole("textbox", { name: "T\u00edtulo" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Novo grupo" })).toBeInTheDocument();
  });
});
