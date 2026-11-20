export type ScheduleRange = {
  activities: {
    id: string;
    revision: number;
    title: string;
    startsAt: string | null;
    endsAt: string | null;
    scheduledDate: string | null;
    parentActivityId: string | null;
    colorKey: string | null;
    tagId: string | null;
    linkedCount: number;
  }[];
  reservations: {
    id: string;
    revision: number;
    todoId: string;
    todoRevision: number;
    title: string;
    completed: boolean;
    startsAt: string;
    endsAt: string;
    parentActivityId: string | null;
    parentTitle: string | null;
    parentStartsAt: string | null;
    parentEndsAt: string | null;
    colorKey: string | null;
  }[];
};
