// Tipos e índices dos dados gerados por scripts/build-roadmap-view.mjs (window.ROADMAP_DATA).
// A página não calcula estados: ondas, pendências e prontidão chegam prontas do gerador.

export type Status = "PLANNED" | "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELLED";

export type Task = {
  id: string;
  title: string;
  epic: string;
  status: Status;
  dependsOn: string[];
  external: string[];
  path: string;
  markdown: string;
  wave: string;
  pending: string[];
  unblocks: string[];
  canStart: boolean;
  waiting: boolean;
};

export type Epic = {
  id: string;
  title: string;
  status: Status;
  result: string;
  path: string;
  markdown: string;
  counts: Record<Status, number>;
  total: number;
  progress: number;
};

export type RoadmapDocument = {
  path: string;
  title: string;
  tipo: string | null;
  area: string | null;
  folder: string;
  markdown: string;
};

export type RoadmapData = {
  active: { task: string | null; status: Status | null; nextAction: string | null; markdown: string };
  commit: string | null;
  counts: Record<Status, number>;
  documents: RoadmapDocument[];
  epics: Epic[];
  generatedAt: string;
  repositoryUrl: string;
  statusOrder: Status[];
  tasks: Task[];
};

declare global {
  interface Window {
    ROADMAP_DATA?: RoadmapData;
  }
}

export const STATUS_LABEL: Record<Status, string> = {
  PLANNED: "Planejada",
  READY: "Pronta",
  IN_PROGRESS: "Em andamento",
  BLOCKED: "Bloqueada",
  DONE: "Concluída",
  CANCELLED: "Cancelada",
};

export const FINAL_STATUSES = new Set<Status>(["DONE", "CANCELLED"]);

export function createIndex(data: RoadmapData) {
  return {
    tasksById: new Map(data.tasks.map((task) => [task.id, task])),
    tasksByPath: new Map(data.tasks.map((task) => [task.path, task])),
    epicsById: new Map(data.epics.map((epic) => [epic.id, epic])),
    epicsByPath: new Map(data.epics.map((epic) => [epic.path, epic])),
    documentsByPath: new Map(data.documents.map((document) => [document.path, document])),
  };
}

export type RoadmapIndex = ReturnType<typeof createIndex>;

export function countStatuses(tasks: Task[]): Record<Status, number> {
  const counts = { PLANNED: 0, READY: 0, IN_PROGRESS: 0, BLOCKED: 0, DONE: 0, CANCELLED: 0 };

  for (const task of tasks) {
    counts[task.status] += 1;
  }

  return counts;
}

export function wavesOf(tasks: Task[]): string[] {
  return [...new Set(tasks.map((task) => task.wave))].sort((a, b) => {
    if (a === "done") return 1;
    if (b === "done") return -1;
    return Number(a) - Number(b);
  });
}

export function waveLabel(wave: string) {
  return wave === "done" ? "Finalizadas" : `Onda ${wave}`;
}

export function percent(part: number, total: number) {
  return total ? `${Math.round((part / total) * 100)}%` : "—";
}

export function matchesTask(task: Task, query: string) {
  const normalized = query.trim().toLowerCase();
  return (
    !normalized ||
    task.id.toLowerCase().includes(normalized) ||
    task.title.toLowerCase().includes(normalized)
  );
}
