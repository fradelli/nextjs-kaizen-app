import { describe, expect, it } from "vitest";
import { scheduleGridEntries } from "./calendar-grid.entries";
import type { ScheduleRange } from "../../../application/schedule-range";
const activity: ScheduleRange["activities"][number] = {
  id: "parent",
  title: "Work",
  revision: 0,
  startsAt: "2026-11-17T12:00:00Z",
  endsAt: "2026-11-17T21:00:00Z",
  scheduledDate: null,
  parentActivityId: null,
  colorKey: null,
  tagId: null,
  linkedCount: 0,
};
const reservation: ScheduleRange["reservations"][number] = {
  id: "reservation",
  revision: 0,
  todoId: "todo",
  todoRevision: 0,
  title: "Task",
  completed: false,
  startsAt: "2026-11-17T13:00:00Z",
  endsAt: "2026-11-17T14:00:00Z",
  parentActivityId: "parent",
  parentTitle: "Work",
  parentStartsAt: activity.startsAt,
  parentEndsAt: activity.endsAt,
  colorKey: null,
};
describe("calendar interval membership", () => {
  it("handles an empty range", () => expect(scheduleGridEntries("2026-11-17", [])).toEqual([]));
  it("keeps untimed activities outside the timed grid", () => {
    expect(
      scheduleGridEntries("2026-11-17", [], {
        activities: [
          { ...activity, startsAt: null },
          { ...activity, id: "no-end", endsAt: null },
        ],
        reservations: [],
      }),
    ).toEqual([]);
  });
  it.each([
    { parentActivityId: null },
    { parentActivityId: "missing" },
    { startsAt: "2026-11-17T11:00:00Z" },
    { endsAt: "2026-11-17T22:00:00Z" },
  ])("renders independent reservation %#", (change) => {
    const entries = scheduleGridEntries("2026-11-17", [], {
      activities: [activity],
      reservations: [{ ...reservation, ...change }],
    });
    expect(entries.map((e) => e.id)).toContain("reservation");
  });
  it.each([{ startsAt: null }, { endsAt: null }])(
    "does not nest under an untimed parent %#",
    (change) => {
      expect(
        scheduleGridEntries("2026-11-17", [], {
          activities: [{ ...activity, ...change }],
          reservations: [reservation],
        }).map((e) => e.id),
      ).toEqual(["reservation"]);
    },
  );
  it("delegates contained reservations to the parent card", () => {
    const entries = scheduleGridEntries("2026-11-17", [], {
      activities: [activity],
      reservations: [reservation],
    });
    expect(entries.map((e) => e.id)).toEqual(["parent"]);
    expect(entries[0].start).toBe(540);
    expect(entries[0].end).toBe(1080);
  });
});
