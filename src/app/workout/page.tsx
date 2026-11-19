import {
  mutateScheduleAction,
  loadTodoLists,
  loadTodos,
  loadCalendarTrainingDay,
} from "./schedule-actions";
import { CalendarRange } from "@/features/schedule/ui/components/calendar-range/calendar-range";
import { redirect } from "next/navigation";

import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { queryCalendarPage } from "@/features/schedule/data/query-calendar-page";
import { InvalidTrainingDate } from "@/features/training/ui/components/training-day-page/components/invalid-training-date/invalid-training-date";
import { TrainingDayPage } from "@/features/training/ui/components/training-day-page/training-day-page";
import {
  addTrainingActivityAction,
  controlTrainingActivityAction,
  deleteTrainingActivityAction,
  saveTrainingActivityExerciseAction,
  updateTrainingActivityAction,
} from "./training-actions";

type TrainingPageProps = Readonly<{
  searchParams: Promise<
    Readonly<{ date?: string | readonly string[]; view?: string; days?: string }>
  >;
}>;

export default async function TrainingPage({ searchParams }: TrainingPageProps) {
  const { date, view: rawView, days: rawDays } = await searchParams;
  const parsedDays = Number(rawDays ?? 7);
  const dayCount =
    Number.isInteger(parsedDays) && parsedDays >= 1 && parsedDays <= 14 ? parsedDays : 7;
  const view = rawView === "day" ? "day" : "week";
  const dateResolution = resolveTrainingDayDate({ rawDate: date });

  if (dateResolution.status === "invalid") {
    return (
      <TrainingDayPage dateResolution={dateResolution}>
        <InvalidTrainingDate todayDate={dateResolution.todayDate} reason={dateResolution.reason} />
      </TrainingDayPage>
    );
  }

  if (dateResolution.requiresCanonicalRedirect) {
    redirect(
      `/workout?date=${encodeURIComponent(dateResolution.civilDate)}&view=${view}${rawDays ? "&days=" + dayCount : ""}`,
    );
  }

  const snapshot = await queryCalendarPage(
    dateResolution.civilDate,
    view === "day" ? 1 : dayCount,
    rawDays === undefined,
  );
  const actions = {
    addActivity: addTrainingActivityAction,
    updateActivity: updateTrainingActivityAction,
    controlActivity: controlTrainingActivityAction,
    saveActivityExercise: saveTrainingActivityExerciseAction,
    deleteActivity: deleteTrainingActivityAction,
  };
  return (
    <CalendarRange
      {...snapshot}
      resolution={dateResolution}
      actions={actions}
      mutate={mutateScheduleAction}
      loadLists={loadTodoLists}
      loadTodos={loadTodos}
      loadTrainingDay={loadCalendarTrainingDay}
    />
  );
}
