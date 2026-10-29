---
id: E06-T07
epic: E06
depends_on: [E06-T03]
---

# Mostrar a última execução de cada série

## Objetivo

Dar referência de progressão ao mostrar, na série atual, o resultado da série de mesmo número na última execução concluída do mesmo exercício.

## Contexto conhecido

A E06-T03 persiste exercícios e séries por atividade, mas a leitura do dia consulta somente as execuções daquela data. A identidade estável do exercício entre versões do plano precisa ser confirmada, sem usar apenas o nome.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `prisma/models/training.prisma`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/application/get-training-day.ts`
- `src/features/training/application/training-dto.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`

## Comportamento esperado

- A série 1 mostra a série 1 da última execução concluída do mesmo exercício; a série 2 mostra a série 2, e assim por diante.
- A referência é informativa: o usuário pode manter, melhorar ou reduzir o resultado.
- Sem histórico ou sem série correspondente, não há valor inventado.
- Exercícios sem carga mostram apenas as medidas aplicáveis.

## Escopo e impactos

- Investigar a identidade canônica de exercícios entre planos, versões e sessões; avaliar reuso de `ExerciseDefinition` existente antes de propor outra entidade.
- Definir consulta eficiente, ordenação por conclusão real, ownership do workspace e projeção mínima para a UI.
- Cobrir mudança na quantidade de séries, séries zeradas, atividade excluída e mais de uma sessão no mesmo dia.

## Fora de escopo

- Exigir progressão, alterar prescrições ou criar gráficos históricos.
- Refatorar todo o catálogo de exercícios sem necessidade comprovada.

## Decisões antes da implementação

- Definir se a última execução com série zerada conta como referência ou se a busca recua para a última série efetivamente realizada.
- Confirmar a chave estável do exercício e o desempate de execuções no mesmo dia.
- Reanalisar o código vigente, apresentar solução e trade-offs e aguardar aprovação explícita antes de implementar.

## Critérios de aceite

- [ ] A referência por número de série é correta entre versões compatíveis e não vaza dados de outro workspace.
- [ ] Casos sem histórico, com séries diferentes e sem carga são claros e testados.
- [ ] A consulta não torna a página diária desnecessariamente lenta.

## Resultado

Escopo incorporado à E06-T26 com correspondência por tipo (aquecimento/trabalho), entre treinos, aprovada pelo usuário. Não implementar outra referência paralela.
