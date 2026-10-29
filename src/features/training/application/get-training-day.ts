import type {
  TrainingAssignmentSnapshot,
  TrainingActivitySnapshot,
  TrainingExerciseExecutionSnapshot,
  TrainingExerciseRole,
  TrainingItemStatus,
  TrainingPlanSnapshot,
  TrainingSessionSnapshot,
} from "../domain/training-day.types";
import { parseCivilDate } from "../domain/training-day.rules";
import { TrainingProjectionError } from "../domain/training-projection.error";
import type {
  TrainingDayDto,
  TrainingDayExerciseDto,
  TrainingDaySessionDto,
  TrainingExecutionDto,
  TrainingActivityDto,
  TrainingSetDto,
} from "./training-dto";
import { resolveTrainingExercisePriorityLevel } from "../domain/training-exercise-priority";
import type { GetTrainingDayDependencies, GetTrainingDayInput } from "./get-training-day.types";
import { projectAvailablePublicTrainingPlan } from "./get-public-training-plan";
import { formatTrainingExerciseBlockLabel } from "./format-training-exercise-block-label";

export async function getTrainingDay(
  dependencies: GetTrainingDayDependencies,
  input: GetTrainingDayInput,
): Promise<TrainingDayDto> {
  const civilDate = parseCivilDate(input.civilDate);
  const { workspaceId } = await dependencies.resolveWorkspace();
  await dependencies.repository.ensureScheduledTrainingDay({
    workspaceId,
    civilDate,
    environment: dependencies.environment,
  });
  const snapshot = await dependencies.repository.findTrainingDay({
    workspaceId,
    civilDate,
    environment: dependencies.environment,
  });
  const assignment = snapshot.assignment;
  const activities = Object.freeze(snapshot.activities.map(projectTrainingActivity));

  if (!assignment || assignment.kind === "unassigned") {
    if (assignment) {
      assertUnassignedAssignmentIsCoherent(assignment);
    }

    if (!snapshot.activePlan) {
      return Object.freeze({
        state: "unavailable",
        civilDate,
        reason: "active_plan_not_found",
        activities,
      });
    }

    return Object.freeze({
      state: "unassigned",
      civilDate,
      assignmentId: assignment?.id ?? null,
      assignmentRevision: assignment?.revision ?? null,
      availablePlan: projectAvailablePublicTrainingPlan(snapshot.activePlan),
      activities,
    });
  }

  if (assignment.kind === "rest") {
    assertRestAssignmentIsCoherent(assignment);

    return Object.freeze({
      state: "rest",
      civilDate,
      assignmentId: assignment.id,
      assignmentRevision: assignment.revision,
      availablePlan: snapshot.activePlan
        ? projectAvailablePublicTrainingPlan(snapshot.activePlan)
        : null,
      reason: assignment.reason,
      execution: projectTrainingExecution(assignment),
      activities,
    });
  }

  const plan = requireAssignedPlan(assignment);
  const mainSession = requireSession(plan, assignment.mainSessionDatabaseId, "principal");
  const execution = projectTrainingExecution(assignment);

  if (assignment.kind === "mobility") {
    assertNoPreparationSession(assignment);
    assertExecutionReferencesAssignedSessions(assignment, [mainSession.databaseId]);

    return Object.freeze({
      state: "mobility",
      civilDate,
      assignmentId: assignment.id,
      assignmentRevision: assignment.revision,
      planId: plan.planId,
      planVersion: plan.version,
      availablePlan: projectAvailablePublicTrainingPlan(plan),
      execution,
      ...projectAssignmentSchedule(assignment),
      mobility: projectTrainingDaySession(mainSession, "mobility", assignment),
      activities,
    });
  }

  const preparation = assignment.preparationSessionDatabaseId
    ? projectTrainingDaySession(
        requireSession(plan, assignment.preparationSessionDatabaseId, "preparação"),
        "preparation",
        assignment,
      )
    : null;
  assertExecutionReferencesAssignedSessions(
    assignment,
    [mainSession.databaseId, assignment.preparationSessionDatabaseId].filter(
      (databaseId): databaseId is string => databaseId !== null,
    ),
  );

  return Object.freeze({
    state: "training",
    civilDate,
    assignmentId: assignment.id,
    assignmentRevision: assignment.revision,
    planId: plan.planId,
    planVersion: plan.version,
    availablePlan: projectAvailablePublicTrainingPlan(plan),
    execution,
    ...projectAssignmentSchedule(assignment),
    preparation,
    main: projectTrainingDaySession(mainSession, "main", assignment),
    activities,
  });
}

function projectTrainingActivity(activity: TrainingActivitySnapshot): TrainingActivityDto {
  const currentInterval = activity.intervals.find((interval) => interval.endedAt === null) ?? null;
  const accumulatedActiveSeconds = activity.intervals.reduce((total, interval) => {
    if (!interval.endedAt) return total;
    return (
      total + Math.max(0, Date.parse(interval.endedAt) - Date.parse(interval.startedAt)) / 1000
    );
  }, 0);
  return Object.freeze({
    id: activity.id,
    type: activity.type,
    source: activity.source,
    role: activity.role,
    name: activity.name,
    sport: activity.sport,
    status: activity.status,
    plannedStartTime:
      activity.plannedStartMinute === null ? null : formatMinuteOfDay(activity.plannedStartMinute),
    plannedEndTime:
      activity.plannedEndMinute === null ? null : formatMinuteOfDay(activity.plannedEndMinute),
    plannedDurationMinutes:
      activity.plannedStartMinute === null || activity.plannedEndMinute === null
        ? null
        : activity.plannedEndMinute - activity.plannedStartMinute,
    actualStartTime:
      activity.actualStartMinute === null ? null : formatMinuteOfDay(activity.actualStartMinute),
    actualEndTime:
      activity.actualEndMinute === null ? null : formatMinuteOfDay(activity.actualEndMinute),
    actualDurationMinutes:
      activity.actualStartMinute === null || activity.actualEndMinute === null
        ? null
        : activity.actualEndMinute - activity.actualStartMinute,
    startedAt: activity.startedAt,
    completedAt: activity.completedAt,
    accumulatedActiveSeconds: Math.floor(accumulatedActiveSeconds),
    currentIntervalStartedAt: currentInterval?.startedAt ?? null,
    intervals: activity.intervals,
    intensity: activity.intensity,
    energy: activity.energy,
    comment: activity.comment,
    revision: activity.revision,
    structured: activity.session
      ? Object.freeze({
          main: projectTrainingActivitySession(activity.session, "main", activity),
          preparation: activity.preparationSession
            ? projectTrainingActivitySession(activity.preparationSession, "preparation", activity)
            : null,
        })
      : null,
    ...(!activity.session && activity.preparationSession
      ? {
          preparationSession: projectTrainingActivitySession(
            activity.preparationSession,
            "preparation",
            activity,
          ),
        }
      : {}),
    preparations: Object.freeze(activity.preparations.map(projectTrainingActivity)),
  });
}

function projectTrainingActivitySession(
  session: TrainingSessionSnapshot,
  role: TrainingExerciseRole,
  activity: TrainingActivitySnapshot,
): TrainingDaySessionDto {
  const persistedByPrescription = new Map(
    activity.exerciseExecutions
      .filter(
        (execution) =>
          execution.sessionDatabaseId === session.databaseId && execution.role === role,
      )
      .map((execution) => [execution.prescriptionId, execution]),
  );
  return Object.freeze({
    role,
    sessionId: session.sessionId,
    name: session.name,
    targetDurationMinutes: session.targetDurationMinutes,
    shortDurationMinutes: session.shortDurationMinutes,
    intensity: session.intensity,
    notes: session.notes,
    exercises: Object.freeze(
      session.exercises.map((prescription) =>
        Object.freeze({
          ...projectTrainingDayExercise(
            prescription,
            role,
            persistedByPrescription.get(prescription.prescriptionId),
          ),
          history: activity.history?.filter(
            (item) =>
              item.activityId !== activity.id &&
              (item.startedAt && activity.startedAt ? item.startedAt < activity.startedAt : true) &&
              item.exerciseId === prescription.exercise.exerciseId &&
              item.unit === prescription.dose.unit &&
              item.scope === prescription.dose.scope &&
              item.loadApplicable === prescription.exercise.loadApplicable,
          ),
        }),
      ),
    ),
  });
}

function formatMinuteOfDay(value: number): string {
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function projectTrainingDaySession(
  session: TrainingSessionSnapshot,
  role: TrainingExerciseRole,
  assignment: TrainingAssignmentSnapshot,
): TrainingDaySessionDto {
  const persistedByPrescription = new Map(
    (assignment.execution?.exercises ?? [])
      .filter((item) => item.sessionDatabaseId === session.databaseId)
      .map((item) => [item.prescriptionId, item]),
  );

  for (const persisted of persistedByPrescription.values()) {
    if (persisted.role !== role) {
      invalidReference("A função da execução não corresponde à sessão atribuída.");
    }
  }

  const prescribedIds = new Set(session.exercises.map((item) => item.prescriptionId));

  if (
    [...persistedByPrescription.keys()].some((prescriptionId) => !prescribedIds.has(prescriptionId))
  ) {
    invalidReference("A execução referencia exercício ausente da sessão atribuída.");
  }

  return Object.freeze({
    role,
    sessionId: session.sessionId,
    name: session.name,
    targetDurationMinutes: session.targetDurationMinutes,
    shortDurationMinutes: session.shortDurationMinutes,
    intensity: session.intensity,
    notes: session.notes,
    exercises: Object.freeze(
      session.exercises.map((prescription) =>
        Object.freeze({
          ...projectTrainingDayExercise(
            prescription,
            role,
            persistedByPrescription.get(prescription.prescriptionId),
          ),
        }),
      ),
    ),
  });
}

function projectTrainingDayExercise(
  prescription: TrainingSessionSnapshot["exercises"][number],
  role: TrainingExerciseRole,
  persisted: TrainingExerciseExecutionSnapshot | undefined,
): TrainingDayExerciseDto {
  if (
    persisted &&
    persisted.sets.some((set) => set.setNumber > prescription.sets && set.confirmed === undefined)
  ) {
    invalidReference("A execução contém uma série fora da prescrição apresentada.");
  }

  if (role !== "main" && persisted?.sets.length) {
    invalidReference("Preparação ou mobilidade não pode conter séries persistidas.");
  }

  if (!prescription.exercise.loadApplicable && persisted?.sets.some((set) => set.loadKg !== null)) {
    invalidReference("A execução contém carga para um exercício sem carga aplicável.");
  }

  const persistedSets = new Map(persisted?.sets.map((set) => [set.setNumber, set]) ?? []);
  const sets =
    role === "main"
      ? Array.from(
          {
            length: Math.max(
              prescription.sets,
              ...(persisted?.sets.map((set) => set.setNumber) ?? []),
            ),
          },
          (_, index) => projectTrainingSet(index + 1, persistedSets.get(index + 1)),
        )
      : [];

  return Object.freeze({
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
    executionId: persisted?.id ?? null,
    status: projectTrainingExerciseStatus(role, sets, persisted?.itemStatus),
    comment: persisted?.comment ?? null,
    revision: persisted?.revision ?? null,
    sets: Object.freeze(sets),
  });
}

function projectTrainingExerciseStatus(
  role: TrainingExerciseRole,
  sets: readonly TrainingSetDto[],
  persistedStatus: TrainingItemStatus | undefined,
): TrainingItemStatus {
  if (persistedStatus !== undefined) return persistedStatus;
  if (role !== "main") return "pending";
  if (!sets.length) return "pending";
  if (sets.some((set) => set.status === "pending")) return "pending";
  if (sets.every((set) => set.status === "skipped")) return "skipped";
  return "completed";
}

function projectTrainingSet(
  setNumber: number,
  persisted: TrainingExerciseExecutionSnapshot["sets"][number] | undefined,
): TrainingSetDto {
  return Object.freeze({
    setNumber,
    kind: persisted?.kind,
    confirmed: persisted?.confirmed,
    status: persisted?.status ?? "pending",
    value: persisted?.value ?? null,
    leftValue: persisted?.leftValue ?? null,
    rightValue: persisted?.rightValue ?? null,
    directionValues: persisted?.directionValues ?? null,
    loadKg: persisted?.loadKg ?? null,
    revision: persisted?.revision ?? null,
  });
}

function projectTrainingExecution(
  assignment: TrainingAssignmentSnapshot,
): TrainingExecutionDto | null {
  const execution = assignment.execution;

  return execution
    ? Object.freeze({
        id: execution.id,
        status: execution.status,
        comment: execution.comment,
        intensity: execution.intensity,
        energy: execution.energy,
        actualStartTime:
          execution.actualStartMinute === null
            ? null
            : formatMinuteOfDay(execution.actualStartMinute),
        actualEndTime:
          execution.actualEndMinute === null ? null : formatMinuteOfDay(execution.actualEndMinute),
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        revision: execution.revision,
      })
    : null;
}

function projectAssignmentSchedule(assignment: TrainingAssignmentSnapshot) {
  return {
    plannedStartTime:
      assignment.plannedStartMinute === null
        ? null
        : formatMinuteOfDay(assignment.plannedStartMinute),
    plannedEndTime:
      assignment.plannedEndMinute === null ? null : formatMinuteOfDay(assignment.plannedEndMinute),
    plannedDurationMinutes:
      assignment.plannedStartMinute === null || assignment.plannedEndMinute === null
        ? null
        : assignment.plannedEndMinute - assignment.plannedStartMinute,
  } as const;
}

function requireAssignedPlan(assignment: TrainingAssignmentSnapshot): TrainingPlanSnapshot {
  if (!assignment.plan) {
    return invalidReference("A atribuição não referencia uma versão de plano válida.");
  }

  return assignment.plan;
}

function requireSession(
  plan: TrainingPlanSnapshot,
  databaseId: string | null,
  label: string,
): TrainingSessionSnapshot {
  const session = plan.sessions.find((candidate) => candidate.databaseId === databaseId);

  if (!session) {
    return invalidReference(`A sessão de ${label} não pertence à versão atribuída.`);
  }

  return session;
}

function assertRestAssignmentIsCoherent(assignment: TrainingAssignmentSnapshot): void {
  if (
    assignment.plan ||
    assignment.mainSessionDatabaseId ||
    assignment.preparationSessionDatabaseId ||
    assignment.execution?.exercises.length
  ) {
    invalidReference("O descanso contém referências de treino incompatíveis.");
  }
}

function assertUnassignedAssignmentIsCoherent(assignment: TrainingAssignmentSnapshot): void {
  if (
    assignment.plan ||
    assignment.mainSessionDatabaseId ||
    assignment.preparationSessionDatabaseId ||
    assignment.execution
  ) {
    invalidReference("O dia não atribuído contém referências operacionais incompatíveis.");
  }
}

function assertNoPreparationSession(assignment: TrainingAssignmentSnapshot): void {
  if (assignment.preparationSessionDatabaseId) {
    invalidReference("A mobilidade não pode conter uma sessão de preparação.");
  }
}

function assertExecutionReferencesAssignedSessions(
  assignment: TrainingAssignmentSnapshot,
  assignedSessionIds: readonly string[],
): void {
  if (
    assignment.execution?.exercises.some(
      (exercise) => !assignedSessionIds.includes(exercise.sessionDatabaseId),
    )
  ) {
    invalidReference("A execução contém exercício fora das sessões atribuídas.");
  }
}

function invalidReference(message: string): never {
  throw new TrainingProjectionError("TRAINING_REFERENCE_INVALID", message);
}
