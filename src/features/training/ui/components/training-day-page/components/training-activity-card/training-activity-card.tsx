"use client";
import { TrainingRestTimer } from "../training-rest-timer/training-rest-timer";

import { useTranslations } from "next-intl";

import { CaretUpIcon } from "@fradelli/ui/icons/CaretUp";
import { CaretDownIcon } from "@fradelli/ui/icons/CaretDown";

import { Badge } from "@fradelli/ui/badge";
import { Button } from "@fradelli/ui/button";
import { useState } from "react";
import {
  isTrainingAgendaDateEditable,
  isTrainingExecutionDateEditable,
} from "@/features/training/domain/training-edit-window";
import { supportsRetrospectiveTrainingRecord } from "@/features/training/domain/training-retrospective-record.rules";

import { useTrainingActivityDraft } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft";
import { trainingExerciseDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import { TrainingExercise } from "../training-session/components/training-exercise/training-exercise";
import { TrainingActivityControls } from "../training-activity-controls/training-activity-controls";
import { TrainingActivityDeleteForm } from "../training-activity-delete-form/training-activity-delete-form";
import { TrainingActivityEditor } from "../training-activity-editor/training-activity-editor";
import { TrainingActivityTimer } from "../training-activity-timer/training-activity-timer";
import { trainingActivityCardStyles } from "./training-activity-card.styles";
import type { TrainingActivityCardProps } from "./training-activity-card.types";

const statusLabels = {
  scheduled: "notStarted",
  in_progress: "inProgress",
  paused: "paused",
  completed: "completed",
  skipped: "skipped",
} as const;

export function TrainingActivityCard({
  civilDate,
  activity,
  actions,
  availablePlan = null,
}: TrainingActivityCardProps) {
  const t = useTranslations("training");

  const execution = useTrainingActivityDraft({ activity, civilDate });
  const retrospective = supportsRetrospectiveTrainingRecord(activity.type) && !activity.startedAt;
  const agendaEditable = isTrainingAgendaDateEditable(civilDate);
  const executionEditable = isTrainingExecutionDateEditable(civilDate);
  const activeDraft =
    retrospective || activity.status === "completed" || activity.status === "skipped"
      ? null
      : execution.draft;
  const status = activeDraft?.status ?? activity.status;
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);
  const expanded =
    expandedOverride ?? (status === "in_progress" || (Boolean(activeDraft) && status === "paused"));
  const genericPreparation = activity.preparations[0] ?? null;
  const hasPreparation = Boolean(
    activity.structured?.preparation || activity.preparationSession || genericPreparation,
  );
  const [phase, setPhase] = useState<"preparation" | "main">(
    hasPreparation && !retrospective ? "preparation" : "main",
  );
  const structured = activity.structured;
  const activeSession =
    phase === "preparation"
      ? (structured?.preparation ?? activity.preparationSession)
      : structured?.main;
  const rootState =
    status === "completed"
      ? trainingActivityCardStyles.completed
      : status === "paused"
        ? trainingActivityCardStyles.paused
        : "";

  function startActivity() {
    if (!execution.start()) return;
    setPhase(hasPreparation ? "preparation" : "main");
    setExpandedOverride(null);
  }

  const resting = Object.entries(activeDraft?.exercises ?? {}).find(([, item]) => item.rest);
  return (
    <article className={`${trainingActivityCardStyles.root} ${rootState}`}>
      <header className={trainingActivityCardStyles.header}>
        <div className={trainingActivityCardStyles.top}>
          <div className="min-w-0 flex-1">
            <h2 className={trainingActivityCardStyles.title}>
              <Button
                type="button"
                variant="ghost"
                className={trainingActivityCardStyles.headingToggle}
                aria-expanded={expanded}
                onClick={() => setExpandedOverride(!expanded)}
              >
                <span className="fd-text-card">{activity.name}</span>
                {expanded ? (
                  <CaretUpIcon size={16} weight="fill" aria-hidden="true" focusable="false" />
                ) : (
                  <CaretDownIcon size={16} weight="fill" aria-hidden="true" focusable="false" />
                )}
              </Button>
            </h2>
            <p className={trainingActivityCardStyles.metadata}>
              {activitySummary(activity, status, t)}
            </p>
          </div>
          <div className={trainingActivityCardStyles.tools}>
            <TrainingActivityControls
              civilDate={civilDate}
              activity={activity}
              action={actions.controlActivity}
              draft={activeDraft}
              onStart={startActivity}
              onPause={execution.pause}
              onResume={execution.resume}
              onPrepareCompletion={execution.prepareCompletion}
              executionStorageError={execution.storageError}
              onFinalized={execution.clear}
              ready={execution.ready && executionEditable}
            />
            {status !== "completed" && agendaEditable ? (
              <TrainingActivityEditor
                civilDate={civilDate}
                activity={activity}
                availablePlan={availablePlan}
                actions={actions}
                startedLocally={Boolean(activeDraft)}
              />
            ) : null}
            {status !== "completed" && agendaEditable ? (
              <TrainingActivityDeleteForm
                civilDate={civilDate}
                activity={activity}
                action={actions.deleteActivity}
                compact
                startedLocally={Boolean(activeDraft)}
                onDeleted={execution.clear}
              />
            ) : null}
          </div>
        </div>
        {!retrospective && status !== "scheduled" ? (
          <TrainingActivityTimer activity={activity} draft={activeDraft} />
        ) : null}
      </header>

      {!retrospective && execution.storageError ? (
        <p role="alert" className={trainingActivityCardStyles.guidance}>
          {t("storageFull")}
        </p>
      ) : null}
      {execution.ready &&
      !activeDraft &&
      (activity.status === "in_progress" || activity.status === "paused") ? (
        <p role="alert" className={trainingActivityCardStyles.guidance}>
          {t("executionRecoveryFailed")}
        </p>
      ) : null}

      {expanded ? (
        <div className={trainingActivityCardStyles.body}>
          <nav className={trainingActivityCardStyles.navigation} aria-label={t("trainingStage")}>
            {hasPreparation ? (
              <Button
                type="button"
                size="sm"
                variant={phase === "preparation" ? "default" : "outline"}
                onClick={() => setPhase("preparation")}
              >
                {t("warmup")}
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={phase === "main" ? "default" : "outline"}
              onClick={() => setPhase("main")}
            >
              {structured ? t("training") : t("activity")}
            </Button>
          </nav>
          {activeSession ? (
            <section className={trainingActivityCardStyles.session}>
              <div className={trainingActivityCardStyles.sessionHeader}>
                <div>
                  <h3 className={trainingActivityCardStyles.sessionTitle}>{activeSession.name}</h3>
                  <p className={trainingActivityCardStyles.sessionMetadata}>
                    {activeSession.targetDurationMinutes} {t("minutes")}
                    {activeSession.intensity ? ` · ${humanize(activeSession.intensity)}` : ""}
                  </p>
                </div>
                <Badge variant={phase === "preparation" ? "info" : "warning"}>
                  {phase === "preparation" ? t("preparation") : t("training")}
                </Badge>
              </div>
              <div className={trainingActivityCardStyles.exercises}>
                {activeSession.exercises.map((exercise) => (
                  <TrainingExercise
                    key={exercise.prescriptionId}
                    exercise={exercise}
                    sessionId={activeSession.sessionId}
                    activityId={activity.id}
                    role={activeSession.role}
                    civilDate={civilDate}
                    saveExerciseAction={
                      activity.status === "completed" && executionEditable
                        ? actions.saveActivityExercise
                        : undefined
                    }
                    executionDraft={
                      activeDraft?.exercises[
                        trainingExerciseDraftKey(
                          activeSession.role === "main" ? "main" : "preparation",
                          exercise.exerciseId,
                        )
                      ]
                    }
                    onExecutionDraftChange={
                      activeDraft && executionEditable
                        ? (value) =>
                            execution.updateExercise(
                              trainingExerciseDraftKey(
                                activeSession.role === "main" ? "main" : "preparation",
                                exercise.exerciseId,
                              ),
                              value,
                            )
                        : undefined
                    }
                  />
                ))}
              </div>
            </section>
          ) : phase === "preparation" && genericPreparation ? (
            <section className={trainingActivityCardStyles.session}>
              <div className={trainingActivityCardStyles.sessionHeader}>
                <div>
                  <h3 className={trainingActivityCardStyles.sessionTitle}>
                    {genericPreparation.name}
                  </h3>
                  <p className={trainingActivityCardStyles.sessionMetadata}>
                    {genericPreparation.plannedDurationMinutes === null
                      ? t("durationUnknown")
                      : `${genericPreparation.plannedDurationMinutes} min`}{" "}
                    {t("optionalPreparation")}
                  </p>
                </div>
                <Badge variant="info">{t("preparation")}</Badge>
              </div>
              <p className={trainingActivityCardStyles.guidance}>
                {retrospective ? t("retrospectivePreparation") : t("preparationGuidance")}
              </p>
            </section>
          ) : (
            <section className={trainingActivityCardStyles.session}>
              <div className={trainingActivityCardStyles.sessionHeader}>
                <div>
                  <h3 className={trainingActivityCardStyles.sessionTitle}>{activity.name}</h3>
                  <p className={trainingActivityCardStyles.sessionMetadata}>
                    {activity.sport ? `${activity.sport} · ` : ""}
                    {activity.plannedDurationMinutes === null
                      ? t("durationUnknown")
                      : t("plannedMinutes", { minutes: activity.plannedDurationMinutes })}
                  </p>
                </div>
                <Badge variant="secondary">{t(typeLabels[activity.type])}</Badge>
              </div>
            </section>
          )}
          {phase === "preparation" ? (
            <Button type="button" onClick={() => setPhase("main")}>
              {structured ? t("goToTraining") : t("goToActivity")}
            </Button>
          ) : hasPreparation ? (
            <Button type="button" variant="outline" onClick={() => setPhase("preparation")}>
              {t("backToWarmup")}
            </Button>
          ) : null}
        </div>
      ) : null}
      {resting?.[1].rest ? (
        <TrainingRestTimer
          endsAt={resting[1].rest.endsAt}
          onAdjust={(seconds) =>
            execution.updateExercise(resting[0], {
              ...resting[1],
              rest: {
                ...resting[1].rest!,
                endsAt: Math.max(Date.now(), resting[1].rest!.endsAt + seconds * 1000),
              },
            })
          }
          onSkip={() => execution.updateExercise(resting[0], { ...resting[1], rest: undefined })}
        />
      ) : null}
    </article>
  );
}

function activitySummary(
  activity: TrainingActivityCardProps["activity"],
  status: keyof typeof statusLabels,
  t: ReturnType<typeof useTranslations<"training">>,
): string {
  const preparationMinutes =
    supportsRetrospectiveTrainingRecord(activity.type) && !activity.startedAt
      ? null
      : (activity.structured?.preparation?.targetDurationMinutes ??
        activity.preparationSession?.targetDurationMinutes ??
        activity.preparations[0]?.plannedDurationMinutes);
  const totalMinutes =
    activity.plannedDurationMinutes ?? activity.structured?.main.targetDurationMinutes;
  const durations =
    totalMinutes === null || totalMinutes === undefined
      ? t("durationUnknown")
      : preparationMinutes
        ? t("minutesWithWarmup", { minutes: totalMinutes, warmup: preparationMinutes })
        : `${totalMinutes} min`;
  return `${activity.plannedStartTime ?? t("timeUnknown")} · ${durations} · ${t(statusLabels[status])}`;
}

const typeLabels = {
  structured_training: "planTraining",
  sport_practice: "sportPractice",
  specific_training: "specificTraining",
  mobility: "mobility",
} as const;

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
