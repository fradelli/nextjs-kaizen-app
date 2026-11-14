import { beforeEach, describe, expect, it, vi } from "vitest";

const { queryDay, notFound } = vi.hoisted(() => ({
  queryDay: vi.fn(),
  notFound: vi.fn(() => {
    throw new Error("not found");
  }),
}));

vi.mock("next/navigation", () => ({ notFound }));
vi.mock("@/features/training/data/training-queries", () => ({
  queryFixedWorkspaceTrainingDayPage: queryDay,
}));
vi.mock("@/features/training/application/resolve-training-day-date", () => ({
  resolveTrainingDayDate: () => ({ status: "valid", civilDate: "2026-09-17" }),
}));
vi.mock("@/app/workout/training-actions", () => ({
  addTrainingActivityAction: vi.fn(),
  controlTrainingActivityAction: vi.fn(),
  deleteTrainingActivityAction: vi.fn(),
  saveTrainingActivityExerciseAction: vi.fn(),
  updateTrainingActivityAction: vi.fn(),
}));

import TrainingDetailPage from "@/app/workout/activity/[occurrenceKey]/page";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("workout detail route", () => {
  it("opens a preparation-only routine through the same detail route as structured training", async () => {
    queryDay.mockResolvedValue({
      status: "ready",
      day: {
        activities: [
          {
            id: "warmup",
            type: "mobility",
            structured: null,
            preparationSession: { sessionId: "preparation" },
          },
        ],
      },
    });
    await expect(
      TrainingDetailPage({
        params: Promise.resolve({ occurrenceKey: "warmup" }),
        searchParams: Promise.resolve({ date: "2026-09-17" }),
      }),
    ).resolves.toBeTruthy();
    expect(notFound).not.toHaveBeenCalled();
  });

  it("keeps ordinary sports without a session outside the exercise detail route", async () => {
    queryDay.mockResolvedValue({
      status: "ready",
      day: {
        activities: [
          { id: "sport", type: "sport_practice", structured: null, preparationSession: null },
        ],
      },
    });
    await expect(
      TrainingDetailPage({
        params: Promise.resolve({ occurrenceKey: "sport" }),
        searchParams: Promise.resolve({ date: "2026-09-17" }),
      }),
    ).rejects.toThrow("not found");
  });
});
