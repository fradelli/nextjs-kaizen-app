import TrainingDetailPage from "@/app/workout/activity/[occurrenceKey]/page";
import { TrainingWorkoutOverlay } from "@/features/training/ui/components/training-workout-overlay/training-workout-overlay";

export default async function InterceptedWorkout(props: Parameters<typeof TrainingDetailPage>[0]) {
  return <TrainingWorkoutOverlay>{await TrainingDetailPage(props)}</TrainingWorkoutOverlay>;
}
