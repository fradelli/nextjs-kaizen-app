export function positionIntervals<T>(
  entries: readonly { item: T; id: string; start: number; end: number }[],
) {
  const sorted = [...entries].sort((a, b) => a.start - b.start || a.id.localeCompare(b.id));
  let group: ((typeof sorted)[number] & { lane: number })[] = [];
  let groupEnd = 0;
  let lanes: number[] = [];
  const result: ((typeof sorted)[number] & { lane: number; laneCount: number })[] = [];
  const finish = () =>
    result.push(...group.map((entry) => ({ ...entry, laneCount: lanes.length })));
  for (const entry of sorted) {
    if (entry.start >= groupEnd) {
      finish();
      group = [];
      lanes = [];
    }
    let lane = lanes.findIndex((end) => end <= entry.start);
    if (lane < 0) lane = lanes.length;
    lanes[lane] = entry.end;
    group.push({ ...entry, lane });
    groupEnd = group.length === 1 ? entry.end : Math.max(groupEnd, entry.end);
  }
  finish();
  return result;
}

export function clipToDay(date: string, start: string, end: string) {
  const midnight = new Date(date + "T00:00:00-03:00").getTime();
  return {
    start: Math.max(0, (new Date(start).getTime() - midnight) / 60000),
    end: Math.min(1440, (new Date(end).getTime() - midnight) / 60000),
  };
}
