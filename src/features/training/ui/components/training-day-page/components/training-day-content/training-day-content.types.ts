import type { TrainingDayPageQueryResult } from "@/features/training/application/training-dto";

export type TrainingDayContentProps = Pick<
  Extract<TrainingDayPageQueryResult, { status: "invalid_data" }>,
  "reason"
>;
