export type TodoListPage = {
  items: {
    id: string;
    name: string;
    colorKey: string | null;
    revision: number;
    systemKey?: string | null;
    incompleteCount?: number;
  }[];
  nextCursor: string | null;
};

export type TodoPage = {
  items: {
    id: string;
    listId: string;
    title: string;
    revision: number;
    estimatedMinutes: number | null;
    completedAt: string | null;
  }[];
  nextCursor: string | null;
};
