import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@fradelli/ui/select";
import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@fradelli/ui/field";
import type { TrainingPreparationSelectProps } from "./training-preparation-select.types";

export function TrainingPreparationSelect({
  activity,
  availablePlan,
  value,
  onChange,
  disabled,
  allowKeep,
}: TrainingPreparationSelectProps) {
  const t = useTranslations("training");

  const sessions =
    availablePlan?.sessions.filter((session) => session.assignmentRole === "preparation") ?? [];
  const id = `activity-preparation-${activity?.id ?? "new"}`;
  const current = activity?.preparationSession?.name ?? activity?.preparations[0]?.name;
  const keepLabel = current ? t("keepNamedPreparation", { name: current }) : t("keepCurrent");
  const unavailable =
    !["keep", "automatic", "none"].includes(value) &&
    !sessions.some((session) => session.sessionId === value);
  const items = {
    ...(unavailable ? { [value]: t("warmupUnavailable") } : {}),
    ...(allowKeep ? { keep: keepLabel } : {}),
    automatic: t("automaticWarmup"),
    none: t("noWarmup"),
    ...Object.fromEntries(sessions.map((session) => [session.sessionId, session.name])),
  };
  return (
    <Field>
      <FieldLabel htmlFor={id}>{t("warmup")}</FieldLabel>
      <Select
        name="preparationSessionId"
        value={value}
        items={items}
        disabled={disabled}
        onValueChange={(next) => {
          if (next !== null) onChange(next);
        }}
      >
        <SelectTrigger id={id} aria-describedby={`${id}-hint`} className="w-full">
          <SelectValue />
        </SelectTrigger>
        <SelectContent alignItemWithTrigger={false}>
          {Object.entries(items).map(([option, label]) => (
            <SelectItem key={option} value={option} disabled={unavailable && option === value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FieldDescription id={`${id}-hint`}>
        {disabled
          ? t("preserveStartedWarmup")
          : value === "automatic"
            ? t("automaticWarmupDescription")
            : value === "none"
              ? t("saveWithoutWarmup")
              : t("optionalWarmupDescription")}
      </FieldDescription>
    </Field>
  );
}
