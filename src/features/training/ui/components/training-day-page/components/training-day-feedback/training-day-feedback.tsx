import { Alert, AlertAction, AlertDescription, AlertTitle } from "@fradelli/ui/alert";

import { trainingDayFeedbackStyles } from "./training-day-feedback.styles";
import type { TrainingDayFeedbackProps } from "./training-day-feedback.types";

export function TrainingDayFeedback({
  title,
  description,
  variant = "info",
  action,
}: TrainingDayFeedbackProps) {
  return (
    <Alert variant={variant}>
      <AlertTitle className={trainingDayFeedbackStyles.title}>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      {action ? <AlertAction>{action}</AlertAction> : null}
    </Alert>
  );
}
