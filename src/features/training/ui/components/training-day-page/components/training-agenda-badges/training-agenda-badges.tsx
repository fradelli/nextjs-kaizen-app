import { useTranslations } from "next-intl";
import { Badge } from "@fradelli/ui/badge";

import { trainingAgendaBadgesStyles } from "./training-agenda-badges.styles";
import type { TrainingAgendaBadgesProps } from "./training-agenda-badges.types";

export function TrainingAgendaBadges({ day }: TrainingAgendaBadgesProps) {
  const t = useTranslations("training");

  const plannedLabel = day.state === "rest" && !day.activities.length ? t("rest") : null;

  return (
    <>
      <div className={trainingAgendaBadgesStyles.root} aria-label={t("dailyAgenda")}>
        {plannedLabel ? <Badge variant="outline">{plannedLabel}</Badge> : null}
        {day.activities.map((activity) => (
          <Badge
            key={activity.id}
            variant={activity.status === "completed" ? "success" : "warning"}
          >
            {activity.name} · {activity.plannedStartTime ?? t("timeUnknown")}
            {activity.plannedEndTime ? `–${activity.plannedEndTime}` : ""}
          </Badge>
        ))}
      </div>
      {"planId" in day ? (
        <details className="fd-text-interface text-muted-foreground">
          <summary className="cursor-pointer py-2">{t("planDetails")}</summary>
          <p>{t("planVersion", { id: day.planId, version: day.planVersion })}</p>
        </details>
      ) : null}
    </>
  );
}
