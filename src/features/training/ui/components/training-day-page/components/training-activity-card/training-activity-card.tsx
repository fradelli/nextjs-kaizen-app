"use client";

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
  scheduled: "Não iniciado",
  in_progress: "Em andamento",
  paused: "Pausado",
  completed: "Concluído",
  skipped: "Não realizado",
} as const;

export function TrainingActivityCard({
  civilDate,
  activity,
  actions,
  availablePlan = null,
}: TrainingActivityCardProps) {
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

  return (
    <article className={`${trainingActivityCardStyles.root} ${rootState}`}>
      <header className={trainingActivityCardStyles.header}>
        <div className={trainingActivityCardStyles.top}>
          <div>
            <h2 className={trainingActivityCardStyles.title}>
              <Button
                type="button"
                variant="ghost"
                className={trainingActivityCardStyles.headingToggle}
                aria-expanded={expanded}
                onClick={() => setExpandedOverride(!expanded)}
              >
                {activity.name} <span aria-hidden="true">{expanded ? "▴" : "▾"}</span>
              </Button>
            </h2>
            <p className={trainingActivityCardStyles.metadata}>
              {activitySummary(activity, status)}
            </p>
          </div>
          <div className={trainingActivityCardStyles.tools}>
            {!retrospective && status !== "scheduled" ? (
              <TrainingActivityTimer activity={activity} draft={activeDraft} />
            ) : null}
            {activeDraft && executionEditable ? (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={activeDraft.status === "paused" ? execution.resume : execution.pause}
                aria-label={
                  activeDraft.status === "paused" ? "Retomar atividade" : "Pausar atividade"
                }
              >
                {activeDraft.status === "paused" ? "▶" : "⏸"}
              </Button>
            ) : null}
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
      </header>

      {!retrospective && execution.storageError ? (
        <p role="alert" className={trainingActivityCardStyles.guidance}>
          Não foi possível guardar o rascunho neste navegador. Libere espaço antes de continuar.
        </p>
      ) : null}
      {execution.ready &&
      !activeDraft &&
      (activity.status === "in_progress" || activity.status === "paused") ? (
        <p role="alert" className={trainingActivityCardStyles.guidance}>
          Não foi possível recuperar esta execução. Recarregue a página antes de continuar.
        </p>
      ) : null}

      {status === "scheduled" && !retrospective ? (
        <TrainingActivityControls
          civilDate={civilDate}
          activity={activity}
          action={actions.controlActivity}
          onStart={startActivity}
          onFinalized={execution.clear}
          ready={execution.ready && executionEditable}
        />
      ) : null}

      {expanded ? (
        <div className={trainingActivityCardStyles.body}>
          <nav className={trainingActivityCardStyles.navigation} aria-label="Etapa do treino">
            {hasPreparation ? (
              <Button
                type="button"
                size="sm"
                variant={phase === "preparation" ? "default" : "outline"}
                onClick={() => setPhase("preparation")}
              >
                Aquecimento
              </Button>
            ) : null}
            <Button
              type="button"
              size="sm"
              variant={phase === "main" ? "default" : "outline"}
              onClick={() => setPhase("main")}
            >
              {structured ? "Treino" : "Atividade"}
            </Button>
          </nav>
          {activeSession ? (
            <section className={trainingActivityCardStyles.session}>
              <div className={trainingActivityCardStyles.sessionHeader}>
                <div>
                  <h3 className={trainingActivityCardStyles.sessionTitle}>{activeSession.name}</h3>
                  <p className={trainingActivityCardStyles.sessionMetadata}>
                    {activeSession.targetDurationMinutes} min
                    {activeSession.intensity ? ` · ${humanize(activeSession.intensity)}` : ""}
                  </p>
                </div>
                <Badge variant={phase === "preparation" ? "info" : "warning"}>
                  {phase === "preparation" ? "Preparação" : "Treino"}
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
                      ? "Duração a definir"
                      : `${genericPreparation.plannedDurationMinutes} min`}{" "}
                    · preparação opcional
                  </p>
                </div>
                <Badge variant="info">Preparação</Badge>
              </div>
              <p className={trainingActivityCardStyles.guidance}>
                {retrospective
                  ? "Esta preparação é opcional. Você pode registrar a atividade realizada sem concluir o aquecimento ou informar horários reais."
                  : "Faça o aquecimento adequado à atividade. O cronômetro principal continua registrando apenas o tempo ativo, mesmo ao alternar entre as etapas."}
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
                      ? "Duração a definir"
                      : `${activity.plannedDurationMinutes} min planejados`}
                  </p>
                </div>
                <Badge variant="secondary">{typeLabels[activity.type]}</Badge>
              </div>
            </section>
          )}
          {phase === "preparation" ? (
            <Button type="button" onClick={() => setPhase("main")}>
              {structured ? "Ir para o treino" : "Ir para a atividade"}
            </Button>
          ) : hasPreparation ? (
            <Button type="button" variant="outline" onClick={() => setPhase("preparation")}>
              Voltar ao aquecimento
            </Button>
          ) : null}
          {(status !== "scheduled" || retrospective) && executionEditable ? (
            <TrainingActivityControls
              civilDate={civilDate}
              activity={activity}
              action={actions.controlActivity}
              draft={activeDraft}
              onFinalized={execution.clear}
            />
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function activitySummary(
  activity: TrainingActivityCardProps["activity"],
  status: keyof typeof statusLabels,
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
      ? "Duração a definir"
      : preparationMinutes
        ? `${totalMinutes} min (inclui ${preparationMinutes} min de aquecimento)`
        : `${totalMinutes} min`;
  return `${activity.plannedStartTime ?? "Horário a definir"} · ${durations} · ${statusLabels[status]}`;
}

const typeLabels = {
  structured_training: "Treino do plano",
  sport_practice: "Prática esportiva",
  specific_training: "Treino específico",
  mobility: "Mobilidade",
} as const;

function humanize(value: string): string {
  return value.replaceAll("_", " ");
}
