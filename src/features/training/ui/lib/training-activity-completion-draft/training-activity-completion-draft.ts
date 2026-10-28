import { z } from "zod";

export const completionValuesSchema = z.object({
  intensity: z.enum(["", "low", "moderate", "high"]),
  energy: z.enum(["", "tired", "normal", "energized"]),
  comment: z.string().max(1000),
});
export const completionDraftSchema = z.object({
  version: z.literal(1),
  revision: z.number().int().nonnegative(),
  action: z.enum(["complete", "record_completed", "update_feedback"]),
  values: completionValuesSchema,
  executionSignature: z.string().nullable(),
  completionRequestedAt: z.iso.datetime().nullable(),
  expiresAt: z.number().finite(),
  writerId: z.string(),
});
export type CompletionValues = z.infer<typeof completionValuesSchema>;
export type CompletionMode = z.infer<typeof completionDraftSchema>["action"];
export function completionDraftKey(action: CompletionMode, civilDate: string, activityId: string) {
  return `kaizen:training-completion-draft:v1:${action}:${civilDate}:${activityId}`;
}
export function readCompletionDraft(
  raw: string,
  revision: number,
  action: CompletionMode,
  now: number,
) {
  try {
    const parsed = completionDraftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { status: "invalid" as const };
    if (parsed.data.expiresAt <= now) return { status: "expired" as const, draft: parsed.data };
    if (parsed.data.revision !== revision || parsed.data.action !== action)
      return { status: "stale" as const, draft: parsed.data };
    return { status: "restored" as const, draft: parsed.data };
  } catch {
    return { status: "invalid" as const };
  }
}
