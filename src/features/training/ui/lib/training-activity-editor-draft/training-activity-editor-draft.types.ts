import type { TrainingActivityType } from "@/features/training/domain/training-day.types";

export type TrainingActivityEditorValues = Readonly<{
  type: TrainingActivityType;
  name: string;
  sport: string;
  sessionId: string;
  preparationChoice: string | null;
  targetCivilDate: string;
  plannedStartTime: string;
  manualEndTime: string;
  automaticEnd: boolean;
}>;

export type TrainingActivityEditorContext = Readonly<{
  scope: "public-fixed-workspace";
  mode: "new" | "edit";
  sourceCivilDate: string;
  activityId: string | null;
  baseRevision: number | null;
  baseFingerprint: string;
  planFingerprint: string;
}>;

export type TrainingActivityEditorDraft = Readonly<{
  version: 1;
  context: TrainingActivityEditorContext;
  values: TrainingActivityEditorValues;
  writerId: string;
  writeId: string;
  updatedAt: string;
  expiresAt: string;
}>;

export type TrainingActivityEditorDraftStatus =
  | "loading"
  | "clean"
  | "dirty"
  | "stored"
  | "restored"
  | "storage_error"
  | "stale"
  | "external_change"
  | "expired"
  | "invalid";

export type TrainingActivityEditorStorageResult =
  Readonly<{ status: "ok" }> | Readonly<{ status: "failed" }>;

export type TrainingActivityEditorReadResult =
  | Readonly<{ status: "missing" }>
  | Readonly<{ status: "restored"; draft: TrainingActivityEditorDraft }>
  | Readonly<{
      status: "stale";
      draft: TrainingActivityEditorDraft;
      reason: "context_changed" | "base_changed" | "plan_changed";
    }>
  | Readonly<{ status: "expired" }>
  | Readonly<{ status: "invalid" }>;
