---
id: E11-T01
epic: E11
depends_on: []
---

# Validar a base integrada da agenda

## Objetivo

Verificar os fluxos já integrados na PR #86 e registrar quais validações continuam pendentes. A tarefa é de validação residual, não de reconstrução da agenda.

## Entradas

- [docs/plans/agenda/RECONCILIATION.md](../../../docs/plans/agenda/RECONCILIATION.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/plans/agenda/AGENDA-DRAG-AND-DROP.md](../../../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/product/telas/agenda-regras-de-produto.md](../../../docs/product/telas/agenda-regras-de-produto.md) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/data/schedule-writer.ts](../../../src/features/schedule/data/schedule-writer.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts](../../../src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts) — consultar o contrato ou seção correspondente ao escopo.
- [tests/integration/agenda-foundation.test.ts](../../../tests/integration/agenda-foundation.test.ts) — consultar o contrato ou seção correspondente ao escopo.

## Entregáveis

Resultado verificável descrito nos critérios abaixo, com evidências vinculadas a esta tarefa. Antes de editar código, aplicar as seções pertinentes da [arquitetura](../../../docs/architecture/TARGET-ARCHITECTURE.md) e os contratos locais. Não carregar planos históricos inteiros.

## Subtarefas

- [ ] Conferir criação/edição de atividade, grupos, tarefas e reservas na base integrada.
- [ ] Conferir cache ao reduzir/ampliar dias, resposta perdida e atualização de datas afetadas.
- [ ] Executar regressões proporcionais e registrar resultados e limitações de navegador/dispositivo.

## Critérios de aceite

- [ ] O relatório distingue código existente, teste executado e validação não realizada.
- [ ] Lista, reserva e card preservam identidade após recarga; ocupação interna e sobreposição independente são verificadas.
- [ ] Movimento de pai e mudança de grupo preservam horários, vínculos e histórico conforme as regras.

## Fora de escopo

Não implementar gestos, recorrência ou reescrever a fundação. Falhas reais encontradas devem ser delimitadas antes de ampliar o escopo.

## Validações

Conferir links, IDs, dependências e coerência com regras de produto. Quando houver implementação autorizada, executar os gates proporcionais e os cenários do plano; registrar o que foi executado e o que ficou pendente. Testes ainda não executados não contam como evidência.

## Resultado

Backlog registrado em 21/11/2026 durante a reconciliação documental. Nenhuma execução desta tarefa foi iniciada por este registro. O status canônico fica exclusivamente no índice do roadmap.
