---
id: E05-T04
epic: E05
depends_on: [E05-T03]
---

# Testar integridade persistida

## Objetivo

Provar joins, constraints, versão ativa e proveniência contra banco real de teste.

## Entradas

- `docs/operations/E05.md`
- `docs/architecture/DATA-MODEL.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `prisma/schema.prisma`
- `prisma/models/platform.prisma`
- `prisma/models/training.prisma`
- `prisma/models/nutrition.prisma`
- `prisma/migrations/20260913011504_initial_p0/migration.sql`
- `src/features/plan-definition-import/domain/plan-definition-import.types.ts`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `src/features/plan-definition-import/application/import-versioned-plan-definitions.ts`
- `src/features/plan-definition-import/data/read-plan-definitions-from-git.ts`
- `src/features/plan-definition-import/data/validate-plan-definition-snapshot.ts`
- `src/features/plan-definition-import/data/prisma-plan-definition-import-repository.ts`
- `src/features/plan-definition-import/data/plan-definition.mapper.ts`
- `src/features/plan-definition-import/data/persist-source-import-batches.ts`
- `src/features/plan-definition-import/data/persist-reviewed-exercise-definitions.ts`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/plan-definition-import/data/persist-nutrition-plan-definition.ts`
- `src/features/plan-definition-import/data/activate-selected-plan-definitions.ts`
- `tests/integration/import-versioned-plan-definitions.test.ts`
- `tests/integration/database.test.ts`
- `tests/integration/database.setup.ts`
- `tests/integration/fixtures/database.fixture.ts`
- `tests/integration/fixtures/import-database.fixture.ts`
- `vitest.config.ts`
- `vitest.integration.config.ts`
- `package.json`
- `compose.yaml`
- `.env.example`
- `.github/workflows/ci.yml`
- `scripts/import-versioned-plan-definitions.ts`
- `scripts/validate-governance.mjs`
- `roadmap/README.md`
- `CHANGELOG.md`
- `src/features/persisted-data-integrity/application/validate-persisted-data.ts`
- `src/features/persisted-data-integrity/data/prisma-persisted-data-reader.ts`
- `src/lib/db/test-database-configuration.utils.ts`
- `scripts/validate-persisted-data.ts`
- `tests/integration/persisted-data-integrity.test.ts`
- `tests/integration/persisted-data-concurrency.test.ts`

## Entregáveis

- Testes de integração e relatório de paridade.

## Subtarefas

- [x] Testar plano ativo e referências.
- [x] Testar duplicação e ausência de pai.
- [x] Comparar contagens e campos relevantes.
- [x] Testar rollback da importação.
- [x] Auditar projeções e proveniência em snapshot somente leitura consistente.
- [x] Distinguir banco vazio de paridade válida, sem expor dados operacionais.
- [x] Validar conflitos de revisão com duas conexões reais.
- [x] Executar CLI em schema descartável preparado pela integração.

## Validações

- Testes rodam em ambiente descartável e falham para dados inválidos.

## Critérios de aceite

- [x] Banco preserva as invariantes do repositório.

## Resultado

Implementado auditor server-only somente leitura, com regras puras de paridade,
DTOs sem Prisma, hash dos bytes Git e confirmação da origem no commit de primeira
importação. Relatório distingue `valid`, `invalid` e `not-imported`, sem incluir
valores, documentos, UUIDs ou strings de conexão. Seu escopo é o conjunto canônico
de definições do commit selecionado; não certifica fontes históricas não
selecionadas nem varre dados operacionais privados.

CLI protegida pelo destino loopback `kaizen_test`, sem fallback operacional,
importação, migration ou reparo. Integração prepara schema aleatório, importa,
executa a CLI e remove somente o schema validado. Casos de revisão concorrente
usam dois Clients independentes e exigem um vencedor e um conflito, preservando
campos e vínculos do vencedor. Testes prévios de rollback e história mantidos.

`pnpm run ci` aprovado: 144 testes unitários/validadores, 30 integrações PostgreSQL,
29 regressões dos scripts, formato, lint, estrutura, tipos, dados, build e audit
sem vulnerabilidades conhecidas. Migration inicial, JSONs aprovados, shells e
volumes preservados. Implementação local aguardando validação e autorização de
commit/PR. Conclusão Docker anterior já integrada pela PR #39.
