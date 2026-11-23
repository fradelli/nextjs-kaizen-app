---
id: E06-T23
epic: E06
depends_on: [E06-T12]
---

# Registrar futevôlei e atividades externas retrospectivamente

## Escopo implementado

Registro direto de práticas esportivas e treinos específicos em hoje e ontem,
sem cronômetro, horários reais ou aquecimento obrigatório. Preparação opcional
consultável; formulário de registro somente no fim do cartão expandido.

## Objetivo

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo implementado».

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `src/app/workout/training-actions.ts`
- `src/features/training/application/mutate-training-day.ts`
- `src/features/training/application/training-mutation.types.ts`
- `src/features/training/data/prisma-training-repository.ts`
- `src/features/training/domain/training-retrospective-record.rules.ts`
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`
- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`
- `prisma/migrations/20261004120000_allow_retrospective_external_activity/migration.sql`
- `tests/integration/training-mutations.test.ts`

## Entregáveis

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Escopo implementado».

## Subtarefas

Não registrado na versão original desta tarefa.

## Validações

Não registrado na versão original desta tarefa.

## Critérios de aceite

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Aceite e resultado».

## Resultado

Não registrado na versão original desta tarefa; conteúdo equivalente na seção «Aceite e resultado».

## Aceite e resultado

- [x] Registro sem execução guiada; horários desconhecidos permanecem ausentes.
- [x] Aquecimento opcional visível, sem bloquear o registro.
- [x] Registro oculto no cartão recolhido e na última posição quando expandido.
- [x] Workspace fixo, ownership, revisão e bloqueio de conclusão futura preservados.
- [x] Migration aditiva aplicada no PostgreSQL local em 04/10/2026.
- [x] Integrações PostgreSQL e checks das PRs #61 e #62 aprovados.

Implementação autorizada e revisada pelo usuário na conversa. Atualização de
`developer` com a E06-T22 incorporada sem ampliar a janela retrospectiva.
Testes, integrações PostgreSQL, backup/restore, build, qualidade, dados e governança
passaram na primeira CI da PR #61. A auditoria falhou com 17 achados.
Correções de Next.js 16.3.8 e transitivos reduziram a auditoria local a um achado
alto em `braces` 3.0.3, dependência de desenvolvimento sem patch publicado
([GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm)). A PR #62
adiciona um fork interno baseado no commit revisado
`28d440b5dd449dbf1fe6f3506cf94ecca4d02660`, com limites de profundidade. O fork
está identificado e documentado em `vendor/braces/README.kaizen.md`.
Instalação congelada, lint, formatação, auditoria sem achados, 291 testes do app
e 904 testes do pacote passaram localmente. A CI completa das PRs #61 e #62 passou
em 12/10/2026, incluindo PostgreSQL, backup/restore e build. A jornada manual
completa permanece pendente; nenhum documento de planejamento acompanha a entrega.
