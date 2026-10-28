import { redirect } from "next/navigation";

import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { queryFixedWorkspaceTrainingDayPage } from "@/features/training/data/training-queries";
import { InvalidTrainingDate } from "@/features/training/ui/components/training-day-page/components/invalid-training-date/invalid-training-date";
import { TrainingDayContent } from "@/features/training/ui/components/training-day-page/components/training-day-content/training-day-content";
import { TrainingAgendaBadges } from "@/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges";
import { TrainingActivityEditor } from "@/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor";
import { TrainingActivityEditorNotice } from "@/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice";
import { TrainingDayPage } from "@/features/training/ui/components/training-day-page/training-day-page";
import {
  addTrainingActivityAction,
  controlTrainingActivityAction,
  deleteTrainingActivityAction,
  saveTrainingActivityExerciseAction,
  updateTrainingActivityAction,
} from "./training-actions";

type TrainingPageProps = Readonly<{
  searchParams: Promise<Readonly<{ date?: string | readonly string[] }>>;
}>;

export default async function TrainingPage({ searchParams }: TrainingPageProps) {
  const { date } = await searchParams;
  const dateResolution = resolveTrainingDayDate({ rawDate: date });

  if (dateResolution.status === "invalid") {
    return (
      <TrainingDayPage dateResolution={dateResolution}>
        <InvalidTrainingDate
          todayDate={dateResolution.todayDate}
          reason={dateResolution.reason}
          maximumFutureDate={dateResolution.maximumFutureDate}
        />
      </TrainingDayPage>
    );
  }

  if (dateResolution.requiresCanonicalRedirect) {
    redirect(`/treino?date=${encodeURIComponent(dateResolution.civilDate)}`);
  }

  const trainingDayResult = await queryFixedWorkspaceTrainingDayPage(dateResolution.civilDate);
  const actions = {
    addActivity: addTrainingActivityAction,
    updateActivity: updateTrainingActivityAction,
    controlActivity: controlTrainingActivityAction,
    saveActivityExercise: saveTrainingActivityExerciseAction,
    deleteActivity: deleteTrainingActivityAction,
  };
  const day = trainingDayResult.status === "ready" ? trainingDayResult.day : null;

  return (
    <TrainingDayPage
      dateResolution={dateResolution}
      controls={
        day ? (
          <TrainingActivityEditor
            civilDate={day.civilDate}
            availablePlan={"availablePlan" in day ? day.availablePlan : null}
            actions={actions}
          />
        ) : null
      }
      summary={
        day ? (
          <>
            <TrainingAgendaBadges day={day} />
            <TrainingActivityEditorNotice />
          </>
        ) : null
      }
    >
      <TrainingDayContent result={Promise.resolve(trainingDayResult)} actions={actions} />
    </TrainingDayPage>
  );
}
