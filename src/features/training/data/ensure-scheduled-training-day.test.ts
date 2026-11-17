import { afterEach, describe, expect, it, vi } from "vitest";
import type { Prisma } from "@/generated/prisma/client";
import { parseCivilDate } from "../domain/training-day.rules";
vi.mock("server-only", () => ({}));
import { readScheduledTrainingDay } from "./ensure-scheduled-training-day";

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
