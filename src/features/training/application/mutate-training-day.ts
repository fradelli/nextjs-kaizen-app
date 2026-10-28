import { parseCivilDate } from "../domain/training-day.rules";
import {
  isTrainingAgendaDateEditable,
  isTrainingExecutionDateEditable,
} from "../domain/training-edit-window";
import type { TrainingMutationRepository } from "./training-repository";
import type {
  TrainingMutationResult,
  AddTrainingActivityCommand,
  ControlTrainingActivityCommand,
  DeleteTrainingActivityCommand,
  SaveTrainingActivityExerciseCommand,
  UpdateTrainingActivityCommand,
} from "./training-mutation.types";

type MutationDependencies = Readonly<{
  repository: TrainingMutationRepository;
  resolveWorkspace: () => Readonly<{ workspaceId: string }>;
  now?: () => Date;
}>;

export function addTrainingActivity(
  dependencies: MutationDependencies,
  input: Omit<AddTrainingActivityCommand, "workspaceId" | "civilDate"> & { civilDate: string },
): Promise<TrainingMutationResult> {
  if (!isTrainingAgendaDateEditable(input.civilDate, dependencies.now?.()))
    return agendaDateLocked();
  return dependencies.repository.addTrainingActivity({
    ...input,
    civilDate: parseCivilDate(input.civilDate),
    workspaceId: dependencies.resolveWorkspace().workspaceId,
  });
}

export function controlTrainingActivity(
  dependencies: MutationDependencies,
  input: Omit<ControlTrainingActivityCommand, "workspaceId" | "civilDate"> & {
    civilDate: string;
  },
): Promise<TrainingMutationResult> {
  if (!isTrainingExecutionDateEditable(input.civilDate, dependencies.now?.()))
    return executionDateLocked();
  return dependencies.repository.controlTrainingActivity({
    ...input,
    civilDate: parseCivilDate(input.civilDate),
    workspaceId: dependencies.resolveWorkspace().workspaceId,
  });
}

export function saveTrainingActivityExercise(
  dependencies: MutationDependencies,
  input: Omit<SaveTrainingActivityExerciseCommand, "workspaceId" | "civilDate"> & {
    civilDate: string;
  },
): Promise<TrainingMutationResult> {
  if (!isTrainingExecutionDateEditable(input.civilDate, dependencies.now?.()))
    return executionDateLocked();
  return dependencies.repository.saveTrainingActivityExercise({
    ...input,
    civilDate: parseCivilDate(input.civilDate),
    workspaceId: dependencies.resolveWorkspace().workspaceId,
  });
}

export function updateTrainingActivity(
  dependencies: MutationDependencies,
  input: Omit<UpdateTrainingActivityCommand, "workspaceId" | "civilDate" | "targetCivilDate"> & {
    civilDate: string;
    targetCivilDate?: string;
  },
): Promise<TrainingMutationResult> {
  if (!isTrainingAgendaDateEditable(input.civilDate, dependencies.now?.()))
    return agendaDateLocked();
  if (
    input.targetCivilDate &&
    !isTrainingAgendaDateEditable(input.targetCivilDate, dependencies.now?.())
  ) {
    return Promise.resolve({
      status: "invalid",
      field: "targetCivilDate",
      message: "A nova data deve ficar entre ontem e quatro dias no futuro.",
    });
  }
  return dependencies.repository.updateTrainingActivity({
    ...input,
    civilDate: parseCivilDate(input.civilDate),
    targetCivilDate: input.targetCivilDate ? parseCivilDate(input.targetCivilDate) : undefined,
    workspaceId: dependencies.resolveWorkspace().workspaceId,
  });
}

export function deleteTrainingActivity(
  dependencies: MutationDependencies,
  input: Omit<DeleteTrainingActivityCommand, "workspaceId" | "civilDate"> & {
    civilDate: string;
  },
): Promise<TrainingMutationResult> {
  if (!isTrainingAgendaDateEditable(input.civilDate, dependencies.now?.()))
    return agendaDateLocked();
  return dependencies.repository.deleteTrainingActivity({
    ...input,
    civilDate: parseCivilDate(input.civilDate),
    workspaceId: dependencies.resolveWorkspace().workspaceId,
  });
}

function agendaDateLocked(): Promise<TrainingMutationResult> {
  return Promise.resolve({
    status: "invalid",
    field: "civilDate",
    message: "Só é possível organizar atividades de ontem até quatro dias no futuro.",
  });
}

function executionDateLocked(): Promise<TrainingMutationResult> {
  return Promise.resolve({
    status: "invalid",
    field: "civilDate",
    message: "Só é possível registrar uma execução de hoje ou ontem.",
  });
}
