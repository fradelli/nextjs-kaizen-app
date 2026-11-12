import { TrainingInlineActivityCard } from "@/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card";
import {
  addTrainingActivityAction,
  controlTrainingActivityAction,
  deleteTrainingActivityAction,
  saveTrainingActivityExerciseAction,
  updateTrainingActivityAction,
} from "../../training-actions";
import { notFound } from "next/navigation";
import { queryFixedWorkspaceTrainingDayPage } from "@/features/training/data/training-queries";
import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";

export default async function TrainingDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ occurrenceKey: string }>;
  searchParams: Promise<{ date?: string | string[] }>;
}) {
  const [{ occurrenceKey }, { date }] = await Promise.all([params, searchParams]);
  const resolution = resolveTrainingDayDate({ rawDate: date });
  if (resolution.status !== "valid") notFound();
  const result = await queryFixedWorkspaceTrainingDayPage(resolution.civilDate);
  if (result.status !== "ready") notFound();
  const activity = result.day.activities.find((item) => item.id === occurrenceKey);
  if (!activity || activity.type !== "structured_training" || !activity.structured) notFound();
  return (
    <section className="mx-auto max-w-3xl space-y-6 p-4">
      <TrainingInlineActivityCard
        dedicated
        activity={activity}
        civilDate={resolution.civilDate}
        availablePlan={"availablePlan" in result.day ? result.day.availablePlan : null}
        actions={{
          addActivity: addTrainingActivityAction,
          updateActivity: updateTrainingActivityAction,
          controlActivity: controlTrainingActivityAction,
          saveActivityExercise: saveTrainingActivityExerciseAction,
          deleteActivity: deleteTrainingActivityAction,
        }}
      />
    </section>
  );
}
