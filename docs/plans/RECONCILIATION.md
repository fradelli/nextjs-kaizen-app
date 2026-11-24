# Reconciliação dos planos do Kaizen

- **Tipo:** Plano de organização e acompanhamento.
- **Área:** Treino, catálogo, design system, alimentação, idiomas e publicação.
- **Tarefas relacionadas:** links por recorte nas seções abaixo; lacunas de vínculo permanecem explícitas.

Revisão de 21/11/2026 sobre os arquivos locais, incluindo a reconciliação da agenda ainda não commitada. Este documento registra evidências e diferenças de escopo; o [roadmap](https://github.com/fradelli/playbook/blob/main/projects/kaizen/README.md) conserva todos os estados. Testes antigos citados nas fontes não foram executados novamente nesta revisão. Banco, navegador, pacote do design system em outro repositório e ambientes publicados não foram inspecionados.

## Treino

| Recorte | Evidência disponível | Trabalho restante e vínculo |
| --- | --- | --- |
| Execução de séries e histórico | O resultado de [E06-T26](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T26-set-execution.md) registra implementação e testes. O [plano de séries](training/TRAINING-SET-EXECUTION-AND-HISTORY-PLAN.md) reúne checkpoints de outubro e regras posteriores de novembro. | Não refazer a entrega. Conferência física permanece vinculada a [E06-T14](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T14-add-mobile-bottom-navigation.md); proveniência e validação ampla têm escopos próprios em [E06-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T04-show-training-provenance.md) e [E06-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T05-validate-training-flow.md). |
| Descanso | E06-T26 registra início e controles; o [pacote Mira](design-system/AJUSTES-DO-EXECUTOR-MIRA.md#verificação-local--14112026) registra ajustes posteriores. | Comparar o aceite de [E06-T09](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T09-design-rest-timer-experience.md) e [E06-T10](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T10-implement-rest-timer.md) com as entregas antes de encerrar ou reduzir tarefas. Descanso editável local/permanente pertence à próxima rodada proposta no pacote Mira, não à evidência de 14/11. |
| Blocos e mudança de plano | [E06-T18](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T18-guide-combined-exercise-blocks.md) registra somente navegação manual/subtítulos na entrega anterior; [E06-T13](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T13-reconcile-future-activities-on-plan-change.md) trata reconciliação futura. | Guiar blocos e reconciliar ativação não estão comprovados pela existência de séries independentes. |
| Autoria de planos | [Plano de autoria](training/PLANOS-DE-TREINO.md#andamento-da-implementação), [schema](../../prisma/models/workout-plans.prisma), [migration](../../prisma/migrations/20261117010000_workout_plan_prescriptions/migration.sql) e [domínio de prescrição](../../src/features/training/domain/workout-prescription.ts) existem. A rota `/plans` não consta na árvore de páginas consultada. | Validar migration/seed, variantes e reserva de execução; entregar casos de uso, editor e persistência ponta a ponta. Falta tarefa dedicada ao recorte de autoria; não atribuir sua conclusão à agenda ou à importação externa. |
| Identidade da execução | [Desenho de identidade](training/TRAINING-EXECUTION-IDENTITY-DESIGN.md) se declara proposta. | Delimitar identidade de cada aparição do exercício/série, reenvio, correção e expiração. Relação técnica com E06-T26 não comprova implementação integral nem vínculo formal do novo desenho. |
| Importação externa | [Plano externo](training/E06-T21-external-training-plan-import.md) e [E06-T21](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E06-training-execution/T21-design-external-training-plan-import.md) delimitam o desenho. | Contrato intermediário, prévia e adaptadores JSON/Excel continuam separados do importador Git existente. |

## Catálogo

O [plano de catálogo](catalog/CATALOG-IMPORT-PLAN.md#uso-da-primeira-seed) registra migration, primeira seed e reaplicação em PostgreSQL descartável. O [schema](../../prisma/models/catalog.prisma) e o [script de seed](../../scripts/seed-catalog.mjs) existem. Isso comprova uma base implementada, não aprovação editorial de todas as entradas.

Permanecem no plano: equivalências, requisitos divergentes, nomes ingleses, modalidades de medida/carga, publicação editorial, aceite de backup/restauração e integração ao editor. As contagens da seção histórica não foram recalculadas e não devem aparecer como indicadores atuais no painel. A preparação registrada em [E10-T09](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md) é uma interseção de escopo; não substitui tarefas próprias para revisão editorial e integração ao editor. Esses vínculos formais ainda precisam ser definidos.

**Divergência a resolver:** o plano do catálogo diz que não haverá versões de planos; o [plano de autoria](training/PLANOS-DE-TREINO.md#persistência-e-semântica) exige revisões preservadas. Não transformar uma dessas frases em ordem de apagar dados ou retirar versionamento. Antes de retomar a implementação, registrar qual decisão substitui qual e separar catálogo editorial, prescrição e snapshot da execução. Esta revisão preserva ambos os documentos e não aprova uma nova arquitetura.

## Design system

[E10-T09](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md) reúne a adoção integral. Seu resultado e a [verificação de 14/11](design-system/AJUSTES-DO-EXECUTOR-MIRA.md#verificação-local--14112026) registram entregas locais do executor e diálogos. A seção **Próxima rodada proposta** do mesmo plano é posterior ao pacote verificado e deve continuar identificada como planejamento.

O [plano de migração](design-system/MIRA-DESIGN-SYSTEM-MIGRATION-PLAN.md#critérios-de-conclusão) ainda exige inventário, jornadas, revisão do CSS restante, versão publicada exata e instalação limpa. O [manifesto atual](../../package.json) aponta para um tarball local `fradelli-ui-mira-color-swatch.tgz`, diferente do candidato do relatório de 14/11. Portanto, não transferir automaticamente aquele aceite para o artefato atual nem declarar publicação do DS. A retomada deve conferir o [inventário visual](../product/telas/componentes-shadcn.md), o candidato efetivo e as pendências da tarefa.

## Alimentação

O [épico de dados E02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/README.md) e o [modelo de persistência](../../prisma/models/nutrition.prisma) pertencem à fundação. A [página atual](../../src/app/nutrition/page.tsx) renderiza `FeaturePlaceholder`. Dados migrados e uma tela traduzida não entregam consulta e registro alimentar.

O [plano E07](nutrition/E07.md) já tem cinco tarefas próprias: projeção, página, registro, proveniência/segurança e validação. Não abrir tarefas duplicadas. Sua referência antiga a `/dieta` deve ser lida como histórica: a superfície atual é `/nutrition`. A implementação deverá seguir os contratos vigentes e os critérios do épico.

## Internacionalização

[E09-T09](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E09-future-evolution/T09-localize-current-interface.md) e a [evidência da interface](../evidence/i18n/I18N-UI-IMPLEMENTATION.md) registram PT/EN para as superfícies existentes, com limites explícitos para conteúdo editorial e alimentação. Não repetir a infraestrutura pelo diagnóstico anterior do [plano](i18n/I18N-PT-EN-PLAN.md).

E09-T05 a E09-T08 incluem política de idioma, conteúdo, documentação e validação mais ampla. A tradução da interface não encerra esse conjunto. A política futura English-first precisa ser conciliada com a instrução vigente de documentação em PT-BR antes de qualquer tradução em massa. Traduções editoriais do catálogo precisam de revisão própria; a estratégia de banco do plano de i18n permanece proposta.

## Publicação

O [plano E08](release/E08.md) mantém preview, exposição pública, produção, operação/rollback e release como etapas verificáveis. Build local, candidato do DS e merge registrado não comprovam deploy. URLs, smoke remoto, backup/restore e promoção não foram verificados nesta revisão. Usar as tarefas existentes, sem antecipar aceite ou alterar suas dependências.

## Agenda e limites transversais

A [reconciliação da agenda](agenda/RECONCILIATION.md) detalha a fundação integrada e o E11. Ela não absorve autoria de planos, aprovação editorial do catálogo, alimentação nem publicação. O [mapa do projeto](https://github.com/fradelli/playbook/blob/main/projects/kaizen/OVERVIEW.md) oferece entrada por área sem manter uma segunda tabela de estados.

## Próximos refinamentos de planejamento

| Lacuna | Encaminhamento antes de iniciar código |
| --- | --- |
| Autoria e identidade sem tarefa dedicada | Definir um primeiro incremento e tarefas próprias com dependências reais; usar os critérios dos planos existentes. |
| Catálogo sem fila editorial própria | Separar revisão/publicação editorial, validações operacionais residuais e consumo pelo editor. |
| Descanso com tarefas antigas e entregas posteriores | Comparar critérios individualmente, preservar evidências e propor redução/encerramento apenas do que estiver comprovado. |
| Versionamento e política de idioma divergentes | Registrar decisão de vigência com fonte e escopo; não substituir silenciosamente regras. |
| Candidato Mira diferente do relatório | Conferir o artefato atual e a matriz de jornadas antes de reutilizar aceite ou publicar. |

Esses são encaminhamentos, não tarefas iniciadas ou mudanças de prioridade. A tarefa selecionada permanece em [ACTIVE](https://github.com/fradelli/playbook/blob/main/projects/kaizen/ACTIVE.md). Nenhum estado, dependência ou checklist existente foi alterado nesta reconciliação.
