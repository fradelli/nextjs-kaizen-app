---
id: E05-T01
epic: E05
depends_on: [E03-T05]
---

# Modelar treino e alimentação

## Objetivo

Modelar somente entidades, relações e constraints exigidas pelo P0.

## Entradas

- `docs/operations/E05.md`
- `docs/product/P0.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/decisions/DATABASE-AND-ORM.md`
- `data/active.json`
- `data/exercises.json`
- `data/nutrition/active.json`
- `data/plans/2026-08-performance-v2.json`
- `data/plans/2026-08-performance-v1.json`
- `data/nutrition/plans/2026-09-personal-v1.json`
- `schemas/training-plan.schema.json`
- `schemas/nutrition-plan.schema.json`
- `schemas/README.md`
- `docs/decisions/DATA-SOURCE-TRANSITION.md`
- `docs/decisions/PRIVACY-AND-OPERATIONS.md`
- `scripts/validate-data.mjs`
- `scripts/validate-data.test.mjs`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `CHANGELOG.md`

## Entregáveis

- `docs/architecture/DATA-MODEL.md`
- `data/training-execution-metadata.json`
- `schemas/training-execution-metadata.schema.json`
- Integração dos metadados em `scripts/validate-data.mjs` e suas regressões.
- Cobertura documentada em `schemas/README.md` e evidência no roadmap/changelog.

## Subtarefas

- [x] Mapear IDs, versões, status e proveniência.
- [x] Modelar definições, ativações, atribuições e execuções de treino e alimentação.
- [x] Modelar rate limit sem armazenar chave de pareamento ou IP bruto.
- [x] Definir unicidade e integridade referencial.
- [x] Classificar medição e aplicabilidade de carga de todo exercício usado, sem default por inferência.
- [x] Excluir domínios futuros.

## Validações

- Cada campo deriva de dado ou requisito aprovado.
- Schema estrito, coverage dos dois planos históricos e normalizações explícitas passam em `pnpm data:check`.
- Regressões cobrem carga, unidade, medição, referências, duplicação e doses não revisadas.
- Constraints relacionais estão especificadas; sua execução real em PostgreSQL pertence às próximas tarefas.

## Critérios de aceite

- [x] Modelo representa treino e alimentação sem duplicar fontes.
- [x] As 18 entidades têm colunas, relações, uniques, checks, índices e políticas de exclusão.
- [x] Todos os 38 exercícios usados nos planos versionados possuem metadados revisados.
- [x] Nenhuma dependência, banco, migration, endpoint ou Client foi criado.

## Resultado

Implementação concluída: modelo relacional especificado e metadados
dos 38 exercícios integrados ao validador de dados. Planos e biblioteca permanecem
intactos. Os gates locais de `pnpm run ci` passaram, incluindo regressões, integridade
dos dados, build e auditoria de dependências. E05-T02 está pronta, mas não foi iniciada.
