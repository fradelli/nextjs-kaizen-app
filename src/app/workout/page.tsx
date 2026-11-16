import { TrainingActivityEditor } from "@/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor";
import { redirect } from "next/navigation";

import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { queryFixedWorkspaceTrainingWeekPage } from "@/features/training/data/training-queries";
import { InvalidTrainingDate } from "@/features/training/ui/components/training-day-page/components/invalid-training-date/invalid-training-date";
import { TrainingDayContent } from "@/features/training/ui/components/training-day-page/components/training-day-content/training-day-content";
import { TrainingWeekGrid } from "@/features/training/ui/components/training-week-grid/training-week-grid";
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
  searchParams: Promise<Readonly<{ date?: string | readonly string[]; view?: string; days?: string }>>;
}>;

export default async function TrainingPage({ searchParams }: TrainingPageProps) {
  const { date, view: rawView, days: rawDays } = await searchParams;
  const parsedDays = Number(rawDays ?? 7);
  const dayCount = Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 14 ? parsedDays : 7;
  const view = rawView === "day" ? "day" : "week";
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
    redirect(`/workout?date=${encodeURIComponent(dateResolution.civilDate)}&view=${view}`);
  }

  const trainingWeekResult = await queryFixedWorkspaceTrainingWeekPage(dateResolution.civilDate, dayCount);
  const actions = {
    addActivity: addTrainingActivityAction,
    updateActivity: updateTrainingActivityAction,
    controlActivity: controlTrainingActivityAction,
    saveActivityExercise: saveTrainingActivityExerciseAction,
    deleteActivity: deleteTrainingActivityAction,
  };
  const day =
    trainingWeekResult.status === "ready"
      ? (trainingWeekResult.week.days.find((item) => item.civilDate === dateResolution.civilDate) ??
        null)
      : null;

  return (
    <TrainingDayPage
      dateResolution={dateResolution}
      view={view}
      controls={day ? <TrainingActivityEditor shortcutOnly civilDate={day.civilDate} availablePlan={"availablePlan" in day ? day.availablePlan : null} actions={actions} /> : null}
      summary={
        day ? (
          <>
            <TrainingActivityEditorNotice />
          </>
        ) : null
      }
    >
      {trainingWeekResult.status === "ready" ? (
        <>
          {day?.state === "unavailable" && day.activities.length === 0 ? (
            <TrainingDayContent
              result={Promise.resolve({ status: "ready", day })}
              actions={actions}
            />
          ) : null}
          <TrainingWeekGrid
            key={trainingWeekResult.week.startDate}
            days={trainingWeekResult.week.days}
            selectedDate={dateResolution.civilDate}
            view={view}
            actions={actions}
          />
        </>
      ) : (
        <TrainingDayContent result={Promise.resolve(trainingWeekResult)} actions={actions} />
      )}
    </TrainingDayPage>
  );
}
