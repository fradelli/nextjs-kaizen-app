import type {
  CivilDate,
  TrainingExerciseHistory,
  NormalizedTrainingDose,
  TrainingExerciseRole,
  TrainingExecutionStatus,
  TrainingItemStatus,
  TrainingMeasurementType,
  TrainingActivityEnergy,
  TrainingActivityIntensity,
  TrainingActivityStatus,
  TrainingActivityType,
  TrainingActivitySource,
} from "../domain/training-day.types";
import type { TrainingExercisePriorityLevel } from "../domain/training-exercise-priority";

export type PublicTrainingExerciseDto = Readonly<{
  prescriptionId: string;
  exerciseId: string;
  name: string;
  ordinal: number;
  prescribedSets: number;
  prescribedText: string;
  blockLabel?: string | null;
  block?: Readonly<{ mode: string; ordinal: number; position: number }> | null;
  restSeconds: number | null;
  priorityLevel: TrainingExercisePriorityLevel | null;
  notes: string | null;
  dose: NormalizedTrainingDose;
  measurementType: TrainingMeasurementType;
  loadApplicable: boolean;
  loadUnit: string | null;
  instructions: readonly string[];
  cues: readonly string[];
  risks: string | null;
}>;

export type PublicTrainingSessionDto = Readonly<{
  sessionId: string;
  name: string;
  targetDurationMinutes: number;
  shortDurationMinutes: number | null;
  intensity: string | null;
  notes: string | null;
  assignmentRole: TrainingExerciseRole;
  compatiblePreparationSessionIds: readonly string[];
  exercises: readonly PublicTrainingExerciseDto[];
}>;

export type AvailablePublicTrainingPlanDto = Readonly<{
  status: "available";
  planId: string;
  version: string;
  sourceStatus: string;
  preparationSuggestions?: readonly Readonly<{ sport: string; sessionId: string }>[];
  sessions: readonly PublicTrainingSessionDto[];
}>;

export type PublicTrainingPlanDto =
  | AvailablePublicTrainingPlanDto
  | Readonly<{ status: "unavailable"; reason: "active_plan_not_found" }>;

export type TrainingSetDto = Readonly<{
  setNumber: number;
  kind?: "warmup" | "work";
  confirmed?: boolean | null;

  status: TrainingItemStatus;
  value: number | null;
  leftValue: number | null;
  rightValue: number | null;
  directionValues: Readonly<Record<string, number>> | null;
  loadKg: string | null;
  revision: number | null;
}>;

export type TrainingDayExerciseDto = PublicTrainingExerciseDto &
  Readonly<{
    history?: readonly TrainingExerciseHistory[];
  }> &
  Readonly<{
    executionId: string | null;
    status: TrainingItemStatus;
    comment: string | null;
    revision: number | null;
    sets: readonly TrainingSetDto[];
  }>;

export type TrainingDaySessionDto = Readonly<{
  role: "main" | "preparation" | "mobility";
  sessionId: string;
  name: string;
  targetDurationMinutes: number;
  shortDurationMinutes: number | null;
  intensity: string | null;
  notes: string | null;
  exercises: readonly TrainingDayExerciseDto[];
}>;

export type TrainingExecutionDto = Readonly<{
  id: string;
  status: TrainingExecutionStatus;
  comment: string | null;
  intensity: TrainingActivityIntensity | null;
  energy: TrainingActivityEnergy | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  startedAt: string | null;
  completedAt: string | null;
  revision: number;
}>;

export type TrainingActivityDto = Readonly<{
  id: string;
  type: TrainingActivityType;
  source: TrainingActivitySource;
  role: "primary" | "preparation";
  name: string;
  sport: string | null;
  status: TrainingActivityStatus;
  plannedStartTime: string | null;
  plannedEndTime: string | null;
  plannedDurationMinutes: number | null;
  actualStartTime: string | null;
  actualEndTime: string | null;
  actualDurationMinutes: number | null;
  startedAt: string | null;
  completedAt: string | null;
  accumulatedActiveSeconds: number;
  currentIntervalStartedAt: string | null;
  intervals: readonly Readonly<{ startedAt: string; endedAt: string | null }>[];
  intensity: TrainingActivityIntensity | null;
  energy: TrainingActivityEnergy | null;
  comment: string | null;
  revision: number;
  structured: Readonly<{
    main: TrainingDaySessionDto;
    preparation: TrainingDaySessionDto | null;
  }> | null;
  preparationSession?: TrainingDaySessionDto | null;
  preparations: readonly TrainingActivityDto[];
}>;

type TrainingDayActivitiesDto = Readonly<{
  activities: readonly TrainingActivityDto[];
}>;

type AssignedTrainingDayBaseDto = TrainingDayActivitiesDto &
  Readonly<{
    civilDate: CivilDate;
    assignmentId: string;
    assignmentRevision: number;
    planId: string;
    planVersion: string;
    availablePlan: AvailablePublicTrainingPlanDto;
    execution: TrainingExecutionDto | null;
    plannedStartTime: string | null;
    plannedEndTime: string | null;
    plannedDurationMinutes: number | null;
  }>;

export type TrainingDayDto =
  | (TrainingDayActivitiesDto &
      Readonly<{
        state: "unavailable";
        civilDate: CivilDate;
        reason: "active_plan_not_found";
      }>)
  | (TrainingDayActivitiesDto &
      Readonly<{
        state: "unassigned";
        civilDate: CivilDate;
        assignmentId: string | null;
        assignmentRevision: number | null;
        availablePlan: AvailablePublicTrainingPlanDto;
      }>)
  | (AssignedTrainingDayBaseDto &
      Readonly<{
        state: "training";
        preparation: TrainingDaySessionDto | null;
        main: TrainingDaySessionDto;
      }>)
  | (AssignedTrainingDayBaseDto &
      Readonly<{
        state: "mobility";
        mobility: TrainingDaySessionDto;
      }>)
  | (TrainingDayActivitiesDto &
      Readonly<{
        state: "rest";
        civilDate: CivilDate;
        assignmentId: string;
        assignmentRevision: number;
        availablePlan: AvailablePublicTrainingPlanDto | null;
        reason: string | null;
        execution: TrainingExecutionDto | null;
      }>);

export type TrainingDayPageQueryResult =
  | Readonly<{ status: "ready"; day: TrainingDayDto }>
  | Readonly<{
      status: "invalid_data";
      reason: "definition_invalid" | "reference_invalid";
    }>;
