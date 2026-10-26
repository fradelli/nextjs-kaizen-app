"use client";

import { Button } from "@fradelli/ui/button";
import { Input } from "@fradelli/ui/input";
import { useState } from "react";
import { useTrainingActivitySchedule } from "./hooks/use-training-activity-schedule";
import { isValidPlannedInterval } from "./training-activity-form.utils";

import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { TrainingActionFeedback } from "../training-action-feedback/training-action-feedback";
import { trainingActivityFormStyles } from "./training-activity-form.styles";
import type { TrainingActivityFormProps } from "./training-activity-form.types";

export function TrainingActivityForm({
  civilDate,
  action,
  activity,
  availablePlan,
}: TrainingActivityFormProps) {
  const schedule = useTrainingActivitySchedule({ civilDate, action, activity, availablePlan });
  const [name, setName] = useState(activity?.name ?? "");
  const [sport, setSport] = useState(activity?.sport ?? "");
  const [validateTimes, setValidateTimes] = useState(false);
  const submission = useTrainingActionFeedback(async (previous, formData) => {
    const result = await action(previous, formData).catch(() => ({
      status: "invalid" as const,
      message: "Não foi possível salvar. Confira a conexão e tente novamente.",
    }));
    if (result.status === "saved") {
      schedule.acceptSaved(result.revision);
      setValidateTimes(false);
      if (!activity) {
        setName("");
        setSport("");
      }
    }
    return result;
  });
  const { type } = schedule;
  const needsSport = type === "sport_practice" || type === "specific_training";
  const timeError = validateTimes && !isValidPlannedInterval(schedule.startTime, schedule.endTime);
  const hintId = `activity-end-hint-${activity?.id ?? "new"}`;
  const hint = timeError
    ? "O fim planejado deve ser posterior ao início, no mesmo dia."
    : type !== "structured_training"
      ? null
      : !schedule.automatic
        ? "Horário ajustado por você."
        : schedule.suggestion.status === "ready"
          ? `Calculado pela duração do treino: ${schedule.suggestion.durationMinutes} min.`
          : schedule.suggestion.status === "next_day"
            ? "Esse treino terminaria no dia seguinte. Ajuste o início ou informe um fim no mesmo dia."
            : schedule.suggestion.status === "duration_unavailable"
              ? "Não foi possível calcular a duração. Informe o fim planejado."
              : "Informe o início para calcular o fim pela duração do treino.";

  return (
    <form
      action={submission.formAction}
      className={trainingActivityFormStyles.root}
      onReset={(event) => event.preventDefault()}
      onSubmit={(event) => {
        if (!isValidPlannedInterval(schedule.startTime, schedule.endTime)) {
          event.preventDefault();
          setValidateTimes(true);
        }
      }}
    >
      <fieldset disabled={submission.pending} className="grid min-w-0 gap-3 border-0 p-0 m-0">
        <input type="hidden" name="civilDate" value={civilDate} />
        {activity ? (
          <>
            <input type="hidden" name="activityId" value={activity.id} />
            <input type="hidden" name="expectedRevision" value={schedule.expectedRevision} />
          </>
        ) : null}
        <div className={trainingActivityFormStyles.grid}>
          <div className={trainingActivityFormStyles.field}>
            <label
              className={trainingActivityFormStyles.label}
              htmlFor={`activity-type-${activity?.id ?? "new"}`}
            >
              Tipo de atividade
            </label>
            <select
              id={`activity-type-${activity?.id ?? "new"}`}
              name="type"
              className={trainingActivityFormStyles.control}
              value={type}
              onChange={(event) => schedule.changeType(event.target.value as typeof type)}
            >
              <option value="structured_training">Treino do plano</option>
              <option value="sport_practice">Prática esportiva</option>
              <option value="specific_training">Treino específico</option>
              <option value="mobility">Mobilidade</option>
            </select>
          </div>
          {type === "structured_training" ? (
            <div className={trainingActivityFormStyles.field}>
              <label
                className={trainingActivityFormStyles.label}
                htmlFor={`activity-session-${activity?.id ?? "new"}`}
              >
                Treino
              </label>
              <select
                id={`activity-session-${activity?.id ?? "new"}`}
                name="sessionId"
                value={schedule.sessionId}
                onChange={(event) => schedule.setSessionId(event.target.value)}
                className={trainingActivityFormStyles.control}
                required
              >
                {schedule.sessions.map((session) => (
                  <option key={session.sessionId} value={session.sessionId}>
                    {session.name}
                  </option>
                ))}
              </select>
              <input type="hidden" name="name" value="Treino do plano" />
            </div>
          ) : (
            <input type="hidden" name="sessionId" value="" />
          )}
          {type !== "structured_training" ? (
            <div className={trainingActivityFormStyles.field}>
              <label
                className={trainingActivityFormStyles.label}
                htmlFor={`activity-name-${activity?.id ?? "new"}`}
              >
                Nome
              </label>
              <Input
                id={`activity-name-${activity?.id ?? "new"}`}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                placeholder="Ex.: Jogo de sábado"
                required
              />
            </div>
          ) : null}
          {needsSport ? (
            <div className={trainingActivityFormStyles.field}>
              <label
                className={trainingActivityFormStyles.label}
                htmlFor={`activity-sport-${activity?.id ?? "new"}`}
              >
                Esporte
              </label>
              <Input
                id={`activity-sport-${activity?.id ?? "new"}`}
                name="sport"
                value={sport}
                onChange={(event) => setSport(event.target.value)}
                maxLength={80}
                placeholder="Ex.: Futevôlei"
                required
              />
            </div>
          ) : (
            <input type="hidden" name="sport" value="" />
          )}
          <div className={trainingActivityFormStyles.field}>
            <label
              className={trainingActivityFormStyles.label}
              htmlFor={`activity-start-time-${activity?.id ?? "new"}`}
            >
              Início planejado
            </label>
            <Input
              id={`activity-start-time-${activity?.id ?? "new"}`}
              name="plannedStartTime"
              type="time"
              value={schedule.startTime}
              onChange={(event) => schedule.setStartTime(event.target.value)}
              required
            />
          </div>
          <div className={trainingActivityFormStyles.field}>
            <label
              className={trainingActivityFormStyles.label}
              htmlFor={`activity-end-time-${activity?.id ?? "new"}`}
            >
              Fim planejado
            </label>
            <Input
              id={`activity-end-time-${activity?.id ?? "new"}`}
              name="plannedEndTime"
              type="time"
              value={schedule.endTime}
              onChange={(event) => schedule.changeEnd(event.target.value)}
              onBlur={() => setValidateTimes(Boolean(schedule.startTime && schedule.endTime))}
              aria-describedby={hint ? hintId : undefined}
              aria-invalid={timeError || undefined}
              required
            />
            {hint ? (
              <p id={hintId} className={trainingActivityFormStyles.hint} aria-live="polite">
                {hint}
              </p>
            ) : null}
            {type === "structured_training" && !schedule.automatic ? (
              <Button type="button" variant="outline" onClick={schedule.enableAutomatic}>
                Usar duração do treino
              </Button>
            ) : null}
          </div>
        </div>
        <div className={trainingActivityFormStyles.actions}>
          <Button type="submit" disabled={submission.pending}>
            {activity ? "Salvar alterações" : "Adicionar atividade"}
          </Button>
        </div>
      </fieldset>
      <TrainingActionFeedback state={submission.state} pending={submission.pending} />
    </form>
  );
}
