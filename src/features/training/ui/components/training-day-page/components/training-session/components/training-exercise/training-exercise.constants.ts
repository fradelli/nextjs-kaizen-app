import type { TrainingItemStatus } from "@/features/training/domain/training-day.types";

export const TRAINING_EXERCISE_STATUS_LABELS = {
  pending: "pending",
  completed: "completed",
  skipped: "exerciseSkipped",
} satisfies Record<TrainingItemStatus, string>;

export const TRAINING_EXERCISE_STATUS_VARIANTS = {
  pending: "outline",
  completed: "success",
  skipped: "secondary",
} satisfies Record<TrainingItemStatus, "outline" | "success" | "secondary">;
