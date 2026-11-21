---
id: E11-T06
epic: E11
depends_on: []
---

# Definir as extensões de interação da agenda

## Objetivo

Fechar as decisões que impedem especificar resize superior, navegação multidia no mobile, faixa sem horário e movimentação de treinos concluídos. Entrega documental, sem implementar essas extensões.

## Entradas

- [docs/plans/agenda/RECONCILIATION.md](../../../docs/plans/agenda/RECONCILIATION.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/plans/agenda/AGENDA-DRAG-AND-DROP.md](../../../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) — consultar o contrato ou seção correspondente ao escopo.
- [docs/product/telas/agenda-regras-de-produto.md](../../../docs/product/telas/agenda-regras-de-produto.md) — consultar o contrato ou seção correspondente ao escopo.
- [src/features/training/ui/training-calendar.ts](../../../src/features/training/ui/training-calendar.ts) — consultar o contrato ou seção correspondente ao escopo.

## Entregáveis

Resultado verificável descrito nos critérios abaixo, com evidências vinculadas a esta tarefa. Antes de editar código, aplicar as seções pertinentes da [arquitetura](../../../docs/architecture/TARGET-ARCHITECTURE.md) e os contratos locais. Não carregar planos históricos inteiros.

## Subtarefas

- [ ] Separar planejamento de execução nos cards concluídos e definir a representação movida.
- [ ] Definir efeitos do resize superior sobre itens internos e a política temporal histórica.
- [ ] Definir entrada acessível sem arraste, faixa sem horário no toque e navegação entre dias no mobile.

## Critérios de aceite

- [ ] Cada questão possui decisão registrada ou bloqueio explícito, sem hipótese apresentada como aprovação.
- [ ] ScheduledDate, tarefa sem data e eventual dia inteiro permanecem conceitos distintos.
- [ ] Implementações posteriores são delimitadas por decisões; nada arredonda ou reescreve execução por conveniência visual.

## Fora de escopo

Não autoriza implementar resize superior, recorrência ou alterar registros realizados. Pode ser refinada independentemente da POC.

## Validações

Conferir links, IDs, dependências e coerência com regras de produto. Quando houver implementação autorizada, executar os gates proporcionais e os cenários do plano; registrar o que foi executado e o que ficou pendente. Testes ainda não executados não contam como evidência.

## Resultado

Backlog registrado em 21/11/2026 durante a reconciliação documental. Nenhuma execução desta tarefa foi iniciada por este registro. O status canônico fica exclusivamente no índice do roadmap.
