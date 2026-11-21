---
id: E11-T04
epic: E11
depends_on: [E11-T03]
---

# Mover e redimensionar uma reserva individual

## Objetivo

Criar os contratos ausentes para editar somente a reserva selecionada, sem mover o pai nem alterar outras reservas da tarefa.

## Entradas

- [docs/plans/agenda/RECONCILIATION.md](../../../docs/plans/agenda/RECONCILIATION.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/plans/agenda/AGENDA-DRAG-AND-DROP.md](../../../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/product/telas/agenda-regras-de-produto.md](../../../docs/product/telas/agenda-regras-de-produto.md) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/application/schedule-command.ts](../../../src/features/schedule/application/schedule-command.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/data/schedule-writer.ts](../../../src/features/schedule/data/schedule-writer.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/ui/components/reservation-editor/reservation-editor.tsx](../../../src/features/schedule/ui/components/reservation-editor/reservation-editor.tsx) — consultar o contrato ou seção correspondente ao escopo.

## Entregáveis

Resultado verificável descrito nos critérios abaixo, com evidências vinculadas a esta tarefa. Antes de editar código, aplicar as seções pertinentes da [arquitetura](../../../docs/architecture/TARGET-ARCHITECTURE.md) e os contratos locais. Não carregar planos históricos inteiros.

## Subtarefas

- [ ] Definir comandos e validar revisão da reserva e dos pais afetados.
- [ ] Reutilizar ocupação, grade temporal, histórico e recibos.
- [ ] Integrar editor e gesto usando a mesma operação.

## Critérios de aceite

- [ ] Reserva mantém ID, todoId e checkbox compartilhado.
- [ ] Editar uma reserva não move o pai nem suas irmãs.
- [ ] Ocupação interna, cancelamento, retry e concorrência são cobertos por testes.

## Fora de escopo

Sem recorrência, inferência de execução ou alteração implícita de todas as reservas.

## Validações

Conferir links, IDs, dependências e coerência com regras de produto. Quando houver implementação autorizada, executar os gates proporcionais e os cenários do plano; registrar o que foi executado e o que ficou pendente. Testes ainda não executados não contam como evidência.

## Resultado

Backlog registrado em 21/11/2026 durante a reconciliação documental. Nenhuma execução desta tarefa foi iniciada por este registro. O status canônico fica exclusivamente no índice do roadmap.
