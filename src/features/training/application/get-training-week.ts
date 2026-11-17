import { parseCivilDate, toCivilDateString } from "../domain/training-day.rules";
import type { GetTrainingDayDependencies, GetTrainingDayInput } from "./get-training-day.types";
import type { TrainingDayDto } from "./training-dto";
import { getTrainingDay } from "./get-training-day";

export async function getTrainingWeek(
  dependencies: GetTrainingDayDependencies,
  input: GetTrainingDayInput,
  dayCount = 7,
  alignWeek = true,
) {
  const startDate = parseCivilDate(input.civilDate);
  const selectedDate = new Date(`${startDate}T00:00:00.000Z`);
  const date = new Date(selectedDate);
  if (alignWeek && dayCount === 7) date.setUTCDate(date.getUTCDate() - date.getUTCDay());
  const workspace = await dependencies.resolveWorkspace();
  const days: TrainingDayDto[] = [];
  for (let offset = 0; offset < dayCount; offset++) {
    const civilDate = toCivilDateString(date);
    days.push(
      await getTrainingDay({ ...dependencies, resolveWorkspace: () => workspace }, { civilDate }),
    );
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return Object.freeze({
    startDate: days[0]!.civilDate,
    endDate: days[days.length - 1]!.civilDate,
    days: Object.freeze(days),
  });
}
