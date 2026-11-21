---
id: E05-T05
epic: E05
depends_on: [E05-T04]
---

# Validar backup e restauração

## Objetivo

Demonstrar recuperação dos dados em PostgreSQL local antes de depender de um provedor gerenciado.

## Entradas

- `docs/operations/E05.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `compose.yaml`
- `prisma/schema.prisma`
- `prisma/models/platform.prisma`
- `prisma/models/training.prisma`
- `prisma/models/nutrition.prisma`
- `prisma/migrations/20260913011504_initial_p0/migration.sql`
- `.env.example`
- `package.json`
- `.github/workflows/ci.yml`
- `.github/pull_request_template.md`
- `scripts/import-versioned-plan-definitions.ts`
- `scripts/validate-persisted-data.ts`
- `src/lib/db/test-database-configuration.types.ts`
- `src/lib/db/test-database-configuration.utils.ts`
- `src/features/plan-definition-import/data/read-plan-definitions-from-git.ts`
- `src/features/persisted-data-integrity/application/validate-persisted-data.ts`
- `src/features/persisted-data-integrity/data/prisma-persisted-data-reader.ts`
- `tests/integration/database.setup.ts`
- `tests/integration/fixtures/database.fixture.ts`
- `tests/integration/fixtures/import-database.fixture.ts`
- `vitest.integration.config.ts`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `CHANGELOG.md`

## Entregáveis

- `docs/operations/BACKUP-AND-RESTORE.md`
- Evidência de teste de restauração.

## Subtarefas

- [x] Executar `pg_dump` no PostgreSQL local de origem.
- [x] Restaurar com `pg_restore` em outro PostgreSQL local descartável.
- [x] Validar contagens, IDs e versão ativa.
- [x] Registrar duração, limitações e evidência; RPO/RTO gerenciado pertence a E08.
- [x] Isolar origem e destino em containers descartáveis sem tocar volumes existentes.
- [x] Automatizar o fluxo e sua limpeza com erros sanitizados.
- [x] Executar a prova em job dedicado da CI.

## Validações

- Restore local produz banco utilizável e íntegro.
- Nenhuma conta, branch ou credencial Neon é necessária nesta tarefa.

## Critérios de aceite

- [x] Procedimento local é repetível e não expõe credenciais.

## Resultado

Concluída na PR #42. O job `Backup restore` executou PostgreSQL 18.6 em dois
containers descartáveis, gerou dump custom de 151.376 bytes em 199 ms e restaurou
em 231 ms. O destino manteve migrations atuais, integridade persistida válida,
planos ativos, contagens globais e por workspace e todas as identidades do canário.
Os sete gates da PR passaram. A estação local não tinha engine Docker disponível;
a prova repetível foi executada no runner Linux isolado da CI. Neon, dados reais,
RPO/RTO gerenciado, retenção e restauração de produção permanecem fora do escopo.
