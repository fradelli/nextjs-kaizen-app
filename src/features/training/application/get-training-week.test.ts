import { describe, expect, it, vi } from "vitest";
import { getTrainingWeek } from "./get-training-week";
import type { TrainingRepository } from "./training-repository";

describe("getTrainingWeek", () => {
  it.each([
    ["2026-11-10", "2026-11-14", 5],
    ["2026-11-14", "2026-11-14", 1],
    ["2026-11-15", "2026-11-21", 7],
    ["2026-12-31", "2027-01-02", 3],
  ])("consulta de %s até %s sem materializar dias", async (civilDate, endDate, count) => {
    const resolveWorkspace = vi.fn(() => ({ workspaceId: "server-workspace" }));
    const repository: TrainingRepository = {
      findActiveTrainingPlan: vi.fn(),
      ensureScheduledTrainingDay: vi.fn(),
      findTrainingDay: vi.fn(async () => ({ activePlan: null, assignment: null, activities: [] })),
    };
    const result = await getTrainingWeek(
      {
        repository,
        environment: "local",
        resolveWorkspace,
      },
      { civilDate },
    );
    expect(result.startDate).toBe(civilDate);
    expect(result.endDate).toBe(endDate);
    expect(result.days).toHaveLength(count);
    expect(resolveWorkspace).toHaveBeenCalledTimes(1);
    expect(repository.ensureScheduledTrainingDay).not.toHaveBeenCalled();
    expect(repository.findTrainingDay).toHaveBeenCalledTimes(count);
  });

  it("rejeita uma data inválida antes de acessar o workspace", async () => {
    const resolveWorkspace = vi.fn();
    await expect(
      getTrainingWeek(
        {
          repository: {} as TrainingRepository,
          environment: "local",
          resolveWorkspace,
        },
        { civilDate: "2026-02-30" },
      ),
    ).rejects.toThrow();
    expect(resolveWorkspace).not.toHaveBeenCalled();
  });
});
