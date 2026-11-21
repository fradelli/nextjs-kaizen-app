---
id: E11-T08
epic: E11
depends_on: []
---

# Definir apresentação de sobreposições e agrupador

## Objetivo

Detalhar o agrupamento visual com dois cards e +N, sem alterar a liberdade de sobreposição nem confundir apresentação com vínculo.

## Entradas

- [docs/plans/agenda/RECONCILIATION.md](../../../docs/plans/agenda/RECONCILIATION.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/plans/agenda/AGENDA-DRAG-AND-DROP.md](../../../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/product/telas/agenda-regras-de-produto.md](../../../docs/product/telas/agenda-regras-de-produto.md) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/ui/schedule-layout.ts](../../../src/features/schedule/ui/schedule-layout.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/ui/components/calendar-grid/calendar-grid.entries.ts](../../../src/features/schedule/ui/components/calendar-grid/calendar-grid.entries.ts) — consultar o contrato ou seção correspondente ao escopo.

## Entregáveis

Resultado verificável descrito nos critérios abaixo, com evidências vinculadas a esta tarefa. Antes de editar código, aplicar as seções pertinentes da [arquitetura](../../../docs/architecture/TARGET-ARCHITECTURE.md) e os contratos locais. Não carregar planos históricos inteiros.

## Subtarefas

- [ ] Definir ordem das atividades visíveis e tratamento de cruzamentos parciais.
- [ ] Definir abertura do agrupador por mouse, toque e teclado.
- [ ] Definir escolha de alvo quando um drop encontra atividades agrupadas.

## Critérios de aceite

- [ ] Regras de ordem e cruzamentos estão decididas ou registradas como pendentes.
- [ ] Todas as atividades permanecem acessíveis e identificáveis.
- [ ] O plano distingue esta entrega do DnD inicial e do vínculo entre atividades.

## Fora de escopo

Esta tarefa entrega especificação; implementação posterior depende do aceite visual. Não bloqueia sobreposição independente existente.

## Validações

Conferir links, IDs, dependências e coerência com regras de produto. Quando houver implementação autorizada, executar os gates proporcionais e os cenários do plano; registrar o que foi executado e o que ficou pendente. Testes ainda não executados não contam como evidência.

## Resultado

Backlog registrado em 21/11/2026 durante a reconciliação documental. Nenhuma execução desta tarefa foi iniciada por este registro. O status canônico fica exclusivamente no índice do roadmap.
