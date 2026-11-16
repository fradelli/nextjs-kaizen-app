import { resolveTrainingDayDate } from "@/features/training/application/resolve-training-day-date";
import { queryFixedWorkspaceTrainingWeekPage } from "@/features/training/data/training-queries";

export async function GET(request: Request) {
  const rawDate = new URL(request.url).searchParams.get("date");
  const date = resolveTrainingDayDate({ rawDate: rawDate ?? "" });
  if (date.status !== "valid") return new Response(null, { status: 400 });
  const result = await queryFixedWorkspaceTrainingWeekPage(date.civilDate, 1);
  if (result.status !== "ready") return new Response(null, { status: 422 });
  return Response.json(result.week.days[0], { headers: { "Cache-Control": "private, no-store" } });
}
