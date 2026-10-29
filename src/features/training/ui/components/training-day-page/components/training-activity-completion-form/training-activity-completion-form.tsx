"use client";
import { useTranslations } from "next-intl";

import { Field, FieldLabel } from "@fradelli/ui/field";
import { Input } from "@fradelli/ui/input";
import { trainingNativeSelectStyles } from "@/features/training/ui/training-native-select.styles";
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
            <select
              id={`${id}-intensity`}
              name="intensity"
              required
              value={values.intensity}
              className={trainingNativeSelectStyles.control}
              onChange={(event) =>
                onChange({
                  ...values,
                  intensity: event.currentTarget.value as CompletionValues["intensity"],
                })
              }
            >
              <option value="">{t("select")}</option>
              <option value="low">{t("low")}</option>
              <option value="moderate">{t("moderate")}</option>
              <option value="high">{t("high")}</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-energy`}>{t("energy")}</FieldLabel>
            <select
              id={`${id}-energy`}
              name="energy"
              required
              value={values.energy}
              className={trainingNativeSelectStyles.control}
              onChange={(event) =>
                onChange({
                  ...values,
                  energy: event.currentTarget.value as CompletionValues["energy"],
                })
              }
            >
              <option value="">{t("select")}</option>
              <option value="tired">{t("tired")}</option>
              <option value="normal">{t("normal")}</option>
              <option value="energized">{t("energized")}</option>
            </select>
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
