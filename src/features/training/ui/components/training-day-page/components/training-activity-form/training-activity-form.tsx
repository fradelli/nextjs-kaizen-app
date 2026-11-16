"use client";
import { sportModalities } from "@/features/training/domain/sport-modalities";
import { NativeSelect, NativeSelectOption } from "@fradelli/ui/native-select";
import { useTranslations } from "next-intl";

import { PanelRight } from "lucide-react";
import { Button } from "@fradelli/ui/button";
import { Field, FieldDescription, FieldLabel } from "@fradelli/ui/field";
import { Input } from "@fradelli/ui/input";
import { PendingButton } from "@fradelli/ui/pending-button";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { isSameTrainingSport } from "@/features/training/domain/training-sport.rules";
import { trainingActivityDraftKey } from "@/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils";
import { useTrainingActivitySchedule } from "./hooks/use-training-activity-schedule";
import { isValidPlannedInterval } from "./training-activity-form.utils";

import { useTrainingActionFeedback } from "@/features/training/ui/hooks/use-training-action-feedback";
import { TrainingActionFeedback } from "../training-action-feedback/training-action-feedback";
import { trainingActivityFormStyles } from "./training-activity-form.styles";
import type { TrainingActivityFormProps } from "./training-activity-form.types";

const plannedTimeOptions = Array.from({ length: 24 * 4 }, (_, slot) => {
  const hour = String(Math.floor(slot / 4)).padStart(2, "0");
  const minute = String((slot % 4) * 15).padStart(2, "0");
  const time = `${hour}:${minute}`;
  return (
    <NativeSelectOption key={time} value={time}>
      {time}
    </NativeSelectOption>
  );
});

export function TrainingActivityForm({
  civilDate,
  action,
  activity,
  availablePlan,
  editor,
  onPanelClose,
  startedLocally = false,
}: TrainingActivityFormProps) {
  const t = useTranslations("training");

  const router = useRouter();
  const [targetDate, setTargetDate] = useState(editor?.initialValues.targetCivilDate ?? civilDate);
  const [preparationChoice, setPreparationChoice] = useState<string | null>(
    editor ? editor.initialValues.preparationChoice : activity ? "keep" : null,
  );
  const [draftError, setDraftError] = useState<string | null>(null);
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
            if (activity && targetDate !== civilDate) router.push(`/workout?date=${targetDate}`);
          }
        }
        return result;
      } catch {
        editor?.onNeedsReload();
        return {
          status: "invalid" as const,
          message: t("saveUnconfirmed"),
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
  const hint = timeError ? t("endAfterStart") : null;
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
          setDraftError(t("restoredSessionUnavailable"));
          return;
        }
        setDraftError(null);
        if (activity && (targetDate !== civilDate || (needsSport && preparationValue !== "keep"))) {
          try {
            if (window.localStorage.getItem(trainingActivityDraftKey(civilDate, activity.id))) {
              event.preventDefault();
              setDraftError(t("localSessionBlocksReschedule"));
              return;
            }
          } catch {
            event.preventDefault();
            setDraftError(t("draftCheckFailed"));
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
        <input type="hidden" name="civilDate" value={activity ? civilDate : targetDate} />
        {activity ? (
          <>
            <input type="hidden" name="activityId" value={activity.id} />
            <input type="hidden" name="expectedRevision" value={schedule.expectedRevision} />
          </>
        ) : null}
        <div className={trainingActivityFormStyles.grid}>
          <div className="flex items-center gap-1">
            <Field className="min-w-0 flex-1">
              <FieldLabel className="sr-only" htmlFor={`activity-type-${activity?.id ?? "new"}`}>
                {t("activityType")}
              </FieldLabel>
              <NativeSelect
                id={`activity-type-${activity?.id ?? "new"}`}
                name="type"
                className="w-full"
                value={type === "specific_training" ? "sport_practice" : type}
                onChange={(event) => schedule.changeType(event.target.value as typeof type)}
              >
                <NativeSelectOption value="structured_training">
                  {t("planTraining")}
                </NativeSelectOption>
                <NativeSelectOption value="sport_practice">{t("sportPractice")}</NativeSelectOption>
                <NativeSelectOption value="mobility">{t("mobility")}</NativeSelectOption>
              </NativeSelect>
            </Field>
            {onPanelClose && (
              <Button
                className="hidden shrink-0 md:inline-flex"
                type="button"
                variant="ghost"
                size="icon"
                tone="neutral"
                aria-label={t("closeForm")}
                aria-controls="schedule-editor-panel"
                aria-expanded
                onClick={onPanelClose}
              >
                <PanelRight size={12} aria-hidden />
              </Button>
            )}
          </div>
          {type === "structured_training" ? (
            <Field>
              <FieldLabel className="sr-only" htmlFor={`activity-session-${activity?.id ?? "new"}`}>
                {t("training")}
              </FieldLabel>
              <NativeSelect
                id={`activity-session-${activity?.id ?? "new"}`}
                name="sessionId"
                value={schedule.sessionId}
                onChange={(event) => schedule.setSessionId(event.target.value)}
                className="w-full"
                required
              >
                {invalidSession ? (
                  <NativeSelectOption value={schedule.sessionId} disabled>
                    {t("trainingUnavailable")}
                  </NativeSelectOption>
                ) : null}
                {schedule.sessions.map((session) => (
                  <NativeSelectOption key={session.sessionId} value={session.sessionId}>
                    {session.name}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
              <input type="hidden" name="name" value="Treino do plano" />
            </Field>
          ) : (
            <input type="hidden" name="sessionId" value="" />
          )}
          {needsSport && <input type="hidden" name="name" value={name || sport} />}
          {type !== "structured_training" && !needsSport ? (
            <Field>
              <FieldLabel className="sr-only" htmlFor={`activity-name-${activity?.id ?? "new"}`}>
                {t("name")}
              </FieldLabel>
              <Input
                id={`activity-name-${activity?.id ?? "new"}`}
                name="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                maxLength={120}
                placeholder={t("activityNamePlaceholder")}
                required
              />
            </Field>
          ) : null}
          {needsSport ? (
            <Field>
              <FieldLabel className="sr-only" htmlFor={`activity-sport-${activity?.id ?? "new"}`}>
                {t("sport")}
              </FieldLabel>
              <NativeSelect
                id={`activity-sport-${activity?.id ?? "new"}`}
                name="sport"
                value={sport}
                onChange={(event) => {
                  setSport(event.target.value);
                  setName(event.target.value);
                  setPreparationChoice(null);
                }}
                className="w-full"
                required
              >
                <NativeSelectOption value="" disabled>
                  {t("sport")}
                </NativeSelectOption>
                {activity?.sport && !sportModalities.some((item) => item === activity.sport) && (
                  <NativeSelectOption value={activity.sport}>{activity.sport}</NativeSelectOption>
                )}
                {sportModalities.map((item) => (
                  <NativeSelectOption key={item} value={item}>
                    {item}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Field>
          ) : (
            <input type="hidden" name="sport" value="" />
          )}
          {needsSport ? (
            <input type="hidden" name="preparationSessionId" value={preparationValue} />
          ) : null}
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1">
            <Field>
              <FieldLabel
                className="sr-only"
                htmlFor={`activity-start-time-${activity?.id ?? "new"}`}
              >
                {t("plannedStart")}
              </FieldLabel>
              <NativeSelect
                id={`activity-start-time-${activity?.id ?? "new"}`}
                name="plannedStartTime"
                className="w-full"
                value={schedule.startTime}
                onChange={(event) => schedule.setStartTime(event.target.value)}
                required
              >
                <NativeSelectOption value="" disabled>
                  --:--
                </NativeSelectOption>
                {plannedTimeOptions}
              </NativeSelect>
            </Field>
            <span aria-hidden="true">&rarr;</span>
            <Field>
              <FieldLabel
                className="sr-only"
                htmlFor={`activity-end-time-${activity?.id ?? "new"}`}
              >
                {t("plannedEnd")}
              </FieldLabel>
              <NativeSelect
                id={`activity-end-time-${activity?.id ?? "new"}`}
                name="plannedEndTime"
                className="w-full"
                value={schedule.endTime}
                onChange={(event) => schedule.changeEnd(event.target.value)}
                onBlur={() => setValidateTimes(Boolean(schedule.startTime && schedule.endTime))}
                aria-describedby={hint ? hintId : undefined}
                aria-invalid={timeError || undefined}
                required
              >
                <NativeSelectOption value="" disabled>
                  --:--
                </NativeSelectOption>
                {plannedTimeOptions}
              </NativeSelect>
            </Field>
          </div>
          <Input
            aria-label={t("activityDate")}
            type="date"
            name={activity ? "targetCivilDate" : undefined}
            value={targetDate}
            onChange={(event) => setTargetDate(event.target.value)}
            disabled={!notStarted}
            required
          />
          {hint ? (
            <FieldDescription id={hintId} aria-live="polite">
              {hint}
            </FieldDescription>
          ) : null}
          {type === "structured_training" && !schedule.automatic ? (
            <Button type="button" variant="outline" onClick={schedule.enableAutomatic}>
              {t("useTrainingDuration")}
            </Button>
          ) : null}
        </div>
        {!editor ? (
          <div className={trainingActivityFormStyles.actions}>
            <PendingButton type="submit" pending={submission.pending} pendingLabel={t("saving")}>
              {activity ? t("saveChanges") : t("addActivity")}
            </PendingButton>
          </div>
        ) : null}
      </fieldset>
      {draftError ? (
        <p role="alert" className={trainingActivityFormStyles.error}>
          {draftError}
        </p>
      ) : null}
      <TrainingActionFeedback state={submission.state} pending={submission.pending} />
    </form>
  );
}
