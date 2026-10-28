import type {
  TrainingActivityEditorContext,
  TrainingActivityEditorDraftStatus,
  TrainingActivityEditorStorageResult,
  TrainingActivityEditorValues,
} from "../../lib/training-activity-editor-draft/training-activity-editor-draft.types";

export type UseTrainingActivityEditorDraftInput = Readonly<{
  context: TrainingActivityEditorContext;
  baseValues: TrainingActivityEditorValues;
}>;

export type UseTrainingActivityEditorDraftResult = Readonly<{
  ready: boolean;
  initialValues: TrainingActivityEditorValues;
  status: TrainingActivityEditorDraftStatus;
  dirty: boolean;
  blocked: boolean;
  update: (values: TrainingActivityEditorValues) => void;
  flush: () => TrainingActivityEditorStorageResult;
  discard: () => TrainingActivityEditorStorageResult;
  finish: () => TrainingActivityEditorStorageResult;
}>;
