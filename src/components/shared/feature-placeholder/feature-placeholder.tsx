import { Badge } from "@fradelli/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";

import { FEATURE_PLACEHOLDER_BADGE_LABEL } from "./feature-placeholder.constants";
import { featurePlaceholderStyles } from "./feature-placeholder.styles";
import type { FeaturePlaceholderProps } from "./feature-placeholder.types";

export function FeaturePlaceholder({ description, headingId, title }: FeaturePlaceholderProps) {
  return (
    <section className={featurePlaceholderStyles.root} aria-labelledby={headingId}>
      <Card className={featurePlaceholderStyles.card}>
        <CardHeader>
          <Badge variant="secondary">{FEATURE_PLACEHOLDER_BADGE_LABEL}</Badge>
          <CardTitle>
            <h1 id={headingId} className={featurePlaceholderStyles.title}>
              {title}
            </h1>
          </CardTitle>
          <CardDescription className="text-base">{description}</CardDescription>
        </CardHeader>
      </Card>
    </section>
  );
}
