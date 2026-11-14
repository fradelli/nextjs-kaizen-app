"use client";
import { NativeSelect, NativeSelectOption } from "@fradelli/ui/native-select";
import { useTranslations } from "next-intl";

import { Field, FieldLabel } from "@fradelli/ui/field";
import { Input } from "@fradelli/ui/input";
import type { CompletionValues } from "@/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft";
import { trainingActivityCompletionFormStyles as styles } from "./training-activity-completion-form.styles";
import type { TrainingActivityCompletionFormProps } from "./training-activity-completion-form.types";

export function TrainingActivityCompletionForm({
  id,
  mobility,
  disabled,
  values,
  onChange,
}: TrainingActivityCompletionFormProps) {
  const t = useTranslations("training");

  return (
    <fieldset disabled={disabled} className={styles.root}>
      <legend className="sr-only">{t("activityFeedback")}</legend>
      {!mobility ? (
        <>
          <Field>
            <FieldLabel htmlFor={`${id}-intensity`}>{t("intensity")}</FieldLabel>
            <NativeSelect
              id={`${id}-intensity`}
              name="intensity"
              required
              value={values.intensity}
              className="w-full"
              onChange={(event) =>
                onChange({
                  ...values,
                  intensity: event.currentTarget.value as CompletionValues["intensity"],
                })
              }
            >
              <NativeSelectOption value="">{t("select")}</NativeSelectOption>
              <NativeSelectOption value="low">{t("low")}</NativeSelectOption>
              <NativeSelectOption value="moderate">{t("moderate")}</NativeSelectOption>
              <NativeSelectOption value="high">{t("high")}</NativeSelectOption>
            </NativeSelect>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-energy`}>{t("energy")}</FieldLabel>
            <NativeSelect
              id={`${id}-energy`}
              name="energy"
              required
              value={values.energy}
              className="w-full"
              onChange={(event) =>
                onChange({
                  ...values,
                  energy: event.currentTarget.value as CompletionValues["energy"],
                })
              }
            >
              <NativeSelectOption value="">{t("select")}</NativeSelectOption>
              <NativeSelectOption value="tired">{t("tired")}</NativeSelectOption>
              <NativeSelectOption value="normal">{t("normal")}</NativeSelectOption>
              <NativeSelectOption value="energized">{t("energized")}</NativeSelectOption>
            </NativeSelect>
          </Field>
        </>
      ) : (
        <>
          <input type="hidden" name="intensity" value="" />
          <input type="hidden" name="energy" value="" />
        </>
      )}
      <Field className="sm:col-span-2">
        <FieldLabel htmlFor={`${id}-comment`}>{t("comment")}</FieldLabel>
        <Input
          id={`${id}-comment`}
          name="comment"
          maxLength={1000}
          value={values.comment}
          onChange={(event) => onChange({ ...values, comment: event.currentTarget.value })}
        />
      </Field>
    </fieldset>
  );
}
