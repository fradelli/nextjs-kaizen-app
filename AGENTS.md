# Contrato do Codex no Kaizen

O Kaizen combina planos públicos versionados com registros operacionais de treino e alimentação.

## Rota mínima de contexto

1. Leia este contrato e `roadmap/ACTIVE.md`.
2. Abra somente a tarefa selecionada e suas `Entradas`, nas seções indicadas.
3. Aplique instruções aninhadas da árvore alcançada: `roadmap/AGENTS.md`, `docs/AGENTS.md`, `docs/migration/AGENTS.md` e `data/AGENTS.md`.

Não leia árvores recursivamente. Localize títulos/caminhos com `rg`; se indisponível, use buscas direcionadas com PowerShell. Roadmap global, changelog e tarefas concluídas entram somente para planejamento, atualização de estado ou investigação histórica. Se a tarefa estiver concluída, siga a retomada sem reexecutá-la.

## Regras globais

- PT-BR; diferencie fatos, decisões, propostas e incógnitas. Não invente dados ausentes.
- Repositório público: não versione credenciais, identidade desnecessária, contexto médico ou comentários pessoais. Não diagnostique lesões nem apresente conteúdo alimentar não validado como prescrição profissional.
- Verifique Git antes de editar e preserve alterações locais. Preserve IDs e histórico; mudanças destrutivas exigem migração e rollback explícitos.
- Não crie abstração, dependência, endpoint ou serviço sem consumidor na tarefa atual.
- Next.js full-stack, PostgreSQL/Prisma; definições em Git/JSON e operação no banco. Sem backend separado ou cliente HTTP interno.
- P0 público, sem autenticação por decisão explícita. Workspace fixo resolvido no servidor; autenticação antes de multiusuário ou dados sensíveis.
- Datas civis: `America/Sao_Paulo`; timestamps: UTC. Server Actions validam origem, entrada, ownership e concorrência no servidor. Nunca aceite `workspace_id` do cliente.

## Leitura por tarefa

As entradas listam `docs/architecture/TARGET-ARCHITECTURE.md` com as seções aplicáveis:

| Mudança | Seções obrigatórias |
| --- | --- |
| Código | Semântica e legibilidade do código; Boundaries |
| React | Organização dos componentes React; Server Components; Client Components |
| Mutação | Server Actions; Segurança; Transações e concorrência |
| Prisma/banco | Organização do Prisma e configuração de banco; Migrations |

Cada componente tem pasta própria; `components/` contém pastas de componentes. Regras completas pertencem à arquitetura. Aparência: `docs/product/telas/guia-de-estilo.md`. Comportamento: documento da tela em `docs/product/telas/`. Leia decisões e planos históricos apenas quando necessários à tarefa.

## Git e validação

- Trabalho novo parte de `developer` em `codex/<ID>-descricao-curta`; não recrie branch nem desfaça trabalho em andamento.
- PR de tarefa para `developer` usa squash; promoções `developer -> staging -> master` usam merge commit. Sem force push ou reescrita compartilhada.
- Título `[<ID>] tipo(escopo): resumo`; descrição em `.github/pull_request_template.md`. Detalhes: `docs/delivery/PULL-REQUEST-STANDARD.md`.
- Sempre confira `git diff --check` e ausência de segredos. Documentação: links, IDs, dependências e vigência. Dados: schema, ponteiros e referências. Código: gates proporcionais em `package.json`.
- `pnpm run ci` executa gates locais; `pnpm ci` é instalação congelada. `pnpm governance <evento.json>` valida PR/roadmap; `pnpm data:check` valida dados; `pnpm test:ci-scripts` valida os scripts.

## Skills locais

Uso exclusivo do Codex. `.agents/skills/` é instalação local Prisma ignorada pelo Git; leia somente a referência compatível com a versão instalada e a tarefa. Presença no disco não comprova descoberta automática pelo host. Vínculos de outros clientes não são requisitos do projeto.
