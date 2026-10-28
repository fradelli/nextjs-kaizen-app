"use client";
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
  return (
    <fieldset disabled={disabled} className={styles.root}>
      <legend className="sr-only">Avaliação da atividade</legend>
      {!mobility ? (
        <>
          <Field>
            <FieldLabel htmlFor={`${id}-intensity`}>Intensidade</FieldLabel>
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
              <option value="">Selecione</option>
              <option value="low">Leve</option>
              <option value="moderate">Moderada</option>
              <option value="high">Alta</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor={`${id}-energy`}>Disposição durante a atividade</FieldLabel>
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
              <option value="">Selecione</option>
              <option value="tired">Cansado</option>
              <option value="normal">Normal</option>
              <option value="energized">Disposto</option>
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
        <FieldLabel htmlFor={`${id}-comment`}>Comentário</FieldLabel>
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
