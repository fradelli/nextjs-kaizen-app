import { describe, expect, it } from "vitest";
import { scheduleForDate } from "./schedule-range.utils";
import type { ScheduleRange } from "./schedule-range";
const row: ScheduleRange["activities"][number] = {
  id: "a",
  title: "A",
  revision: 0,
  startsAt: null,
  endsAt: null,
  scheduledDate: null,
  parentActivityId: null,
  colorKey: null,
  tagId: null,
  linkedCount: 0,
};
describe("daily schedule clipping", () => {
  it("excludes reservations touching midnight and includes a spanning reservation", () => {
    const reservation = {
      id: "r",
      revision: 0,
      todoId: "t",
      todoRevision: 0,
      title: "Task",
      completed: false,
      parentActivityId: null,
      parentTitle: null,
      parentStartsAt: null,
      parentEndsAt: null,
      colorKey: null,
    };
    const reservations = [
      {
        ...reservation,
        id: "inside",
        startsAt: "2026-11-17T12:00:00.000Z",
        endsAt: "2026-11-17T13:00:00.000Z",
      },
      {
        ...reservation,
        id: "before",
        startsAt: "2026-11-16T12:00:00.000Z",
        endsAt: "2026-11-17T03:00:00.000Z",
      },
      {
        ...reservation,
        id: "after",
        startsAt: "2026-11-18T03:00:00.000Z",
        endsAt: "2026-11-18T04:00:00.000Z",
      },
    ];
    expect(
      scheduleForDate({ activities: [], reservations }, "2026-11-17").reservations.map((r) => r.id),
    ).toEqual(["inside"]);
  });

  it("selects civil-date activities and intersecting timed intervals only", () => {
    const activities = [
      { ...row, id: "untimed", scheduledDate: "2026-11-17" },
      { ...row, id: "other", scheduledDate: "2026-11-18" },
      {
        ...row,
        id: "inside",
        startsAt: "2026-11-17T12:00:00.000Z",
        endsAt: "2026-11-17T13:00:00.000Z",
      },
      {
        ...row,
        id: "before",
        startsAt: "2026-11-16T12:00:00.000Z",
        endsAt: "2026-11-17T03:00:00.000Z",
      },
      {
        ...row,
        id: "after",
        startsAt: "2026-11-18T03:00:00.000Z",
        endsAt: "2026-11-18T04:00:00.000Z",
      },
      { ...row, id: "open", startsAt: "2026-11-17T12:00:00.000Z" },
    ];
    expect(
      scheduleForDate({ activities, reservations: [] }, "2026-11-17").activities.map((a) => a.id),
    ).toEqual(["untimed", "inside"]);
  });
});
