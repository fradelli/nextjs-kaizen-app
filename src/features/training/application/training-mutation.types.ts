import type {
  CivilDate,
  TrainingExerciseRole,
  TrainingActivityEnergy,
  TrainingActivityIntensity,
  TrainingActivityType,
} from "../domain/training-day.types";

export type TrainingMutationResult =
  | Readonly<{ status: "saved"; revision: number }>
  | Readonly<{ status: "conflict"; message: string }>
  | Readonly<{ status: "invalid"; message: string; field?: string }>
  | Readonly<{ status: "not_found"; message: string }>
  | Readonly<{ status: "pending_confirmation"; message: string; pendingCount: number }>;

export type AddTrainingActivityCommand = Readonly<{
  workspaceId: string;
  environment: "local" | "preview" | "staging" | "production";
  civilDate: CivilDate;
  type: TrainingActivityType;
  name: string;
  sport: string | null;
  sessionId: string | null;
  preparationSessionId?: string | null;
  plannedStartTime: string;
  plannedEndTime: string;
}>;

export type ControlTrainingActivityCommand = Readonly<{
  workspaceId: string;
  civilDate: CivilDate;
  activityId: string;
  action: "complete" | "record_completed" | "update_feedback";
  intensity: TrainingActivityIntensity | null;
  energy: TrainingActivityEnergy | null;
  comment: string | null;
  expectedRevision: number;
  executionDraft?: TrainingActivityExecutionInput | null;
}>;

export type TrainingActivityExecutionInput = Readonly<{
  version: 1;
  activityId: string;
  civilDate: string;
  expectedRevision: number;
  status: "in_progress" | "paused";
  startedAt: string;
  intervals: readonly Readonly<{ startedAt: string; endedAt: string | null }>[];
  exercises: Readonly<
    Record<
      string,
      Readonly<{
        sessionId: string;
        exerciseId: string;
        role: "main" | "preparation";
        completed: boolean;
        comment: string;
        sets: readonly Readonly<{
          setNumber: number;
          value: string;
          leftValue: string;
          rightValue: string;
          directionValues: Readonly<Record<string, string>>;
          loadKg: string;
        }>[];
      }>
    >
  >;
}>;

export type SaveTrainingActivityExerciseCommand = Readonly<{
  workspaceId: string;
  civilDate: CivilDate;
  activityId: string;
  sessionId: string;
  exerciseId: string;
  role: TrainingExerciseRole;
  completed: boolean;
  comment: string | null;
  expectedRevision: number | null;
  sets: readonly TrainingActivitySetResultInput[];
}>;

export type TrainingActivitySetResultInput = Readonly<{
  setNumber: number;
  value: number;
  leftValue: number | null;
  rightValue: number | null;
  directionValues: Readonly<Record<string, number>> | null;
  loadKg: string | null;
}>;

export type UpdateTrainingActivityCommand = AddTrainingActivityCommand &
  Readonly<{
    targetCivilDate?: CivilDate;
    activityId: string;
    expectedRevision: number;
  }>;

export type DeleteTrainingActivityCommand = Readonly<{
  workspaceId: string;
  civilDate: CivilDate;
  activityId: string;
  expectedRevision: number;
}>;
