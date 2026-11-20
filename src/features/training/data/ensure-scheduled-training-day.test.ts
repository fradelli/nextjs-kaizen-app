import { afterEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import { parseCivilDate } from "../domain/training-day.rules";
vi.mock("server-only", () => ({}));
import {
  readScheduledTrainingDay,
  ensureScheduledTrainingDay,
  ensureScheduledTrainingDayInTransaction,
} from "./ensure-scheduled-training-day";

afterEach(() => vi.useRealTimers());

describe("readScheduledTrainingDay", () => {
  it("projeta duas ocorrências distintas sem executar escritas e preserva seus IDs", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-10T15:00:00Z"));
    const create = vi.fn(() => {
      throw new Error("Leitura tentou gravar");
    });
    const client = {
      dailyTrainingAssignment: { findUnique: async () => null, create },
      trainingDayActivity: { findMany: async () => [], create },
      planActivation: {
        findFirst: async () => ({
          trainingPlan: {
            id: "plan",
            trainingSessionDefinition_plan: [],
            weeklySchedule: {
              schema_version: "2.0.0",
              entries: ["12:00", "17:00"].map((start_time) => ({
                day: "tuesday",
                type: "sport_practice",
                name: "Vôlei",
                start_time,
                end_time: start_time === "12:00" ? "13:00" : "18:00",
              })),
            },
          },
        }),
      },
    } as unknown as Prisma.TransactionClient;
    const input = {
      workspaceId: "workspace",
      civilDate: parseCivilDate("2026-11-10"),
      environment: "local" as const,
    };
    const first = await readScheduledTrainingDay(client, input);
    const second = await readScheduledTrainingDay(client, input);
    expect(first?.activities).toHaveLength(2);
    expect(first?.activities.map((item) => item.id)).toEqual(
      second?.activities.map((item) => item.id),
    );
    expect(new Set(first?.activities.map((item) => item.id)).size).toBe(2);
    expect(create).not.toHaveBeenCalled();
  });
});

describe("weekly projection validation", () => {
  const input = {
    workspaceId: "workspace",
    civilDate: parseCivilDate("2026-11-10"),
    environment: "local" as const,
  };
  const now = new Date("2026-11-10T15:00:00Z");
  const main = {
    id: "main-id",
    sessionId: "main",
    assignmentRole: "main",
    name: "Strength",
    targetDurationMinutes: 45,
    compatiblePreparationSessionIds: ["prep"],
  };
  const prep = { id: "prep-id", sessionId: "prep", assignmentRole: "preparation", name: "Warmup" };
  function client(entries: unknown[], sessions: unknown[] = [main, prep]) {
    return {
      dailyTrainingAssignment: { findUnique: vi.fn().mockResolvedValue(null) },
      trainingDayActivity: { findMany: vi.fn().mockResolvedValue([]) },
      planActivation: {
        findFirst: vi.fn().mockResolvedValue({
          trainingPlan: {
            id: "plan",
            trainingSessionDefinition_plan: sessions,
            weeklySchedule: { schema_version: "2.0.0", entries },
          },
        }),
      },
    } as unknown as Prisma.TransactionClient;
  }
  const entry = {
    day: "tuesday",
    type: "sport_practice",
    name: "Sport",
    start_time: "12:00",
    end_time: "13:00",
  };
  it.each([
    { ...entry, start_time: null },
    { ...entry, end_time: "11:00" },
    { ...entry, type: "structured_training", session_id: "missing" },
    { ...entry, preparation_session_id: "missing" },
    { ...entry, type: "mobility", preparation_session_id: "prep" },
    { ...entry, name: undefined },
    { ...entry, end_time: null },
    { ...entry, start_time: "23:45", end_time: "23:59" },
    { ...entry, day: "invalid" },
  ])("rejects an incoherent imported entry %#", async (row) => {
    if (row.start_time === "23:45") row.start_time = "23:59";
    await expect(readScheduledTrainingDay(client([row]), input, now)).rejects.toThrow();
  });
  it.each(
    [
      [{ ...entry, type: "structured_training", session_id: "main", end_time: null }],
      [{ ...entry, type: "mobility" }],
      [{ ...entry, preparation_session_id: "prep", sport: "Football" }],
      [{ day: "tuesday", type: "rest", start_time: null, end_time: null }],
      [],
    ].map((entries) => ({ entries })),
  )("projects valid entries %#", async ({ entries }) => {
    const result = await readScheduledTrainingDay(client(entries), input, now);
    if (entries.length)
      expect(result?.assignment.kind).toBe(entries[0].type === "rest" ? "rest" : "unassigned");
    else expect(result).toBeUndefined();
  });
  it("rejects rest mixed with another activity", async () => {
    await expect(
      readScheduledTrainingDay(
        client([entry, { day: "tuesday", type: "rest", start_time: null, end_time: null }]),
        input,
        now,
      ),
    ).rejects.toThrow();
  });
  it("preserves persisted occurrences and tombstones", async () => {
    const c = client([entry]);
    const first = await readScheduledTrainingDay(c, input, now);
    vi.mocked(c.trainingDayActivity.findMany).mockResolvedValue([
      { id: first!.activities[0].id },
    ] as never);
    expect((await readScheduledTrainingDay(c, input, now))?.activities).toEqual([]);
    vi.mocked(c.dailyTrainingAssignment.findUnique).mockResolvedValue({ id: "existing" } as never);
    expect(await readScheduledTrainingDay(c, input, now)).toBeUndefined();
  });
  it.each([null, { id: "plan", weeklySchedule: null }])(
    "handles missing active definitions %#",
    async (plan) => {
      const c = client([]);
      vi.mocked(c.planActivation.findFirst).mockResolvedValue(
        plan ? ({ trainingPlan: plan } as never) : null,
      );
      expect(await readScheduledTrainingDay(c, input, now)).toBeUndefined();
    },
  );
  it.each(["P2002", "P2034"])("retries a concurrent materialization %s", async (code) => {
    const transaction = vi.fn().mockRejectedValueOnce({ code }).mockResolvedValue(undefined);
    await ensureScheduledTrainingDay({ $transaction: transaction } as never, input, now);
    expect(transaction).toHaveBeenCalledTimes(2);
  });
  it.each([null, new Error("offline"), { code: "OTHER" }, { code: "P2034" }])(
    "propagates a persistent transaction failure %#",
    async (error) => {
      const transaction = vi.fn().mockRejectedValue(error);
      await expect(
        ensureScheduledTrainingDay({ $transaction: transaction } as never, input, now),
      ).rejects.toEqual(error);
      expect(transaction).toHaveBeenCalledTimes(
        error && "code" in error && error.code === "P2034" ? 3 : 1,
      );
    },
  );
});

describe("legacy schedule compatibility", () => {
  const input = {
    workspaceId: "workspace",
    civilDate: parseCivilDate("2026-11-10"),
    environment: "local" as const,
  };
  const now = new Date("2026-11-10T15:00:00Z");
  function client(
    session: string,
    time: string | null,
    options: { enabled?: boolean; duration?: number; empty?: boolean; main?: boolean } = {},
  ) {
    const entries = options.empty ? [] : [{ day: "tuesday", session, time }];
    return {
      dailyTrainingAssignment: { findUnique: vi.fn().mockResolvedValue(null) },
      trainingDayActivity: { findMany: vi.fn().mockResolvedValue([]) },
      planActivation: {
        findFirst: vi.fn().mockResolvedValue({
          trainingPlan: {
            id: "plan",
            trainingSessionDefinition_plan: options.main
              ? [
                  {
                    id: "main",
                    sessionId: "strength",
                    assignmentRole: "main",
                    name: "Strength",
                    targetDurationMinutes: 45,
                    compatiblePreparationSessionIds: [],
                  },
                ]
              : [],
            weeklySchedule: {
              weekend_game: {
                enabled: options.enabled ?? true,
                day: "saturday",
                start_time: "12:00",
              },
              planning_defaults: { footvolley_duration_minutes: options.duration ?? 60 },
              models: { saturday_game: entries, sunday_game: entries },
            },
          },
        }),
      },
    } as unknown as Prisma.TransactionClient;
  }
  it.each(["footvolley", "footvolley_only", "game", "rest", "rest_or_light_mobility", "strength"])(
    "preserves supported legacy session %s",
    async (session) => {
      const result = await readScheduledTrainingDay(
        client(session, "12:00", { main: true }),
        input,
        now,
      );
      expect(result?.legacy).toBe(true);
      if (session.startsWith("rest")) expect(result?.assignment.kind).toBe("rest");
      else expect(result?.activities).toHaveLength(1);
    },
  );
  it.each(["footvolley", "game"])("preserves untimed %s", async (session) => {
    const result = await readScheduledTrainingDay(client(session, null), input, now);
    expect(result?.activities[0].plannedStartMinute).toBe(session === "game" ? 720 : null);
  });
  it.each([
    { session: "missing", time: "12:00", main: false },
    { session: "strength", time: null, main: true },
    { session: "strength", time: "23:45", main: true },
    { session: "footvolley", time: "23:45", main: false },
  ])("rejects invalid legacy prescription %#", async (row) => {
    await expect(
      readScheduledTrainingDay(client(row.session, row.time, { main: row.main }), input, now),
    ).rejects.toThrow();
  });
  it("does not project a disabled legacy schedule", async () => {
    expect(
      await readScheduledTrainingDay(client("game", "12:00", { enabled: false }), input, now),
    ).toBeUndefined();
  });
  it("rejects a legacy schedule missing the requested weekday", async () => {
    await expect(
      readScheduledTrainingDay(client("game", "12:00", { empty: true }), input, now),
    ).rejects.toThrow();
  });
});

describe("materialization idempotency", () => {
  it("keeps an existing daily activity without querying or writing a plan", async () => {
    const findFirst = vi.fn().mockResolvedValue({ id: "existing" });
    const create = vi.fn();
    const transaction = {
      trainingDayActivity: { findFirst, create },
      dailyTrainingAssignment: { create },
    } as unknown as Prisma.TransactionClient;
    await ensureScheduledTrainingDayInTransaction(transaction, {
      workspaceId: "workspace",
      civilDate: parseCivilDate("2026-11-10"),
      environment: "local",
    });
    expect(findFirst).toHaveBeenCalledOnce();
    expect(create).not.toHaveBeenCalled();
  });
  it("does not write when there is no active plan", async () => {
    const create = vi.fn();
    const transaction = {
      trainingDayActivity: { findFirst: vi.fn().mockResolvedValue(null), create },
      dailyTrainingAssignment: { findUnique: vi.fn().mockResolvedValue(null), create },
      planActivation: { findFirst: vi.fn().mockResolvedValue(null) },
    } as unknown as Prisma.TransactionClient;
    await ensureScheduledTrainingDayInTransaction(transaction, {
      workspaceId: "workspace",
      civilDate: parseCivilDate("2026-11-10"),
      environment: "local",
    });
    expect(create).not.toHaveBeenCalled();
  });
});
