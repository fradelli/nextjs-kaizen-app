import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@fradelli/ui/collapsible";
import { Button } from "@fradelli/ui/button";
import { useTranslations } from "next-intl";
import { Badge } from "@fradelli/ui/badge";

import { trainingAgendaBadgesStyles } from "./training-agenda-badges.styles";
import type { TrainingAgendaBadgesProps } from "./training-agenda-badges.types";

export function TrainingAgendaBadges({ day }: TrainingAgendaBadgesProps) {
  const t = useTranslations("training");

  const plannedLabel = day.state === "rest" && !day.activities.length ? t("rest") : null;

  return (
    <>
      {plannedLabel ? (
        <div className={trainingAgendaBadgesStyles.root} aria-label={t("dailyAgenda")}>
          <Badge variant="outline">{plannedLabel}</Badge>
        </div>
      ) : null}
      {"planId" in day ? (
        <Collapsible className="fd-text-interface text-muted-foreground">
          <CollapsibleTrigger render={<Button type="button" variant="ghost" />}>
            {t("planDetails")}
          </CollapsibleTrigger>
          <CollapsibleContent keepMounted>
            <p>{t("planVersion", { id: day.planId, version: day.planVersion })}</p>
          </CollapsibleContent>
        </Collapsible>
      ) : null}
    </>
  );
}
