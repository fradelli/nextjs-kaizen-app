# Kaizen

Fonte de verdade versionada e aplicação incremental para treino e alimentação pessoal.

A fundação documental está concluída. A aplicação Next.js começa mínima e evolui por tarefas pequenas, preservando dados, decisões e histórico aprovados.

## Estado atual

- Branches `developer`, `staging` e `master` publicadas.
- Fundações de treino e alimentação validadas.
- Produto, arquitetura, privacidade e operação do P0 aprovados.
- Node.js 24.20.0, pnpm 11.25.0 e Next.js 16.3.8 fixados.
- Aplicação de treino disponível localmente com `pnpm dev`, com persistência em PostgreSQL.
- Agenda futura e registro retrospectivo de atividades externas implementados.
- A jornada manual retrospectiva permanece pendente; consulte o roadmap para o estado de cada tarefa.

## Acesso rápido

- [Tarefa ativa](roadmap/ACTIVE.md)
- [Status completo do roadmap](roadmap/README.md)
- [Produto P0](docs/product/P0.md)
- [Arquitetura alvo](docs/architecture/TARGET-ARCHITECTURE.md)
- [Privacidade e operação](docs/decisions/PRIVACY-AND-OPERATIONS.md)
- [Guia modular de implementação](docs/implementation/P0-IMPLEMENTATION-GUIDE.md)
- [Plano ativo de treino](data/active.json)
- [Plano ativo de alimentação](data/nutrition/active.json)
- [Política do repositório público](docs/decisions/PUBLIC-REPOSITORY-AND-DATA-POLICY.md)
- [Manifesto de migração](docs/migration/MIGRATION-MANIFEST.md)
- [Schemas](schemas/README.md)

## Desenvolvimento local

```powershell
corepack enable
pnpm install --frozen-lockfile
pnpm dev
```

A aplicação fica disponível em `http://localhost:3000`. Consulte os scripts de qualidade em [package.json](package.json).

### Acesso pelo celular na rede local

Para testar em um celular conectado à mesma rede, substitua `IP_LOCAL` pelo
endereço da máquina de desenvolvimento, pare o servidor atual e execute:

```powershell
pnpm db:generate
pnpm workspace:ensure
pnpm exec next dev --hostname IP_LOCAL
```

No celular, abra `http://IP_LOCAL:3000/treino`, usando o mesmo endereço do comando.
O endereço depende da rede e não deve ficar fixado na documentação do projeto.

### Pastas e arquivos locais

- `node_modules/`: dependências instaladas da aplicação.
- `.next/`, `coverage/` e `*.tsbuildinfo`: arquivos gerados pelo desenvolvimento,
  build e testes; podem ser regenerados.
- `.env`: configuração local; deve ser preservada e nunca versionada.
- `vendor/braces/`: código versionado usado pela correção de dependência; não é cache.
- Cópias de trabalho do Git são auxiliares. Antes de removê-las, confira alterações
  locais e preserve trabalho pendente em um commit ou backup recuperável.

O [plano visual](docs/implementation/FRADELLI-DESIGN-SYSTEM-ADOPTION-PLAN.md)
é uma proposta e ainda depende de aprovação para implementação. O
[contexto consolidado](kaizen-project-context.md) é uma fotografia histórica;
confirme o estado atual no roadmap e no código.

## Fluxo de branches

```text
branch de tarefa -> developer -> staging -> master
```

Tarefas entram em `developer` por squash. Promoções para `staging` e `master` usam merge commit.

## Privacidade

O repositório e as definições aprovadas são públicos. Bancos, segredos e registros operacionais permanecem privados e são protegidos no servidor.
