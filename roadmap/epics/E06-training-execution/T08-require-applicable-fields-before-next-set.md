---
id: E06-T08
epic: E06
depends_on: [E06-T03]
---

# Exigir medidas aplicáveis antes de avançar a série

## Objetivo

Alinhar a navegação entre séries aos campos exigidos pelo exercício, preservando a possibilidade de voltar e corrigir séries anteriores.

## Contexto conhecido

Na E06-T03, o avanço já exige medida positiva da série atual e trata `0` como não realizado, mas não verifica se a carga foi preenchida quando `loadApplicable` é verdadeiro.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils.ts`
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/application/training-dto.ts`

## Comportamento esperado

- Repetições ou medidas aplicáveis devem ser positivas para liberar a série seguinte; vazio e `0` não liberam.
- Quando o exercício usa carga, a carga também precisa ser válida e positiva; exercício sem carga não mostra nem exige o campo.
- Séries anteriores permanecem acessíveis e editáveis; finalizar o treino ainda pode persistir séries vazias como zero segundo a regra existente.

## Escopo e impactos

- Revisar validação da UI e do servidor para evitar regras divergentes.
- Cobrir medidas bilaterais, tempo, contatos e direções, sem presumir que todo exercício usa repetições.
- Testar regressão de preenchimento, avanço e retorno.

## Fora de escopo

- Salvar cada série separadamente ou interpretar zero como melhoria de desempenho.

## Decisões antes da implementação

- Confirmar como cargas assistidas, barra sem anilhas ou outras medidas especiais seriam representadas; não aceitar `0 kg` silenciosamente para avançar no contrato atual.
- Reanalisar o código vigente, apresentar solução e trade-offs e aguardar aprovação explícita antes de implementar.

## Critérios de aceite

- [ ] O avanço respeita todos os campos aplicáveis, inclusive carga quando houver.
- [ ] Zero e vazio permanecem equivalentes para bloqueio de avanço, sem impedir a finalização com séries zeradas.
- [ ] Testes cobrem exercícios com e sem carga e doses não convencionais.

## Resultado

Cancelada pela decisão explícita de edição independente na E06-T26. Não exigir sequência nem carga positiva como condição nova de avanço; confirmação exige as medidas válidas aplicáveis.
