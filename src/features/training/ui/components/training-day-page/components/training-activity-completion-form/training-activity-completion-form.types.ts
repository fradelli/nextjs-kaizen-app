import type { CompletionValues } from "@/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft";
export type TrainingActivityCompletionFormProps = Readonly<{
  id: string;
  mobility: boolean;
  disabled: boolean;
  values: CompletionValues;
  onChange: (values: CompletionValues) => void;
}>;
