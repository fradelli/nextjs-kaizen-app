import { parseTrainingExerciseBlock } from "./parse-training-exercise-block";
import type { Prisma } from "@/generated/prisma/client";
import {
  parseDirectionValues,
  parseNormalizedTrainingDose,
  parseStringArray,
  readNullableStringProperty,
  readStringArrayProperty,
  toCivilDateString,
} from "../domain/training-day.rules";
import type {
  TrainingAssignmentSnapshot,
  TrainingExerciseExecutionSnapshot,
  TrainingPlanSnapshot,
  TrainingSessionSnapshot,
} from "../domain/training-day.types";
import type {
  PrismaTrainingAssignmentRow,
  PrismaTrainingPlanRow,
} from "./prisma-training-repository.types";

export function mapPrismaTrainingPlan(row: PrismaTrainingPlanRow): TrainingPlanSnapshot {
  return Object.freeze({
    databaseId: row.id,
    planId: row.planId,
    version: row.version,
    sourceStatus: row.sourceStatus,
    preparationSuggestions: mapPreparationSuggestions(row),
    sessions: Object.freeze(
      [...row.trainingSessionDefinition_plan]
        .sort((left, right) => compareStableIdentifiers(left.sessionId, right.sessionId))
        .map(mapPrismaTrainingSession),
    ),
  });
}

export function mapPrismaTrainingAssignment(
  row: PrismaTrainingAssignmentRow,
): TrainingAssignmentSnapshot {
  const execution = row.trainingExecution_assignment;

  return Object.freeze({
    id: row.id,
    civilDate: toCivilDateString(row.civilDate),
    kind: row.kind,
    mainSessionDatabaseId: row.mainSessionId,
    preparationSessionDatabaseId: row.preparationSessionId,
    plannedStartMinute: row.plannedStartMinute,
    plannedEndMinute: row.plannedEndMinute,
    reason: row.reason,
    revision: row.revision,
    plan: row.plan ? mapPrismaTrainingPlan(row.plan) : null,
    execution: execution
      ? Object.freeze({
          id: execution.id,
          status: execution.status,
          comment: execution.comment,
          intensity: execution.intensity,
          energy: execution.energy,
          actualStartMinute: execution.actualStartMinute,
          actualEndMinute: execution.actualEndMinute,
          startedAt: toTimestamp(execution.startedAt),
          completedAt: toTimestamp(execution.completedAt),
          revision: execution.revision,
          exercises: Object.freeze(
            execution.trainingExerciseExecution_execution.map(mapPrismaExerciseExecution),
          ),
        })
      : null,
  });
}

function mapPrismaTrainingSession(
  row: PrismaTrainingPlanRow["trainingSessionDefinition_plan"][number],
): TrainingSessionSnapshot {
  return Object.freeze({
    databaseId: row.id,
    sessionId: row.sessionId,
    name: row.name,
    targetDurationMinutes: row.targetDurationMinutes,
    shortDurationMinutes: row.shortDurationMinutes,
    intensity: row.intensity,
    notes: row.notes,
    assignmentRole: row.assignmentRole,
    compatiblePreparationSessionIds: parseStringArray(
      row.compatiblePreparationSessionIds,
      "Lista de preparações compatíveis",
    ),
    exercises: Object.freeze(
      [...row.trainingExerciseDefinition_session]
        .sort((left, right) => left.ordinal - right.ordinal)
        .map((prescription) =>
          Object.freeze({
            prescriptionId: prescription.id,
            ordinal: prescription.ordinal,
            sets: prescription.sets,
            prescribedText: prescription.prescribedText,
            restSeconds: prescription.restSeconds,
            priority: prescription.priority,
            notes: prescription.notes,
            block: parseTrainingExerciseBlock(prescription),
            dose: parseNormalizedTrainingDose(prescription.normalizedDose),
            exercise: Object.freeze({
              exerciseId: prescription.exercise.exerciseId,
              name: prescription.exercise.namePt,
              measurementType: prescription.exercise.measurementType,
              loadApplicable: prescription.exercise.loadApplicable,
              loadUnit: prescription.exercise.loadUnit,
              instructions: readStringArrayProperty(prescription.exercise.definition, "how_to"),
              cues: readStringArrayProperty(prescription.exercise.definition, "cues"),
              risks: readNullableStringProperty(prescription.exercise.definition, "risks"),
            }),
          }),
        ),
    ),
  });
}

function mapPrismaExerciseExecution(
  row: PrismaTrainingAssignmentRow["trainingExecution_assignment"] extends infer Execution
    ? NonNullable<Execution> extends {
        trainingExerciseExecution_execution: readonly (infer ExerciseExecution)[];
      }
      ? ExerciseExecution
      : never
    : never,
): TrainingExerciseExecutionSnapshot {
  return Object.freeze({
    id: row.id,
    prescriptionId: row.exerciseDefinitionId,
    sessionDatabaseId: row.sessionDefinitionId,
    role: row.role,
    itemStatus: row.itemStatus,
    comment: row.comment,
    revision: row.revision,
    sets: Object.freeze(
      row.trainingSetExecution_exerciseExecution.map((set) =>
        Object.freeze({
          setNumber: set.setNumber,
          status: set.status,
          value: set.value,
          leftValue: set.leftValue,
          rightValue: set.rightValue,
          directionValues: parseDirectionValues(set.directionValues),
          loadKg: decimalToString(set.loadKg),
          revision: set.revision,
        }),
      ),
    ),
  });
}

function decimalToString(value: Prisma.Decimal | null): string | null {
  return value?.toString() ?? null;
}

function toTimestamp(value: Date | null): string | null {
  return value?.toISOString() ?? null;
}

function compareStableIdentifiers(left: string, right: string): number {
  if (left === right) return 0;

  return left < right ? -1 : 1;
}

function mapPreparationSuggestions(row: PrismaTrainingPlanRow) {
  const schedule = row.weeklySchedule;
  if (
    !schedule ||
    typeof schedule !== "object" ||
    Array.isArray(schedule) ||
    !("entries" in schedule) ||
    !Array.isArray(schedule.entries)
  )
    return [];
  const suggestions = new Map<string, { sport: string; sessionId: string }>();
  for (const entry of schedule.entries) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    if (typeof entry.sport !== "string" || typeof entry.preparation_session_id !== "string")
      continue;
    if (
      !row.trainingSessionDefinition_plan.some(
        (session) =>
          session.sessionId === entry.preparation_session_id &&
          session.assignmentRole === "preparation",
      )
    )
      continue;
    suggestions.set(`${entry.sport}:${entry.preparation_session_id}`, {
      sport: entry.sport,
      sessionId: entry.preparation_session_id,
    });
  }
  return [...suggestions.values()];
}
