---
id: E12-T11
epic: E12
depends_on: [E12-T07]
---

# Endurecer as opções estritas do TypeScript

## Objetivo

Ativar `noUncheckedIndexedAccess` e `noImplicitOverride` e eliminar as asserções não nulas que essas opções tornam desnecessárias.

## Contexto

`tsconfig.json` usa `strict: true` sem `noUncheckedIndexedAccess`. O código compensa com `!` em leituras de `Map` e de índices, por exemplo `cache.listPages.get("current")!` em `use-schedule-entities.ts` e `exercises[key]!` em `use-training-activity-draft.ts`. Há também um `as unknown as` em `src/features/schedule/data/prisma-schedule-repository.ts`.

## Entradas

- `tsconfig.json` — opções do compilador.
- `docs/architecture/TARGET-ARCHITECTURE.md` — seção "Stack escolhida" (Linguagem).
- Saída de `pnpm typecheck` com as opções ativadas.

## Entregáveis

- `tsconfig.json` com as novas opções.
- Correções por tratamento explícito de ausência, sem silenciar erros.
- Regra de lint contra asserção não nula, se o volume restante permitir.

## Subtarefas

- [ ] Ativar as opções e medir os erros.
- [ ] Corrigir por módulo, começando pelo domínio.
- [ ] Remover o `as unknown as`.
- [ ] Avaliar a regra de lint.

## Validações

- `pnpm typecheck`, `pnpm lint` e `pnpm test` passam.
- `git grep -c ')!' -- src` diminui e cada uso restante tem justificativa.

## Critérios de aceite

- [ ] As duas opções estão ativas.
- [ ] Nenhum erro foi silenciado com `@ts-expect-error` ou `as`.

## Resultado

Não iniciada.
