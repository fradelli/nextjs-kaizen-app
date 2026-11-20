import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  fireEvent,
} from "../../../../../../tests/support/render-localized";
import { ScheduleCard } from "./schedule-card";
import type {
  ScheduleActivity,
  ScheduleReservation,
} from "../schedule-workspace/schedule-workspace.types";
const state = vi.hoisted(() => ({
  activitiesById: new Map<string, ScheduleActivity>(),
  reservationsById: new Map<string, ScheduleReservation>(),
  reservationsByParent: new Map<string, ScheduleReservation[]>(),
  pending: false,
  submit: vi.fn(),
  edit: vi.fn(),
}));
vi.mock("../schedule-workspace/schedule-workspace", () => ({
  useScheduleData: () => state,
  useScheduleEditorAction: () => state.edit,
}));
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  state.activitiesById.clear();
  state.reservationsById.clear();
  state.reservationsByParent.clear();
});
const activity: ScheduleActivity = {
  id: "work",
  revision: 0,
  title: "Work",
  startsAt: "2026-11-17T12:00:00Z",
  endsAt: "2026-11-17T21:00:00Z",
  scheduledDate: "2026-11-17",
  parentActivityId: null,
  colorKey: "purple",
  tagId: null,
  linkedCount: 0,
};
const reservation: ScheduleReservation = {
  id: "r",
  revision: 0,
  todoId: "todo",
  todoRevision: 2,
  title: "Daily",
  completed: false,
  startsAt: "2026-11-17T13:00:00Z",
  endsAt: "2026-11-17T13:30:00Z",
  parentActivityId: "work",
  parentTitle: "Work",
  parentStartsAt: activity.startsAt,
  parentEndsAt: activity.endsAt,
  colorKey: "lilac",
};
describe("calendar card interactions", () => {
  it("uses refreshed reservation state and keeps a future untimed card active", () => {
    state.reservationsById.set("r", {
      ...reservation,
      title: "Updated task",
      completed: true,
      colorKey: null,
    });
    const view = render(<ScheduleCard reservation={reservation} date="2026-11-17" />);
    expect(screen.getByRole("checkbox")).toBeChecked();
    expect(screen.getByText("Updated task")).toBeInTheDocument();
    view.rerender(
      <ScheduleCard
        activity={{ ...activity, startsAt: null, endsAt: null, colorKey: null }}
        date="2099-11-17"
      />,
    );
    expect(screen.getByText("Work").closest("[data-elapsed]")).toBeNull();
  });

  it.each(["purple", "lilac", null, "unknown"])("opens activity with color %s", (colorKey) => {
    render(<ScheduleCard activity={{ ...activity, colorKey }} date="2026-11-17" />);
    fireEvent.click(screen.getByRole("button", { name: /Work/ }));
    expect(state.edit).toHaveBeenCalledWith({ kind: "activity", id: "work", date: "2026-11-17" });
  });
  it("uses current cached title rather than stale calendar data", () => {
    state.activitiesById.set("work", { ...activity, title: "Updated" });
    render(<ScheduleCard activity={activity} date="2026-11-17" />);
    expect(screen.getByText("Updated")).toBeInTheDocument();
    expect(screen.queryByText("Work")).not.toBeInTheDocument();
  });
  it("completes the shared todo and opens its reservation", () => {
    render(<ScheduleCard reservation={reservation} date="2026-11-17" />);
    fireEvent.click(screen.getByRole("checkbox"));
    expect(state.submit).toHaveBeenCalledWith(
      { kind: "complete", todoId: "todo", expectedRevision: 2, completed: true },
      false,
    );
    fireEvent.click(screen.getByRole("button", { name: /Daily/ }));
    expect(state.edit).toHaveBeenCalledWith({ kind: "reserve", id: "r" });
  });
  it("renders contained reservations inside the parent and leaves outside reservations separate", () => {
    state.reservationsByParent.set("work", [
      reservation,
      {
        ...reservation,
        id: "outside",
        title: "Outside",
        startsAt: "2026-11-17T22:00:00Z",
        endsAt: "2026-11-17T23:00:00Z",
      },
    ]);
    render(<ScheduleCard activity={activity} date="2026-11-17" />);
    expect(screen.getByText("Daily")).toBeInTheDocument();
    expect(screen.queryByText("Outside")).not.toBeInTheDocument();
  });
  it("opens an untimed activity without rendering a time", () => {
    render(
      <ScheduleCard activity={{ ...activity, startsAt: null, endsAt: null }} date="2026-11-17" />,
    );
    expect(screen.getByRole("button", { name: "Work" })).toBeInTheDocument();
  });
});
