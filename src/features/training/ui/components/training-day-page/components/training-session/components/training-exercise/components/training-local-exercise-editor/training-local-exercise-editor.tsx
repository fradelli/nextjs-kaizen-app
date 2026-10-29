"use client";
import { useTranslations } from "next-intl";

import { ArrowLeftIcon } from "@fradelli/ui/icons/ArrowLeft";
import { ArrowRightIcon } from "@fradelli/ui/icons/ArrowRight";
import { XIcon } from "@fradelli/ui/icons/X";
import { ChatCircleIcon } from "@fradelli/ui/icons/ChatCircle";

import { Button } from "@fradelli/ui/button";
import { Input } from "@fradelli/ui/input";
import { useState } from "react";

import {
  isTrainingSetPerformed,
  requiredDirections,
} from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";
import type { TrainingSetDraft } from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.types";
import { trainingLocalExerciseEditorStyles as styles } from "./training-local-exercise-editor.styles";
import type { TrainingLocalExerciseEditorProps } from "./training-local-exercise-editor.types";

export function TrainingLocalExerciseEditor({
  exercise,
  draft,
  onChange,
}: TrainingLocalExerciseEditorProps) {
  const t = useTranslations("training");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [commentOpen, setCommentOpen] = useState(false);
  const currentSet = draft.sets[currentIndex];
  if (!currentSet) return null;

  function updateSet(field: keyof TrainingSetDraft | string, value: string) {
    const updated = draft.sets.map((set, index) => {
      if (index !== currentIndex) return set;
      if (field.startsWith("direction:")) {
        const direction = field.slice("direction:".length);
        return { ...set, directionValues: { ...set.directionValues, [direction]: value } };
      }
      return { ...set, [field]: value };
    });
    const next = updated[currentIndex];
    if (!next) return;
    if (
      isTrainingSetPerformed(currentSet, exercise.dose) &&
      !isTrainingSetPerformed(next, exercise.dose) &&
      updated.slice(currentIndex + 1).some((set) => isTrainingSetPerformed(set, exercise.dose))
    ) {
      if (!window.confirm(t("clearSetConfirmation"))) return;
      for (let index = currentIndex + 1; index < updated.length; index++) {
        const set = updated[index];
        if (set)
          updated[index] = {
            ...set,
            value: "",
            leftValue: "",
            rightValue: "",
            loadKg: "",
            directionValues: {},
          };
      }
    }
    onChange({ ...draft, sets: updated });
  }

  const nextEnabled =
    currentIndex < draft.sets.length - 1 && isTrainingSetPerformed(currentSet, exercise.dose);
  const fields: { key: string; label: string; value: string; className: string; step?: string }[] =
    [];
  if (exercise.dose.scope === "total")
    fields.push({
      key: "value",
      label:
        exercise.dose.unit === "seconds"
          ? t("seconds")
          : exercise.dose.unit === "contacts"
            ? t("contacts")
            : t("repetitions"),
      value: currentSet.value,
      className: styles.measureInput,
    });
  if (exercise.dose.scope === "each_side")
    fields.push(
      {
        key: "leftValue",
        label: t("left"),
        value: currentSet.leftValue,
        className: styles.measureInput,
      },
      {
        key: "rightValue",
        label: t("right"),
        value: currentSet.rightValue,
        className: styles.measureInput,
      },
    );
  for (const direction of requiredDirections(exercise.dose.scope)) {
    fields.push({
      key: `direction:${direction}`,
      label: t(`directions.${direction}`),
      value: currentSet.directionValues[direction] ?? "",
      className: styles.measureInput,
    });
  }
  if (exercise.loadApplicable)
    fields.push({
      key: "loadKg",
      label: t("load", { unit: exercise.loadUnit ?? "kg" }),
      value: currentSet.loadKg,
      className: styles.loadInput,
      step: "0.001",
    });

  return (
    <div className={styles.root}>
      <div className={styles.seriesHeader}>
        <strong className="shrink-0 whitespace-nowrap">
          {t("setNumber", { number: currentSet.setNumber })}
        </strong>
        <nav className={styles.navigation} aria-label={t("setNavigation")}>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={t("openPreviousSet")}
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
          >
            <ArrowLeftIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
          </Button>
          <span className={styles.counter} aria-live="polite">
            {t("setPosition", { current: currentIndex + 1, total: draft.sets.length })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11"
            aria-label={t("openNextSet")}
            disabled={!nextEnabled}
            onClick={() => setCurrentIndex(currentIndex + 1)}
          >
            <ArrowRightIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
          </Button>
        </nav>
      </div>
      <div className={styles.fields}>
        {fields.map((field) => (
          <div key={field.key} className={styles.field}>
            <label
              className={styles.label}
              htmlFor={`${exercise.prescriptionId}-${currentSet.setNumber}-${field.key}`}
            >
              {field.label}
            </label>
            <Input
              id={`${exercise.prescriptionId}-${currentSet.setNumber}-${field.key}`}
              type="number"
              min={0}
              step={field.step ?? "1"}
              inputMode="decimal"
              value={field.value}
              className={field.className}
              onChange={(event) => updateSet(field.key, event.currentTarget.value)}
            />
          </div>
        ))}
      </div>
      {commentOpen ? (
        <div className={styles.commentPanel}>
          <div className={styles.commentHeader}>
            <label htmlFor={`${exercise.prescriptionId}-local-comment`}>{t("comment")}</label>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label={t("closeComment")}
              onClick={() => setCommentOpen(false)}
            >
              <XIcon size={20} weight="regular" aria-hidden="true" focusable="false" />
            </Button>
          </div>
          <Input
            id={`${exercise.prescriptionId}-local-comment`}
            value={draft.comment}
            maxLength={1000}
            onChange={(event) => onChange({ ...draft, comment: event.currentTarget.value })}
          />
        </div>
      ) : null}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={styles.commentButton}
        aria-expanded={commentOpen}
        onClick={() => setCommentOpen(!commentOpen)}
      >
        <ChatCircleIcon size={20} weight="regular" aria-hidden="true" focusable="false" />{" "}
        {t("comment")}
      </Button>
    </div>
  );
}
