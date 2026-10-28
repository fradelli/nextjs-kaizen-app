import { Badge } from "@fradelli/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";

import { restTrainingDayStyles } from "./rest-training-day.styles";
import type { RestTrainingDayProps } from "./rest-training-day.types";

export function RestTrainingDay({ day }: RestTrainingDayProps) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="info">Descanso</Badge>
        <CardTitle>
          <h2>Descanso hoje</h2>
        </CardTitle>
        <CardDescription className="text-base">
          Este dia não possui exercícios prescritos nem campos de execução.
        </CardDescription>
      </CardHeader>
      <CardContent className={restTrainingDayStyles.content}>
        {day.reason ? <p className={restTrainingDayStyles.reason}>{day.reason}</p> : null}
      </CardContent>
    </Card>
  );
}
