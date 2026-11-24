# Governança de CI/CD

- **Tipo:** Decisão.
- **Área:** Governança.
- **Tarefas relacionadas:** [E00-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E00-repository-governance/T01-initialize-repository-and-branches.md), [E04-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E04-nextjs-foundation/T05-configure-minimal-ci.md), [E08-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E08-personal-release/T01-deploy-preview.md), [E08-T03](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E08-personal-release/T03-prepare-production.md).

## Status

- Data: 2026-08-30
- Decisão: aprovada para implementação progressiva
- Plataforma: GitHub Actions e Vercel

## Princípios herdados do Sandicts

- `developer`, `staging` e `master` são protegidas e recebem mudanças somente por PR.
- CI valida branch, direção, título, descrição e conteúdo antes do merge.
- Promoções preservam o SHA aprovado e executam o CI completo antes do deploy.
- Preview e produção possuem configurações e segredos separados.
- Falha de check obrigatório bloqueia entrega; não vira aviso para destravar a PR.
- Nomes de checks permanecem estáveis porque serão usados nos rulesets do GitHub.

## Adaptações do Kaizen

- IDs `E00-T01` substituem chaves Jira.
- Não há check de contrato OpenAPI nem imagem Docker enquanto o projeto for somente Next.js na Vercel.
- Existe `Data integrity` para schemas, IDs, ponteiros ativos, importação idempotente e migrations.
- E2E entra quando existir jornada crítica e tooling; não será um placeholder vazio.

## Checks estáveis

| Nome               | Responsabilidade                                                      |
| ------------------ | --------------------------------------------------------------------- |
| `Governance`       | Branch, destino, título, corpo e direção da promoção                  |
| `Quality`          | Instalação reproduzível, formato, lint e typecheck                    |
| `Test`             | Testes automatizados proporcionais ao comportamento alterado          |
| `Data integrity`   | Dados canônicos, schemas, IDs, importação e migrations                |
| `Build`            | Build de produção do Next.js sem dependência oculta do ambiente local |
| `Dependency audit` | Audit com limiar explícito, inicialmente `moderate`                   |

Na fase exclusivamente documental, a validação é manual e inclui links, IDs, dependências e `git diff --check`. Os workflows e required checks serão criados em E04-T05 depois que existirem runtime, lockfile e scripts reais.

## CI de pull request

Dispara em PR para `developer`, `staging` ou `master` nos eventos de abertura, atualização, reabertura e edição. Deve:

1. validar branch, título, corpo, ID existente e matriz de direção;
2. instalar dependências com lockfile;
3. executar todos os checks aplicáveis em jobs separados;
4. cancelar execuções antigas da mesma PR;
5. usar permissões mínimas e não depender de segredos em PRs comuns.

### Exceção restrita para Dependabot

Decisão adicional de E04-T05 em 2026-09-10: PRs criadas por `dependabot[bot]` não precisam declarar um ID de tarefa nem reproduzir o template humano, pois esses campos não podem ser mantidos com segurança pela automação. A exceção só é válida quando todas as condições abaixo são verdadeiras:

- autor `dependabot[bot]`;
- branch de origem iniciada por `dependabot/`;
- destino `developer`;
- título convencional `build(deps): ...` ou `build(deps-dev): ...`;
- alterações produzidas pela configuração versionada do Dependabot.

Essas PRs continuam sujeitas a `Quality`, `Test`, `Data integrity`, `Build` e `Dependency audit`. A exceção não permite promoção, bypass de checks, push direto nem acesso adicional a segredos.

### Métodos de merge

- PR de tarefa para `developer`: squash.
- Promoção `developer -> staging` ou `staging -> master`: merge commit.
- Rebase merge não pertence ao fluxo aprovado.

## CD de preview

Dispara após merge em `staging`:

1. executa o CI reutilizável no SHA recebido;
2. faz checkout e confirma o SHA imutável;
3. aplica migrations compatíveis usando credenciais do ambiente `preview`;
4. constrói e publica artefato prebuilt com versão fixada da Vercel CLI;
5. aguarda o deployment e executa smoke público no workspace fixo;
6. mantém apenas uma execução de preview por vez, sem cancelar deploy iniciado.

## CD de produção

Dispara após merge em `master` e repete as garantias do preview com ambiente `production`. A promoção exige URL e evidência do preview, backup/restauração validados e plano de rollback.

Segredos e variáveis de preview nunca são reutilizados implicitamente em produção. Nenhum valor secreto é versionado.

## Migrations e rollback

- Migrations são versionadas, revisadas e aplicadas antes do deployment correspondente.
- Mudanças destrutivas não compartilham release com a remoção do código antigo.
- Rollback da aplicação aponta para o último deployment saudável.
- Migrations já aplicadas não são revertidas automaticamente; correções de banco avançam por nova migration.

## Implementação progressiva

- E04-T05: CI, validação de governança e rulesets.
- E05: integridade de dados, banco, migrations e restauração.
- E08-T01: CD de preview e smoke tests.
- E08-T03–T05: CD de produção, rollback e release pessoal.
