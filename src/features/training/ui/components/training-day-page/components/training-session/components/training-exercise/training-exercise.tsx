"use client";
import { useState, useRef } from "react";
import { Input } from "@fradelli/ui/input";
import { Button } from "@fradelli/ui/button";
import { TrainingActivityModal } from "../../../training-activity-modal/training-activity-modal";
import {
  isTrainingSetPerformed,
  createTrainingSetDrafts,
  hasTrainingSetData,
} from "@/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils";
import { useTranslations } from "next-intl";

import { Alert, AlertDescription, AlertTitle } from "@fradelli/ui/alert";
import { Switch } from "@fradelli/ui/switch";

import { trainingExerciseStyles } from "./training-exercise.styles";
import type { TrainingExerciseProps } from "./training-exercise.types";
import { formatTrainingDisplayText } from "./training-exercise.utils";
import { TrainingWarmupToggle } from "../../../training-warmup-toggle/training-warmup-toggle";
import { ExercisePriorityIndicator } from "./components/exercise-priority-indicator/exercise-priority-indicator";
import { TrainingCompletedExerciseCorrection } from "./components/training-completed-exercise-correction/training-completed-exercise-correction";
import { TrainingLocalExerciseEditor } from "./components/training-local-exercise-editor/training-local-exercise-editor";

export function TrainingExercise({
  exercise,
  sessionId,
  role,
  civilDate,
  activityId,
  saveExerciseAction,
  executionDraft,
  onExecutionDraftChange,
}: TrainingExerciseProps) {
  const t = useTranslations("training");

  const [commentOpen, setCommentOpen] = useState(false);
  const [comment, setComment] = useState("");
  const commentTrigger = useRef<HTMLButtonElement>(null);
  const [tipsOpen, setTipsOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const tipsTrigger = useRef<HTMLButtonElement>(null);
  const historyTrigger = useRef<HTMLButtonElement>(null);
  const local = Boolean(executionDraft && onExecutionDraftChange);
  const completed = local
    ? executionDraft!.completed
    : exercise.status === "completed" || exercise.status === "skipped";
  const sets = executionDraft?.sets ?? createTrainingSetDrafts(exercise);
  const performed = sets.filter(
    (set) =>
      (set.confirmed ?? isTrainingSetPerformed(set, exercise.dose)) &&
      isTrainingSetPerformed(set, exercise.dose),
  ).length;
  const visualStatus = !completed
    ? "pending"
    : role !== "main"
      ? "completed"
      : performed === sets.length && sets.length > 0
        ? "completed"
        : performed > 0 || sets.some(hasTrainingSetData)
          ? "partial"
          : "empty";
  const stateLabel =
    visualStatus === "pending"
      ? "exerciseOpen"
      : visualStatus === "completed"
        ? "exerciseComplete"
        : visualStatus === "partial"
          ? "exercisePartial"
          : "exerciseEmpty";
  return (
    <article
      className={`${trainingExerciseStyles.root}`}
      aria-labelledby={`${exercise.prescriptionId}-title`}
    >
      <header
        className={`${trainingExerciseStyles.header} border-l-4 pl-3 ${trainingExerciseStyles.status[visualStatus]}`}
      >
        <div className={trainingExerciseStyles.heading}>
          <h3 id={`${exercise.prescriptionId}-title`} className={trainingExerciseStyles.title}>
            {formatTrainingDisplayText(exercise.name)}
          </h3>

          <dl className={trainingExerciseStyles.metadata}>
            <div>
              <dt className={trainingExerciseStyles.screenReaderOnly}>{t("prescribedSets")}</dt>
              <dd>{t("setCount", { count: exercise.prescribedSets })}</dd>
            </div>
            <div>
              <dt className={trainingExerciseStyles.screenReaderOnly}>{t("prescribedDose")}</dt>
              <dd>{formatTrainingDisplayText(exercise.prescribedText)}</dd>
            </div>
            {exercise.restSeconds === null ? null : (
              <div>
                <dt className={trainingExerciseStyles.screenReaderOnly}>{t("rest")}</dt>
                <dd>{t("restSeconds", { seconds: exercise.restSeconds })}</dd>
              </div>
            )}
            {exercise.priorityLevel ? (
              <div>
                <dt className={trainingExerciseStyles.screenReaderOnly}>{t("priority")}</dt>
                <dd>
                  <ExercisePriorityIndicator level={exercise.priorityLevel} />
                </dd>
              </div>
            ) : null}
          </dl>

          <p className="kaizen-text-caption text-muted-foreground">
            {t(stateLabel)}
            {role === "main" ? ` · ${performed}/${sets.length}` : ""}
          </p>
          {exercise.blockLabel ? (
            <p className={trainingExerciseStyles.prescription}>
              {exercise.block?.mode === "alternating"
                ? t("block", {
                    ordinal: exercise.block.ordinal,
                    position: exercise.block.position === 1 ? "A" : "B",
                  })
                : exercise.blockLabel}
            </p>
          ) : null}
        </div>
        {local ? (
          <Switch
            className="shrink-0"
            checked={completed}
            onClick={() => onExecutionDraftChange?.({ ...executionDraft!, completed: !completed })}
            aria-label={completed ? t("reopenExercise") : t("completeExercise")}
          />
        ) : role === "preparation" && saveExerciseAction && civilDate && activityId && sessionId ? (
          <TrainingWarmupToggle
            civilDate={civilDate}
            activityId={activityId}
            sessionId={sessionId}
            exercise={exercise}
            action={saveExerciseAction}
          />
        ) : null}
      </header>

      {!completed ? (
        <div className="flex flex-wrap gap-2 kaizen-text-caption">
          <Button
            ref={tipsTrigger}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setTipsOpen(true)}
          >
            {t("executionTips")}
          </Button>
          <Button
            ref={historyTrigger}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setHistoryOpen(true)}
          >
            {t("exerciseHistory")}
          </Button>
          {local ? (
            <Button
              ref={commentTrigger}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setComment(executionDraft?.comment ?? "");
                setCommentOpen(true);
              }}
            >
              {t("comment")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {commentOpen ? (
        <TrainingActivityModal
          busy={false}
          title={t("comment")}
          restoreFocusRef={commentTrigger}
          onRequestClose={() => setCommentOpen(false)}
          footer={
            <Button
              onClick={() => {
                if (executionDraft) onExecutionDraftChange?.({ ...executionDraft, comment });
                setCommentOpen(false);
              }}
            >
              {t("save")}
            </Button>
          }
        >
          <Input
            aria-label={t("comment")}
            value={comment}
            maxLength={1000}
            onChange={(event) => setComment(event.currentTarget.value)}
          />
        </TrainingActivityModal>
      ) : null}
      {tipsOpen ? (
        <TrainingActivityModal
          footer={null}
          busy={false}
          title={t("executionTips")}
          restoreFocusRef={tipsTrigger}
          onRequestClose={() => setTipsOpen(false)}
        >
          <div className="space-y-3">
            {exercise.notes ? <p>{exercise.notes}</p> : null}
            {exercise.instructions.map((text, index) => (
              <p key={`instruction-${index}`}>{text}</p>
            ))}
            {exercise.cues.map((text, index) => (
              <p key={`cue-${index}`}>{text}</p>
            ))}
            {exercise.risks ? (
              <Alert variant="warning">
                <AlertTitle>{t("executionTips")}</AlertTitle>
                <AlertDescription>{exercise.risks}</AlertDescription>
              </Alert>
            ) : null}
          </div>
        </TrainingActivityModal>
      ) : null}
      {historyOpen ? (
        <TrainingActivityModal
          footer={null}
          busy={false}
          title={t("exerciseHistory")}
          restoreFocusRef={historyTrigger}
          onRequestClose={() => setHistoryOpen(false)}
        >
          <div className="space-y-4">
            {exercise.history?.length ? (
              exercise.history.map((item, index) => (
                <section key={`${item.date}-${index}`}>
                  <h4>{item.date}</h4>
                  {item.sets.map((set) => (
                    <p key={set.setNumber}>
                      {set.kind === "warmup" ? "W" : set.setNumber} · {set.loadKg ?? "—"}{" "}
                      {exercise.loadApplicable ? exercise.loadUnit : ""} ·{" "}
                      {set.leftValue !== null || set.rightValue !== null
                        ? `${set.leftValue ?? "—"}/${set.rightValue ?? "—"}`
                        : (set.value ?? "—")}{" "}
                      · {set.status === "completed" ? t("exerciseComplete") : t("exercisePartial")}
                    </p>
                  ))}
                </section>
              ))
            ) : (
              <p>{t("noReference")}</p>
            )}
          </div>
        </TrainingActivityModal>
      ) : null}

      {local && !completed && role === "main" && executionDraft && onExecutionDraftChange ? (
        <TrainingLocalExerciseEditor
          exercise={exercise}
          draft={executionDraft}
          onChange={onExecutionDraftChange}
        />
      ) : !local &&
        role === "main" &&
        saveExerciseAction &&
        civilDate &&
        activityId &&
        sessionId ? (
        <TrainingCompletedExerciseCorrection
          key={exercise.revision ?? "new"}
          civilDate={civilDate}
          activityId={activityId}
          sessionId={sessionId}
          exercise={exercise}
          action={saveExerciseAction}
        />
      ) : null}

      {exercise.comment && !saveExerciseAction ? (
        <p className={trainingExerciseStyles.notes}>
          {t("commentText", { comment: exercise.comment })}
        </p>
      ) : null}
    </article>
  );
}
