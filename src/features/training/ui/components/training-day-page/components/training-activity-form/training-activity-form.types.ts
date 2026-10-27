import type {
  AvailablePublicTrainingPlanDto,
  TrainingActivityDto,
} from "@/features/training/application/training-dto";
import type { TrainingActivityEditorValues } from "@/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.types";
import type { TrainingFormAction } from "@/features/training/ui/training-action.types";

export type TrainingActivityFormProps = Readonly<{
  startedLocally?: boolean;
  editor?: Readonly<{
    formId: string;
    initialValues: TrainingActivityEditorValues;
    blocked: boolean;
    readOnly: boolean;
    onValuesChange: (values: TrainingActivityEditorValues) => void;
    onBusyChange: (busy: boolean) => void;
    onSaved: (result: Readonly<{ targetCivilDate: string }>) => void;
    onNeedsReload: () => void;
  }>;
  civilDate: string;
  action: TrainingFormAction;
  activity?: TrainingActivityDto;
  availablePlan: AvailablePublicTrainingPlanDto | null;
}>;

export type TrainingScheduleSession = Pick<
  NonNullable<TrainingActivityDto["structured"]>["main"],
  "sessionId" | "name" | "targetDurationMinutes"
>;
