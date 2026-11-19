# Agenda — comparação do modelo com o repositório

Inspeção estática de 17/11/2026. O estado abaixo é histórico; a [refatoração de desempenho de 18/11](AGENDA-PERFORMANCE-E-ORGANIZACAO.md) descreve o fluxo posterior. Base de produto: [modelo conceitual](../architecture/MODELO-CONCEITUAL-DA-AGENDA.md) e [diálogos aprovados](../product/telas/agenda-regras-de-produto.md#diálogos-de-exclusão-e-movimento). Evidências abaixo descrevem o checkout local, inclusive arquivos em andamento. O banco em execução e sua lista de migrations aplicadas não foram consultados.

## Percurso real de leitura e gravação

- A [página semanal](../../src/app/workout/page.tsx) chama a consulta de semana do workspace de treino. O [controlador da grade](../../src/features/schedule/ui/components/calendar-range/calendar-range.tsx) recebe dias do servidor como TrainingDayDto e busca apenas datas ausentes. A [rota diária](../../src/app/workout/calendar-day/route.ts) chama a mesma consulta com um dia. Preservar a carga inicial e o cache por data, substituindo o contrato de leitura à medida que atividades comuns ganharem persistência.
- As [ações do editor](../../src/app/workout/training-actions.ts) validam as entradas e encaminham inclusão, atualização e exclusão como operações de treino. O [schema de treino](../../prisma/models/training.prisma) dá a TrainingDayActivity data civil, minutos de início e fim, tipo de treino, revisão e exclusão lógica. Seu pai é a relação de preparação do treino. Um período multidia precisa de um fim com data própria.
- No [repositório Prisma](../../src/features/training/data/prisma-training-repository.ts), deleteTrainingActivity materializa a ocorrência projetada, valida estado e revisão, marca deletedAt no principal e nos filhos pelo parentActivityId. Recusa exclusão em estados concluído, em andamento ou pausado. Usar essa operação para “Manter na agenda” retiraria justamente os filhos que devem sobreviver. São regras do fluxo de treino; a agenda precisa de uma operação própria.
- Os [testes de agendamento de treino](../../tests/integration/training-activity-scheduling.test.ts) cobrem identidade após movimento, preparação, atividade concluída, concorrência e falha no destino. O [teste da grade](../../src/features/schedule/ui/components/calendar-range/calendar-range.test.tsx) cobre ampliação e redução do intervalo sem buscar duas vezes o oitavo dia. São referências de regressão identificadas por leitura; esta inspeção não executou as suítes.

## Mapa do primeiro percurso

| Passo | Cobertura encontrada | Mudança necessária |
|---|---|---|
| Criar “Revisar PR” em Trabalho | Ausente nos modelos Prisma inspecionados: não há lista de to-dos e tarefa comum com identidade própria. | Persistir lista e tarefa no workspace, com conclusão independente do horário. |
| Reservar às 9h30, inclusive em mais de um dia | Parcial: a grade lê horários de atividades de treino. Não há reserva distinta de to-do. | Cada reserva aponta para a mesma tarefa ou para uma ocorrência recorrente específica. Confirmar ou cancelar não duplica o checkbox. |
| Mover Trabalho e manter os horários | Divergente: o vínculo encontrado representa preparação esportiva. | Persistir intervalo e vínculo separadamente. Uma reserva fora do intervalo continua com o pai e herda sua cor. Uma Daily que saia do intervalo segue a regra própria de atividade comum. |
| Recarregar a página | Parcial: há leitura inicial e incremental de dias de treino. | A consulta deve trazer reservas pelo próprio intervalo, inclusive quando o pai cai fora da janela consultada, com dados suficientes para resolver a cor. |
| Mover o to-do de lista | Sem representação de lista, cor histórica e alcance sobre várias reservas. | Alterar o grupo do to-do; aplicar a mudança às reservas futuras. Manter o vínculo e a classificação históricos das encerradas, sem depender apenas do grupo atual da tarefa. |
| Excluir Trabalho e manter itens | Divergente: o escritor de treino marca os filhos como excluídos. | Contar por vínculo, inclusive fora do intervalo. Desvincular os itens preservando horários, checkbox e execução. A reserva passa a usar a cor da lista. |
| Excluir Trabalho e remover itens | Parcial apenas no mecanismo de exclusão lógica do treino. | Retirar as ocorrências e reservas no escopo escolhido, preservar o to-do e seu histórico. Cancelar o diálogo não grava nada. |

## Relações candidatas à modelagem

Começar por lista, to-do, atividade de agenda, tag opcional e reserva. A atividade pode ter outra atividade como pai. A reserva tem destino de tarefa e vínculo opcional com atividade pai; sua identidade e seu intervalo sobrevivem à desvinculação. Lista e atividade pai são fontes distintas de cor. Para histórico, comparar classificação vigente por período com registro da classificação no momento da mudança. Definir antes da migration o tratamento de uma reserva em andamento durante troca de lista, pois a regra aprovada distingue futuras e encerradas.

Em seguida modelar regra de repetição, identidade original da ocorrência, exceções e registro manual de execução. A leitura precisa distinguir atividade datada sem hora, intervalo contínuo entre datas e tarefa ainda sem data. Para treino, manter referência explícita à ocorrência executável; uma tag Treino não fornece essa identidade. Há um [modelo de planos em andamento](../../prisma/models/workout-plans.prisma) no checkout: validar sua versão efetiva e o vínculo com o executor antes de escolher uma chave de integração.

## Ordem de refatoração e critérios

1. **Fechar o desenho físico do primeiro percurso.** Definir chaves, escopo do workspace, revisão, preservação histórica e índices para consulta por intervalo e por pai. Verificar migrations aplicadas em ambiente local antes de preparar qualquer mudança.
2. **Implementar lista → reserva → conclusão como fluxo vertical.** Criar e reservar por formulário. Recarregar e conferir o mesmo checkbox na lista e nos cards. Testar ocupação interna, duas reservas da mesma tarefa e cancelamento da prévia.
3. **Integrar leitura de agenda e treino.** Usar um contrato de apresentação da grade com origem e destino de abertura explícitos. Manter o executor responsável por séries, carga e descanso. Testar agenda sem plano ativo, treino abrindo o executor e card comum com tag Treino abrindo o editor.
4. **Implementar movimento, troca de lista e exclusão.** Aplicar a escolha em uma transação, validar revisão e atualizar as datas afetadas no cache. Testar uma reserva fora do pai, dois dias distintos, alteração concorrente e falha parcial. Cobrir os dois botões de confirmação e o cancelamento pelas entradas normais da interface.
5. **Acrescentar recorrência, exceções e tempo manual** com os critérios do modelo conceitual. Conectar os gestos de arraste às mesmas operações já validadas pelo formulário.

**Teste de saída da primeira integração:** Trabalho muda de 9h–12h para 11h–14h. Ao manter os horários, “Revisar PR” continua às 9h30 após recarregar e herda a cor de Trabalho. Ao excluir Trabalho e manter itens, a mesma reserva continua às 9h30 e passa a herdar a cor da lista. Usar cores distintas no cenário para tornar a mudança observável. O checkbox e eventual tempo real informado permanecem associados à tarefa.
