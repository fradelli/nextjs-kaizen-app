import { describe, expect, it, vi } from "vitest";
import {
  addTrainingActivity,
  controlTrainingActivity,
  deleteTrainingActivity,
  saveTrainingActivityExercise,
  updateTrainingActivity,
} from "./mutate-training-day";
import type { TrainingMutationRepository } from "./training-repository";

function dependencies() {
  const repository: TrainingMutationRepository = {
    addTrainingActivity: vi.fn(),
    controlTrainingActivity: vi.fn(),
    deleteTrainingActivity: vi.fn(),
    saveTrainingActivityExercise: vi.fn(),
    updateTrainingActivity: vi.fn(),
  };
  return {
    repository,
    resolveWorkspace: () => ({ workspaceId: "fixed" }),
    now: () => new Date("2026-09-26T15:00:00Z"),
  };
}
describe("training mutation date boundary", () => {
  it.each(["2026-09-25", "2026-09-26"])(
    "records retrospectively on %s using the fixed workspace",
    async (civilDate) => {
      const d = dependencies();
      await controlTrainingActivity(d, {
        civilDate,
        activityId: "activity",
        expectedRevision: 0,
        action: "record_completed",
        intensity: "high",
        energy: "normal",
        comment: null,
      });
      expect(d.repository.controlTrainingActivity).toHaveBeenCalledWith(
        expect.objectContaining({
          civilDate,
          workspaceId: "fixed",
          action: "record_completed",
        }),
      );
    },
  );
  it.each(["2026-09-27", "2026-09-30"])(
    "allows agenda mutations but rejects execution on future date %s",
    async (civilDate) => {
      const d = dependencies();
      const expected = { status: "invalid", field: "civilDate" };
      await addTrainingActivity(d, {
        civilDate,
      } as Parameters<typeof addTrainingActivity>[1]);
      await updateTrainingActivity(d, {
        civilDate,
      } as Parameters<typeof updateTrainingActivity>[1]);
      await deleteTrainingActivity(d, {
        civilDate,
      } as Parameters<typeof deleteTrainingActivity>[1]);
      await expect(
        controlTrainingActivity(d, { civilDate, action: "record_completed" } as Parameters<
          typeof controlTrainingActivity
        >[1]),
      ).resolves.toMatchObject(expected);
      await expect(
        saveTrainingActivityExercise(d, { civilDate } as Parameters<
          typeof saveTrainingActivityExercise
        >[1]),
      ).resolves.toMatchObject(expected);
      expect(d.repository.addTrainingActivity).toHaveBeenCalledOnce();
      expect(d.repository.updateTrainingActivity).toHaveBeenCalledOnce();
      expect(d.repository.deleteTrainingActivity).toHaveBeenCalledOnce();
      expect(d.repository.controlTrainingActivity).not.toHaveBeenCalled();
      expect(d.repository.saveTrainingActivityExercise).not.toHaveBeenCalled();
    },
  );

  it.each(["2026-09-24", "2026-10-01"])(
    "rejects every mutation outside the agenda window on %s",
    async (civilDate) => {
      const d = dependencies();
      const expected = { status: "invalid", field: "civilDate" };
      await expect(
        addTrainingActivity(d, { civilDate } as Parameters<typeof addTrainingActivity>[1]),
      ).resolves.toMatchObject(expected);
      await expect(
        updateTrainingActivity(d, { civilDate } as Parameters<typeof updateTrainingActivity>[1]),
      ).resolves.toMatchObject(expected);
      await expect(
        deleteTrainingActivity(d, { civilDate } as Parameters<typeof deleteTrainingActivity>[1]),
      ).resolves.toMatchObject(expected);
      await expect(
        controlTrainingActivity(d, { civilDate, action: "record_completed" } as Parameters<
          typeof controlTrainingActivity
        >[1]),
      ).resolves.toMatchObject(expected);
      await expect(
        saveTrainingActivityExercise(d, { civilDate } as Parameters<
          typeof saveTrainingActivityExercise
        >[1]),
      ).resolves.toMatchObject(expected);
      for (const method of Object.values(d.repository)) expect(method).not.toHaveBeenCalled();
    },
  );
});

describe("activity rescheduling date boundary", () => {
  it.each(["2026-09-24", "2026-10-01", "2026-02-30"])(
    "rejects invalid destination %s before accessing the repository",
    async (targetCivilDate) => {
      const d = dependencies();
      await expect(
        updateTrainingActivity(d, { civilDate: "2026-09-26", targetCivilDate } as Parameters<
          typeof updateTrainingActivity
        >[1]),
      ).resolves.toMatchObject({ status: "invalid", field: "targetCivilDate" });
      expect(d.repository.updateTrainingActivity).not.toHaveBeenCalled();
    },
  );
  it.each(["2026-09-25", "2026-09-30"])(
    "passes an allowed destination %s with server workspace",
    async (targetCivilDate) => {
      const d = dependencies();
      await updateTrainingActivity(d, { civilDate: "2026-09-26", targetCivilDate } as Parameters<
        typeof updateTrainingActivity
      >[1]);
      expect(d.repository.updateTrainingActivity).toHaveBeenCalledWith(
        expect.objectContaining({ civilDate: "2026-09-26", targetCivilDate, workspaceId: "fixed" }),
      );
    },
  );
  it("does not move an activity whose source date is locked even if destination is allowed", async () => {
    const d = dependencies();
    await expect(
      updateTrainingActivity(d, {
        civilDate: "2026-09-24",
        targetCivilDate: "2026-09-26",
      } as Parameters<typeof updateTrainingActivity>[1]),
    ).resolves.toMatchObject({ status: "invalid", field: "civilDate" });
    expect(d.repository.updateTrainingActivity).not.toHaveBeenCalled();
  });
});
