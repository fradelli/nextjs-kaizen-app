import type { TrainingPlanSnapshot } from "../domain/training-day.types";
import type {
  AvailablePublicTrainingPlanDto,
  PublicTrainingPlanDto,
  PublicTrainingSessionDto,
} from "./training-dto";
import { resolveTrainingExercisePriorityLevel } from "../domain/training-exercise-priority";
import type { GetPublicTrainingPlanDependencies } from "./get-public-training-plan.types";
import { formatTrainingExerciseBlockLabel } from "./format-training-exercise-block-label";

export async function getPublicTrainingPlan(
  dependencies: GetPublicTrainingPlanDependencies,
): Promise<PublicTrainingPlanDto> {
  const plan = await dependencies.repository.findActiveTrainingPlan(dependencies.environment);

  return plan ? projectAvailablePublicTrainingPlan(plan) : unavailablePublicTrainingPlan();
}

export function projectAvailablePublicTrainingPlan(
  plan: TrainingPlanSnapshot,
): AvailablePublicTrainingPlanDto {
  return Object.freeze({
    status: "available",
    planId: plan.planId,
    version: plan.version,
    sourceStatus: plan.sourceStatus,
    preparationSuggestions: plan.preparationSuggestions ?? [],
    sessions: Object.freeze(plan.sessions.map(projectPublicTrainingSession)),
  });
}

function projectPublicTrainingSession(
  session: TrainingPlanSnapshot["sessions"][number],
): PublicTrainingSessionDto {
  return Object.freeze({
    sessionId: session.sessionId,
    name: session.name,
    targetDurationMinutes: session.targetDurationMinutes,
    shortDurationMinutes: session.shortDurationMinutes,
    intensity: session.intensity,
    notes: session.notes,
    assignmentRole: session.assignmentRole,
    compatiblePreparationSessionIds: session.compatiblePreparationSessionIds,
    exercises: Object.freeze(
      session.exercises.map((prescription) =>
        Object.freeze({
          prescriptionId: prescription.prescriptionId,
          exerciseId: prescription.exercise.exerciseId,
          name: prescription.exercise.name,
          ordinal: prescription.ordinal,
          prescribedSets: prescription.sets,
          prescribedText: prescription.prescribedText,
          blockLabel: formatTrainingExerciseBlockLabel(prescription.block),
          block: prescription.block,
          restSeconds: prescription.restSeconds,
          priorityLevel: resolveTrainingExercisePriorityLevel(prescription.priority),
          notes: prescription.notes,
          dose: prescription.dose,
          measurementType: prescription.exercise.measurementType,
          loadApplicable: prescription.exercise.loadApplicable,
          loadUnit: prescription.exercise.loadUnit,
          instructions: prescription.exercise.instructions,
          cues: prescription.exercise.cues,
          risks: prescription.exercise.risks,
        }),
      ),
    ),
  });
}

function unavailablePublicTrainingPlan(): PublicTrainingPlanDto {
  return Object.freeze({ status: "unavailable", reason: "active_plan_not_found" });
}
