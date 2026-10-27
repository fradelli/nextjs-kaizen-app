import { z } from "zod";
const id = z.string().max(200);
const civilDate = z.iso.date();
const clock = z.union([z.literal(""), z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)]);
export const activityEditorValuesSchema = z
  .object({
    type: z.enum(["structured_training", "sport_practice", "specific_training", "mobility"]),
    name: z.string().max(120),
    sport: z.string().max(80),
    sessionId: id,
    preparationChoice: id.nullable(),
    targetCivilDate: z.union([z.literal(""), civilDate]),
    plannedStartTime: clock,
    manualEndTime: clock,
    automaticEnd: z.boolean(),
  })
  .strict();
export const activityEditorDraftSchema = z
  .object({
    version: z.literal(1),
    context: z
      .object({
        scope: z.literal("public-fixed-workspace"),
        mode: z.enum(["new", "edit"]),
        sourceCivilDate: civilDate,
        activityId: id.min(1).nullable(),
        baseRevision: z.number().int().nonnegative().nullable(),
        baseFingerprint: z.string().max(8192),
        planFingerprint: z.string().max(8192),
      })
      .strict(),
    values: activityEditorValuesSchema,
    writerId: z.uuid(),
    writeId: z.uuid(),
    updatedAt: z.iso.datetime(),
    expiresAt: z.iso.datetime(),
  })
  .strict()
  .refine(
    ({ context: c, values: v, updatedAt, expiresAt }) =>
      (c.mode === "new"
        ? c.activityId === null && c.baseRevision === null && v.preparationChoice !== "keep"
        : c.activityId !== null && c.baseRevision !== null) &&
      Date.parse(updatedAt) <= Date.parse(expiresAt),
  );
