---
id: E06-T03
epic: E06
depends_on: [E06-T02]
---

# Registrar preparação, séries e comentários

## Objetivo

Permitir executar a programação diária definida pelo plano, salvando preparação, séries e comentários em um fluxo progressivo.

## Entradas

- `docs/history/implementation/E06.md`
- `docs/product/P0.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `data/exercises.json`
- `data/schedule.json`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `src/features/plan-definition-import/domain/plan-definition-import.types.ts`
- `src/features/plan-definition-import/data/read-plan-definitions-from-git.ts`
- `src/features/plan-definition-import/data/persist-plan-definition-snapshot.ts`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/plan-definition-import/data/plan-definition-snapshot-validation.rules.ts`
- `src/features/plan-definition-import/data/validate-plan-definition-snapshot.ts`
- `schemas/schedule.schema.json`
- `data/training-execution-metadata.json`
- `schemas/training-execution-metadata.schema.json`
- `prisma/models/training.prisma`
- `prisma/models/platform.prisma`
- `prisma/migrations/20260916190000_training_activity_log/migration.sql`
- `prisma/migrations/20260919010000_generalize_training_day_activity/migration.sql`
- `prisma/migrations/20260919020000_training_assignment_times/migration.sql`
- `prisma/migrations/20260919030000_training_activity_execution_lifecycle/migration.sql`
- `prisma/migrations/20260919040000_unify_training_activity_execution/migration.sql`
- `prisma/migrations/20260919050000_allow_planned_mobility_definition/migration.sql`
- `prisma/migrations/20260922160000_training_weekly_schedule/migration.sql`
- `prisma/migrations/20260923180000_allow_training_schedule_import_batch/migration.sql`
- `scripts/validate-data.mjs`
- `scripts/validate-data.test.mjs`
- `src/lib/security/workspace.ts`
- `src/app/treino/page.tsx`
- `src/app/treino/training-actions.ts`
- `src/features/training/application/training-dto.ts`
- `src/features/training/application/get-training-day.ts`
- `src/features/training/application/get-public-training-plan.ts`
- `src/features/training/application/resolve-training-day-date.ts`
- `src/features/training/application/resolve-training-day-date.test.ts`
- `src/features/training/application/resolve-training-day-date.types.ts`
- `src/features/training/application/training-mutation.types.ts`
- `src/features/training/application/mutate-training-day.ts`
- `src/features/training/application/training-repository.ts`
- `src/features/training/domain/training-weekly-schedule.ts`
- `src/features/training/domain/training-weekly-schedule.types.ts`
- `src/features/training/domain/training-weekly-schedule.test.ts`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/features/plan-definition-import/domain/training-session-assignment.utils.ts`
- `src/features/plan-definition-import/domain/training-session-assignment.utils.test.ts`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils.ts`
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.test.tsx`
- `src/features/training/domain/training-day.rules.ts`
- `src/features/training/domain/training-day.types.ts`
- `src/features/training/domain/training-exercise-priority.ts`
- `src/features/training/domain/training-exercise-priority.test.ts`
- `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.tsx`
- `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.test.tsx`
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.tsx`
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.styles.ts`
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges.tsx`
- `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-timer/training-activity-timer.tsx`
- `src/features/training/ui/components/training-day-page/components/training-warmup-toggle/training-warmup-toggle.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.types.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.styles.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.constants.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.test.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-completed-exercise-correction/training-completed-exercise-correction.tsx`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-completed-exercise-correction/training-completed-exercise-correction.types.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`
- `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils.ts`
- `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.test.ts`
- `tests/integration/training-mutations.test.ts`
- `tests/integration/training-projections.test.ts`
- `tests/integration/fixtures/database.fixture.ts`
- `tests/integration/fixtures/import-database.fixture.ts`
- `src/features/plan-definition-import/data/plan-definition-import-validation.test.ts`
- `src/features/persisted-data-integrity/data/prisma-persisted-data.mapper.ts`
- `src/features/persisted-data-integrity/domain/persisted-data-integrity.types.ts`
- `src/features/persisted-data-integrity/domain/training-plan-integrity.rules.ts`
- `src/features/persisted-data-integrity/application/validate-persisted-data.test.ts`
- `tests/unit/fixtures/persisted-data-integrity.fixture.ts`
- `tests/integration/import-versioned-plan-definitions.test.ts`
- `tests/integration/persisted-data-integrity.test.ts`

## Entregáveis

- Agenda diária compacta, gestão unificada em drawer e execução guiada de preparação, séries e atividades.

## Subtarefas

- [x] Exibir séries, repetições, descanso e observações disponíveis.
- [x] Separar preparação do treino principal.
- [x] Usar o tipo explícito de medição por série.
- [x] Exibir e persistir carga somente com `load_applicable=true`.
- [x] Manter a execução parcialmente preenchida no navegador, detectar conflito e preservar o rascunho em erro de finalização.
- [x] Materializar séries ainda vazias como zero ao concluir, preservando a possibilidade de corrigi-las depois.
- [x] Resumir a agenda em badges compactos com atividade, duração ou horário.
- [x] Incluir a preparação compatível automaticamente e permitir navegar entre aquecimento e atividade sem alterar o registro existente.
- [x] Iniciar o treino no aquecimento e permitir acessar o treino principal sem bloquear por itens de aquecimento pendentes.
- [x] Exibir uma série por vez e bloquear avanço enquanto a anterior estiver pendente.
- [x] Recolher dicas de execução e corrigir a composição visual dos alertas.
- [x] Substituir a troca especial de programação pela mesma gestão usada para adicionar, editar e remover atividades.
- [x] Persistir atividades adicionais sem alterar a programação prescrita.
- [x] Separar tipo estrutural, nome e esporte da atividade.
- [x] Suportar treino estruturado, prática esportiva, treino específico e mobilidade.
- [x] Preservar horários planejados; registrar início, pausa e retomada no rascunho local e persistir os intervalos ao finalizar.
- [x] Registrar intensidade e energia percebidas somente na execução.
- [x] Vincular preparação de mobilidade às atividades principais e mantê-la visível como etapa opcional.
- [x] Editar e remover logicamente atividades pelo drawer da agenda.
- [x] Incluir atividades nos badges e na leitura do dia para futura agregação mensal.
- [x] Permitir múltiplos treinos estruturados no mesmo dia, inclusive sessões iguais em horários distintos.
- [x] Manter no máximo um cronômetro ativo por navegador e exigir confirmação para pausar a atividade atual.
- [x] Excluir o tempo pausado da duração ativa e preservar todos os intervalos para relatórios.
- [x] Bloquear exclusão de atividade concluída, mantendo correções de avaliação, séries e cargas.
- [x] Usar toggle acessível no aquecimento, bloqueando sua edição enquanto marcado como feito.
- [x] Carregar sessões estruturadas dinamicamente do plano ativo persistido, sem catálogo mockado na UI.
- [x] Salvar exercícios e séries em uma transação ao finalizar a atividade, sem persistência por série ou por toggle durante o treino.
- [x] Tratar campo vazio e zero como série não realizada e impedir lacunas entre séries.
- [x] Exibir editor compacto com uma série por vez, comentário recolhível e bloqueio por toggle.
- [x] Representar prioridade em três níveis com semântica acessível e compatibilidade com o plano legado.
- [x] Limitar leitura e mutações a no máximo quatro dias no futuro sem prefetch dos dias bloqueados.
- [x] Versionar a agenda semanal com modelo de sábado e materializar somente a data consultada, sem recriar exclusões.
- [x] Recolher o exercício ao marcar o switch no cabeçalho e reabri-lo sem perder o rascunho.
- [x] Exibir prioridade com rótulo e barras neutras; permitir fechar o comentário pelo cabeçalho.
- [x] Confirmar exclusão em modal sobreposto, destacando a preservação da atividade.
- [x] Não exibir avisos de salvamento para ações locais de execução.
- [x] Recuperar atividades já iniciadas em rascunho local sem gravar switches ou pausas até a finalização.
- [x] Reabrir exercícios recolhidos sem perder valores e sem rótulos visíveis de estado ou contador textual de exercícios.
- [x] Exibir uma única mensagem direta no modal de exclusão.
- [x] Usar a mesma cor informativa do switch na borda de todo exercício concluído, inclusive sem repetições; destacar o badge do treino principal sem alterar o da preparação.
- [x] Remover a interface e os comandos antigos de atribuição e execução que duplicavam o fluxo por atividades.
- [x] Tratar uma agenda vazia após exclusão como vazia, sem ressuscitar o treino antigo; distinguir exclusão intencional de referência ausente.
- [x] Manter correções explícitas de exercícios após a conclusão, sem permitir gravações antecipadas no banco.
- [x] Permitir a fonte de agenda semanal no banco, vinculá-la uma única vez a versões legadas e auditar seu conteúdo sem enfraquecer a imutabilidade das demais definições.
- [x] Alinhar título e descrição dos avisos sem ícone na mesma coluna para evitar sobreposição em telas estreitas.

## Validações

- Testar transições, pausa e retomada, constraints, séries zeradas, links entre sessão/exercício e autorização.

## Critérios de aceite

- [x] A execução real pode ser registrada sem alterar a prescrição.
- [x] Cronômetro, pausas, aquecimento, séries e avaliação ficam recuperáveis neste navegador até a finalização; então são persistidos juntos no PostgreSQL do workspace fixo.
- [x] O front-end descobre os treinos estruturados pelo plano ativo salvo no banco, sem mocks operacionais.

## Resultado

Fluxo guiado, agenda diária genérica e registro separado entre planejamento e realização disponíveis localmente. A agenda continua persistida ao ser alterada. Uma nova atividade inicia expandida; cronômetro, pausas, aquecimento, exercícios e comentários permanecem em rascunho neste navegador e são gravados em uma única transação ao finalizar cada atividade. Registros iniciados antes dessa mudança também são recuperados como rascunho local; a finalização preserva os IDs dos intervalos e séries existentes. O modelo semanal com jogo no sábado foi escolhido explicitamente como padrão temporário. O importador vincula uma cópia versionada da agenda à versão ativa do plano, e a leitura cria apenas a data consultada dentro do limite de quatro dias futuros. Os treinos de futevôlei usam 90 minutos planejados provisórios; o jogo de sábado permanece com horário a definir. A interface e os comandos antigos de atribuição/execução foram removidos: excluir a última atividade não reexibe a prescrição histórica, e correções posteriores à conclusão continuam possíveis por ação explícita. A migração permite importar a nova fonte e vincular a agenda uma única vez a versões antigas, sem abrir a edição das demais definições. A auditoria cobre o documento da agenda ativo e seus vínculos históricos. Avisos sem ícone agora alinham título e descrição para evitar sobreposição em telas estreitas.

Integrada em `developer` pela PR #48 (`379413c`). A política futura de geração
e persistência da data consultada será revisada na E06-T11, sem reabrir esta entrega.
