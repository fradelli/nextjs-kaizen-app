# Banco de dados e ORM

- **Tipo:** Decisão.
- **Área:** Banco de dados.
- **Tarefas relacionadas:** [E03-T04](../../roadmap/epics/E03-product-and-architecture/T04-define-target-architecture.md), [E03-T05](../../roadmap/epics/E03-product-and-architecture/T05-approve-implementation-guide.md).

## Status

- Data: 2026-09-02
- Decisão: aprovada
- Tarefa: `E03-T04`

## Escolha

- Banco relacional: PostgreSQL.
- Hospedagem gerenciada: Neon para preview e produção.
- Desenvolvimento: PostgreSQL local em container.
- ORM e migrations: Prisma ORM 7 estável.
- Driver: adapter PostgreSQL sobre `pg`.
- Runtime: Node.js; Edge Runtime excluído.

Na data da decisão, a documentação estável do Prisma usa a linha 7.10. O guia E03-T05 deve pinar a versão estável compatível e não instalar Prisma 8 enquanto estiver em release candidate.

## Requisitos que determinaram a escolha

- relações e constraints entre workspace, data, versão, sessão, exercício, série, refeição e opção;
- transações para limpar campos incompatíveis e detectar concorrência;
- histórico imutável de versões;
- migrations SQL revisáveis e automatizáveis;
- banco real isolado por preview;
- pooling compatível com funções serverless;
- caminho futuro para múltiplos usuários sem troca de banco;
- TypeScript com queries tipadas e sem SQL espalhado na UI.

## Uso das conexões

| Contexto | Conexão | Privilégio |
| --- | --- | --- |
| Next.js em execução | `DATABASE_URL` pooled | CRUD somente nas tabelas necessárias |
| Prisma Migrate e backup | `DIRECT_URL` direta | migration/backup conforme job protegido |
| desenvolvimento local | URL direta do container | owner somente do banco local |
| teste de integração | banco/branch descartável | criação e remoção no ambiente de teste |

O Prisma Client é criado uma vez por processo em desenvolvimento e reutilizado. O adapter `pg` mantém o comportamento compatível entre PostgreSQL local e Neon. Prisma models ficam na camada de dados; domínio e UI não dependem deles.

## Migrations

- `prisma migrate dev`: somente local.
- `prisma migrate deploy`: CI, staging e produção.
- `prisma db push`: proibido fora de experimento descartável não versionado; não faz parte do fluxo do projeto.
- SQL gerado é revisado e pode receber constraints PostgreSQL que o Prisma Schema não expressa.
- Aplicações destrutivas usam expand/contract.
- URL de produção não é copiada para máquina local para executar migration manual.

## Neon

- Runtime usa endpoint pooled.
- Migrations e `pg_dump` usam endpoint direto.
- Produção, staging e previews possuem branches/credenciais isoladas.
- Preview não herda dados pessoais; usar schema-only ou seed sintético.
- Cold start é tratado como indisponibilidade transitória limitada, não com retry infinito.
- Instant restore e snapshots complementam, mas não substituem, backup cifrado externo.

## Alternativas avaliadas

### SQLite/Turso

Rejeitada para produção. Simplifica o início, mas não representa o alvo PostgreSQL nos testes e torna futuras constraints, concorrência e migração outro projeto.

### Supabase

PostgreSQL seria compatível, porém Auth, Storage, Realtime e APIs geradas não são requisitos. Neon oferece o banco e branching necessários com menor superfície para este MVP.

### Drizzle ORM

É uma opção válida e mais próxima de SQL. Foi rejeitada para reduzir decisões operacionais: Prisma Migrate, Client tipado e documentação de Next.js/Neon atendem o escopo atual. Troca só deve ocorrer diante de limitação concreta medida.

### SQL manual

Permanece permitido dentro de migrations ou repository específico quando necessário para constraint/query não expressável. Não será a estratégia principal porque amplia mapeamento e geração de tipos sem benefício no P0.

### Prisma Postgres/Accelerate

Não escolhidos. O banco já será Neon e seu endpoint pooled atende o runtime; adicionar outro proxy ou provedor não resolve requisito confirmado.

## Riscos e controles

| Risco | Controle |
| --- | --- |
| excesso de conexões serverless | endpoint Neon pooled e Client reutilizado |
| migration incompatível com rollback | expand/contract, revisão SQL e teste com versão anterior |
| divergência entre Prisma e banco | migrations do zero em CI e constraints testadas |
| acoplamento de domínio ao ORM | mapeadores e portas na camada de dados |
| versão pre-release instalada por `latest` | pin exato e lockfile; stable tag verificada |
| preview com dados reais | branch schema-only ou seed sintético |
| dependência exclusiva do backup do provedor | dump cifrado externo e restore mensal |

## Consequência

E04 pode criar o boundary server-only sem banco funcional. E05 implementa schema, migrations e importação. E06/E07 consomem repositórios por feature, sem alterar a decisão de fonte de verdade.
