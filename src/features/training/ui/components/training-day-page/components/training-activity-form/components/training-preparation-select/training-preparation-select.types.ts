import type { TrainingActivityFormProps } from "../../training-activity-form.types";
export type TrainingPreparationSelectProps = Pick<
  TrainingActivityFormProps,
  "activity" | "availablePlan"
> &
  Readonly<{
    value: string;
    onChange: (value: string) => void;
    disabled: boolean;
    allowKeep: boolean;
  }>;
