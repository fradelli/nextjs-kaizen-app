[ERROR] - (starship::print): Under a 'dumb' terminal (TERM=dumb).

# Roadmap do Kaizen

Este arquivo é a fonte canônica do status de todos os épicos e tarefas. Não é necessário abrir cada tarefa para descobrir o que foi concluído.

## Protocolo de leitura

1. Leia `AGENTS.md`.
2. Consulte este índice para o status global.
3. Leia `ACTIVE.md`.
4. Abra somente a tarefa ativa e os arquivos de entrada indicados nela.

## Estados

`PLANNED` · `READY` · `IN_PROGRESS` · `BLOCKED` · `DONE` · `CANCELLED`

Somente este arquivo guarda o status canônico. Arquivos individuais não repetem o campo `status`.

## Épicos

| ID  | Status      | Épico                                                                   | Resultado                                                               |
| --- | ----------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| E00 | DONE        | [Governança do repositório](epics/E00-repository-governance/README.md)  | Repositório público governado, contexto otimizado e legado rastreável   |
| E01 | DONE        | [Migração de treino](epics/E01-training-data-migration/README.md)       | Fundação de treino migrada e validada                                   |
| E02 | DONE        | [Migração de alimentação](epics/E02-nutrition-data-migration/README.md) | Plano alimentar revisado, versionado e validado                         |
| E03 | DONE        | [Produto e arquitetura](epics/E03-product-and-architecture/README.md)   | P0, arquitetura e guia de implementação aprovados                       |
| E04 | DONE        | [Fundação Next.js](epics/E04-nextjs-foundation/README.md)               | Aplicação mínima com gates e Design System compartilhado                |
| E05 | DONE        | [Banco, importação e acesso](epics/E05-database-and-import/README.md)   | Persistência e importação íntegras; acesso adiado por decisão explícita |
| E06 | IN_PROGRESS | [Execução de treino](epics/E06-training-execution/README.md)            | Consulta e registro utilizáveis de treino                               |
| E07 | PLANNED     | [Execução de alimentação](epics/E07-nutrition-execution/README.md)      | Consulta e registro utilizáveis de alimentação                          |
| E08 | PLANNED     | [Publicação pessoal](epics/E08-personal-release/README.md)              | Local, preview e produção verificados                                   |
| E09 | PLANNED     | [Evolução futura](epics/E09-future-evolution/README.md)                 | Backlog posterior ao MVP pessoal                                        |

## Todas as tarefas

| ID      | Status    | Tarefa                                                                                                                                         | Depende de                            |
| ------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| E00-T01 | DONE      | [Inicializar repositório e branches](epics/E00-repository-governance/T01-initialize-repository-and-branches.md)                                | —                                     |
| E00-T02 | CANCELLED | [Tornar o repositório privado](epics/E00-repository-governance/T02-make-repository-private.md)                                                 | Cancelada por decisão do proprietário |
| E00-T03 | DONE      | [Criar contrato raiz](epics/E00-repository-governance/T03-create-root-contract.md)                                                             | E00-T01                               |
| E00-T04 | DONE      | [Criar sistema de roadmap](epics/E00-repository-governance/T04-create-roadmap-system.md)                                                       | E00-T03                               |
| E00-T06 | DONE      | [Adaptar governança de PR e CI/CD](epics/E00-repository-governance/T06-adapt-delivery-governance.md)                                           | E00-T04                               |
| E00-T05 | DONE      | [Registrar proveniência do legado](epics/E00-repository-governance/T05-register-legacy-provenance.md)                                          | E00-T04, E00-T06                      |
| E00-T07 | DONE      | [Otimizar contexto e sanear dependências pré-MVP](epics/E00-repository-governance/T07-optimize-agent-context.md)                               | E03-T05                               |
| E01-T01 | DONE      | [Congelar snapshot de origem](epics/E01-training-data-migration/T01-freeze-source-snapshot.md)                                                 | E00-T05                               |
| E01-T02 | DONE      | [Migrar dados canônicos de treino](epics/E01-training-data-migration/T02-migrate-canonical-training-data.md)                                   | E01-T01                               |
| E01-T03 | DONE      | [Migrar histórico de treino](epics/E01-training-data-migration/T03-migrate-training-history.md)                                                | E01-T02                               |
| E01-T04 | DONE      | [Migrar documentação humana](epics/E01-training-data-migration/T04-migrate-human-documentation.md)                                             | E01-T03                               |
| E01-T05 | DONE      | [Migrar schemas](epics/E01-training-data-migration/T05-migrate-schemas.md)                                                                     | E01-T04                               |
| E01-T06 | DONE      | [Validar fundação de treino](epics/E01-training-data-migration/T06-validate-training-foundation.md)                                            | E01-T05                               |
| E02-T01 | DONE      | [Inventariar alimentação e unknowns](epics/E02-nutrition-data-migration/T01-inventory-nutrition-inputs.md)                                     | E01-T06                               |
| E02-T02 | DONE      | [Preservar dieta original](epics/E02-nutrition-data-migration/T02-preserve-original-diet.md)                                                   | E02-T01, dieta fornecida              |
| E02-T03 | DONE      | [Revisar plano alimentar](epics/E02-nutrition-data-migration/T03-review-nutrition-plan.md)                                                     | E02-T02                               |
| E02-T04 | DONE      | [Estruturar plano alimentar](epics/E02-nutrition-data-migration/T04-structure-nutrition-plan.md)                                               | E02-T03, decisões aprovadas           |
| E02-T05 | DONE      | [Criar ponteiro, schema e guia](epics/E02-nutrition-data-migration/T05-create-nutrition-contracts.md)                                          | E02-T04                               |
| E02-T06 | DONE      | [Validar fundação alimentar](epics/E02-nutrition-data-migration/T06-validate-nutrition-foundation.md)                                          | E02-T05                               |
| E03-T01 | DONE      | [Definir jornadas do P0](epics/E03-product-and-architecture/T01-define-p0-journeys.md)                                                         | E01-T06, E02-T06                      |
| E03-T02 | DONE      | [Definir transição da fonte de verdade](epics/E03-product-and-architecture/T02-define-source-of-truth-transition.md)                           | E03-T01                               |
| E03-T03 | DONE      | [Definir privacidade e operação](epics/E03-product-and-architecture/T03-define-privacy-and-operations.md)                                      | E03-T01                               |
| E03-T04 | DONE      | [Definir arquitetura](epics/E03-product-and-architecture/T04-define-target-architecture.md)                                                    | E03-T02, E03-T03                      |
| E03-T05 | DONE      | [Aprovar guia de implementação](epics/E03-product-and-architecture/T05-approve-implementation-guide.md)                                        | E03-T04                               |
| E04-T01 | DONE      | [Criar aplicação Next.js](epics/E04-nextjs-foundation/T01-scaffold-nextjs.md)                                                                  | E03-T05, E00-T07                      |
| E04-T02 | DONE      | [Configurar qualidade estática](epics/E04-nextjs-foundation/T02-configure-static-quality.md)                                                   | E04-T01                               |
| E04-T03 | DONE      | [Criar fronteira server-only](epics/E04-nextjs-foundation/T03-create-server-only-boundary.md)                                                  | E04-T02                               |
| E04-T04 | DONE      | [Criar shell acessível](epics/E04-nextjs-foundation/T04-create-accessible-shell.md)                                                            | E04-T08                               |
| E04-T05 | DONE      | [Configurar CI mínimo](epics/E04-nextjs-foundation/T05-configure-minimal-ci.md)                                                                | E04-T02, E04-T03, E04-T06             |
| E04-T06 | DONE      | [Registrar adoção do Design System compartilhado](epics/E04-nextjs-foundation/T06-adopt-shared-design-system-decision.md)                      | E04-T02                               |
| E04-T07 | DONE      | [Validar prontidão técnica para o Design System](epics/E04-nextjs-foundation/T07-validate-design-system-readiness.md)                          | E04-T05, E04-T06                      |
| E04-T08 | DONE      | [Integrar Design System versionado](epics/E04-nextjs-foundation/T08-integrate-versioned-design-system.md)                                      | E04-T07                               |
| E04-T09 | DONE      | [Padronizar estrutura das páginas React](epics/E04-nextjs-foundation/T09-standardize-react-page-structure.md)                                  | E04-T04                               |
| E05-T01 | DONE      | [Modelar treino e alimentação](epics/E05-database-and-import/T01-design-relational-model.md)                                                   | E03-T05                               |
| E05-T02 | DONE      | [Configurar banco e migrations](epics/E05-database-and-import/T02-configure-database-and-migrations.md)                                        | E04-T03, E05-T01                      |
| E05-T03 | DONE      | [Criar importação idempotente](epics/E05-database-and-import/T03-create-idempotent-import.md)                                                  | E05-T02                               |
| E05-T04 | DONE      | [Testar integridade persistida](epics/E05-database-and-import/T04-test-persisted-integrity.md)                                                 | E05-T03                               |
| E05-T05 | DONE      | [Validar backup e restauração](epics/E05-database-and-import/T05-validate-backup-and-restore.md)                                               | E05-T04                               |
| E05-T06 | CANCELLED | [Implementar acesso pessoal](epics/E05-database-and-import/T06-implement-personal-access.md)                                                   | E05-T05                               |
| E05-T07 | DONE      | [Aprimorar semântica e fronteiras do código](epics/E05-database-and-import/T07-refine-code-semantics.md)                                       | E05-T04                               |
| E06-T01 | DONE      | [Projetar treino e execução do dia](epics/E06-training-execution/T01-project-active-training-plan.md)                                          | E05-T05                               |
| E06-T02 | DONE      | [Criar página de treino do dia](epics/E06-training-execution/T02-create-daily-training-page.md)                                                | E04-T04, E06-T01                      |
| E06-T03 | DONE      | [Registrar preparação, séries e comentários](epics/E06-training-execution/T03-record-training-execution.md)                                    | E06-T02                               |
| E06-T04 | READY     | [Exibir proveniência e histórico](epics/E06-training-execution/T04-show-training-provenance.md)                                                | E06-T03                               |
| E06-T05 | PLANNED   | [Validar fluxo de treino](epics/E06-training-execution/T05-validate-training-flow.md)                                                          | E06-T04                               |
| E06-T06 | PLANNED   | [Prescrever carga alvo por exercício e por série](epics/E06-training-execution/T06-prescribe-target-load.md)                                   | E06-T03                               |
| E06-T07 | PLANNED   | [Mostrar a última execução de cada série](epics/E06-training-execution/T07-show-previous-set-performance.md)                                   | E06-T03                               |
| E06-T08 | PLANNED   | [Exigir medidas aplicáveis antes de avançar a série](epics/E06-training-execution/T08-require-applicable-fields-before-next-set.md)            | E06-T03                               |
| E06-T09 | PLANNED   | [Projetar a experiência do contador de descanso](epics/E06-training-execution/T09-design-rest-timer-experience.md)                             | E06-T03                               |
| E06-T10 | PLANNED   | [Implementar o contador de descanso aprovado](epics/E06-training-execution/T10-implement-rest-timer.md)                                        | E06-T09                               |
| E06-T11 | DONE      | [Revisar o ciclo de vida do plano diário](epics/E06-training-execution/T11-review-daily-plan-lifecycle.md)                                     | E06-T03                               |
| E06-T12 | DONE      | [Refinar edição de atividades do dia](epics/E06-training-execution/T12-refine-daily-activity-editing.md)                                       | E06-T11                               |
| E06-T13 | PLANNED   | [Reconciliar atividades futuras ao ativar outro plano](epics/E06-training-execution/T13-reconcile-future-activities-on-plan-change.md)         | E06-T11                               |
| E06-T14 | BLOCKED   | [Mover navegação principal para baixo no mobile](epics/E06-training-execution/T14-add-mobile-bottom-navigation.md)                             | E04-T04                               |
| E06-T15 | DONE      | [Generalizar a programação semanal de atividades](epics/E06-training-execution/T15-generalize-weekly-training-schedule.md)                     | E06-T11                               |
| E06-T16 | DONE      | [Validar e importar a nova programação de treino](epics/E06-training-execution/T16-import-new-training-program.md)                             | E06-T15                               |
| E06-T17 | DONE      | [Preparar reinício controlado dos dados de treino](epics/E06-training-execution/T17-prepare-training-data-fresh-start.md)                      | E06-T11                               |
| E06-T18 | PLANNED   | [Guiar a execução dos blocos combinados](epics/E06-training-execution/T18-guide-combined-exercise-blocks.md)                                   | E06-T16                               |
| E06-T19 | DONE      | [Preencher automaticamente o fim planejado do treino](epics/E06-training-execution/T19-autofill-planned-workout-end.md)                        | E06-T12                               |
| E06-T20 | PLANNED   | [Remover treino específico das opções de inclusão](epics/E06-training-execution/T20-simplify-activity-type-options.md)                         | E06-T12                               |
| E06-T21 | PLANNED   | [Projetar importação externa de planos de treino](epics/E06-training-execution/T21-design-external-training-plan-import.md)                    | E06-T16                               |
| E06-T22 | DONE      | [Permitir organizar a agenda futura sem iniciar treinos](epics/E06-training-execution/T22-allow-future-agenda-editing.md)                      | E06-T12                               |
| E06-T23 | READY     | [Registrar futevôlei e atividades externas retrospectivamente](epics/E06-training-execution/T23-record-external-activities-retrospectively.md) | E06-T12                               |
| E07-T01 | PLANNED   | [Projetar dieta e execução do dia](epics/E07-nutrition-execution/T01-project-active-nutrition-plan.md)                                         | E05-T05                               |
| E07-T02 | PLANNED   | [Criar página de dieta do dia](epics/E07-nutrition-execution/T02-create-nutrition-page.md)                                                     | E04-T04, E07-T01                      |
| E07-T03 | PLANNED   | [Registrar escolhas, cumprimento e comentários](epics/E07-nutrition-execution/T03-record-meal-execution.md)                                    | E07-T02                               |
| E07-T04 | PLANNED   | [Exibir segurança e proveniência](epics/E07-nutrition-execution/T04-show-nutrition-safety.md)                                                  | E07-T03                               |
| E07-T05 | PLANNED   | [Validar fluxo alimentar](epics/E07-nutrition-execution/T05-validate-nutrition-flow.md)                                                        | E07-T04                               |
| E08-T01 | PLANNED   | [Publicar preview](epics/E08-personal-release/T01-deploy-preview.md)                                                                           | E06-T05, E07-T05                      |
| E08-T02 | PLANNED   | [Validar exposição pública](epics/E08-personal-release/T02-protect-access.md)                                                                  | E08-T01                               |
| E08-T03 | PLANNED   | [Preparar produção](epics/E08-personal-release/T03-prepare-production.md)                                                                      | E08-T02, E05-T05                      |
| E08-T04 | PLANNED   | [Validar operação e rollback](epics/E08-personal-release/T04-validate-operations-and-rollback.md)                                              | E08-T03                               |
| E08-T05 | PLANNED   | [Publicar MVP pessoal](epics/E08-personal-release/T05-release-personal-mvp.md)                                                                 | E08-T04                               |
| E09-T01 | PLANNED   | [Projetar sono e atividades gerais](epics/E09-future-evolution/T01-design-sleep-and-general-activities.md)                                     | E08-T05                               |
| E09-T02 | PLANNED   | [Implementar controle de sono](epics/E09-future-evolution/T02-implement-sleep-tracking.md)                                                     | E09-T01                               |
| E09-T03 | PLANNED   | [Implementar registro de atividades gerais](epics/E09-future-evolution/T03-implement-general-activity-tracking.md)                             | E09-T01                               |
| E09-T04 | PLANNED   | [Validar jornadas de sono e atividades](epics/E09-future-evolution/T04-validate-sleep-and-activity-flows.md)                                   | E09-T02, E09-T03                      |
| E09-T05 | PLANNED   | [Projetar arquitetura i18n e política English-first](epics/E09-future-evolution/T05-design-i18n-and-english-policy.md)                         | E06-T05, E07-T05, E09-T04             |
| E09-T06 | PLANNED   | [Internacionalizar produto e conteúdo canônico](epics/E09-future-evolution/T06-internationalize-product-content.md)                            | E09-T05                               |
| E09-T07 | PLANNED   | [Migrar documentação e entrega para inglês](epics/E09-future-evolution/T07-migrate-documentation-to-english.md)                                | E09-T05                               |
| E09-T08 | PLANNED   | [Validar experiência multilíngue](epics/E09-future-evolution/T08-validate-multilingual-experience.md)                                          | E09-T06, E09-T07                      |

## Regra de atualização

Ao iniciar ou concluir uma tarefa:

1. altere o status nesta tabela;
2. atualize `ACTIVE.md`;
3. preencha `Resultado` no arquivo da tarefa concluída;
4. atualize `CHANGELOG.md` quando houver entrega material.

Não é necessário abrir tarefas concluídas para conferir o progresso: esta tabela deve permanecer sincronizada.
