---
id: E05-T07
epic: E05
depends_on: [E05-T04]
---

# Aprimorar semântica e fronteiras do código

## Objetivo

Tornar o importador e a auditoria persistida legíveis por conceitos de negócio,
com tipos explícitos, responsabilidades coesas e fronteiras arquiteturais
verificadas automaticamente.

## Entradas

- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/operations/E05.md`
- `src/features/plan-definition-import/domain/plan-definition-import.types.ts`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `src/features/plan-definition-import/domain/plan-definition-import.error.ts`
- `src/features/plan-definition-import/data/read-plan-definitions-from-git.ts`
- `src/features/plan-definition-import/data/plan-definition.mapper.ts`
- `src/features/plan-definition-import/data/plan-definition-persistence.types.ts`
- `src/features/plan-definition-import/data/plan-definition-persistence.utils.ts`
- `src/features/plan-definition-import/data/plan-definition-snapshot-validation.rules.ts`
- `src/features/plan-definition-import/data/activate-selected-plan-definitions.ts`
- `src/features/plan-definition-import/data/persist-reviewed-exercise-definitions.ts`
- `src/features/plan-definition-import/data/persist-training-plan-definition.ts`
- `src/features/plan-definition-import/data/persist-nutrition-plan-definition.ts`
- `src/features/plan-definition-import/data/plan-definition-import-validation.test.ts`
- `src/features/persisted-data-integrity/application/validate-persisted-data.ts`
- `src/features/persisted-data-integrity/application/validate-persisted-data.test.ts`
- `src/features/persisted-data-integrity/application/validate-imported-source-commits.test.ts`
- `src/features/persisted-data-integrity/application/validate-persisted-data.fixture.ts`
- `src/features/persisted-data-integrity/domain/persisted-data-integrity.types.ts`
- `src/features/persisted-data-integrity/domain/definition-parity.utils.ts`
- `src/features/persisted-data-integrity/domain/import-provenance-integrity.rules.ts`
- `src/features/persisted-data-integrity/domain/training-definition-integrity.rules.ts`
- `src/features/persisted-data-integrity/domain/nutrition-definition-integrity.rules.ts`
- `src/features/persisted-data-integrity/data/prisma-persisted-data-reader.ts`
- `src/features/persisted-data-integrity/data/persisted-data-integrity-cli.utils.ts`
- `src/features/persisted-data-integrity/data/persisted-data-integrity-cli.utils.test.ts`
- `scripts/validate-persisted-data.ts`
- `scripts/validate-component-structure.mjs`
- `scripts/validate-component-structure.test.mjs`
- `tests/integration/import-versioned-plan-definitions.test.ts`
- `tests/integration/persisted-data-integrity.test.ts`
- `package.json`
- `vitest.config.ts`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `roadmap/epics/E05-database-and-import/README.md`
- `CHANGELOG.md`
- `.github/pull_request_template.md`

## Entregáveis

- Contratos tipados e mapeamento explícito entre Prisma e domínio.
- Regras de integridade separadas por entidade e fixtures restritas a testes.
- Taxonomia pública de falhas da CLI sem vazamento de detalhes internos.
- Gate automatizado de dependências entre camadas e fronteiras Client/Server.

## Subtarefas

- [x] Tipar cada projeção persistida e mapear Prisma explicitamente.
- [x] Tornar as fontes do importador uma união discriminada e tipar contadores.
- [x] Separar regras de paridade por entidade e mover fixtures para testes.
- [x] Distinguir argumentos, fonte e infraestrutura nos erros da CLI.
- [x] Impedir imports entre camadas incompatíveis por gate automatizado.
- [x] Documentar as convenções como regra permanente da arquitetura.

## Validações

- Formato, lint, estrutura, fronteiras, tipos, cobertura, dados, build e audit.
- Integrações PostgreSQL executadas na CI da PR em ambiente descartável.

## Critérios de aceite

- [x] Código de produção não usa casts duplos para descobrir formatos canônicos.
- [x] Tipos Prisma permanecem na camada de dados.
- [x] Regras de treino e alimentação revelam sua entidade responsável pelo nome.
- [x] Imports arquiteturalmente incompatíveis falham no gate local e na CI.

## Resultado

Implementação concluída. A suíte unitária possui 150 testes, a integração possui
30 casos PostgreSQL e os validadores de CI possuem 32 regressões. Os seis checks
da PR #41 aprovaram governança, qualidade, testes, integridade dos dados, build e
auditoria de dependências. A integração local ficou indisponível porque o engine
Docker Desktop não iniciou, sem substituir ou enfraquecer a validação remota.
