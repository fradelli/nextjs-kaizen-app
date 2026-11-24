# Arquitetura alvo do Kaizen

- **Tipo:** Arquitetura.
- **Área:** Arquitetura geral.
- **Tarefas relacionadas:** [E03-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T04-define-target-architecture.md), [E04-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T06-adopt-shared-design-system-decision.md), [E03-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E03-product-and-architecture/T05-approve-implementation-guide.md), [E04-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T01-scaffold-nextjs.md).

> Consulta dirigida: código → **Semântica e legibilidade / Boundaries**; React → **Organização dos componentes React / Next.js**; banco → **Organização do Prisma / Migrations**. A aparência atual segue o [guia Mira](../product/telas/guia-de-estilo.md); o contrato inicial de E04 permanece evidência histórica.

## Status

- Data: 2026-09-02
- Decisão: aprovada
- Tarefa: `E03-T04`
- Escopo: MVP pessoal de Dieta e Treino
- Revisão visual: `E04-T06` substitui somente a fundação visual exclusiva local por [`@fradelli/ui`](../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md); as demais decisões de E03 permanecem válidas.

## Drivers

1. Publicar rápido uma aplicação pessoal com somente duas jornadas.
2. Preservar regras e versões de planos sem duplicar fontes editáveis.
3. Registrar execuções do workspace único em PostgreSQL.
4. Operar localmente, em preview e em produção na Vercel.
5. Permitir contas e múltiplos workspaces no futuro sem antecipar suas telas.
6. Manter segurança, migrations, testes e rollback proporcionais aos dados operacionais e ao risco aceito.

## Stack escolhida

| Área             | Escolha                                       | Regra de versão                                                                              |
| ---------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Runtime          | Node.js 24 LTS                                | versão exata pinada no repositório e Vercel                                                  |
| Framework        | Next.js 16 App Router                         | última versão estável corrigida da linha Active LTS; mínimo seguro 16.3.3 na data da decisão |
| UI               | React 19                                      | versão compatível exigida pelo Next.js pinado                                                |
| Linguagem        | TypeScript em modo estrito                    | sem `any` implícito e sem emissão no typecheck                                               |
| Pacotes          | pnpm via Corepack                             | campo `packageManager` e lockfile obrigatórios                                               |
| Design System    | `@fradelli/ui` por versão exata               | contrato externo versionado; primeira integração planejada em `0.1.0`                        |
| Estilos          | Tailwind CSS 4 + CSS público do Design System | pins comprovados na integração; CSS Modules somente para composição local                    |
| Validação        | Zod                                           | schemas na fronteira de entrada; domínio mantém invariantes próprias                         |
| Banco            | PostgreSQL                                    | local em container; Neon em preview e produção                                               |
| ORM              | Prisma ORM 7 estável                          | Client gerado, driver adapter PostgreSQL e Prisma Migrate                                    |
| Testes unitários | Vitest                                        | domínio, aplicação, parsers e validação                                                      |
| Testes de UI     | Testing Library                               | comportamento e acessibilidade de componentes interativos                                    |
| Testes E2E       | Playwright                                    | jornadas críticas em PostgreSQL real                                                         |
| Hospedagem       | Vercel                                        | runtime Node.js, não Edge                                                                    |

Versões exatas pertencem ao guia E03-T05 e ao lockfile de E04-T01. Dependências `latest`, beta, canary, release candidate ou intervalos sem lockfile não entram no projeto. Em 2026-09-02, Node 24 é LTS e Next.js 16.3 é Active LTS; a implementação deve usar o patch estável mais recente e corrigido disponível no início de E04.

## Forma do sistema

```text
Navegador
  ├─ leitura pública ───────────────┐
  ├─ leitura do workspace fixo ────┤
  └─ Server Action pública ─────────┤
                                    v
Next.js App Router no runtime Node.js
  ├─ UI: páginas, layouts e componentes
  ├─ Application: casos de uso e portas
  ├─ Domain: entidades, valores e invariantes
  └─ Data: repositórios e importadores server-only
                                    |
                                    v
Prisma Client + adapter PostgreSQL
                                    |
                                    v
PostgreSQL local / Neon por ambiente
```

É uma única aplicação full-stack e um único banco por ambiente. O navegador não acessa o banco, e o servidor não faz requisição HTTP para suas próprias rotas.

## Estrutura de diretórios alvo

```text
src/
  app/
    (public)/
    dieta/
    treino/
    api/health/
    layout.tsx
    page.tsx
  features/
    nutrition/
      domain/
      application/
      data/
      ui/
    training/
      domain/
      application/
      data/
      ui/
  lib/
    db/
    env/
    security/
    validation/
  generated/
    prisma/
prisma/
  migrations/
  models/
    platform.prisma
    training.prisma
    nutrition.prisma
  schema.prisma
tests/
  integration/
  e2e/
```

Pastas são criadas apenas quando recebem um arquivo necessário. Não serão adicionados barrels globais, diretórios vazios ou camadas sem consumidor.

## Semântica e legibilidade do código

Convenção permanente para novas implementações e para código alterado na tarefa:

- Nomear features, arquivos, tipos e casos de uso pelo conceito de negócio e
  responsabilidade real. O nome deve distinguir, por exemplo, importar definições
  de planos de registrar uma execução pessoal.
- Funções de ação usam verbo e objeto explícitos; mapeadores indicam conversão,
  e validações indicam a condição garantida. Evitar nomes genéricos como `process`,
  `handle` ou `data` quando escondem o propósito. Nomes locais curtos são aceitáveis
  quando o contexto é inequívoco, sem repetir desnecessariamente o nome da feature.
- Separar responsabilidades coesas em módulos com consumidores atuais. A
  orquestração deve revelar a sequência do caso de uso; detalhes de leitura,
  validação, mapeamento e persistência não devem encobrir essa sequência.
- Manter tipos, erros, utilitários e implementação junto do responsável, mas em
  arquivos próprios quando suas responsabilidades forem distintas. Componentes
  React seguem adicionalmente a organização em pastas definida abaixo.
- Converter formatos posicionais externos em propriedades nomeadas na fronteira
  de leitura. Regras de negócio não dependem de índices de coluna sem significado.
- Preservar fronteiras Server/Client, autorização, procedência e transações ao
  extrair módulos. Uma validação ou operação não deve ser duplicada em camadas
  diferentes sem necessidade explícita; atomicidade pertence ao caso de uso.
- Testes devem descrever comportamento, condições de falha e garantias do domínio.
  Comentários explicam decisões e restrições não evidentes, sem compensar nomes
  obscuros ou simplesmente repetir a implementação.

Antes da entrega, revisar se é possível identificar pelo código o que entra,
o que muda, o que permanece preservado e o que acontece em caso de falha. Registrar
essa revisão na PR; formato, lint, tipos e testes continuam obrigatórios, mas
não comprovam sozinhos clareza semântica. Não criar abstrações futuras ou refatorar
código alheio ao escopo apenas para atender à convenção.

O gate `pnpm structure:check` valida tanto a organização física dos componentes
quanto imports entre camadas. Domínio não depende de aplicação ou infraestrutura;
aplicação não acessa Prisma, banco ou adaptadores concretos; UI e módulos
`use client` não importam a camada de dados, Client Prisma, scripts ou banco.
Exceções arquiteturais devem ser decididas e documentadas, não contornadas com
aliases ou imports relativos equivalentes.

## Boundaries

### Domínio

Contém tipos e regras puras de Dieta e Treino:

- estados permitidos;
- valores de data civil e medidas;
- transições de cumprimento e execução;
- incompatibilidade entre opção e descrição alternativa;
- aplicabilidade de carga;
- conclusão com pendências;
- concorrência por revisão.

Não importa React, Next.js, Prisma, Zod, `process.env` ou APIs de rede.

### Aplicação

Implementa casos de uso, por exemplo:

- obter dieta do dia;
- atribuir tipo de dia;
- registrar refeição;
- obter treino do dia;
- atribuir treino, mobilidade ou descanso;
- registrar série;
- concluir sessão.

Depende do domínio e de interfaces pequenas de repositório, relógio, workspace e transação. Não conhece componentes nem modelos gerados do Prisma.

### Dados

Implementa as portas da aplicação com Prisma, importador e mapeadores. É `server-only` e responde por:

- queries com filtro de workspace;
- transações e optimistic concurrency;
- tradução entre registros e domínio;
- importação idempotente dos JSONs;
- ativação de versões;
- sanitização de erros de infraestrutura.

Tipos do Prisma não atravessam a fronteira para UI ou domínio.

### UI

Server Components carregam DTOs pelos casos de uso. Client Components existem somente para interação local: formulários, estados de envio, confirmação e foco. Eles recebem DTOs serializáveis e não importam repositórios, Prisma ou segredos.

Tokens, tipografia, foco, motion, estados visuais genéricos e primitives acessíveis vêm de `@fradelli/ui`. O Kaizen mantém shell, layouts, páginas, rotas, textos, i18n, calendário composto e o mapeamento entre cores e conceitos do domínio. CSS local serve apenas à composição e não duplica o contrato visual compartilhado.

### Organização dos componentes React

`src/app` permanece fino e concentra rotas, metadata, layouts e composição no
nível da rota. Blocos visuais compartilhados vivem em `src/components/shared`;
blocos específicos de negócio vivem em `src/features/<feature>`. Cada
componente React fica em uma pasta própria com o mesmo nome. Diretórios
`components/` contêm somente pastas de componentes, nunca arquivos de
componentes soltos. Entradas especiais do App Router, como `page.tsx` e
`layout.tsx`, permanecem na estrutura exigida pelo Next.js.

Os arquivos auxiliares ficam junto do componente que os consome:

```text
component-name/
├── component-name.tsx
├── component-name.types.ts
├── component-name.constants.ts
├── component-name.styles.ts
├── component-name.module.css
├── component-name.utils.ts
├── component-name.test.tsx
├── components/
│   └── private-child/
│       ├── private-child.tsx
│       ├── private-child.types.ts
│       └── private-child.styles.ts
└── hooks/
    └── use-component-name.ts
```

- `*.tsx` renderiza e compõe UI;
- `*.types.ts` mantém props, contratos locais e view models;
- `*.constants.ts` mantém listas, ordem, defaults e constantes semânticas;
- `*.styles.ts` mantém composição densa de classes utilitárias fora do JSX;
- `*.module.css` mantém somente composição visual local com tokens públicos;
- `*.utils.ts` mantém transformações puras e não importa React, roteador,
  Prisma, adapters ou componentes;
- `hooks/use-*.ts` mantém estado, efeitos, integração com contexto e estado de
  rota que realmente dependam de hooks;
- `components/` mantém pastas de filhos privados que não fazem parte da API compartilhada.

Não se cria arquivo vazio apenas para cumprir o formato. A separação acontece
quando existe responsabilidade real e melhora leitura, teste ou isolamento.
Imports explícitos são o padrão; `index.ts` só existe quando a pasta expõe uma
API pública pequena e intencional. `*.styles.ts` e `*.module.css` são
alternativas conforme a composição; não se usam ambos sem necessidade real.
Tipos, estilos, constantes, testes, hooks e utilitários de um filho privado não
ficam centralizados na pasta do pai quando pertencem somente ao filho.

Server Components são o padrão. O limite `"use client"` deve ficar na menor
folha que precise de interação, estado, efeito ou API do navegador. O Server
Component pode compor essa ilha e passar apenas props serializáveis ou conteúdo
renderizável. Módulos client não importam acesso a dados, casos de uso
server-only, Prisma, segredos ou variáveis privadas. Código de dados usa
`server-only`; Server Actions ficam em módulos próprios, tratam a requisição
como entrada pública e delegam regra de negócio para a camada de aplicação.

### Dependências permitidas

| Origem        | Pode depender de                                                        |
| ------------- | ----------------------------------------------------------------------- |
| `domain`      | biblioteca padrão e código do próprio domínio                           |
| `application` | `domain` e portas definidas em `application`                            |
| `data`        | `application`, `domain`, Prisma e adapters server-only                  |
| `ui`          | DTOs/casos de uso públicos da feature e React                           |
| `app`         | `ui`, composition root e funções server-only em entrypoints do servidor |

Importação inversa falha no lint/validação arquitetural.

## Next.js

### Server Components

- São o padrão para páginas e leituras iniciais.
- Leem conteúdo público versionado ou DTOs do banco pelo application layer.
- Dados operacionais mutáveis do workspace fixo são dinâmicos e não usam cache público.
- Conteúdo público imutável pode usar cache por versão do plano.
- Segredos e objetos do Prisma nunca são serializados para o cliente.

### Client Components

- Começam no menor limite que precisa de estado/interação.
- Mantêm rascunho enquanto a mutação está em andamento ou falha.
- Não confirmam persistência de forma otimista antes da resposta do servidor.
- Não fazem fetch para Route Handler interno quando uma Server Action resolve o caso.

### Server Actions

Cada mutação segue esta ordem:

1. validar origem da requisição;
2. resolver o `workspace_id` fixo no servidor;
3. ignorar/rejeitar qualquer ownership fornecido pelo cliente;
4. validar input com Zod;
5. converter para comando da aplicação;
6. executar caso de uso em transação quando necessário;
7. mapear conflito ou erro esperado para resultado tipado;
8. revalidar somente a leitura afetada;
9. retornar DTO mínimo sem dado sensível desnecessário.

Server Actions são tratadas como endpoints públicos. Não se confia em componente oculto, campo hidden ou TypeScript do cliente.

### Route Handlers

No P0, existem somente quando há consumidor HTTP real:

- health check sanitizado;
- callbacks futuros de provedor, inexistentes no MVP;
- automação operacional que não possa chamar código interno diretamente.

Não existe REST interna, OpenAPI ou BFF separado para a própria UI.

## Rotas do P0

Rotas verificadas na árvore atual; idioma não altera URLs.

| Rota | Estado |
| --- | --- |
| `/` | Redirect para `/workout` |
| `/workout` | Agenda/consulta semanal; Server Component e ilhas de interação |
| `/workout/activity/[occurrenceKey]` | Detalhe direto; interceptado por `@workout/(.)workout/activity/[occurrenceKey]` na navegação |
| `/nutrition` | Placeholder traduzido; jornada alimentar ainda não implementada |
| `/foundations` | Galeria técnica do design system |

`/dieta`, `/treino` e `/api/health` pertencem ao desenho inicial e não existem nesta árvore. Planos e rotinas do [mapa de telas](../product/telas/README.md) são escopo para detalhamento, não endpoints entregues.

Data selecionada: query string ISO `YYYY-MM-DD`; visão: `view=day|week`. O servidor interpreta datas civis em `America/Sao_Paulo` e rejeita formato inválido.

## Definições importadas

Os JSONs versionados são validados e importados conforme [`DATA-SOURCE-TRANSITION.md`](../decisions/DATA-SOURCE-TRANSITION.md). As versões do banco são insert-only e preservam:

- ID e versão da fonte;
- caminho relativo;
- SHA-256;
- schema version;
- commit da aplicação/importação;
- documento-fonte imutável para auditoria;
- relações normalizadas necessárias às jornadas.

O documento-fonte em JSONB é uma cópia de auditoria dentro da mesma projeção imutável, não uma segunda fonte editável.

### Metadados de execução de treino

Os arquivos atuais usam strings como `4-6`, `8_contacts`, `3_each_side` e `2_minutes`; eles não declaram de forma completa se carga externa é aplicável. A UI não pode inferir isso por categoria ou nome.

Antes da importação E05, deve existir um contrato nativo e revisado para cada exercício utilizado contendo:

- `measurement_type`: `repetitions`, `seconds`, `contacts` ou `per_side`;
- `load_applicable`: booleano;
- unidade de carga permitida, inicialmente `kg` quando aplicável;
- regra de normalização do texto prescrito.

Esse contrato pertence aos dados versionados e complementa, sem sobrescrever, a biblioteca migrada. Ausência de classificação é erro de importação, nunca default silencioso.

## Modelo conceitual

### Plataforma mínima

- `Workspace`: boundary de ownership; existe um workspace fixo no MVP.
- `ImportBatch`: proveniência e resultado de uma importação.
- `PlanActivation`: versão ativa por domínio e ambiente lógico.
- `PairingRateLimit`: estrutura preservada para uma proteção de acesso futura; não é usada no P0 atual.

### Treino

- `ExerciseDefinition`: versão importada da biblioteca e metadados de execução.
- `TrainingPlanVersion`: versão imutável do plano.
- `TrainingSessionDefinition`: sessão pertencente à versão.
- `TrainingExerciseDefinition`: ordem, dose, descanso, prioridade e referência de exercício.
- `DailyTrainingAssignment`: atribuição histórica da data ou descanso; não cria uma segunda execução visível quando suas atividades são removidas.
- `TrainingDayActivity`: unidade operacional de agenda e execução; pode representar treino estruturado, prática esportiva, treino específico ou mobilidade.
- `TrainingActivityExecutionInterval`: intervalos realizados, usados para descontar pausas da duração ativa.
- `TrainingActivityExerciseExecution` e `TrainingActivitySetExecution`: resultados ligados à atividade e à prescrição versionada.
- `TrainingExecution`, `TrainingExerciseExecution` e `TrainingSetExecution`: estruturas históricas preservadas para auditoria e migração; não recebem novas gravações pelo fluxo da tela.

### Alimentação

- `NutritionPlanVersion`: versão imutável do plano.
- `NutritionDayTypeDefinition`: tipo, faixa e módulos da versão.
- `MealDefinition`: refeição ordenada da versão.
- `MealOptionDefinition`: opção ou referência resolvida.
- `DailyNutritionAssignment`: data + tipo de dia por workspace.
- `MealExecution`: estado, opção, descrição alternativa e comentário.

Não existem `User` ou `WorkspaceMembership` no MVP. As tabelas pessoais já contêm `workspace_id`; as entidades de conta entram somente no cutover futuro.

## Regras relacionais obrigatórias

- Chaves primárias internas usam UUID gerado no servidor/banco.
- IDs de domínio e versões da fonte permanecem colunas explícitas.
- Unicidade de plano: domínio + `plan_id` + `version`.
- Unicidade de importação: caminho da fonte + SHA-256.
- Unicidade diária inclui `workspace_id` + data civil.
- Uma execução referencia exatamente uma atribuição e a versão apresentada.
- Número de série é único dentro da execução do exercício.
- Carga é `null` quando `load_applicable=false`.
- Campos incompatíveis com o estado alimentar são `null` por constraint/regra transacional.
- `revision` inteiro suporta concorrência otimista.
- Exclusões em cascata não alcançam versões ou execuções históricas.
- Datas de domínio usam `date`; timestamps usam UTC; apresentação usa `America/Sao_Paulo`.

O Prisma Schema expressa o que for suportado. Constraints SQL adicionais são incluídas na migration e testadas, não omitidas por limitação do ORM.

## Fluxos

### Importação

```text
JSON do commit -> parse/schema -> referências -> SHA-256
  -> transação -> lote -> versões ausentes -> ativações -> commit
```

- Importar duas vezes produz `no-op`.
- Mesmo ID/versão com hash diferente falha.
- Ponteiro inválido preserva ativação anterior.
- Importação não altera atribuições nem execuções.

### Leitura operacional

```text
requisição -> workspace fixo server-only -> caso de uso -> repository
  -> plano ativado + execução da data -> DTO mínimo -> Server Component
```

### Mutação

```text
form -> Server Action -> origem + workspace fixo + Zod -> comando + revisão esperada
  -> transação -> constraint/revision -> resultado tipado -> revalidação
```

## Transações e concorrência

- Atribuir um dia e criar seu registro inicial ocorre atomicamente.
- Mudar status limpa campos incompatíveis na mesma transação.
- Atualização inclui a revisão esperada; zero linhas alteradas retorna conflito.
- Concluir sessão não marca séries pendentes como realizadas.
- Erro conhecido retorna código de domínio; erro inesperado recebe request ID e log sanitizado.
- Retry automático só ocorre em operação idempotente e erro transitório conhecido.

## Segurança

A arquitetura implementa o modo temporário definido em
[`PUBLIC-SINGLE-WORKSPACE-MODE.md`](../decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md):

- secrets validados no boot e acessíveis apenas no servidor;
- `WorkspaceResolver` fixo e server-only;
- validação de origem e entrada;
- queries e mutações sempre filtradas pelo workspace resolvido no servidor;
- nenhum `workspace_id` do cliente define ownership;
- conteúdo operacional mutável sem cache público;
- headers de segurança e `noindex`;
- logs sem payload, cookie ou segredo;
- runtime role separada da migration role;
- conexão TLS pooled no runtime e direta no CI de migration.

Não há autenticação, sessão ou pareamento nesta fase. Qualquer pessoa que acesse a
URL pode usar as operações expostas; autenticação real é obrigatória antes de
múltiplos usuários ou dados considerados sensíveis.

## Organização do Prisma e configuração de banco

- `prisma/schema.prisma` contém somente generator e datasource. Modelos e enums ficam em `prisma/models/`, em arquivos por domínio; estruturas transversais ficam em `platform.prisma`. A configuração aponta para `prisma/`, sem criar namespaces de banco apenas para organizar arquivos.
- `prisma.config.ts` é uma entrada fina: carrega o ambiente e declara caminhos/datasource. Validação e proteções da CLI ficam em auxiliar puro e testável, sem inicializar o Client da aplicação. Usar o carregador nativo de ambiente; adicionar dependência de carregamento/interpolação somente com necessidade comprovada.
- Configuração de runtime é validada no servidor e tipada. Separar tipos, constantes de pool, utilitários puros de URL, leitura de ambiente e criação do Client. Criar arquivos auxiliares apenas quando houver consumidor; nunca exportar segredos para UI.
- O Client é lazy, `server-only`, usa adapter PostgreSQL e pool limitado. Reutilizar instância no processo e durante hot reload; não conectar ao importar módulos nem desconectar por requisição. Ferramentas de duração finita encerram seu Client em `finally`.
- Runtime usa `DATABASE_URL` pooled; migrations usam somente `DIRECT_URL`, sem fallback. Manter as proteções de destino local e a proibição de reset/db push no fluxo versionado; erros não revelam strings de conexão.
- `dev`, `build`, `typecheck`, testes unitários, cobertura e integração geram o Client antes de executar sua ferramenta. Não depender de geração manual ou exclusiva da CI. O código gerado é ignorado pelo Git e não recebe edição manual.
- Manter ESM e runtime Node do Next.js. Não importar convenções específicas de NestJS, CommonJS ou cascatas de outro projeto sem requisito aprovado. Tipos Prisma permanecem na camada de dados e são mapeados para contratos de aplicação.
- Separar arquivos de schema sem mudar entidades não exige migration nova. Confirmar equivalência do schema e ausência de diferença SQL; migrations existentes permanecem intactas. Mudanças reais de modelo seguem o processo abaixo.

## Migrations

### Desenvolvimento

- Alterar os arquivos de `prisma/models/` e criar migration com `pnpm db:migrate` somente contra banco local descartável.
- Revisar o SQL gerado e adicionar constraints/índices explícitos necessários.
- Commitar schema e diretório completo da migration juntos.
- Validar do zero, não apenas sobre o banco do autor.

### CI, staging e produção

- CI cria PostgreSQL limpo, executa `prisma migrate deploy`, importa dados e roda testes.
- Staging e produção executam `prisma migrate deploy` em job único, com conexão direta e ambiente protegido.
- `prisma db push`, `migrate dev` e reset são proibidos em preview estável e produção.
- Deploy falha antes de servir código incompatível se migration ou importação falhar.
- Migration destrutiva segue expand/contract em releases diferentes.
- Migration aplicada nunca é editada ou apagada.
- Rollback de aplicação usa código compatível; banco recebe correção adiante.

## Estratégia de testes

| Nível             | Ferramenta                         | Cobertura mínima                                                         |
| ----------------- | ---------------------------------- | ------------------------------------------------------------------------ |
| Dados documentais | validadores JSON + testes próprios | schemas, ponteiros, IDs, referências e metadados de execução             |
| Domínio           | Vitest                             | transições, medidas, carga, comentários, conclusão e datas               |
| Aplicação         | Vitest com fakes pequenos          | workspace resolvido, casos de uso, conflitos e erros                     |
| Integração        | Vitest + PostgreSQL real           | repositories, constraints, transações, migration e importador duas vezes |
| Componentes       | Testing Library                    | formulários, erro associado, teclado e estados de envio                  |
| E2E               | Playwright + PostgreSQL isolado    | Dieta, Treino, descanso, workspace fixo e histórico                      |
| Build/operação    | Next build + smoke                 | env, headers, health, migration, importação e rollback                   |

SQLite, mocks do Prisma e snapshots visuais não substituem testes relacionais. Cada bug de domínio recebe teste no nível mais baixo capaz de reproduzi-lo.

### Casos obrigatórios

- dia sem tipo não inventa faixa alimentar;
- `followed_different` exige descrição;
- mudança de status limpa campos incompatíveis;
- exercício sem carga não aceita nem persiste carga;
- medidas por lado preservam os dois valores;
- conclusão com pendências não fabrica execução;
- importação repetida não duplica;
- versão com hash conflitante falha;
- `workspace_id` fornecido pelo cliente não redireciona leitura nem mutação;
- gravações concorrentes retornam conflito;
- nova ativação não reescreve histórico;
- timezone permanece correto na virada do dia.

## Observabilidade e falhas

- Toda resposta e log de erro possuem request ID.
- Health check informa somente status, versão e dependências agregadas.
- Erros são categorizados em validação, conflito, indisponibilidade e interno.
- Métricas não usam IDs pessoais, comentários ou descrições como labels.
- Falha do banco mostra conteúdo público disponível quando seguro e bloqueia operações pessoais.
- Backup/restore e deploy registram evidências separadas dos logs da aplicação.

## Incrementos

1. E04 cria scaffold, qualidade, boundary server-only e CI; registra a decisão compartilhada, valida prontidão, integra `@fradelli/ui` por versão exata e só então cria o shell, sem regra de negócio.
2. E05 modela PostgreSQL, cria metadados, migrations, importador, restore local e o resolvedor fixo server-only.
3. E06 implementa projeção e registros de Treino consumindo o workspace fixo.
4. E07 implementa projeção e registros de Dieta consumindo a mesma fronteira.
5. E08 configura Vercel/Neon, valida a exposição pública aceita e comprova backup, rollback e produção.

Cada incremento deve manter lint, tipos, testes, integridade e build verdes. Não se cria abstração para fase futura sem consumidor no incremento atual.

## Alternativas rejeitadas no P0

- NestJS, backend separado ou microserviços: duplicam deploy e contratos sem consumidor externo.
- REST/OpenAPI interna: adiciona serialização e manutenção entre partes do mesmo Next.js.
- Monorepo para compartilhar UI: acopla ciclos de entrega independentes; o Design System permanece em repositório próprio e chega ao Kaizen por package versionado.
- Edge Runtime: Prisma/PostgreSQL, criptografia e ferramentas operacionais usam Node com menos restrições.
- SQLite em produção ou testes de integração: não representa constraints e concorrência do PostgreSQL alvo.
- Supabase como plataforma completa: autenticação, storage e realtime não são necessários.
- Drizzle como ORM principal: Prisma oferece migrations e modelo tipado suficientes para o time/projeto atual.
- Prisma Accelerate: Neon já oferece pooling; outra camada não resolve requisito confirmado.
- Redux ou TanStack Query: Server Components e estado local de formulário cobrem o P0.
- Tailwind ou biblioteca de componentes: rejeição original de E03, substituída em E04-T06 após surgir um package compartilhado com ownership e consumidor reais; CSS Modules continuam válidos somente para composição local.
- autenticação nesta fase: adiada enquanto há um único usuário e risco público aceito; os boundaries permitem o cutover futuro.

## Fontes oficiais

- [Node.js — Releases](https://nodejs.org/en/about/previous-releases)
- [Next.js — Blog e releases](https://nextjs.org/blog)
- [Next.js — Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Next.js — Authentication](https://nextjs.org/docs/app/guides/authentication)
- [Prisma — Next.js](https://www.prisma.io/docs/guides/v7/frameworks/nextjs)
- [Prisma — Neon](https://docs.prisma.io/docs/orm/v6/overview/databases/neon)
- [Prisma — Migrate deploy](https://docs.prisma.io/docs/orm/prisma-client/deployment/deploy-database-changes-with-prisma-migrate)
- [Neon — Connection pooling](https://neon.com/docs/connect/connection-pooling)
- [Decisão local — Adoção do Design System compartilhado](../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md)
- [ADR 0001 — Fundação do Design System compartilhado](https://github.com/fradelli/design-system/blob/main/docs/decisions/0001-shared-design-system-foundation.md)

## Critério de conclusão

A arquitetura permite entregar cada jornada em incrementos pequenos, preserva uma fonte editável por classe de dado, mantém ownership estrutural no workspace fixo e não introduz backend ou protocolo interno sem consumidor.
