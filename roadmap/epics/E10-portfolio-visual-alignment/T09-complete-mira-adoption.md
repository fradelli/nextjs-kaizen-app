---
id: E10-T09
epic: E10
depends_on: [E10-T08]
---

# Concluir adoção do design system Mira

## Objetivo

Concluir a migração existente para os exports públicos de `@fradelli/ui`,
preservando comportamento, persistência e composição específica do Kaizen.

## Entradas

- `docs/implementation/MIRA-DESIGN-SYSTEM-MIGRATION-PLAN.md` — sequência, fronteiras e aceite.
- `docs/product/telas/guia-de-estilo.md` — contrato visual vigente.
- `docs/product/telas/componentes-shadcn.md` — inventário e evidências por fluxo.
- `docs/product/telas/agenda-padroes-visuais.md` — geometria e interações da agenda.
- `docs/architecture/TARGET-ARCHITECTURE.md` — Semântica e legibilidade do código;
  Boundaries; Organização dos componentes React; Server Components; Client Components;
  Organização do Prisma e configuração de banco; Migrations.
- `prisma/migrations/20261108010000_exercise_catalog/migration.sql` — preparação local.
- `package.json` e `pnpm-lock.yaml` — candidato efetivamente consumido.

## Entregáveis

- `package.json` e `pnpm-lock.yaml` com candidato validado e, na entrega final, release exato.
- Componentes de `src/features/training/ui/`, `src/components/shared/` e
  `src/features/foundations/` migrados conforme o inventário.
- `docs/product/telas/componentes-shadcn.md` com evidências e exceções reais.
- `CHANGELOG.md`, `roadmap/README.md` e `roadmap/ACTIVE.md` sincronizados.

## Subtarefas

- [x] Revisar/aplicar migration local, confirmar workspace e banco acessível.
- [x] Conferir hash, exports e instalar candidato com Select pelo pnpm.
- [x] Migrar e validar primeiro seletor de formulário real dentro de Dialog.
- [x] Validar Field, Checkbox, envio, teclado e restauração de foco nos consumidores.
- [ ] Reconciliar inventário e lacunas do design system.
- [x] Incorporar Item Mira e indicador de status no DS, instalar candidato e validar barra flutuante sem deslocamento de conteúdo.
- [ ] Concluir executor, agenda, formulários e rotas comuns em lotes.
- [ ] Remover overrides concorrentes e documentar composição local restante.
- [ ] Validar jornadas completas desktop/mobile e gates finais.
- [ ] Após revisão local e release do DS, consumir versão publicada exata.

## Validações

`pnpm db:status`, `pnpm workspace:ensure`, imports reais dos subpaths,
testes dos formulários/diálogos alterados, lint, tipos, estrutura, traduções,
formatação, build e jornadas em Chromium desktop/mobile. Gates finais e
checks do pacote seguem o plano, sem tratar tarball como release publicado.

## Critérios de aceite

- [ ] Controles e aparência genéricos vêm do contrato público do pacote.
- [ ] Composição, regras de domínio e contratos de envio permanecem no Kaizen.
- [ ] Evidências distinguem código, testes, navegador e limitações físicas.
- [ ] Nenhuma pendência de catálogo/release é declarada concluída sem comprovação.

## Resultado

Preparação local entregue em 13/11/2026: migration de catálogo aplicada, 16 migrations
em dia e workspace confirmado. Candidato Select instalado por pnpm, hash conferido
e imports reais aprovados. Seletor de aquecimento migrado, preservando serialização,
sugestões e rascunhos. Instalação congelada offline, build, lint, tipos, estrutura,
traduções, formato e governança do roadmap aprovados; 21 testes do formulário e
47 do editor/card aprovados. Desktop 1440×1000 e mobile emulado 390×844: envio real,
rascunho, Escape, foco e geometria aprovados; Checkbox conferido em foundations.
Atividades sintéticas excluídas pela UI, com histórico de exclusão preservado.

Achado pendente da revisão dos menus: popover nativo de opções intercepta cliques
sobre a confirmação de exclusão aninhada; a exclusão por teclado funciona. Não
declarar o fluxo de exclusão por ponteiro aprovado. O inventário detalha evidências.
A migração integral, catálogo, release e jornada completa de séries permanecem
pendentes. Preservar branch e alterações anteriores sem reexecutar tarefas DONE.

Ampliação autorizada em 13/11/2026: pesquisar a composição oficial do shadcn/ui,
incorporar as primitivas necessárias ao design system e depois instalar no Kaizen
para a barra persistente com indicador verde, preservando a navegação inferior.
Correções do executor discutidas separadamente continuam pendentes: lados lado a
lado, fundo uniforme no tom mais escuro, carga desabilitada sem foco e contagem
por medidas preenchidas com ✓ exclusivo para descanso. A última é uma mudança
funcional aprovada e exige revisão própria dos contratos e regressões.

Barra entregue localmente: Item Mira, StatusIndicator, Lucide e alvo de toque
consumidos do candidato `activity`. Layout fixo sem reserva de espaço; estados
ativo/pausado e reduced motion aprovados em 1440, 390 e 320 px. DS: seis testes
direcionados e quatro histórias, build e tarball aprovados. Kaizen: 21 testes de
barra/reconciliação, build e checks estáticos aprovados. Evidências e hash no
inventário. O aplicativo permanece local na porta 3100, servido pelo build
de produção durante esta conferência; não há publicação ou deploy.

Pacote do executor entregue localmente em 14/11/2026. Decisões e evidências estão em `docs/implementation/AJUSTES-DO-EXECUTOR-MIRA.md`. Inclui regras de contagem/volume, Switch Mira, diálogos responsivos, cabeçalho, tabela e abertura modal consistente. Release e adoção integral continuam nas subtarefas da migração.
