"use client";

import { Alert, AlertDescription, AlertTitle } from "@fradelli/ui/alert";
import { Input } from "@fradelli/ui/input";
import { Switch } from "@fradelli/ui/switch";

import styles from "./training-exercise.module.css";
import { trainingExerciseStyles } from "./training-exercise.styles";
import type { TrainingExerciseProps } from "./training-exercise.types";
import { TrainingExerciseForm } from "./components/training-exercise-form/training-exercise-form";
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
  const local = Boolean(executionDraft && onExecutionDraftChange);
  const completed = local
    ? executionDraft!.completed
    : exercise.status === "completed" || exercise.status === "skipped";
  const visualStatus = completed ? "completed" : "pending";
  return (
    <article
      className={`${trainingExerciseStyles.root} ${trainingExerciseStyles.status[visualStatus]}`}
      aria-labelledby={`${exercise.prescriptionId}-title`}
    >
      <header className={trainingExerciseStyles.header}>
        <div className={trainingExerciseStyles.heading}>
          <h3 id={`${exercise.prescriptionId}-title`} className={trainingExerciseStyles.title}>
            {formatTrainingDisplayText(exercise.name)}
          </h3>
          {exercise.blockLabel ? (
            <p className={trainingExerciseStyles.prescription}>{exercise.blockLabel}</p>
          ) : null}
        </div>
        {local ? (
          <Switch
            className="shrink-0"
            checked={completed}
            onClick={() => onExecutionDraftChange?.({ ...executionDraft!, completed: !completed })}
            aria-label={completed ? "Reabrir exercício para edição" : "Concluir exercício"}
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

      {!completed || !local ? (
        <dl className={trainingExerciseStyles.metadata}>
          <div>
            <dt className={trainingExerciseStyles.screenReaderOnly}>Séries prescritas</dt>
            <dd>{exercise.prescribedSets} séries</dd>
          </div>
          <div>
            <dt className={trainingExerciseStyles.screenReaderOnly}>Dose prescrita</dt>
            <dd>{formatTrainingDisplayText(exercise.prescribedText)}</dd>
          </div>
          {exercise.restSeconds === null ? null : (
            <div>
              <dt className={trainingExerciseStyles.screenReaderOnly}>Descanso</dt>
              <dd>Descanso: {exercise.restSeconds}s</dd>
            </div>
          )}
          {exercise.priorityLevel ? (
            <div>
              <dt className={trainingExerciseStyles.screenReaderOnly}>Prioridade</dt>
              <dd>
                <ExercisePriorityIndicator level={exercise.priorityLevel} />
              </dd>
            </div>
          ) : null}
        </dl>
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

      {!completed || !local ? (
        exercise.instructions.length ||
        exercise.cues.length ||
        exercise.risks ||
        exercise.notes ||
        (role === "preparation" && saveExerciseAction) ? (
          <details className={`${trainingExerciseStyles.disclosure} ${styles.disclosure}`}>
            <summary className={trainingExerciseStyles.disclosureSummary}>
              Ver dicas de execução
            </summary>
            <div className={trainingExerciseStyles.details}>
              {exercise.notes ? (
                <div>
                  <h4 className={trainingExerciseStyles.detailTitle}>Observação</h4>
                  <p className={trainingExerciseStyles.notes}>
                    {formatTrainingDisplayText(exercise.notes)}
                  </p>
                </div>
              ) : null}
              {exercise.instructions.length ? (
                <div>
                  <h4 className={trainingExerciseStyles.detailTitle}>Execução</h4>
                  <ul className={trainingExerciseStyles.list}>
                    {exercise.instructions.map((instruction) => (
                      <li key={instruction}>{instruction}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {exercise.cues.length ? (
                <div>
                  <h4 className={trainingExerciseStyles.detailTitle}>Pontos de atenção</h4>
                  <ul className={trainingExerciseStyles.list}>
                    {exercise.cues.map((cue) => (
                      <li key={cue}>{cue}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {exercise.risks ? (
                <Alert variant="warning" className={trainingExerciseStyles.alert}>
                  <AlertTitle className={trainingExerciseStyles.alertTitle}>
                    Alerta da definição
                  </AlertTitle>
                  <AlertDescription className={trainingExerciseStyles.alertDescription}>
                    {exercise.risks}
                  </AlertDescription>
                </Alert>
              ) : null}
              {local && role === "preparation" && executionDraft && onExecutionDraftChange ? (
                <div>
                  <label
                    htmlFor={`${exercise.prescriptionId}-warmup-comment`}
                    className={trainingExerciseStyles.detailTitle}
                  >
                    Comentário
                  </label>
                  <Input
                    id={`${exercise.prescriptionId}-warmup-comment`}
                    value={executionDraft.comment}
                    maxLength={1000}
                    onChange={(event) =>
                      onExecutionDraftChange({
                        ...executionDraft,
                        comment: event.currentTarget.value,
                      })
                    }
                  />
                </div>
              ) : role === "preparation" &&
                exercise.status !== "completed" &&
                saveExerciseAction &&
                civilDate &&
                activityId &&
                sessionId ? (
                <TrainingExerciseForm
                  civilDate={civilDate}
                  activityId={activityId}
                  sessionId={sessionId}
                  role={role}
                  exercise={exercise}
                  action={saveExerciseAction}
                />
              ) : null}
            </div>
          </details>
        ) : null
      ) : null}
      {exercise.comment && !saveExerciseAction ? (
        <p className={trainingExerciseStyles.notes}>Comentário: {exercise.comment}</p>
      ) : null}
    </article>
  );
}
