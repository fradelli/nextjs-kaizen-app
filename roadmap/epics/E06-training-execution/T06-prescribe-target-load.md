---
id: E06-T06
epic: E06
depends_on: [E06-T03]
---

# Prescrever carga alvo por exercício e por série

## Objetivo

Mostrar uma carga alvo distinta da carga efetivamente realizada, permitindo um alvo único para o exercício ou alvos diferentes por série.

## Contexto conhecido

Na implementação proposta pela E06-T03, a execução guarda `loadKg` por série e o exercício informa `loadApplicable` e `loadUnit`. Ainda não há campo próprio para a carga alvo na definição prescrita. Os dados atuais usam kg. Confirmar esses fatos novamente após o merge da PR correspondente.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `data/training-execution-metadata.json`
- `schemas/training-execution-metadata.schema.json`
- `prisma/models/training.prisma`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/training/application/training-dto.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo e impactos».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Comportamento esperado

- Uma prescrição pode definir a mesma carga para todas as séries ou uma carga específica para cada série.
- O alvo aparece com unidade e nunca é confundido com a carga realizada.
- Exercícios sem carga aplicável não exibem nem exigem alvo.
- Planos antigos sem carga alvo continuam importáveis e legíveis.

## Escopo e impactos

- Reanalisar contrato canônico, unidade, validação, importação, persistência versionada, projeção e apresentação compacta no mobile.
- Preservar a imutabilidade das versões já importadas e planejar migração/rollback se o esquema mudar.
- Testar alvo único, alvos por série, ausência de alvo e exercícios sem carga.

## Fora de escopo

- Calcular ou recomendar cargas automaticamente.
- Mudar a carga realizada ou mover instruções de execução para o resumo.

## Decisões antes da implementação

- Definir a representação canônica dos dois modos de alvo e se há necessidade real de faixa ou outra unidade.
- Conferir valores disponíveis na fonte aprovada; não inventar cargas para o plano atual.
- Reanalisar o código vigente, apresentar solução e trade-offs e aguardar aprovação explícita antes de implementar.

## Critérios de aceite

- [ ] Os dois modos de alvo são representáveis e exibidos sem alterar resultados reais.
- [ ] Compatibilidade com planos antigos, unidades e ausência de alvo é demonstrada por testes.
- [ ] A solução aprovada tem migração e rollback quando necessários.

## Resultado

Ainda não iniciada.
