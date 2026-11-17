"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@fradelli/ui/dialog";
import { previousTrainingSet } from "@/features/training/domain/training-set-execution.rules";

import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import { Input } from "@fradelli/ui/input";
import { Checkbox } from "@fradelli/ui/checkbox";
import { Field, FieldLabel } from "@fradelli/ui/field";

import {
  isTrainingSetPerformed,
  requiredDirections,
} from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";
import type { TrainingSetDraft } from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.types";
import { trainingLocalExerciseEditorStyles } from "./training-local-exercise-editor.styles";
import type { TrainingLocalExerciseEditorProps } from "./training-local-exercise-editor.types";

export function TrainingLocalExerciseEditor({
  exercise,
  draft,
  onChange,
}: TrainingLocalExerciseEditorProps) {
  const t = useTranslations("training");
  const timer = draft.rest;
  const [adding, setAdding] = useState(false);
  const [kind, setKind] = useState<"work" | "warmup">("work");
  function updateSetMeasure(set: TrainingSetDraft, field: string, value: string) {
    const next = field.startsWith("direction:")
      ? { ...set, directionValues: { ...set.directionValues, [field.slice(10)]: value } }
      : { ...set, [field]: value };
    if (!isTrainingSetPerformed(next, exercise.dose, exercise.loadApplicable))
      next.confirmed = false;
    onChange?.({
      ...draft,
      rest: !next.confirmed && timer?.setNumber === set.setNumber ? undefined : timer,
      sets: draft.sets.map((x) => (x.setNumber === set.setNumber ? next : x)),
    });
  }
  function toggleSetConfirmation(set: TrainingSetDraft, timestamp: number) {
    const confirmed = !set.confirmed;
    const rest =
      confirmed && exercise.restSeconds
        ? { setNumber: set.setNumber, endsAt: timestamp + exercise.restSeconds * 1000 }
        : timer?.setNumber === set.setNumber
          ? undefined
          : timer;
    onChange?.({
      ...draft,
      rest,
      sets: draft.sets.map((x) => ({
        ...x,
        confirmed: x.setNumber === set.setNumber ? confirmed : (x.confirmed ?? false),
      })),
    });
  }
  function addSet(kind: "work" | "warmup") {
    const set: TrainingSetDraft = {
      setNumber: Math.max(0, ...draft.sets.map((x) => x.setNumber)) + 1,
      kind,
      confirmed: false,
      value: "",
      leftValue: "",
      rightValue: "",
      directionValues: {},
      loadKg: "",
    };
    onChange?.({
      ...draft,
      sets: [
        ...draft.sets.map((x) => ({
          ...x,
          confirmed: x.confirmed ?? false,
        })),
        set,
      ],
    });
  }
  const ordered = [...draft.sets].sort(
    (a, b) =>
      Number(b.kind === "warmup") - Number(a.kind === "warmup") || a.setNumber - b.setNumber,
  );
  let work = 0,
    warmup = 0;
  return (
    <fieldset disabled={!onChange} className="min-w-0 space-y-2 fd-text-interface">
      <div
        className={`${trainingLocalExerciseEditorStyles.columns} ${exercise.dose.scope === "each_side" ? trainingLocalExerciseEditorStyles.unilateral : trainingLocalExerciseEditorStyles.bilateral} text-xs text-muted-foreground`}
      >
        <span>{t("setHeading")}</span>
        <span>{t("setReference")}</span>
        <span>{t("load", { unit: exercise.loadUnit ?? "kg" })}</span>
        <span className={exercise.dose.scope === "each_side" ? "col-span-2" : undefined}>
          {exercise.dose.unit === "seconds"
            ? t("seconds")
            : exercise.dose.unit === "contacts"
              ? t("contacts")
              : t("repetitions")}
        </span>
        <span className="text-center">{t("confirmHeading")}</span>
      </div>
      {ordered.map((set) => {
        const warm = set.kind === "warmup";
        const ordinal = warm ? ++warmup : ++work;
        const fields =
          exercise.dose.scope === "total"
            ? [
                {
                  key: "value",
                  label:
                    exercise.dose.unit === "seconds"
                      ? t("seconds")
                      : exercise.dose.unit === "contacts"
                        ? t("contacts")
                        : t("repetitions"),
                  value: set.value,
                },
              ]
            : exercise.dose.scope === "each_side"
              ? [
                  { key: "leftValue", label: t("left"), value: set.leftValue },
                  { key: "rightValue", label: t("right"), value: set.rightValue },
                ]
              : requiredDirections(exercise.dose.scope).map((d) => ({
                  key: `direction:${d}`,
                  label: t(`directions.${d}`),
                  value: set.directionValues[d] ?? "",
                }));
        const reference = previousTrainingSet(
          exercise.history ?? [],
          warm ? "warmup" : "work",
          ordinal,
        );
        const previous = reference?.set;
        const performed = isTrainingSetPerformed(set, exercise.dose, exercise.loadApplicable);
        const checked = set.confirmed === true;
        return (
          <div
            key={set.setNumber}
            data-performed={performed}
            className={`${trainingLocalExerciseEditorStyles.columns} ${exercise.dose.scope === "each_side" ? trainingLocalExerciseEditorStyles.unilateral : trainingLocalExerciseEditorStyles.bilateral} items-center border-b border-border pb-2 `}
          >
            <span
              className={`flex size-6 items-center justify-center rounded-md bg-surface-interactive text-xs font-semibold ${warm ? "text-status-warning" : "text-foreground"}`}
              aria-label={
                warm ? t("warmupSet", { number: ordinal }) : t("setNumber", { number: ordinal })
              }
            >
              {warm ? "W" : ordinal}
            </span>
            <p
              className="text-xs text-muted-foreground break-words"
              aria-label={previous ? undefined : t("noReference")}
            >
              {previous?.status === "completed"
                ? `${previous.loadKg ?? "—"} ${exercise.loadApplicable ? exercise.loadUnit : ""} × ${
                    previous.leftValue !== null || previous.rightValue !== null
                      ? `${previous.leftValue ?? "—"}/${previous.rightValue ?? "—"}`
                      : exercise.dose.scope.includes("directions")
                        ? requiredDirections(exercise.dose.scope)
                            .map((direction) => previous.directionValues?.[direction] ?? "—")
                            .join("/")
                        : (previous.value ?? "—")
                  }`
                : "—"}
            </p>
            <Field>
              <FieldLabel
                className="sr-only"
                htmlFor={`${exercise.prescriptionId}-${set.setNumber}-load`}
              >
                {`${t("setNumber", { number: ordinal })} ${t("load", { unit: exercise.loadUnit ?? "kg" })}`}
              </FieldLabel>
              <Input
                id={`${exercise.prescriptionId}-${set.setNumber}-load`}
                type="number"
                min={0}
                step="0.001"
                inputMode="decimal"
                disabled={!exercise.loadApplicable}
                value={exercise.loadApplicable ? set.loadKg : ""}
                aria-describedby={`${exercise.prescriptionId}-title`}
                onChange={(event) => updateSetMeasure(set, "loadKg", event.currentTarget.value)}
                className={`min-w-0 text-center ${checked && exercise.loadApplicable ? "border-status-success-border" : ""}`}
              />
            </Field>
            <div
              className={
                exercise.dose.scope === "each_side"
                  ? "col-span-2 grid grid-cols-2 gap-2"
                  : "grid gap-1"
              }
            >
              {fields.map((field) => (
                <Field
                  key={field.key}
                  orientation={exercise.dose.scope === "each_side" ? "horizontal" : "vertical"}
                  className={
                    exercise.dose.scope === "each_side"
                      ? "flex-row flex-nowrap items-center gap-1"
                      : undefined
                  }
                >
                  <FieldLabel
                    htmlFor={`${exercise.prescriptionId}-${set.setNumber}-${field.key}`}
                    className={
                      fields.length > 1
                        ? "w-auto! flex-none! items-center gap-1 text-xs sm:text-sm"
                        : "sr-only"
                    }
                  >
                    <span className="sr-only">{t("setNumber", { number: ordinal })} </span>
                    {exercise.dose.scope === "each_side" ? (
                      <span className="sr-only">{field.label}</span>
                    ) : null}
                    {exercise.dose.scope === "each_side"
                      ? t(field.key === "leftValue" ? "leftShort" : "rightShort")
                      : field.label}
                  </FieldLabel>
                  <Input
                    id={`${exercise.prescriptionId}-${set.setNumber}-${field.key}`}
                    className={`min-w-0 text-center ${checked ? "border-status-success-border" : ""}`}
                    type="number"
                    min={0}
                    step="1"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(event) =>
                      updateSetMeasure(set, field.key, event.currentTarget.value)
                    }
                    aria-describedby={`${exercise.prescriptionId}-title`}
                  />
                </Field>
              ))}
            </div>
            <Checkbox
              checked={checked}
              aria-label={t("confirmSet", { number: ordinal })}
              disabled={
                !onChange || !isTrainingSetPerformed(set, exercise.dose, exercise.loadApplicable)
              }
              onCheckedChange={() => toggleSetConfirmation(set, Date.now())}
              className="justify-self-center data-checked:border-status-success-border data-checked:bg-status-success-subtle data-checked:text-status-success dark:data-checked:bg-status-success-subtle"
            />
          </div>
        );
      })}
      <Button
        type="button"
        tone="general"
        disabled={draft.sets.length >= 100}
        onClick={() => {
          setKind("work");
          setAdding(true);
        }}
      >
        {t("addSet")}
      </Button>
      <Dialog open={adding} onOpenChange={setAdding}>
        <DialogContent>
          <DialogTitle>{t("addSet")}</DialogTitle>
          <div className="flex gap-2">
            <Button
              variant={kind === "work" ? "default" : "outline"}
              onClick={() => setKind("work")}
            >
              {t("workSetType")}
            </Button>
            <Button
              variant={kind === "warmup" ? "default" : "outline"}
              onClick={() => setKind("warmup")}
            >
              {t("warmupSetType")}
            </Button>
          </div>
          <Button
            onClick={() => {
              addSet(kind);
              setAdding(false);
            }}
          >
            {t("addSet")}
          </Button>
        </DialogContent>
      </Dialog>
    </fieldset>
  );
}
