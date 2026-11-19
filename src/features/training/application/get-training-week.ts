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
  const dates = Array.from({ length: dayCount }, (_, offset) => {
    const day = new Date(date);
    day.setUTCDate(day.getUTCDate() + offset);
    return toCivilDateString(day);
  });
  const days: TrainingDayDto[] = [];
  // Independent reads have separate transactions; bound concurrency to protect the DB pool.
  for (let offset = 0; offset < dates.length; offset += 4) {
    days.push(
      ...(await Promise.all(
        dates
          .slice(offset, offset + 4)
          .map((civilDate) =>
            getTrainingDay({ ...dependencies, resolveWorkspace: () => workspace }, { civilDate }),
          ),
      )),
    );
  }
  return Object.freeze({
    startDate: days[0]!.civilDate,
    endDate: days[days.length - 1]!.civilDate,
    days: Object.freeze(days),
  });
}
