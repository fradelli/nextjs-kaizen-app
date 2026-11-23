---
id: E06-T13
epic: E06
depends_on: [E06-T11]
---

# Reconciliar atividades futuras ao ativar outro plano

## Objetivo

Impedir que treinos estruturados futuros materializados com um plano antigo permaneçam como programação vigente após a ativação de um novo plano.

## Contexto conhecido

A ativação troca a versão ativa, e as atividades do dia preservam `source` e `trainingPlanVersionId`. Não há reconciliação das datas já materializadas; o histórico executado aponta para a versão original e deve continuar intacto.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `prisma/models/training.prisma`
- `src/features/plan-definition-import/data/activate-selected-plan-definitions.ts`
- `src/features/training/data/ensure-scheduled-training-day.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `roadmap/epics/E06-training-execution/T11-review-daily-plan-lifecycle.md`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Comportamento esperado

- Atividades estruturadas futuras originadas do plano antigo deixam de ser apresentadas como vigentes conforme estratégia aprovada.
- Jogos, aulas, práticas independentes e atividades criadas manualmente permanecem.
- Treinos já executados nunca são reescritos; versões antigas permanecem auditáveis.
- A operação é segura sob repetição, falha parcial e concorrência.

## Escopo e impactos

- Comparar exclusão lógica, invalidação, recriação e regeneração sob demanda; escolher a alternativa mínima que preserve integridade.
- Definir como tratar uma atividade de origem no plano que foi editada manualmente e datas futuras com execução já iniciada.
- Especificar migração e rollback antes de qualquer operação destrutiva.

## Fora de escopo

- Reescrever o passado, remover atividades independentes ou criar sistema genérico de versionamento adicional sem consumidor.

## Decisões antes da implementação

- Aprovar a estratégia de reconciliação e a política para exceções manuais; reanalisar o código vigente, apresentar plano e aguardar aprovação explícita.

## Critérios de aceite

- [ ] Ativar Plano B não deixa treino futuro do Plano A como vigente e não apaga jogo independente.
- [ ] Passado executado e vínculo à versão original permanecem íntegros.
- [ ] Repetição, concorrência e rollback são cobertos por testes proporcionais.

## Resultado

Ainda não iniciada.
