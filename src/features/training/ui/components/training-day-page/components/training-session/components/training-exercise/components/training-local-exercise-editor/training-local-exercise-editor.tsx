"use client";
import { previousTrainingSet } from "@/features/training/domain/training-set-execution.rules";

import { useTranslations } from "next-intl";
import { Button } from "@fradelli/ui/button";
import { Input } from "@fradelli/ui/input";
import { CheckIcon } from "@fradelli/ui/icons/Check";

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
  function updateSetMeasure(set: TrainingSetDraft, field: string, value: string) {
    const next = field.startsWith("direction:")
      ? { ...set, directionValues: { ...set.directionValues, [field.slice(10)]: value } }
      : { ...set, [field]: value };
    if (!isTrainingSetPerformed(next, exercise.dose)) next.confirmed = false;
    onChange({
      ...draft,
      rest: !next.confirmed && timer?.setNumber === set.setNumber ? undefined : timer,
      sets: draft.sets.map((x) => (x.setNumber === set.setNumber ? next : x)),
    });
  }
  function toggleSetConfirmation(set: TrainingSetDraft, timestamp: number) {
    const confirmed = !(set.confirmed ?? isTrainingSetPerformed(set, exercise.dose));
    const rest =
      confirmed && exercise.restSeconds
        ? { setNumber: set.setNumber, endsAt: timestamp + exercise.restSeconds * 1000 }
        : timer?.setNumber === set.setNumber
          ? undefined
          : timer;
    onChange({
      ...draft,
      rest,
      sets: draft.sets.map((x) => ({
        ...x,
        confirmed:
          x.setNumber === set.setNumber
            ? confirmed
            : (x.confirmed ?? isTrainingSetPerformed(x, exercise.dose)),
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
    onChange({
      ...draft,
      sets: [
        ...draft.sets.map((x) => ({
          ...x,
          confirmed: x.confirmed ?? isTrainingSetPerformed(x, exercise.dose),
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
    <div className="space-y-2 kaizen-text-body">
      <div
        className={`${trainingLocalExerciseEditorStyles.columns} text-xs text-muted-foreground}`}
      >
        <span>{t("setHeading")}</span>
        <span>{t("setReference")}</span>
        <span>{t("load", { unit: exercise.loadUnit ?? "kg" })}</span>
        <span>
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
        const checked = set.confirmed ?? isTrainingSetPerformed(set, exercise.dose);
        return (
          <div
            key={set.setNumber}
            className={`${trainingLocalExerciseEditorStyles.columns} items-center border-b border-border pb-2}`}
          >
            <span
              className={warm ? "font-semibold text-status-warning" : "font-semibold"}
              aria-label={
                warm ? t("warmupSet", { number: ordinal }) : t("setNumber", { number: ordinal })
              }
            >
              {warm ? "W" : ordinal}
            </span>
            <p
              className="kaizen-text-caption text-muted-foreground break-words"
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
            <Input
              type="number"
              min={0}
              step="0.001"
              inputMode="decimal"
              disabled={!exercise.loadApplicable}
              value={exercise.loadApplicable ? set.loadKg : ""}
              aria-label={`${t("setNumber", { number: ordinal })} ${t("load", { unit: exercise.loadUnit ?? "kg" })}`}
              onChange={(event) => updateSetMeasure(set, "loadKg", event.currentTarget.value)}
              className="min-w-0 px-1 text-center"
            />
            <div className="grid gap-1">
              {fields.map((field) => (
                <label key={field.key} className="min-w-0 text-xs text-muted-foreground">
                  <span className={fields.length > 1 ? "text-xs" : "sr-only"}>{field.label}</span>
                  <Input
                    className="min-w-0 px-1 text-center"
                    type="number"
                    min={0}
                    step="1"
                    inputMode="decimal"
                    value={field.value}
                    onChange={(event) =>
                      updateSetMeasure(set, field.key, event.currentTarget.value)
                    }
                    aria-label={`${t("setNumber", { number: ordinal })} ${field.label}`}
                  />
                </label>
              ))}
            </div>
            <Button
              type="button"
              size="icon"
              variant={checked ? "default" : "outline"}
              className="min-h-11 min-w-11"
              aria-pressed={checked}
              aria-label={t("confirmSet", { number: ordinal })}
              disabled={!isTrainingSetPerformed(set, exercise.dose)}
              onClick={() => toggleSetConfirmation(set, Date.now())}
            >
              <CheckIcon size={16} aria-hidden="true" weight="bold" />
            </Button>
          </div>
        );
      })}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={draft.sets.length >= 100}
          onClick={() => addSet("work")}
        >
          {t("addWorkSet")}
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={draft.sets.length >= 100}
          onClick={() => addSet("warmup")}
        >
          {t("addWarmupSet")}
        </Button>
      </div>
    </div>
  );
}
