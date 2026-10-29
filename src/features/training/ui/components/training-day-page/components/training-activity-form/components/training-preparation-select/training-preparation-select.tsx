import { useTranslations } from "next-intl";
import { Field, FieldDescription, FieldLabel } from "@fradelli/ui/field";
import { trainingNativeSelectStyles } from "@/features/training/ui/training-native-select.styles";
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
  return (
    <Field className="grid min-w-0 gap-2">
      <FieldLabel htmlFor={id} className="fd-text-label text-foreground">
        {t("warmup")}
      </FieldLabel>
      <select
        id={id}
        name="preparationSessionId"
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby={`${id}-hint`}
        className={trainingNativeSelectStyles.control}
      >
        {!["keep", "automatic", "none"].includes(value) &&
        !sessions.some((session) => session.sessionId === value) ? (
          <option value={value} disabled>
            {t("warmupUnavailable")}
          </option>
        ) : null}
        {allowKeep ? (
          <option value="keep">
            {current ? t("keepNamedPreparation", { name: current }) : t("keepCurrent")}
          </option>
        ) : null}
        <option value="automatic">{t("automaticWarmup")}</option>
        <option value="none">{t("noWarmup")}</option>
        {sessions.map((session) => (
          <option key={session.sessionId} value={session.sessionId}>
            {session.name}
          </option>
        ))}
      </select>
      <FieldDescription id={`${id}-hint`} className="fd-text-interface text-muted-foreground">
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
