import type { TrainingActivityCardProps } from "../../../training-day-page/components/training-activity-card/training-activity-card.types";

export type TrainingGridEventProps = TrainingActivityCardProps &
  Readonly<{
    compact?: boolean;
    inList?: boolean;
    markerOnly?: boolean;
  }>;
