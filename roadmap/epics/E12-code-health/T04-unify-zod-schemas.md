---
id: E12-T04
epic: E12
depends_on: [E12-T03]
---

# Unificar os schemas Zod entre cliente e servidor

## Objetivo

Ter um schema Zod por contrato, do qual derivam os tipos, a validação da Server Action e o parse dos rascunhos no navegador.

## Contexto

Achados da auditoria de 2026-11-23:

- O enum de tipo de atividade aparece em `src/app/workout/training-actions.ts` e em `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.schema.ts`.
- Os enums `intensity` e `energy` aparecem na action e em `src/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft.ts`.
- O rascunho de execução tem schema Zod na action e, no cliente, o type guard manual `isTrainingActivityDraft` em `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils.ts`, que valida menos campos.
- `training-activity-editor-draft.schema.ts` usa `.strict()`, considerado legado no Zod 4 (substituto: `z.strictObject()`).
- A regra de `days` entre 1 e 14 se repete em `src/app/workout/page.tsx`, em `calendar-range.tsx` e em `training-date-navigation.tsx`.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Stack escolhida" (Validação), "Boundaries" e "Server Actions".
- `src/app/workout/training-actions.ts` — schemas da fronteira.
- `src/features/training/ui/lib/training-activity-editor-draft/training-activity-editor-draft.schema.ts` e `src/features/training/ui/lib/training-activity-completion-draft/training-activity-completion-draft.ts` — schemas do cliente.
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils.ts` — type guard manual.
- `src/app/workout/page.tsx` — parse de `searchParams`.

## Entregáveis

- Módulo de schemas compartilhados da feature, importável por cliente e servidor sem dependência server-only.
- Action, rascunhos e leitura do localStorage usando os mesmos schemas.
- `z.strictObject()` no lugar de `.strict()`.
- Schema único de `searchParams` da rota de treino usado pela página e pelos componentes.

## Subtarefas

- [ ] Definir o local dos schemas compartilhados respeitando as dependências permitidas.
- [ ] Extrair enums e objetos comuns.
- [ ] Substituir o type guard manual pelo `safeParse` do schema.
- [ ] Trocar as APIs legadas do Zod 4.
- [ ] Centralizar o parse de `searchParams`.

## Validações

- `pnpm typecheck`, `pnpm test` e `pnpm structure:check` passam.
- `git grep '"structured_training", "sport_practice"'` retorna um único local de definição.
- Testes cobrem rascunho inválido no localStorage e `days` fora do intervalo.

## Critérios de aceite

- [ ] Cada contrato tem uma única definição Zod.
- [ ] Nenhum type guard manual substitui schema existente.
- [ ] Nenhum uso de API legada do Zod 4 permanece.

## Resultado

Não iniciada.
