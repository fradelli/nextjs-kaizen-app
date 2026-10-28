"use client";

import { Button } from "@fradelli/ui/button";
import { Input } from "@fradelli/ui/input";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSameTrainingSport } from "@/features/training/domain/training-sport.rules";
import { getTrainingAgendaDateWindow } from "@/features/training/domain/training-edit-window";
import { trainingActivityDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import { TrainingPreparationSelect } from "./components/training-preparation-select/training-preparation-select";
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
  editor,
  startedLocally = false,
}: TrainingActivityFormProps) {
  const router = useRouter();
  const [targetDate, setTargetDate] = useState(editor?.initialValues.targetCivilDate ?? civilDate);
  const [preparationChoice, setPreparationChoice] = useState<string | null>(
    editor ? editor.initialValues.preparationChoice : activity ? "keep" : null,
  );
  const [draftError, setDraftError] = useState<string | null>(null);
  const dateWindow = getTrainingAgendaDateWindow();
  const notStarted =
    !activity ||
    (!startedLocally &&
      activity.status === "scheduled" &&
      !activity.startedAt &&
      !activity.completedAt &&
      activity.preparations.every((item) => item.status === "scheduled" && !item.startedAt));
  const schedule = useTrainingActivitySchedule({
    civilDate,
    action,
    activity,
    availablePlan,
    editor,
  });
  const [name, setName] = useState(editor?.initialValues.name ?? activity?.name ?? "");
  const [sport, setSport] = useState(editor?.initialValues.sport ?? activity?.sport ?? "");
  const [validateTimes, setValidateTimes] = useState(false);
  const snapshot = useMemo(
    () => ({
      type: schedule.type,
      name,
      sport,
      sessionId: schedule.sessionId,
      preparationChoice,
      targetCivilDate: targetDate,
      plannedStartTime: schedule.startTime,
      manualEndTime: schedule.manualEnd,
      automaticEnd: schedule.automatic,
    }),
    [
      schedule.type,
      name,
      sport,
      schedule.sessionId,
      preparationChoice,
      targetDate,
      schedule.startTime,
      schedule.manualEnd,
      schedule.automatic,
    ],
  );
  const publishValues = editor?.onValuesChange;
  useEffect(() => {
    publishValues?.(snapshot);
  }, [publishValues, snapshot]);
  const submitting = useRef(false);
  const submission = useTrainingActionFeedback(
    async (previous, formData) => {
      let savedInEditor = false;
      try {
        const result = await action(previous, formData);
        if (result.status === "conflict" || result.status === "not_found") editor?.onNeedsReload();
        if (result.status === "saved") {
          if (editor) {
            savedInEditor = true;
            editor.onSaved({ targetCivilDate: targetDate });
          } else {
            schedule.acceptSaved(result.revision);
            setValidateTimes(false);
            if (!activity) {
              setName("");
              setSport("");
              setPreparationChoice(null);
            }
            if (activity && targetDate !== civilDate) router.push(`/treino?date=${targetDate}`);
          }
        }
        return result;
      } catch {
        editor?.onNeedsReload();
        return {
          status: "invalid" as const,
          message:
            "Não foi possível confirmar o salvamento. Confira a agenda antes de tentar novamente.",
        };
      } finally {
        if (!savedInEditor) {
          submitting.current = false;
          editor?.onBusyChange(false);
        }
      }
    },
    { refreshOnSaved: !editor },
  );
  const { type } = schedule;
  const needsSport = type === "sport_practice" || type === "specific_training";
  const suggestedPreparation = availablePlan?.preparationSuggestions?.find(
    (item) =>
      isSameTrainingSport(item.sport, sport) &&
      availablePlan.sessions.some(
        (session) =>
          session.assignmentRole === "preparation" && session.sessionId === item.sessionId,
      ),
  )?.sessionId;
  const allowKeepPreparation = Boolean(activity && activity.type === type);
  const preparationValue =
    (preparationChoice === "keep" && !allowKeepPreparation ? null : preparationChoice) ??
    suggestedPreparation ??
    "automatic";
  const invalidSession =
    type === "structured_training" &&
    !schedule.sessions.some((session) => session.sessionId === schedule.sessionId);
  const invalidPreparation =
    needsSport &&
    !["automatic", "none", "keep"].includes(preparationValue) &&
    !availablePlan?.sessions.some(
      (session) =>
        session.assignmentRole === "preparation" && session.sessionId === preparationValue,
    );
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
      id={editor?.formId}
      action={submission.formAction}
      className={trainingActivityFormStyles.root}
      onReset={(event) => event.preventDefault()}
      onSubmit={(event) => {
        if (submitting.current || editor?.blocked || editor?.readOnly) {
          event.preventDefault();
          return;
        }
        if (invalidSession || invalidPreparation) {
          event.preventDefault();
          setDraftError(
            "A sessão recuperada não está disponível. Escolha uma opção válida antes de salvar.",
          );
          return;
        }
        setDraftError(null);
        if (activity && (targetDate !== civilDate || (needsSport && preparationValue !== "keep"))) {
          try {
            if (window.localStorage.getItem(trainingActivityDraftKey(civilDate, activity.id))) {
              event.preventDefault();
              setDraftError(
                "Há um treino iniciado neste navegador. Conclua ou descarte o rascunho antes de mudar a data ou o aquecimento.",
              );
              return;
            }
          } catch {
            event.preventDefault();
            setDraftError(
              "Não foi possível conferir o rascunho local. Tente novamente antes de remarcar.",
            );
            return;
          }
        }
        if (!isValidPlannedInterval(schedule.startTime, schedule.endTime)) {
          event.preventDefault();
          setValidateTimes(true);
          return;
        }
        submitting.current = true;
        editor?.onBusyChange(true);
      }}
    >
      <fieldset
        disabled={submission.pending || editor?.readOnly}
        className="grid min-w-0 gap-3 border-0 p-0 m-0"
      >
        <input type="hidden" name="civilDate" value={civilDate} />
        {activity ? (
          <>
            <input type="hidden" name="activityId" value={activity.id} />
            <input type="hidden" name="expectedRevision" value={schedule.expectedRevision} />
          </>
        ) : null}
        <div className={trainingActivityFormStyles.grid}>
          {activity ? (
            <div className={trainingActivityFormStyles.field}>
              <label
                className={trainingActivityFormStyles.label}
                htmlFor={`activity-date-${activity.id}`}
              >
                Data da atividade
              </label>
              <Input
                id={`activity-date-${activity.id}`}
                name="targetCivilDate"
                type="date"
                value={targetDate}
                onChange={(event) => setTargetDate(event.target.value)}
                min={dateWindow.minimumDate}
                max={dateWindow.maximumDate}
                disabled={!notStarted}
                required
                aria-describedby={`activity-date-hint-${activity.id}`}
              />
              <p
                id={`activity-date-hint-${activity.id}`}
                className={trainingActivityFormStyles.hint}
              >
                {notStarted
                  ? "Remarque entre ontem e os próximos quatro dias. Horários e aquecimento serão mantidos."
                  : "Só é possível mudar a data de atividades ainda não iniciadas."}
              </p>
            </div>
          ) : null}
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
                {invalidSession ? (
                  <option value={schedule.sessionId} disabled>
                    Treino indisponível
                  </option>
                ) : null}
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
          {needsSport ? (
            <TrainingPreparationSelect
              activity={activity}
              availablePlan={availablePlan}
              value={preparationValue}
              onChange={setPreparationChoice}
              disabled={!notStarted}
              allowKeep={allowKeepPreparation}
            />
          ) : null}
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
        {!editor ? (
          <div className={trainingActivityFormStyles.actions}>
            <Button type="submit" disabled={submission.pending}>
              {activity ? "Salvar alterações" : "Adicionar atividade"}
            </Button>
          </div>
        ) : null}
      </fieldset>
      {draftError ? (
        <p role="alert" className={trainingActivityFormStyles.hint}>
          {draftError}
        </p>
      ) : null}
      <TrainingActionFeedback state={submission.state} pending={submission.pending} />
    </form>
  );
}
