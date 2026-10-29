import { getTranslations } from "next-intl/server";
import { RestTrainingDay } from "../rest-training-day/rest-training-day";
import { TrainingDayFeedback } from "../training-day-feedback/training-day-feedback";
import { TrainingActivitySection } from "../training-activity-section/training-activity-section";
import type { TrainingDayContentProps } from "./training-day-content.types";

export async function TrainingDayContent({ result, actions }: TrainingDayContentProps) {
  const t = await getTranslations("training");

  const queryResult = await result;

  if (queryResult.status === "invalid_data") {
    return (
      <TrainingDayFeedback
        variant="destructive"
        title={t("resolveFailed")}
        description={
          queryResult.reason === "reference_invalid"
            ? t("missingPlanReference")
            : t("inconsistentPlan")
        }
      />
    );
  }

  const { day } = queryResult;
  let content;

  switch (day.state) {
    case "unavailable":
      content = (
        <TrainingDayFeedback
          variant="warning"
          title={t("planUnavailable")}
          description={t("planUnavailableDescription")}
        />
      );
      break;
    case "unassigned":
      content = day.activities.length ? null : (
        <TrainingDayFeedback
          variant="info"
          title={t("noActivities")}
          description={t("addActivityGuidance")}
        />
      );
      break;
    case "rest":
      content = day.activities.length ? null : <RestTrainingDay day={day} actions={actions} />;
      break;
    case "training":
    case "mobility":
      content = day.activities.length ? null : (
        <TrainingDayFeedback
          variant="info"
          title={t("noActivities")}
          description={t("addActivityGuidance")}
        />
      );
      break;
  }

  return (
    <>
      {content}
      <TrainingActivitySection
        civilDate={day.civilDate}
        activities={day.activities}
        availablePlan={"availablePlan" in day ? day.availablePlan : null}
        actions={actions}
      />
    </>
  );
}
