import { useTranslations } from "next-intl";
import { Badge } from "@fradelli/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";

import { restTrainingDayStyles } from "./rest-training-day.styles";
import type { RestTrainingDayProps } from "./rest-training-day.types";

export function RestTrainingDay({ day }: RestTrainingDayProps) {
  const t = useTranslations("training");

  return (
    <Card>
      <CardHeader>
        <Badge variant="info">{t("rest")}</Badge>
        <CardTitle>
          <h2>{t("restToday")}</h2>
        </CardTitle>
        <CardDescription className="text-base">{t("restDescription")}</CardDescription>
      </CardHeader>
      <CardContent className={restTrainingDayStyles.content}>
        {day.reason ? <p className={restTrainingDayStyles.reason}>{day.reason}</p> : null}
      </CardContent>
    </Card>
  );
}
