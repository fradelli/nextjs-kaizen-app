import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "../../../../../../../../tests/support/render-localized";
import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { TrainingDateNavigation } from "./training-date-navigation";

const { push, search } = vi.hoisted(() => ({ push: vi.fn(), search: { value: "" } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
  useSearchParams: () => new URLSearchParams(search.value),
}));

beforeEach(() => {
  push.mockClear();
  search.value = "";
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: true, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const dateResolution = resolveTrainingDayDate({
  rawDate: "2026-11-10",
  now: new Date("2026-11-12T15:00:00Z"),
});

describe("calendar keyboard navigation", () => {
  it("opens today and switches desktop views using the selected civil date", () => {
    render(<TrainingDateNavigation dateResolution={dateResolution} />);
    fireEvent.keyDown(window, { key: "t" });
    expect(push).toHaveBeenLastCalledWith("/workout?date=2026-11-12&view=week");
    fireEvent.keyDown(window, { key: "d" });
    expect(push).toHaveBeenLastCalledWith("/workout?days=1&view=day&date=2026-11-10");
    fireEvent.keyDown(window, { key: "w" });
    expect(push).toHaveBeenLastCalledWith("/workout?days=7&view=week&date=2026-11-10");
  });

  it("labels a custom range by its day count and resets Week to seven days", () => {
    search.value = "days=8&view=week";
    const change = vi.fn();
    render(<TrainingDateNavigation dateResolution={dateResolution} onCountChange={change} />);
    expect(screen.getByRole("button", { name: /8 dias/ })).toBeInTheDocument();
    fireEvent.keyDown(window, { key: "w" });
    expect(change).toHaveBeenCalledWith(7);
  });

  it("uses the design-system tooltip rather than a native title on Today", async () => {
    render(<TrainingDateNavigation dateResolution={dateResolution} />);
    const today = screen.getByRole("link", { name: "Hoje" });
    expect(today).not.toHaveAttribute("title");
    act(() => today.focus());
    expect(await screen.findByText("T", { selector: "kbd" })).toBeVisible();
  });

  it("keeps typing and keyboard interactions inside forms, dialogs and menus local", () => {
    render(
      <>
        <TrainingDateNavigation dateResolution={dateResolution} />
        <input aria-label="Draft" />
        <textarea aria-label="Comment" />
        <select aria-label="Value">
          <option>One</option>
        </select>
        <div role="dialog">
          <button>Dialog control</button>
        </div>
        <div role="menu">
          <button>Menu control</button>
        </div>
      </>,
    );
    for (const name of ["Draft", "Comment", "Value", "Dialog control", "Menu control"]) {
      const target = screen.queryByLabelText(name) ?? screen.getByRole("button", { name });
      for (const key of ["d", "w", "t"]) fireEvent.keyDown(target, { key });
    }
    expect(push).not.toHaveBeenCalled();
  });

  it("preserves browser shortcuts, modified keys and repeated keydown events", () => {
    render(<TrainingDateNavigation dateResolution={dateResolution} />);
    for (const modifier of ["ctrlKey", "metaKey", "altKey", "shiftKey", "repeat"]) {
      fireEvent.keyDown(window, { key: "t", [modifier]: true });
    }
    fireEvent.keyDown(window, { key: "x" });
    expect(push).not.toHaveBeenCalled();
  });

  it("does not switch hidden views on a mobile viewport", () => {
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({ matches: false })),
    );
    render(<TrainingDateNavigation dateResolution={dateResolution} />);
    fireEvent.keyDown(window, { key: "d" });
    fireEvent.keyDown(window, { key: "w" });
    expect(push).not.toHaveBeenCalled();
    fireEvent.keyDown(window, { key: "t" });
    expect(push).toHaveBeenCalledOnce();
  });

  it("removes the global shortcut listener when leaving the calendar", () => {
    const view = render(<TrainingDateNavigation dateResolution={dateResolution} />);
    view.unmount();
    fireEvent.keyDown(window, { key: "t" });
    expect(push).not.toHaveBeenCalled();
  });
});
