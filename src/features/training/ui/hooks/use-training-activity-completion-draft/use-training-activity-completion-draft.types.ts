import type {
  CompletionMode,
  CompletionValues,
} from "../../lib/training-activity-completion-draft/training-activity-completion-draft";
export type CompletionDraftInput = Readonly<{
  key: string;
  revision: number;
  action: CompletionMode;
  initialValues: CompletionValues;
  executionSignature: string | null;
  completionRequestedAt: string | null;
}>;
export type CompletionDraftStatus =
  | "loading"
  | "clean"
  | "stored"
  | "restored"
  | "storage_error"
  | "external_change"
  | "stale"
  | "expired"
  | "invalid";
