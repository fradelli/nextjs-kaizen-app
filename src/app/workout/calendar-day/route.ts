import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { queryTrainingCalendar } from "@/features/training/data/query-training-calendar";
import { queryScheduleDay } from "@/features/schedule/data/query-schedule-day";

export async function GET(request: Request) {
  const rawDate = new URL(request.url).searchParams.get("date");
  const date = resolveTrainingDayDate({ rawDate: rawDate ?? "" });
  if (date.status !== "valid") return new Response(null, { status: 400 });
  const result = await queryTrainingCalendar(date.civilDate, 1, false);
  const schedule = await queryScheduleDay(date.civilDate);
  return Response.json(
    { ...result.days[0], schedule },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
