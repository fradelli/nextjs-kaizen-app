import type {
  AvailablePublicTrainingPlanDto,
  TrainingActivityDto,
} from "@/features/training/application/training-dto";
import { activityEditorDraftSchema } from "./training-activity-editor-draft.schema";
import type {
  TrainingActivityEditorContext,
  TrainingActivityEditorDraft,
  TrainingActivityEditorReadResult,
  TrainingActivityEditorValues,
} from "./training-activity-editor-draft.types";

export const EDITOR_NOTICE_EVENT = "kaizen:training-activity-editor-notice";
export function announceEditorNotice(message: string) {
  window.dispatchEvent(new CustomEvent(EDITOR_NOTICE_EVENT, { detail: { message } }));
}
export function activityEditorDraftKey(
  c: Pick<TrainingActivityEditorContext, "mode" | "sourceCivilDate" | "activityId">,
): string {
  return `kaizen:training-activity-editor:v1:public-fixed-workspace:${c.mode === "new" ? `new:${c.sourceCivilDate}` : `edit:${c.activityId}`}`;
}
export function initialActivityEditorValues(
  civilDate: string,
  activity: TrainingActivityDto | undefined,
  plan: AvailablePublicTrainingPlanDto | null,
): TrainingActivityEditorValues {
  return {
    type: activity?.type ?? "sport_practice",
    name: activity?.name ?? "",
    sport: activity?.sport ?? "",
    sessionId:
      activity?.structured?.main.sessionId ??
      plan?.sessions.find((s) => s.assignmentRole === "main")?.sessionId ??
      "",
    preparationChoice: activity ? "keep" : null,
    targetCivilDate: civilDate,
    plannedStartTime: activity?.plannedStartTime ?? "",
    manualEndTime: activity?.plannedEndTime ?? "",
    automaticEnd: !activity,
  };
}
export function activityEditorContext(
  civilDate: string,
  a: TrainingActivityDto | undefined,
  p: AvailablePublicTrainingPlanDto | null,
): TrainingActivityEditorContext {
  return {
    scope: "public-fixed-workspace",
    mode: a ? "edit" : "new",
    sourceCivilDate: civilDate,
    activityId: a?.id ?? null,
    baseRevision: a?.revision ?? null,
    baseFingerprint: JSON.stringify(
      a
        ? [
            a.id,
            civilDate,
            a.revision,
            a.type,
            a.name,
            a.sport,
            a.plannedStartTime,
            a.plannedEndTime,
            a.status,
            a.startedAt,
            a.completedAt,
            a.structured?.main.sessionId,
            a.structured?.preparation?.sessionId ?? a.preparationSession?.sessionId,
            [...a.preparations]
              .sort((x, y) => x.id.localeCompare(y.id))
              .map((x) => [x.id, x.revision, x.status, x.startedAt, x.completedAt]),
          ]
        : [civilDate],
    ),
    planFingerprint: p
      ? JSON.stringify([
          p.planId,
          p.version,
          [...p.sessions]
            .sort((x, y) => x.sessionId.localeCompare(y.sessionId))
            .map((s) => [s.sessionId, s.assignmentRole, s.targetDurationMinutes]),
          [...(p.preparationSuggestions ?? [])].sort((x, y) =>
            `${x.sport}:${x.sessionId}`.localeCompare(`${y.sport}:${y.sessionId}`),
          ),
        ])
      : "unavailable",
  };
}
export function sameActivityEditorValues(
  a: TrainingActivityEditorValues,
  b: TrainingActivityEditorValues,
): boolean {
  return (
    a.type === b.type &&
    a.name === b.name &&
    a.sport === b.sport &&
    a.sessionId === b.sessionId &&
    a.preparationChoice === b.preparationChoice &&
    a.targetCivilDate === b.targetCivilDate &&
    a.plannedStartTime === b.plannedStartTime &&
    a.manualEndTime === b.manualEndTime &&
    a.automaticEnd === b.automaticEnd
  );
}
export function parseActivityEditorDraft(
  raw: string | null,
  context: TrainingActivityEditorContext,
  now = new Date(),
): TrainingActivityEditorReadResult {
  if (raw === null) return { status: "missing" };
  try {
    if (new TextEncoder().encode(raw).length > 32768) return { status: "invalid" };
    const parsed = activityEditorDraftSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return { status: "invalid" };
    const draft = parsed.data;
    if (Date.parse(draft.expiresAt) <= now.getTime()) return { status: "expired" };
    const c = draft.context;
    if (
      c.scope !== context.scope ||
      c.mode !== context.mode ||
      c.activityId !== context.activityId ||
      c.sourceCivilDate !== context.sourceCivilDate
    )
      return { status: "stale", draft, reason: "context_changed" };
    if (c.baseRevision !== context.baseRevision || c.baseFingerprint !== context.baseFingerprint)
      return { status: "stale", draft, reason: "base_changed" };
    if (c.planFingerprint !== context.planFingerprint)
      return { status: "stale", draft, reason: "plan_changed" };
    return { status: "restored", draft };
  } catch {
    return { status: "invalid" };
  }
}
export function createActivityEditorDraft(
  context: TrainingActivityEditorContext,
  values: TrainingActivityEditorValues,
  writerId: string,
  now = new Date(),
): TrainingActivityEditorDraft {
  return {
    version: 1,
    context,
    values,
    writerId,
    writeId: crypto.randomUUID(),
    updatedAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + 7 * 86400000).toISOString(),
  };
}
export function removeActivityEditorDraft(activityId: string): boolean {
  try {
    window.localStorage.removeItem(
      activityEditorDraftKey({ mode: "edit", activityId, sourceCivilDate: "" }),
    );
    return true;
  } catch {
    return false;
  }
}
