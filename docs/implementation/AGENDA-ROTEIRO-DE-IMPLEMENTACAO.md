# Roteiro de implementação da agenda

Planejamento de execução em 17/11/2026. Regras na [agenda](../product/telas/agenda-regras-de-produto.md), relações no [modelo conceitual](../architecture/MODELO-CONCEITUAL-DA-AGENDA.md) e constraints no [plano físico](../architecture/AGENDA-TABELAS-E-CONSULTAS-PROPOSTAS.md). Cada etapa termina com um resultado verificável.

## Execução em 17/11

As migrations de fundação e transações e o repositório da agenda foram implementados. A leitura por intervalo retorna DTOs serializáveis com tarefas e pais em lote. As mutações usam transação Serializable, repetição limitada após falha de serialização, revisões e recibos de operação. Essa estratégia substitui, neste incremento, a proposta de locks explícitos; os testes PostgreSQL verificam o comportamento concorrente.

O histórico desta etapa guarda snapshots por entidade e revisão, inclusive a cor resolvida da reserva. Edição de paleta e recorrência ainda precisam das versões de cor e ocorrências previstas no plano. A interface, o deploy local, os benchmarks e a migração dos escritores antigos continuam pendentes. O tratamento de árvores mais profundas retorna erro explícito até a operação recursiva ser implementada. Não expor esse caso pela interface antes disso.

## 1. Preparar o recorte e a migration

Conferir git status e migrations aplicadas. Preservar o trabalho de planos em andamento. Criar prisma/models/agenda.prisma e uma migration nova. Acrescentar somente as relações necessárias em Workspace. Usar prisma migrate diff para gerar SQL, revisar e acrescentar as constraints descritas no plano físico antes de aplicar no banco de teste.

O primeiro schema contém lista, tag e versões de cor, to-do e histórico, atividade e histórico, reserva e histórico, classificação da tarefa e recibo de operação. UUID e FKs compostas com workspace impedem vínculos cruzados. A reserva referencia uma versão de classificação do próprio to-do. Evitar occurrence_id até a etapa de recorrência.

Definir as constraints para data sem horário versus intervalo completo, fim posterior ao início, estimativa em múltiplos de 15, revisão positiva e FK do pai. Validar Prisma e aplicar todas as migrations em banco de teste vazio. Comparar o schema gerado com as migrations antes de seguir.

**Saída:** testes PostgreSQL rejeitam intervalo incompleto, workspace cruzado e classificação de outra tarefa; aceitam reserva fora do horário do pai e atividades coincidentes. Capturar teste de drift e o plano de reversão por remoção apenas das tabelas novas em ambiente descartável. O banco local recebe deploy depois da validação.

## 2. Domínio e contratos

Criar src/features/schedule/domain, application e data conforme os boundaries existentes. Funções puras recebem relógio e timezone. Centralizar encaixe em 15 minutos, intervalo semiaberto, resolução de cor e classificação de reserva futura, em andamento ou encerrada. Estimar sem duração usa 30 minutos e limita ao próximo obstáculo ou fim do pai.

Contratos de comando usam operationId, expectedRevision, identidade e dados da operação. Workspace é resolvido no servidor. Resultado discriminado contém saved, conflict, invalid ou missing; saved inclui revisões e datas afetadas. Erro tem código traduzível. Contratos de leitura retornam objetos serializáveis, sem tipos Prisma.

**Saída:** exemplos das 11h45 até 12h, início ocupado, meia-noite e movimento com manutenção dos horários aprovados em testes de domínio. Reservas iniciadas mantêm vínculo e cor na troca de lista.

## 3. Persistência do percurso mínimo

Criar repositório de agenda em data com leitura e escrita separadas por responsabilidade. Casos de uso em application incluem criar lista, criar tarefa, criar atividade, reservar tarefa, remover reserva e definir conclusão. Escritores seguem ordem global de locks do plano físico. Revisão, recibo e histórico pertencem à mesma transação.

Definir conclusão por estado desejado. Reserva aponta para a tarefa única e cada representação lê a mesma conclusão. Reservar numa área livre cria bloco e reserva atomicamente. Cancelar prévia é operação local, sem persistência.

**Saída:** testes de integração em tests/integration/schedule-mutations.test.ts cobrem duas reservas para uma tarefa, reenvio idempotente, duas reservas concorrentes na mesma lacuna e rollback após falha parcial. Usar as fixtures PostgreSQL existentes.

## 4. Leitura da semana

Criar queryScheduleRange com início/fim explícitos. Retornar atividades, reservas e faixa sem horário. Buscar pais e tarefas em lote, inclusive pai fora da janela. Manter consulta por overlap compatível com o índice GiST e paginação das listas por chave.

Adaptar src/app/workout/page.tsx, calendar-range.tsx e calendar-day/route.ts para o contrato da agenda. Preservar carga inicial no servidor e cache por dia. Identidades de origem distinguem atividade comum, reserva de to-do e treino projetado. O adaptador de treino chama as consultas atuais e conserva occurrenceKey para abrir o executor.

**Saída:** agenda vazia funciona sem plano; atividade multidia aparece em todas as datas atravessadas; reserva fora do pai aparece na própria data. Teste de ampliação da grade continua buscando apenas datas ausentes. Novo teste impede duplicação de um treino quando projetado e materializado.

## 5. Interface do percurso completo

Painel esquerdo com listas, criação e conclusão de to-dos. Painel direito com atividade, escolha de lista/tag, data e horário. Agendar pelo formulário escolhe bloco, início e duração e mostra prévia. Usar exports reais Mira e tradução. Componentes têm pastas próprias e props tipadas.

Criar ações em src/app/workout/schedule-actions.ts, reutilizando validação de origem, resolução de workspace e feedback por toast. O menu de abertura diferencia editor comum e executor pelo vínculo funcional. No mobile, editor abre inferiormente. Invalidar dados de origem e destino e ignorar respostas de leitura antigas após mutação.

**Saída:** criar “Revisar PR”, reservar duas vezes, recarregar, concluir pela agenda e conferir checkbox único na lista. Abrir treino continua funcionando. Conferir teclado, mobile e desktop.

## 6. Movimento, mudança de lista e exclusão

Comandos moveActivity, changeTodoList e removeActivity recebem política explícita. Movimento mostra Reajustar horários ou Manter horários, confirmando com Mover. Exclusão mostra Manter na agenda ou Remover da agenda, confirmando com Excluir. Cancelar preserva estado.

Alteração do pai aplica a diferença de horário aos itens quando solicitado. Manter horário conserva pai da reserva mesmo fora do intervalo. Atividade comum fora do novo intervalo perde vínculo. Trocar lista afeta reservas ainda não iniciadas, usa cor do novo pai/lista e conserva histórico das anteriores. Excluir verifica todos os vínculos, incluindo externos ao intervalo.

**Saída:** teste do percurso Trabalho 9h–12h → 11h–14h com reserva às 9h30, recarga e exclusão mantendo itens. Testar filho adicionado após abrir o diálogo, nova tentativa da mesma operação e duas alterações concorrentes. Testar remover preservando a tarefa e execução.

## 7. Recorrência e registros reais

Nova migration acrescenta séries versionadas, ocorrências com identidade original, exceções e registros manuais. Validar primeiro duas leituras da mesma ocorrência sem materialização duplicada. Remarcação preserva chave original. Edição futura mantém exceções específicas. Checkpoint diário captura passado sem depender de o usuário abrir o app.

Registros reais têm destino exclusivo e histórico de correção. Testar leitura de segunda concluída e terça pendente, duas reservas da mesma ocorrência, exceção que muda de semana e duração real de 42 minutos para reserva de 30.

**Saída:** critérios de recorrência e tempo da especificação consolidados com evidências. A integração com dieta exige contrato próprio.

## 8. Integração final e desempenho

Fixar a identidade do treino após conferir qual modelo de planos foi entregue. Criar FK do vínculo de agenda para a identidade executável real. Remover escritores antigos somente depois de migrar todos os consumidores. Preservar preparação, séries, carga, confirmação de descanso e histórico do executor nos testes de integração existentes.

Executar benchmarks definidos no plano físico e registrar EXPLAIN, consultas e payload de uma semana. Depois executar db:validate, typecheck, testes direcionados, lint, estrutura e build. Falhas preexistentes devem ser registradas com reprodução e escopo. A entrega termina com testes visuais dos painéis e recarga do percurso mínimo.

Os gestos de arraste usam os mesmos comandos. A escolha de kit continua fora deste roteiro. Pausas internas, profundidade visual além do nível inicial e detalhes de retenção definitiva continuam exigindo decisão antes de seus incrementos.
