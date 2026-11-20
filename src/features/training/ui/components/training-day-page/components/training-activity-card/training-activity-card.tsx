"use client";
import { ControlTooltip } from "@/components/shared/control-tooltip/control-tooltip";

import { ChevronUp, ChevronDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { WorkoutTotals } from "./components/workout-totals/workout-totals";
import styles from "./training-activity-card.module.css";
import { TrainingRestTimer } from "../training-rest-timer/training-rest-timer";

import { useTranslations } from "next-intl";

import { Badge } from "@fradelli/ui/badge";
import { Button } from "@fradelli/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import { Collapsible, CollapsibleContent } from "@fradelli/ui/collapsible";
import type { TrainingDaySessionDto } from "@/features/training/application/training-dto";
import { useContext, useState } from "react";
import { TrainingWorkoutOverlayContext } from "../../../training-workout-overlay/training-workout-overlay.context";
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

export function TrainingActivityCard({ activity, civilDate, ...props }: TrainingActivityCardProps) {
  const t = useTranslations("training");
  if (activity.structured || activity.preparationSession) {
    return (
      <Card role="article" surface="solid" size="sm">
        <CardHeader>
          <Link
            href={`/workout/activity/${encodeURIComponent(activity.id)}?date=${encodeURIComponent(civilDate)}`}
            className={styles.agendaLink}
          >
            <CardTitle asChild>
              <h2>{activity.name}</h2>
            </CardTitle>
            <CardDescription>{activitySummary(activity, activity.status, t)}</CardDescription>
          </Link>
        </CardHeader>
      </Card>
    );
  }
  return <TrainingInlineActivityCard activity={activity} civilDate={civilDate} {...props} />;
}

export function TrainingInlineActivityCard({
  dedicated = false,
  civilDate,
  activity,
  actions,
  availablePlan = null,
}: TrainingActivityCardProps & { dedicated?: boolean }) {
  const t = useTranslations("training");
  const closeOverlay = useContext(TrainingWorkoutOverlayContext);

  const execution = useTrainingActivityDraft({ activity, civilDate });
  const retrospective = supportsRetrospectiveTrainingRecord(activity.type) && !activity.startedAt;
  const agendaEditable = isTrainingAgendaDateEditable(civilDate);
  const executionEditable = isTrainingExecutionDateEditable(civilDate);
  const activeDraft =
    retrospective || activity.status === "completed" || activity.status === "skipped"
      ? null
      : execution.draft;
  const status = activeDraft?.status ?? activity.status;
  const [warmupOpen, setWarmupOpen] = useState(false);
  const [expandedOverride, setExpandedOverride] = useState<boolean | null>(null);
  const expanded =
    dedicated ||
    (expandedOverride ??
      (status === "in_progress" || (Boolean(activeDraft) && status === "paused")));
  const genericPreparation = activity.preparations[0] ?? null;
  const hasPreparation = Boolean(
    activity.structured?.preparation || activity.preparationSession || genericPreparation,
  );
  const structured = activity.structured;
  const preparationOnly = Boolean(activity.preparationSession && !structured);
  const [phase, setPhase] = useState<"preparation" | "main">(
    preparationOnly || (hasPreparation && !dedicated && !retrospective) ? "preparation" : "main",
  );
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
    setPhase(preparationOnly || (hasPreparation && !dedicated) ? "preparation" : "main");
    setExpandedOverride(null);
  }

  function renderSession(session: TrainingDaySessionDto) {
    return (
      <section className={trainingActivityCardStyles.session}>
        <div className={trainingActivityCardStyles.sessionHeader}>
          <div>
            <h3 className={trainingActivityCardStyles.sessionTitle}>{session.name}</h3>
            <p className={trainingActivityCardStyles.sessionMetadata}>
              {session.targetDurationMinutes} {t("minutes")}
              {session.intensity ? ` · ${humanize(session.intensity)}` : ""}
            </p>
          </div>
          <Badge variant={session.role !== "main" ? "info" : "warning"}>
            {session.role !== "main" ? t("preparation") : t("training")}
          </Badge>
        </div>
        <div className={trainingActivityCardStyles.exercises}>
          {session.exercises.map((exercise) => (
            <TrainingExercise
              key={exercise.prescriptionId}
              exercise={exercise}
              sessionId={session.sessionId}
              activityId={activity.id}
              role={session.role}
              previewSets={
                dedicated &&
                !activeDraft &&
                activity.status !== "completed" &&
                activity.status !== "skipped"
              }
              civilDate={civilDate}
              saveExerciseAction={
                activity.status === "completed" && executionEditable
                  ? actions.saveActivityExercise
                  : undefined
              }
              executionDraft={
                activeDraft?.exercises[
                  trainingExerciseDraftKey(
                    session.role === "main" ? "main" : "preparation",
                    exercise.exerciseId,
                  )
                ]
              }
              onExecutionDraftChange={
                activeDraft && executionEditable
                  ? (value) =>
                      execution.updateExercise(
                        trainingExerciseDraftKey(
                          session.role === "main" ? "main" : "preparation",
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
    );
  }

  const resting = Object.entries(activeDraft?.exercises ?? {}).find(([, item]) => item.rest);
  return (
    <article
      className={dedicated ? styles.dedicated : `${trainingActivityCardStyles.root} ${rootState}`}
    >
      <header className={trainingActivityCardStyles.header}>
        <div className={dedicated ? styles.detailTop : trainingActivityCardStyles.top}>
          <div className="min-w-0 flex-1">
            {dedicated ? (
              <Button tone="general" variant="default" size="icon" className={styles.back} asChild>
                <ControlTooltip label={closeOverlay ? t("backToPreviousPage") : t("backToDay")}>
                  <Link
                    href={`/workout?date=${encodeURIComponent(civilDate)}`}
                    onClick={(event) => {
                      if (closeOverlay) {
                        event.preventDefault();
                        closeOverlay();
                      }
                    }}
                    aria-label={closeOverlay ? t("backToPreviousPage") : t("backToDay")}
                  >
                    <ArrowLeft size={20} aria-hidden="true" focusable="false" />
                  </Link>
                </ControlTooltip>
              </Button>
            ) : null}
            {!dedicated && (
              <h2 className={trainingActivityCardStyles.title}>
                {dedicated ? (
                  <span className="fd-text-card">{activity.name}</span>
                ) : (
                  <Button
                    type="button"
                    variant="ghost"
                    className={trainingActivityCardStyles.headingToggle}
                    aria-expanded={expanded}
                    onClick={() => setExpandedOverride(!expanded)}
                  >
                    <span className="fd-text-card">{activity.name}</span>
                    {expanded ? (
                      <ChevronUp size={16} aria-hidden="true" focusable="false" />
                    ) : (
                      <ChevronDown size={16} aria-hidden="true" focusable="false" />
                    )}
                  </Button>
                )}
              </h2>
            )}
            {!dedicated && (
              <p className={trainingActivityCardStyles.metadata}>
                {activitySummary(activity, status, t)}
              </p>
            )}
          </div>
          <div
            className={`${trainingActivityCardStyles.tools} ${dedicated ? styles.detailTools : ""}`}
          >
            {dedicated && structured?.preparation ? (
              <Button
                type="button"
                tone="warm"
                onClick={() => setWarmupOpen(!warmupOpen)}
                aria-expanded={warmupOpen}
              >
                {t("warmup")}
              </Button>
            ) : null}
            <TrainingActivityControls
              civilDate={civilDate}
              activity={activity}
              action={actions.controlActivity}
              draft={activeDraft}
              showLabel={dedicated}
              onStart={startActivity}
              onPause={execution.pause}
              onResume={execution.resume}
              onPrepareCompletion={execution.prepareCompletion}
              executionStorageError={execution.storageError}
              onFinalized={execution.clear}
              ready={execution.ready && executionEditable}
            />
            {!dedicated && agendaEditable ? (
              <TrainingActivityEditor
                civilDate={civilDate}
                activity={activity}
                availablePlan={availablePlan}
                actions={actions}
                startedLocally={Boolean(activeDraft)}
              />
            ) : null}
            {!dedicated && status !== "completed" && agendaEditable ? (
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
        {!retrospective && (dedicated || status !== "scheduled") ? (
          <div className="flex flex-wrap items-center gap-6">
            <TrainingActivityTimer
              activity={activity}
              draft={activeDraft}
              onPause={execution.pause}
              onResume={execution.resume}
            />
            {dedicated && structured ? (
              <WorkoutTotals exercises={structured.main.exercises} draft={activeDraft} />
            ) : null}
          </div>
        ) : null}
      </header>

      {execution.reconciliation === "preserved" || execution.reconciliation === "storage_error" ? (
        <p role="status" className={trainingActivityCardStyles.guidance}>
          {t("completedDraftPreserved")}
        </p>
      ) : null}
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
          {!dedicated && !preparationOnly ? (
            <nav className={trainingActivityCardStyles.navigation} aria-label={t("trainingStage")}>
              {hasPreparation ? (
                <Button
                  type="button"
                  size="sm"
                  tone={phase === "preparation" ? "warm" : undefined}
                  variant={phase === "preparation" ? "default" : "outline"}
                  onClick={() => setPhase("preparation")}
                >
                  {t("warmup")}
                </Button>
              ) : null}
              <Button
                type="button"
                size="sm"
                tone={phase === "main" ? "cool" : undefined}
                variant={phase === "main" ? "default" : "outline"}
                onClick={() => setPhase("main")}
              >
                {structured ? t("training") : t("activity")}
              </Button>
            </nav>
          ) : null}
          {dedicated && structured ? (
            <>
              {structured.preparation ? (
                <Collapsible open={warmupOpen} onOpenChange={setWarmupOpen}>
                  <CollapsibleContent className="pt-3">
                    {renderSession(structured.preparation)}
                  </CollapsibleContent>
                </Collapsible>
              ) : null}
              {renderSession(structured.main)}
            </>
          ) : activeSession ? (
            renderSession(activeSession)
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
          {!dedicated && !preparationOnly ? (
            phase === "preparation" ? (
              <Button type="button" onClick={() => setPhase("main")}>
                {structured ? t("goToTraining") : t("goToActivity")}
              </Button>
            ) : hasPreparation ? (
              <Button type="button" variant="outline" onClick={() => setPhase("preparation")}>
                {t("backToWarmup")}
              </Button>
            ) : null
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
