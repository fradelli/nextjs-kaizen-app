import { useState } from "react";
import type {
  TrainingActivityFormProps,
  TrainingScheduleSession,
} from "../training-activity-form.types";
import { suggestPlannedEnd } from "../training-activity-form.utils";

export function useTrainingActivitySchedule({
  activity,
  availablePlan,
}: TrainingActivityFormProps) {
  const [type, setType] = useState(activity?.type ?? "sport_practice");
  const [originalSession, setOriginalSession] = useState<TrainingScheduleSession | null>(
    activity?.structured?.main ?? null,
  );
  const planSessions =
    availablePlan?.sessions.filter((session) => session.assignmentRole === "main") ?? [];
  const sessions = originalSession
    ? [
        originalSession,
        ...planSessions.filter((session) => session.sessionId !== originalSession.sessionId),
      ]
    : planSessions;
  const [sessionId, setSessionId] = useState(
    originalSession?.sessionId ?? sessions[0]?.sessionId ?? "",
  );
  const [startTime, setStartTime] = useState(activity?.plannedStartTime ?? "");
  const [manualEnd, setManualEnd] = useState(activity?.plannedEndTime ?? "");
  const [automatic, setAutomatic] = useState(!activity);
  const [expectedRevision, setExpectedRevision] = useState(activity?.revision ?? 0);
  const selectedSession = sessions.find((session) => session.sessionId === sessionId);
  const suggestion = suggestPlannedEnd(startTime, selectedSession?.targetDurationMinutes);
  const endTime =
    type === "structured_training" && automatic
      ? suggestion.status === "ready"
        ? suggestion.time
        : ""
      : manualEnd;

  function changeType(nextType: typeof type) {
    if (type === "structured_training" && nextType !== type) {
      setManualEnd(endTime);
      setAutomatic(!endTime && automatic);
    }
    setType(nextType);
  }
  function changeEnd(nextEnd: string) {
    setManualEnd(nextEnd);
    setAutomatic(false);
  }
  function acceptSaved(revision: number) {
    setExpectedRevision(revision);
    if (activity) {
      setOriginalSession(type === "structured_training" ? (selectedSession ?? null) : null);
      setManualEnd(endTime);
      setAutomatic(false);
    } else {
      setType("sport_practice");
      setSessionId(planSessions[0]?.sessionId ?? "");
      setStartTime("");
      setManualEnd("");
      setAutomatic(true);
    }
  }
  return {
    type,
    changeType,
    sessions,
    sessionId,
    setSessionId,
    startTime,
    setStartTime,
    endTime,
    changeEnd,
    automatic,
    enableAutomatic: () => setAutomatic(true),
    suggestion,
    expectedRevision,
    acceptSaved,
  };
}
