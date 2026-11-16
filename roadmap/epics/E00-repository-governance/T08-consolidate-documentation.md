---
id: E00-T08
epic: E00
depends_on: [E00-T07]
---

# Consolidar documentação e contexto do Codex

## Autorização

Plano documental aprovado pelo proprietário em 12/11/2026. Uso exclusivo do Codex. Preservar migração visual paralela; sem commit, push, publicação, banco ou dependências.

## Entradas

- `docs/documentation-review.md` — inventário, critérios e plano aprovado.
- `AGENTS.md` — roteiro mínimo.
- `docs/architecture/TARGET-ARCHITECTURE.md` — rotas, componentes e Prisma.
- `docs/product/telas/guia-de-estilo.md` — direção visual atual.
- `scripts/validate-governance.mjs` — contrato existente; somente leitura.

## Critérios de aceite

- [x] Fontes normativas, propostas e histórico distinguíveis.
- [x] Leitura dirigida por tarefa e seção.
- [x] Consolidações preservam conteúdo exclusivo e origens imutáveis.
- [x] Links, IDs, dependências e ponteiros validados.
- [x] Trabalho paralelo preservado; nenhuma publicação.

## Resultado

Consolidação concluída: 12 documentos redundantes removidos com fonte integral em commit imutável e SHA-256; roteiro por seção, guias, rotas, governança e vigência corrigidos. Inventário individual e limites em `docs/documentation-review.md`.

Validação: integridade dos dados aprovada; 26 testes existentes de dados/governança aprovados; roadmap e diff sem erros. Nenhum código, dado, dependência ou configuração da aplicação mudou em relação ao snapshot anterior à edição. Sem commit, push ou publicação.

Os corpos dos três documentos visuais em edição paralela foram preservados; receberam notas de vigência. Sua consolidação profunda fica após a migração visual. Skills e 22 junctions permanecem instaladas e ignoradas pelo Git. Estado remoto da PR #76, descoberta de skills pelo host e validação física permanecem não comprovados.
