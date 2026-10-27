import { Badge } from "@fradelli/ui/badge";

import { trainingAgendaBadgesStyles } from "./training-agenda-badges.styles";
import type { TrainingAgendaBadgesProps } from "./training-agenda-badges.types";

export function TrainingAgendaBadges({ day }: TrainingAgendaBadgesProps) {
  const plannedLabel = day.state === "rest" && !day.activities.length ? "Descanso" : null;

  return (
    <>
      <div className={trainingAgendaBadgesStyles.root} aria-label="Agenda resumida do dia">
        {plannedLabel ? <Badge variant="outline">{plannedLabel}</Badge> : null}
        {day.activities.map((activity) => (
          <Badge
            key={activity.id}
            variant={activity.status === "completed" ? "success" : "warning"}
          >
            {activity.name} · {activity.plannedStartTime ?? "Horário a definir"}
            {activity.plannedEndTime ? `–${activity.plannedEndTime}` : ""}
          </Badge>
        ))}
      </div>
      {"planId" in day ? (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer py-2">Detalhes do plano</summary>
          <p>
            Plano {day.planId} · versão {day.planVersion}
          </p>
        </details>
      ) : null}
    </>
  );
}
