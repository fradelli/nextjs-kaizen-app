---
id: E06-T01
epic: E06
depends_on: [E05-T05]
---

# Projetar treino e execução do dia

## Objetivo

Criar projeções server-side separadas para leitura pública do plano e leitura operacional do treino e da execução da data no workspace fixo.

## Entradas

- `docs/history/implementation/E06.md`
- `docs/product/P0.md`
- `docs/architecture/DATA-MODEL.md`
- `docs/architecture/TARGET-ARCHITECTURE.md`
- `docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`
- `data/active.json`
- `data/exercises.json`
- `src/lib/security/workspace.ts`
- `src/lib/env/server.ts`
- `src/lib/db/client.ts`
- `src/features/plan-definition-import/domain/plan-definition-source.types.ts`
- `src/features/plan-definition-import/data/plan-definition.mapper.ts`
- `prisma/schema.prisma`
- `prisma/models/platform.prisma`
- `prisma/models/training.prisma`
- `tests/integration/fixtures/database.fixture.ts`
- `tests/integration/fixtures/import-database.fixture.ts`

## Entregáveis

- DTO público do plano ativo, sem estado operacional.
- DTO discriminado do dia no workspace fixo, com atribuição, preparação, séries,
  comentários, status e revisões persistidas.
- Casos de uso de leitura independentes de Prisma e adaptador Prisma server-only.
- Testes unitários e integração PostgreSQL cobrindo histórico e isolamento.

## Decisões de implementação

- A projeção pública resolve `PlanActivation` de domínio `training` no
  `APP_ENV` atual e usa somente a versão ativa não superseded.
- A projeção do dia resolve o workspace por `resolveFixedWorkspace()`; sua API
  pública recebe a data civil, nunca `workspace_id`.
- Dia atribuído usa a versão vinculada à atribuição/execução. Trocar a ativação
  não altera a projeção histórica.
- Dia sem atribuição retorna estado `unassigned` e as sessões selecionáveis da
  versão ativa; não infere agenda a partir de nomes, horários ou dia da semana.
- Estados `training`, `mobility`, `rest` e `unassigned` formam uma união
  discriminada. Campos impossíveis não aparecem como opcionais genéricos.
- Prescrições são a base da projeção. Execuções existentes são sobrepostas por
  identidade; série ainda não persistida aparece `pending` com valores `null`,
  sem criar linha no banco.
- Preparação permanece separada do treino principal. Mobilidade não recebe
  séries ou carga inventadas e descanso não cria exercícios artificiais.
- Exercícios seguem `ordinal`; séries seguem `set_number`; sessões selecionáveis
  usam ordenação estável por identificador. Empates ou referências incoerentes
  retornam erro tipado em vez de uma projeção parcial ambígua.
- `normalized_dose`, `definition` e `Decimal` do Prisma são convertidos na
  fronteira de dados. Tipos gerados, JSON bruto e objetos Prisma não atravessam
  para aplicação ou UI.
- `null` de origem continua `null`. Ausência não vira zero, texto vazio, carga
  corporal ou recomendação inferida.
- As leituras relacionadas do dia usam snapshot consistente no PostgreSQL. A
  tarefa não grava, não cria atribuição e não materializa execução ausente.

## Plano por arquivo

### Domínio

- Criar `src/features/training/domain/training-day.types.ts` com data civil,
  kinds, status, medidas e read models internos sem dependência de Prisma.
- Criar `src/features/training/domain/training-day.rules.ts` para validar data
  `YYYY-MM-DD`, dose normalizada e coerência entre medição, lados e carga.
- Criar `src/features/training/domain/training-projection.error.ts` com códigos
  estáveis para plano ausente, ativação inválida e referência incoerente.
- Adicionar testes unitários ao lado das regras e erros que possuam comportamento.

### Aplicação

- Criar `src/features/training/application/training-dto.ts` com os contratos
  serializáveis `PublicTrainingPlanDto` e `TrainingDayDto` discriminado.
- Criar `src/features/training/application/training-repository.ts` com a menor
  porta de leitura necessária aos dois casos de uso.
- Criar `src/features/training/application/get-public-training-plan.ts` e seu
  arquivo de tipos para resolver a ativação e montar apenas definições públicas.
- Criar `src/features/training/application/get-training-day.ts` e seu arquivo de
  tipos para resolver workspace, data, versão histórica e estado operacional.
- Manter orquestração explícita: resolver contexto, ler snapshot, validar
  referências, projetar DTO. Não criar service genérico ou barrel global.

### Dados e composição server-only

- Criar `src/features/training/data/prisma-training-repository.ts` com selects
  explícitos, filtro obrigatório por `workspaceId + civilDate` e leitura do plano
  ativo por `logicalEnvironment + domain + supersededAt`.
- Criar `src/features/training/data/prisma-training-repository.types.ts` apenas
  para payloads dos selects usados e `prisma-training.mapper.ts` para converter
  banco/JSON/Decimal em read models semânticos.
- Criar `src/features/training/data/training-queries.ts` como composition root
  `server-only`: conecta Client, `APP_ENV` e `resolveFixedWorkspace()` aos casos
  de uso. Esse módulo será o ponto consumido pela página em E06-T02.
- Reutilizar `src/lib/db/client.ts`; não criar Client, endpoint HTTP, cache ou
  nova configuração de ambiente.

### Testes

- Testar os casos de uso com fakes pequenos: plano disponível/ausente, dia sem
  atribuição, treino, mobilidade, descanso e falha de referência.
- Criar `tests/integration/training-projections.test.ts` sobre PostgreSQL real,
  reaproveitando as fixtures descartáveis e o importador canônico.
- Ampliar a fixture somente com fábricas explícitas para atribuição, execução e
  séries; não acoplar testes a IDs aleatórios ou à ordem implícita do banco.
- Provar que outro workspace na mesma data não aparece, que um `workspace_id`
  externo não pode ser passado à query pública e que todas as relações lidas
  pertencem ao workspace resolvido.
- Provar que nova ativação muda o plano público e as opções de um dia não
  atribuído, mas não reescreve um dia já vinculado à versão anterior.
- Provar overlay parcial: séries ausentes ficam pendentes, valores persistidos e
  revisões são restaurados, carga `null` permanece ausente e ordenação é estável.
- Testar snapshots incoerentes por fixture controlada e exigir erro tipado, sem
  vazar SQL, caminho privado ou documento-fonte.

## Ordem de execução

1. Fixar os DTOs discriminados e read models a partir do produto e do schema.
2. Implementar regras puras e casos de uso com testes unitários.
3. Implementar selects Prisma mínimos e mapeadores server-only.
4. Montar o composition root com ambiente e workspace fixo.
5. Cobrir integração canônica, isolamento, histórico e projeção parcial.
6. Executar revisão semântica e todos os gates proporcionais.

## Subtarefas

- [x] Resolver o ponteiro do plano ativo.
- [x] Resolver workspace e data sem aceitar ownership do cliente.
- [x] Combinar atribuição, versão e execução sem perder histórico.
- [x] Ordenar preparação, exercícios e séries de forma determinística.
- [x] Preservar `null` e unknowns.
- [x] Cobrir plano ausente e referências inválidas.
- [x] Garantir que tipos Prisma e JSON bruto não escapem da camada de dados.
- [x] Garantir que nenhuma API aceite `workspace_id` do navegador.

## Validações

- A projeção corresponde aos dados canônicos migrados.
- `pnpm format:check`, `pnpm lint`, `pnpm typecheck`, testes unitários,
  integração PostgreSQL, cobertura, build, `pnpm run ci` e `git diff --check`.
- Busca por segredos, caminhos privados e imports proibidos entre camadas.

## Critérios de aceite

- [x] DTO do plano não contém dados operacionais; DTO do workspace atende à página do dia sem aceitar ownership do cliente.
- [x] Plano ativo, dia não atribuído, treino, mobilidade e descanso possuem estados explícitos e testados.
- [x] Histórico permanece na versão apresentada mesmo após nova ativação.
- [x] Leituras de outro workspace e referências inválidas nunca produzem DTO parcial.

## Fora de escopo

- Alterar schema ou migration, importar dados novamente ou adicionar dependência.
- Alterar `src/app/treino/page.tsx` ou criar componentes React; isso pertence à E06-T02.
- Criar Server Action, atribuição ou gravação; isso pertence à E06-T03.
- Implementar login, sessão, cookie, pareamento, múltiplos usuários ou cache público.

## Resultado

Projeções server-side do plano público e do treino da data implementadas com
DTOs discriminados, regras puras, casos de uso independentes de Prisma e
repositório PostgreSQL com snapshot consistente. A integração comprovou
isolamento por workspace, preservação histórica, overlay parcial e rejeição de
referências incoerentes. `pnpm run ci` passou integralmente com 177 testes
unitários, 33 testes PostgreSQL, build de produção e auditoria sem vulnerabilidades.
