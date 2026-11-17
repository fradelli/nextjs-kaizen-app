"use client";

import { TrainingDayUnexpectedError } from "@/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error";
import type { TrainingDayUnexpectedErrorProps } from "@/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.types";

export default function TrainingError(props: TrainingDayUnexpectedErrorProps) {
  return <TrainingDayUnexpectedError {...props} />;
}
