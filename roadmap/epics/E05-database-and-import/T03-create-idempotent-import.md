---
id: E05-T03
epic: E05
depends_on: [E05-T02]
---

# Criar importação idempotente

## Objetivo

Importar a fundação documental sem duplicar ou alterar silenciosamente os dados.

## Entradas

- `AGENTS.md`
- `.github/pull_request_template.md`
- `docs/operations/E05.md`
- `docs/decisions/DATA-SOURCE-TRANSITION.md`
- `docs/migration/MIGRATION-MANIFEST.md`
- `data/active.json`
- `data/nutrition/active.json`
- `prisma/schema.prisma`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/architecture/DATA-MODEL.md`
- `prisma/models/platform.prisma`
- `prisma/models/training.prisma`
- `prisma/models/nutrition.prisma`
- `src/lib/db/client.ts`
- `src/lib/db/environment.ts`
- `src/lib/env/server.ts`
- `data/exercises.json`
- `data/training-execution-metadata.json`
- `data/plans/2026-08-performance-v1.json`
- `data/plans/2026-08-performance-v2.json`
- `data/nutrition/plans/2026-09-personal-v1.json`
- `schemas/exercise-library.schema.json`
- `schemas/training-execution-metadata.schema.json`
- `schemas/training-plan.schema.json`
- `schemas/nutrition-plan.schema.json`
- `scripts/validate-data.mjs`
- `scripts/validate-data.test.mjs`
- `tests/integration/database.setup.ts`
- `tests/integration/database.test.ts`
- `tests/integration/fixtures/database.fixture.ts`
- `vitest.config.ts`
- `vitest.integration.config.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `.github/workflows/ci.yml`
- `.env.example`
- `.prettierignore`
- `roadmap/README.md`
- `roadmap/ACTIVE.md`
- `CHANGELOG.md`

## Autorização de sequência

Em 14/09/2026, o proprietário autorizou implementar com PostgreSQL real,
mantendo a validação dos containers como pendência explícita da E05-T02.
Essa exceção de sequência não conclui o critério pendente nem dispensa gates.

## Entregáveis

- Importador e relatório de execução definidos no guia.

## Subtarefas

- [x] Validar antes de gravar.
- [x] Usar IDs e versões estáveis.
- [x] Registrar origem e hash.
- [x] Fazer transação onde a consistência exigir.

## Validações

- Segunda execução não cria duplicatas.
- Falha intermediária não deixa versão parcial ativa.

## Critérios de aceite

- [x] Contagens e relações coincidem com a origem.

## Resultado

Implementada CLI `pnpm data:import --environment local`, com seleção do commit
fixado, validação compartilhada e persistência server-only sem endpoint ou UI.
Lotes preservam documentos originais, SHA-256 e origem; versões são insert-only,
e os ponteiros controlam ativações atômicas com histórico.

Primeira execução real em banco local descartável: 7 lotes, 38 exercícios
revisados, 2 versões de treino, 14 sessões, 87 prescrições, 1 versão alimentar,
5 refeições, 20 opções, 6 tipos de dia, 30 vínculos e 2 ativações. Segunda
execução: `no-op`, sem novos registros ou ativações.

Gates locais completos passaram, incluindo 85 testes unitários/validador com
cobertura acima de 80%, 17 testes de integração em PostgreSQL real, 29 regressões
de scripts, formato, lint, estrutura, tipos, dados, build e auditoria sem findings.
Testes verificam versão nova com ID estável, conflito, rollback real, concorrência,
referências alimentares, ponteiros inválidos, ciclos e preservação operacional.

Documentação operacional em `docs/operations/E05.md`. Não foram alterados
planos JSON, schemas, migration, shells, dados pessoais ou infraestrutura externa.
A validação Docker continua pendente na E05-T02; a autorização de sequência
não a declara concluída.

Refinamento semântico autorizado: feature `plan-definition-import`, caso de uso
`importVersionedPlanDefinitions`, etapas de persistência separadas recebendo a
mesma transação e mapeadores explícitos. Manifesto convertido em propriedades
nomeadas, regras de validação separadas e CLI sem validação duplicada. O cliente
do banco só é criado depois da validação; código de erro e relatório mantidos.
Gates completos reexecutados após o refinamento, incluindo regressões de
publicação do manifesto, validação única e smoke da CLI sobre dados existentes
com resultado `no-op`.

Registrada convenção permanente de semântica e legibilidade na arquitetura, com
referência obrigatória no AGENTS e checklist de revisão semântica no template de
PR, conforme solicitação do proprietário. A convenção orienta nomes, responsabilidades,
formatos externos, testes e preservação de fronteiras e atomicidade.
