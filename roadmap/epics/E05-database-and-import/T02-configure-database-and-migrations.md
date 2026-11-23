---
id: E05-T02
epic: E05
depends_on: [E04-T03, E05-T01]
---

# Configurar banco e migrations

## Objetivo

Configurar o banco e o ORM aprovados com migrations reproduzíveis.

## Entradas

- `AGENTS.md`
- `compose.yaml`
- `tests/integration/database.setup.ts`
- `tests/integration/database.test.ts`
- `tests/integration/import-versioned-plan-definitions.test.ts`
- `tests/integration/fixtures/import-database.fixture.ts`
- `docs/operations/E05.md`
- `docs/architecture/DATA-MODEL.md`
- `docs/decisions/DATABASE-AND-ORM.md`
- `data/training-execution-metadata.json`
- `.env.example`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `src/lib/env/server.ts`
- `src/lib/env/server.test.ts`
- `vitest.config.ts`
- `vitest.setup.ts`
- `tsconfig.json`
- `eslint.config.mjs`
- `.gitignore`
- `.prettierignore`
- `.github/workflows/ci.yml`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `CHANGELOG.md`
- `prisma.config.ts`
- `prisma/schema.prisma`
- `src/lib/db/client.ts`
- `src/lib/db/environment.ts`
- `src/lib/db/environment.test.ts`

## Entregáveis

- `compose.yaml`, `prisma.config.ts`, `prisma/schema.prisma`, schemas de domínio em `prisma/models/` e configuração testável da CLI.
- `prisma/migrations/20260913011504_initial_p0/migration.sql` e `migration_lock.toml`.
- Client e configuração server-only em `src/lib/db/`, com testes unitários.
- Configuração Vitest Node e testes PostgreSQL em `tests/integration/`.
- Geração do Client e integração PostgreSQL nos gates locais/CI.
- Operação, deploy, recuperação e pendências documentados no guia.

## Subtarefas

- [x] Isolar URLs por ambiente.
- [x] Versionar migration inicial.
- [x] Impedir acesso do cliente ao banco.
- [x] Definir processo de deploy e rollback.

## Validações

- Banco vazio converge pela migration.
- Segredos não entram no Git ou bundle.

## Critérios de aceite

- [x] Local e teste usam configuração reproduzível.
- [x] Banco vazio converge e segunda aplicação não encontra migrations pendentes.
- [x] Testes reais validam ownership, versões, carga, medidas, refeições e histórico.
- [x] Gates locais completos passam, incluindo auditoria das novas dependências.

## Resultado

Em 14/09, schema dividido por domínio com equivalência dos 30 blocos confirmada,
sem modificar a migration. Configuração tipada e proteções puras da CLI separadas;
geração automática incluída nos comandos de desenvolvimento, build, tipos e testes.
Convenções registradas na arquitetura e referenciadas no AGENTS. Nova execução
validou 42 testes unitários, 10 testes PostgreSQL, 28 regressões dos validadores,
formato, lint, estrutura, tipos, dados e build. O `ci` falhou somente na auditoria
transitiva já registrada abaixo; Docker permanece pendente.

Implementação preparada para PR de revisão, com merge condicionado aos critérios
pendentes. Schema validado, Client gerado e migration
aplicada em dois bancos temporários PostgreSQL 18.6; segunda aplicação e status
confirmaram convergência. Testes unitários e PostgreSQL, tipos, lint, dados e build
foram executados. Containers locais ainda aguardam correção da inicialização do
Docker Desktop; Compose foi validado sem iniciar containers.

Após a falha da PR #36, a correção foi publicada e integrada separadamente pela
PR #37, baseada em `developer`. Override restrito a `@prisma/config@7.10.0`
resolve `deepmerge-ts@8.0.2`, com compatibilidade do uso concreto verificada.
Instalação congelada e `ci` completo passaram em duas cópias limpas:
`developer` + correção e E05-T02 + correção, com testes PostgreSQL reais.
Os dois findings de mysql2 continuam corrigidos pelo override restrito 3.23.1.
Nenhuma exceção de auditoria ou Prisma RC foi aplicado. Naquela execução,
a validação dos containers locais ainda impedia a conclusão.

### Encerramento da pendência Docker

Em 14/09/2026, Docker Desktop respondeu normalmente e o Compose foi executado
com PostgreSQL 18.6 Alpine real. O banco local ficou saudável em loopback na
porta 5432, com volume nomeado; o banco de teste ficou saudável na porta 5434,
com tmpfs independente. A porta 5433 estava ocupada por outro projeto, que foi
preservado. Adicionado `TEST_DATABASE_PORT` opcional com padrão 5433; as duas URLs
privadas de teste foram alinhadas à porta livre, sem alteração de credenciais.
Padrão e override do Compose foram validados sem expor o ambiente privado.

O banco local iniciou sem tabelas públicas. `db:deploy` aplicou a migration;
segunda execução e `db:status` confirmaram convergência. Reiniciar o container
local preservou identidade e checksum da migration no volume. O banco de teste
recebeu a mesma migration e também confirmou ausência de pendências. As fixtures
de importação foram removidas dos schemas isolados ao concluir; desenvolvimento
permaneceu sem lotes importados ou execuções pessoais criadas pelos testes.

Instalação congelada e `pnpm run ci` completo passaram: 85 testes unitários,
17 integrações PostgreSQL, 29 regressões de scripts, formato, lint, estrutura,
tipos, dados, build e auditoria sem findings. Ambos os serviços permanecem
saudáveis para uso local. Nenhum volume foi apagado, migration alterada ou
container de outro projeto interrompido. A pendência Docker está encerrada.
