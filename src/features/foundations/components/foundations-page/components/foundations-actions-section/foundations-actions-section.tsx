import { Button } from "@fradelli/ui/button";

import { foundationsActionsSectionStyles } from "./foundations-actions-section.styles";

export function FoundationsActionsSection() {
  return (
    <section className={foundationsActionsSectionStyles.root} aria-labelledby="actions-title">
      <div>
        <h2 id="actions-title" className={foundationsActionsSectionStyles.title}>
          Ações e estados
        </h2>
        <p className={foundationsActionsSectionStyles.description}>
          Variantes genéricas com foco visível e estado desabilitado.
        </p>
      </div>
      <div className={foundationsActionsSectionStyles.actions}>
        <Button tone="general">Adicionar ou voltar</Button>
        <Button tone="neutral">Hoje</Button>
        <Button tone="start">Iniciar treino</Button>
        <Button tone="navigation">Seção ativa</Button>
        <Button variant="secondary">Ação secundária</Button>
        <Button variant="outline">Ação contornada</Button>
        <Button variant="ghost">Ação discreta</Button>
        <Button variant="destructive" tone="danger">
          Confirmar descarte
        </Button>
        <Button disabled>Ação indisponível</Button>
      </div>
    </section>
  );
}
