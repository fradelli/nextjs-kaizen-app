import type { TrainingActivityDto } from "@/features/training/application/training-dto";
import type { TrainingSetDraft } from "../use-training-exercise-draft/use-training-exercise-draft.types";

export type TrainingExerciseExecutionDraft = {
  sessionId: string;
  exerciseId: string;
  role: "main" | "preparation";
  completed: boolean;
  rest?: { setNumber: number; endsAt: number };
  comment: string;
  sets: readonly TrainingSetDraft[];
};

export type TrainingActivityExecutionDraft = {
  version: 1;
  activityId: string;
  civilDate: string;
  expectedRevision: number;
  status: "in_progress" | "paused";
  startedAt: string;
  intervals: readonly { startedAt: string; endedAt: string | null }[];
  exercises: Record<string, TrainingExerciseExecutionDraft>;
};

export type UseTrainingActivityDraftInput = Readonly<{
  activity: TrainingActivityDto;
  civilDate: string;
}>;
