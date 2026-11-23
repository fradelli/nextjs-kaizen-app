---
id: E11-T03
epic: E11
depends_on: [E11-T02]
---

# Integrar os gestos aprovados à persistência

## Objetivo

Conectar o recorte aprovado da POC aos comandos existentes de atividades comuns, agendamento e troca de grupo, preservando revisão, recibos e cache.

## Entradas

- [docs/plans/agenda/RECONCILIATION.md](../../../docs/plans/agenda/RECONCILIATION.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/plans/agenda/AGENDA-DRAG-AND-DROP.md](../../../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/product/telas/agenda-regras-de-produto.md](../../../docs/product/telas/agenda-regras-de-produto.md) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/application/schedule-command.ts](../../../src/features/schedule/application/schedule-command.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/schedule/ui/components/schedule-workspace/hooks/use-schedule-mutations.ts](../../../src/features/schedule/ui/components/schedule-workspace/hooks/use-schedule-mutations.ts) — consultar o contrato ou seção correspondente ao escopo.
- [src/app/workout/schedule-actions.ts](../../../src/app/workout/schedule-actions.ts) — consultar o contrato ou seção correspondente ao escopo.

## Entregáveis

Resultado verificável descrito nos critérios abaixo, com evidências vinculadas a esta tarefa. Antes de editar código, aplicar as seções pertinentes da [arquitetura](../../../docs/architecture/TARGET-ARCHITECTURE.md) e os contratos locais. Não carregar planos históricos inteiros.

## Subtarefas

- [ ] Registrar aprovação da POC e resolver suas limitações impeditivas.
- [ ] Usar create/update/move_activity, reserve/reserve_new e change_list conforme a intenção.
- [ ] Integrar confirmações de pai, estados pendentes e reconciliação de falhas.

## Critérios de aceite

- [ ] Um gesto válido confirmado produz uma operação idempotente; movimento de ponteiro não grava.
- [ ] Reenvio, concorrência e falha transacional não duplicam tarefas/reservas nem sobrescrevem revisões mais recentes.
- [ ] Keep/shift e mudança de grupo respeitam a distinção entre atividade interna e reserva de to-do.
- [ ] Recarga preserva o resultado; cache recebe apenas as alterações necessárias.

## Fora de escopo

Não incluir reservas individuais, vínculos novos entre atividades, recorrência ou treino realizado neste incremento.

## Validações

Conferir links, IDs, dependências e coerência com regras de produto. Quando houver implementação autorizada, executar os gates proporcionais e os cenários do plano; registrar o que foi executado e o que ficou pendente. Testes ainda não executados não contam como evidência.

## Resultado

Backlog registrado em 21/11/2026 durante a reconciliação documental. Nenhuma execução desta tarefa foi iniciada por este registro. O status canônico fica exclusivamente no índice do roadmap.
