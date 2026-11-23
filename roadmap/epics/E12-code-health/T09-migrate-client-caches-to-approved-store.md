---
id: E12-T09
epic: E12
depends_on: [E12-T08]
---

# Migrar os caches da agenda e o rascunho de treino para a store aprovada

## Objetivo

Substituir os caches de cliente feitos à mão pelo padrão de estado aprovado na E12-T08, preservando o comportamento de concorrência e de rascunho.

## Contexto

Os três pontos identificados na auditoria de 2026-11-23 são `use-schedule-entities.ts`, `use-calendar-days.ts` e `use-training-activity-draft.ts`. O rascunho de treino também usa `window.confirm` nativo para pausar outra atividade, fora do design system; a agenda já tem o componente `schedule-confirm`.

Se a E12-T08 rejeitar Zustand, esta tarefa aplica a alternativa aprovada ou é cancelada com a decisão registrada.

## Entradas

- Decisão aprovada pela E12-T08 em `docs/decisions/`.
- `docs/architecture/TARGET-ARCHITECTURE.md` — seção "Client Components".
- `src/features/schedule/ui/components/schedule-workspace/` — contexts e hooks.
- `src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts`.
- `src/features/training/ui/hooks/use-training-activity-draft/`.
- `src/features/schedule/ui/components/schedule-confirm/schedule-confirm.tsx` — confirmação existente.

## Entregáveis

- Store da agenda com seletores, substituindo os três contexts e o `useMemo` agregado.
- Cache de dias do calendário na mesma abordagem, mantendo épocas e cancelamento.
- Rascunho de treino com persistência local e sincronização entre abas, sem `CustomEvent` próprio nem varredura manual do localStorage.
- Confirmação de pausa com diálogo do design system.

## Subtarefas

- [ ] Instalar a dependência aprovada com versão exata.
- [ ] Migrar a agenda e remover os contexts.
- [ ] Migrar o cache do calendário.
- [ ] Migrar o rascunho de treino e a confirmação.
- [ ] Manter ou ampliar os testes atuais de regressão.

## Validações

- `pnpm test`, `pnpm typecheck` e `pnpm structure:check` passam.
- Testes cobrem conflito de revisão, rascunho em outra aba e falha de armazenamento.
- Conferência manual em duas abas mostra a pausa e a retomada sincronizadas.

## Critérios de aceite

- [ ] Nenhum cache de cliente usa `useReducer` apenas para forçar renderização.
- [ ] Nenhum `window.confirm` permanece em código de produto.
- [ ] O comportamento observável é o mesmo de antes.

## Resultado

Não iniciada.
