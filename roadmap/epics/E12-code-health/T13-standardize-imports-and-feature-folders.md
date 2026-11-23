---
id: E12-T13
epic: E12
depends_on: [E12-T09]
---

# Padronizar imports e estrutura de pastas das features

## Objetivo

Uniformizar imports e a organização física das features e dos testes, com validação automática para manter o padrão.

## Contexto

Achados da auditoria de 2026-11-23:

- A agenda mistura 45 imports com `@/` e 42 relativos com três ou mais `../`; o treino, 116 e 43.
- `src/features/foundations` usa `components/`, enquanto as demais features usam `ui/components/`.
- `training-day-page` chega a sete níveis de `components/` (por exemplo `training-session/components/training-exercise/components/training-local-exercise-editor`).
- A lógica de rascunho está dividida entre `src/features/training/ui/hooks/use-training-*-draft` e `src/features/training/ui/lib/training-*-draft`.
- `tests/training-detail-route.test.tsx` está solto na raiz de `tests/`, e `tests/unit/` só tem fixtures.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md` — seções "Estrutura de diretórios alvo" e "Organização dos componentes React".
- `scripts/validate-component-structure.mjs` e `scripts/validate-layer-boundaries.mjs` — gates de estrutura.
- `eslint.config.mjs` — regras de import.

## Entregáveis

- Regra de import definida (alias `@/` entre pastas e relativo só para arquivos irmãos ou filhos) e aplicada por lint.
- `foundations` no mesmo formato das outras features.
- Componentes que não são filhos privados movidos para níveis mais rasos.
- Rascunhos de treino num único local por responsabilidade.
- `tests/` organizado por tipo, com fixtures junto de quem as usa.

## Subtarefas

- [ ] Definir e configurar a regra de import.
- [ ] Corrigir imports automaticamente.
- [ ] Reorganizar `foundations`, `training-day-page` e rascunhos.
- [ ] Reorganizar `tests/`.
- [ ] Ampliar o gate de estrutura para profundidade máxima, se aprovado.

## Validações

- `pnpm lint`, `pnpm structure:check`, `pnpm typecheck` e `pnpm test` passam.
- `git grep -E 'from "(\.\./){3,}' -- src` não retorna resultado.

## Critérios de aceite

- [ ] Todas as features seguem a mesma estrutura de pastas.
- [ ] A regra de import é aplicada pelo lint.

## Resultado

Não iniciada.
