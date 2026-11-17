import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";

import { foundationsTypographySectionStyles } from "./foundations-typography-section.styles";

export function FoundationsTypographySection() {
  return (
    <section aria-labelledby="typography-title">
      <Card>
        <CardHeader>
          <CardTitle>
            <h2 id="typography-title">Tipografia e superfícies</h2>
          </CardTitle>
          <CardDescription>
            IBM Plex Sans e Figtree, contraste dark-first e hierarquia visual fornecidos pelo
            contrato.
          </CardDescription>
        </CardHeader>
        <CardContent className={foundationsTypographySectionStyles.grid}>
          <div className={foundationsTypographySectionStyles.surface}>
            <p className={foundationsTypographySectionStyles.surfaceLabel}>Superfície padrão</p>
            <p className={foundationsTypographySectionStyles.highlight}>Texto de destaque</p>
          </div>
          <div className={foundationsTypographySectionStyles.elevatedSurface}>
            <p className={foundationsTypographySectionStyles.surfaceLabel}>Superfície elevada</p>
            <p className={foundationsTypographySectionStyles.copy}>Conteúdo secundário legível.</p>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
