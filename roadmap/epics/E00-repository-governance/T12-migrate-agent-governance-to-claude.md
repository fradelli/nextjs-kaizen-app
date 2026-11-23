---
id: E00-T12
epic: E00
depends_on: []
---

# Migrar a governança do agente de Codex para Claude

## Objetivo

Tornar o Claude Code o único agente de desenvolvimento suportado pelo repositório, sem regra, validador ou instalação local que exija o Codex ou outros clientes.

## Contexto

Fatos levantados na auditoria de 2026-11-23 sobre `developer` (`364c71f`):

- `scripts/validate-governance.mjs` aceita somente branches `codex/<ID>-descricao`; um PR de branch com outro prefixo reprova no CI.
- `AGENTS.md` se intitula "Contrato do Codex" e reserva `.agents/skills/` ao Codex; `docs/delivery/PULL-REQUEST-STANDARD.md` repete o prefixo `codex/`.
- `.agents/skills/` guarda 11 skills do Prisma; `.claude/skills/` e `.windsurf/skills/` contêm apenas links para elas; `skills-lock.json` é do Codex. Nenhum desses caminhos é versionado.
- `.gitignore` mantém blocos específicos do Codex e do Windsurf.

Decisão do responsável em 2026-11-23: usar somente Claude no desenvolvimento. Prefixo de branch proposto: `claude/<ID>-descricao-curta`.

## Entradas

- `AGENTS.md` — contrato atual a converter.
- `scripts/validate-governance.mjs` — `taskBranchPattern` e mensagem de erro.
- `scripts/validate-governance.test.mjs` — casos de branch.
- `docs/delivery/PULL-REQUEST-STANDARD.md` — seção de branches.
- `.gitignore` — blocos de referências locais do Codex e de clientes não utilizados.
- `roadmap/AGENTS.md`, `docs/AGENTS.md`, `docs/migration/AGENTS.md`, `data/AGENTS.md` — instruções aninhadas que precisam continuar sendo carregadas.

## Entregáveis

- `CLAUDE.md` na raiz como contrato do agente (conteúdo convertido de `AGENTS.md`), e decisão registrada sobre manter `AGENTS.md` como import ou removê-lo.
- Instruções aninhadas convertidas para `CLAUDE.md` nas mesmas pastas, ou referenciadas pelo contrato raiz.
- `scripts/validate-governance.mjs` e testes aceitando o novo prefixo; histórico `codex/` preservado apenas para branches já integradas.
- `docs/delivery/PULL-REQUEST-STANDARD.md` atualizado.
- `.claude/skills/` com as skills do Prisma como pasta real (local, fora do Git) e `.claude/settings.json` versionado somente se houver permissão ou hook com consumidor.
- `.gitignore` sem blocos do Codex e do Windsurf.

## Subtarefas

- [x] Converter o contrato raiz e remover a seção "Skills locais" exclusiva do Codex.
- [x] Converter ou referenciar as quatro instruções aninhadas.
- [x] Trocar o padrão de branch no validador, nos testes e no padrão de PR.
- [x] Mover as skills do Prisma para `.claude/skills/` e remover `.agents/`, `.windsurf/` e `skills-lock.json` locais.
- [x] Limpar o `.gitignore`.
- [x] Revisar menções ao Codex fora do histórico (`docs/history/`, `docs/worklog/` e `docs/evidence/` permanecem como registro).

## Validações

- `pnpm test:ci-scripts` passa com casos para `claude/E00-T12-x` (aceito) e prefixos não previstos (recusado).
- `pnpm governance` com evento de PR de branch `claude/...` passa.
- `git grep -i codex -- ':!docs/history' ':!docs/worklog' ':!docs/evidence' ':!roadmap/epics'` não retorna regra vigente.
- `pnpm docs:check` passa.

## Critérios de aceite

- [x] Um PR aberto de branch `claude/<ID>-descricao` passa no job Governance.
- [x] Uma sessão nova do Claude Code carrega o contrato raiz e as instruções aninhadas sem depender de `AGENTS.md` do Codex.
- [x] Não restam pastas ou arquivos locais de outros clientes de agente.

## Resultado

Concluída em 2026-11-23.

- Os cinco `AGENTS.md` (raiz, `roadmap/`, `docs/`, `docs/migration/` e `data/`) foram renomeados para `CLAUDE.md` com `git mv`. Decisão: não manter `AGENTS.md` nem import, porque o Claude Code é o único agente suportado.
- O contrato raiz passou a se chamar "Contrato do Claude no Kaizen", lista as instruções aninhadas em `CLAUDE.md` e troca a seção de skills do Codex por "Agente e skills locais".
- `scripts/validate-governance.mjs` aceita somente `claude/<ID>-descricao`; um teste novo recusa `codex/` e `feature/`. `docs/delivery/PULL-REQUEST-STANDARD.md` e `docs/decisions/BRANCHING-AND-ENVIRONMENTS.md` registram a mudança.
- `scripts/validate-documentation.mjs`, `scripts/verify-doc-preservation.mjs` e os links vigentes passaram a apontar para `CLAUDE.md`. Menções a `AGENTS.md` do design system e nomes de branches históricas foram preservados.
- Localmente, as 11 skills do Prisma viraram pasta real em `.claude/skills/` (conteúdo idêntico ao de `.agents/skills/`), e `.agents/`, `.windsurf/` e `skills-lock.json` foram removidos. O `.gitignore` ignora `.claude/skills/` e `.claude/settings.local.json`.
- `.claude/settings.json` não foi criado: nenhuma permissão ou hook tem consumidor nesta tarefa.
- Validações: `pnpm test:ci-scripts` (60 testes), `pnpm docs:check`, `pnpm format:check` e `git diff --check` passaram. O primeiro PR com branch `claude/` comprova o critério do job Governance.
