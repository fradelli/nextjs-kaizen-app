---
id: E12-T01
epic: E12
depends_on: [E00-T13]
---

# Sanear dependências e overrides

## Objetivo

Garantir que toda dependência use versão exata e que todo override do pnpm ainda corresponda a um pacote resolvido e a um motivo vigente.

## Contexto

Achados da auditoria de 2026-11-23:

- `lucide-react` usa `^1.71.0`, contrariando `save-exact=true` e a regra de versão exata da arquitetura.
- `pnpm-workspace.yaml` tem overrides com seletor `@prisma/config@7.10.0` e `prisma@7.10.0`, mas o lockfile resolve a 7.10.1; `mysql2` resolve para 3.24.4, e não para o 3.23.1 do override.
- `minimumReleaseAgeExclude` cita `@fradelli/ui@0.3.0 || 0.6.0`, enquanto o pacote vem de `vendor/`.

## Entradas

- `package.json` — `dependencies` e `devDependencies`.
- `pnpm-workspace.yaml` — `overrides` e `minimumReleaseAgeExclude`.
- `pnpm-lock.yaml` — versões resolvidas.
- `docs/architecture/TARGET-ARCHITECTURE.md` — seção "Stack escolhida".

## Entregáveis

- `package.json` só com versões exatas.
- `pnpm-workspace.yaml` com overrides que casam com o lockfile atual, cada um com o aviso de segurança correspondente, ou removidos quando o pacote pai já corrige.
- `minimumReleaseAgeExclude` atualizado.

## Subtarefas

- [ ] Fixar a versão do `lucide-react`.
- [ ] Conferir cada override contra o lockfile e o aviso de segurança.
- [ ] Remover ou atualizar overrides sem efeito.
- [ ] Atualizar exclusões de idade mínima.

## Validações

- `pnpm install --frozen-lockfile` e `pnpm audit --audit-level=moderate` passam.
- `pnpm why <pacote>` confirma a versão aplicada por cada override restante.

## Critérios de aceite

- [ ] Nenhuma dependência direta usa intervalo de versão.
- [ ] Nenhum override fica sem efeito ou sem motivo registrado.

## Resultado

Não iniciada.
