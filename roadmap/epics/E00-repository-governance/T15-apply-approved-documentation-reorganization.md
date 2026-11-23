---
id: E00-T15
epic: E00
depends_on: [E00-T14]
---

# Aplicar a reorganização documental aprovada

## Objetivo

Executar o plano aprovado na E00-T14, preservando IDs, histórico e links.

## Entradas

- Plano aprovado entregue pela E00-T14 em `docs/plans/` — mapa de movimentação, convenção de nomes e índice único.
- `docs/DOCUMENTATION-STANDARD.md` — padrão a substituir pelo aprovado.
- `scripts/validate-documentation.mjs` — validador a ajustar.
- `scripts/build-roadmap-view.mjs` — leitura de documentos pela visualização local.

## Entregáveis

- Documentos movidos, mesclados ou arquivados conforme o mapa.
- `docs/DOCUMENTATION-STANDARD.md` e o índice único atualizados.
- `scripts/validate-documentation.mjs` e testes cobrindo a nova convenção.
- `CLAUDE.md` e skills do projeto apontando para o núcleo normativo.
- Pastas de modelos consolidadas conforme o plano.

## Subtarefas

- [ ] Mover arquivos com `git mv` para preservar o histórico.
- [ ] Atualizar links relativos e o índice.
- [ ] Ajustar o validador e seus testes.
- [ ] Atualizar o contrato do agente e as skills.
- [ ] Conferir a visualização local do roadmap.

## Validações

- `pnpm docs:check` e `pnpm test:ci-scripts` passam.
- `pnpm roadmap:view` gera a página sem links quebrados.
- Nenhum ID de tarefa, decisão ou plano mudou.

## Critérios de aceite

- [ ] A estrutura de `docs/` segue a taxonomia aprovada.
- [ ] Existe um único índice de documentos.
- [ ] O validador impede a volta dos problemas de nome e organização tratados.

## Resultado

Não iniciada.
