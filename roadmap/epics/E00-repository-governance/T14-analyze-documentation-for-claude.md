---
id: E00-T14
epic: E00
depends_on: [E00-T12]
---

# Analisar a documentação para uso pelo Claude

## Objetivo

Entregar um diagnóstico e um plano aprovado de reorganização da documentação Markdown, otimizado para o Claude Code ler pouco contexto e encontrar a fonte normativa certa.

## Contexto

Fatos levantados na auditoria de 2026-11-23:

- O repositório versiona 258 arquivos `.md` (cerca de 22,7 mil linhas); `docs/` tem 20 subpastas.
- Há três pastas de modelos: `templates/`, `docs/templates/` e `roadmap/templates/`.
- Registro histórico dividido em quatro lugares: `docs/worklog/` (23 arquivos), `docs/evidence/`, `docs/history/` e `docs/implementation/` (um arquivo).
- Relatórios pontuais na raiz de `docs/`: `REORGANIZATION-2026-11.md` e `documentation-review.md`.
- Nomes sem convenção única de caixa (`CATALOG.md` e `documentation-review.md`) e idioma (`componentes-shadcn.md` e `UPDATING-TRAINING-DATA.md`).
- Três índices mantidos à mão: `docs/README.md`, `docs/CATALOG.md` e os `README.md` por assunto.
- `templates/` guarda formulários manuais anteriores ao app (check-in semanal, mudança de horários, novo treino do coach); a agenda já cobre parte deles.

Esta tarefa não move nem apaga documentos; a execução pertence à E00-T15.

## Entradas

- `docs/README.md` — navegação atual.
- `docs/DOCUMENTATION-STANDARD.md` — padrão vigente a revisar.
- `docs/CATALOG.md` — catálogo atual.
- `docs/REORGANIZATION-2026-11.md` — decisões da reorganização anterior.
- `scripts/validate-documentation.mjs` — regras automatizadas que o novo padrão precisa manter ou ajustar.
- `CLAUDE.md` — contrato raiz entregue pela E00-T12.

## Entregáveis

- Plano em `docs/plans/` (pasta definida pelo próprio padrão) com:
  - inventário por pasta: quantidade, finalidade, frequência de uso pelo agente e destino proposto;
  - taxonomia única: normativo (arquitetura, estilo, padrões de entrega), operacional (roadmap ativo, guias) e arquivo (histórico, evidência, diário);
  - convenção de nomes (caixa, idioma, prefixos de data e de ID);
  - índice único e o que passa a ser gerado ou validado por script;
  - estratégia de contexto para o Claude: o que entra no `CLAUDE.md` por import, o que vira skill do projeto em `.claude/skills/` e o que fica fora do contexto padrão;
  - destino de `templates/`, de `docs/templates/` e de `roadmap/templates/`;
  - mapa de movimentação com caminho antigo e novo, para preservar links e IDs.

## Subtarefas

- [ ] Inventariar `docs/`, `roadmap/`, `templates/` e as instruções de agente.
- [ ] Identificar documentos normativos, históricos, duplicados e obsoletos.
- [ ] Propor taxonomia, convenção de nomes e índice único.
- [ ] Propor a estratégia de contexto do Claude (imports, skills, exclusões).
- [ ] Montar o mapa de movimentação.
- [ ] Submeter o plano ao responsável e registrar a aprovação.

## Validações

- O inventário soma todos os `.md` versionados (`git ls-files '*.md'`).
- O plano diferencia fato, decisão, proposta e incógnita.
- `pnpm docs:check` passa com o plano adicionado ao catálogo.

## Critérios de aceite

- [ ] Todo documento atual tem destino proposto: manter, mover, mesclar, arquivar ou remover.
- [ ] O plano define um núcleo normativo pequeno, lido por padrão, e explicita o que fica fora do contexto.
- [ ] O responsável aprovou o plano.

## Resultado

Não iniciada.
