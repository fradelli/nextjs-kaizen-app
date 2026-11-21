# Agenda — desempenho e organização

- **Tipo:** Evidência.
- **Área:** Agenda.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Implementação de 18/11/2026 autorizada após a revisão de desempenho da agenda. Este documento registra mudanças técnicas; as [regras de produto](../../product/telas/agenda-regras-de-produto.md) continuam normativas.

## Atualizações após uma gravação

A [Server Action](../../../src/app/workout/schedule-actions.ts) valida origem, workspace e comando. A transação continua serializável, com revisão por entidade e recibo idempotente. Após gravar, retorna um patch com grupos, tarefas e tags alterados, IDs removidos e os intervalos de agenda afetados. Não chama revalidatePath para as operações de atividades comuns/to-dos.

O patch inclui contagens calculadas no servidor. O cliente confirma a alteração somente após receber a resposta e aplica os registros por ID/revisão. Erros continuam no Toast Mira. Conflitos/missing retornam a leitura atual dos registros identificáveis, permitindo corrigir/repetir uma edição sem atualizar toda a rota. As regras do executor e suas ações próprias de treino permanecem separadas.

O cliente informa até 84 datas em cache. A resposta consulta apenas as datas carregadas que foram afetadas, reunindo datas contíguas e evitando consultas que atravessem meses vazios. Datas afetadas carregadas durante a gravação, mas ausentes dessa leitura, são invalidadas para uma nova consulta. Conclusão e renomeação de to-do atualizam as reservas pelo ID da tarefa, inclusive ao navegar para outra data.

## Cache e navegação

[CalendarRange](../../../src/features/schedule/ui/components/calendar-range/calendar-range.tsx) pertence à feature schedule. A rota contém somente validação/composição. [queryCalendarPage](../../../src/features/schedule/data/query-calendar-page.ts) coordena a carga inicial no servidor.

[useCalendarDays](../../../src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts) conserva os dias durante a abertura da agenda; não usa cache público do Next nem exige Zustand. Navegação, Hoje/T e quantidade de dias atualizam a URL pelo histórico do navegador. Datas já disponíveis são reutilizadas; somente datas ausentes são buscadas. Os links continuam com href, inclusive para modificadores e abertura em outra aba.

Limites atuais: 84 dias recebidos em memória e quatro leituras simultâneas. Cada data tem uma geração; leituras anteriores a uma mutação são canceladas ou ignoradas. Erros podem ser repetidos sem descartar os outros dias. Montar uma nova agenda ou recarregar a página inicia outra sessão de cache.

Listas e tarefas conservam paginação, evitam pedidos duplicados e mesclam registros pela revisão. Grupos/tarefas removidos não reaparecem por uma página antiga ainda em trânsito. Uma página desconhecida de tarefas não é tratada como vazia apenas porque o contador de pendentes é zero: ela pode conter tarefas concluídas.

## Leitura de treino na grade

[queryTrainingCalendar](../../../src/features/training/data/query-training-calendar.ts) lê apenas a apresentação de calendário: identidade, nome, revisão, estado, horários e intervalos necessários à geometria. Carrega o plano ativo uma vez por consulta e reutiliza a projeção existente de ocorrências, incluindo os registros de remoção. Não carrega resultados de séries nem histórico de exercícios por dia.

O [DTO de calendário](../../../src/features/training/application/training-calendar-dto.ts) é explícito e não se apresenta como uma execução completa. O [adaptador visual](../../../src/features/training/ui/components/training-calendar-event/training-calendar-event.tsx) busca TrainingDayDto completo quando o usuário abre o treino/editor ou a lista de treinos breves. O executor mantém seu contrato completo. A projeção de horários é compartilhada para conservar duração real, pausas e registros de poucos segundos.

O plano legado ainda inclui suas definições de exercícios nessa única leitura inicial: ele não é um novo modelo de Planos. Reduzir esse include exige separar formalmente a definição usada pela projeção semanal, sem modificar a execução por conveniência da grade.

## Renderização e responsabilidades

- [CalendarGrid](../../../src/features/schedule/ui/components/calendar-grid/calendar-grid.tsx): eixo, cabeçalhos, faixa sem horário e composição.
- [CalendarDayColumn](../../../src/features/schedule/ui/components/calendar-grid/components/calendar-day-column/calendar-day-column.tsx): coluna memoizada e seleção local. Movimentos dentro do mesmo intervalo de 15 minutos não atualizam o estado. A geometria depende dos dados da coluna, não do ponteiro ou do relógio.
- [ScheduleWorkspace](../../../src/features/schedule/ui/components/schedule-workspace/schedule-workspace.tsx): composição de contextos de dados, painel e ação de abrir editor. Cards não assinam o estado do formulário.
- Hooks do workspace: cache/paginação, mutações/retry e painel/atalhos têm responsáveis distintos.
- Editores de grupo e tarefa usam comandos discriminados, sem Record aberto. Edição de tags tem componente próprio; formulários antigos sem entrada real foram removidos. A reserva é aberta por identidade; não é fabricado um to-do incompleto para satisfazer uma prop.
- Estilos do evento de treino pertencem ao adaptador de treino; a grade mantém somente composição. Primitives interativas, Tooltip e teclas de atalho continuam vindo de @fradelli/ui.

## Escritas em lote

A exclusão de grupos tem [responsável próprio](../../../src/features/schedule/data/schedule-group-writer.ts). Arquivamento de tarefas e retirada de reservas são feitos em lote; snapshots de revisão usam createMany. A [troca de lista](../../../src/features/schedule/data/schedule-todo-placement-writer.ts) carrega as últimas versões de classificação em conjunto, cria as novas versões em lote e atualiza as reservas por tarefa. Pais afetados são revisados uma vez por operação atômica, com snapshot final.

Mudanças de cor em tags também atualizam atividades e reservas em lote. Mudanças de cor de listas criam as versões de classificação em conjunto e atualizam as reservas externas por tarefa. Reservas históricas continuam fora do alcance das alterações classificatórias futuras. As operações permanecem na transação do recibo, com rollback e validação de workspace. Não houve migration ou mudança de schema nesta etapa.

Ainda existe uma atualização por tarefa quando cada reserva precisa de placementVersionId diferente. Isso é explícito; não é anunciado como uma única query independentemente da quantidade de tarefas.

## Validação e limites

TypeScript, lint direcionado, formato e build de produção são as verificações desta etapa. Os testes existentes foram adaptados às novas localizações/props, mas suítes de testes e validação de navegador não foram executadas, conforme a orientação do usuário.

A checagem de fronteiras entre camadas passa. A checagem global de estrutura aponta o arquivo preexistente solar.png dentro da pasta kaizen-logo. A CLI do Next emitiu aviso sobre a versão instalada; nenhuma dependência foi atualizada nesta refatoração. Esses itens impedem declarar o CI global aprovado.

Não foram medidos novos tempos de resposta nem contagens de renderização em execução. A redução de consultas e a ausência de refresh global são verificáveis pelo código; a comparação de latência depende da validação manual.

Percursos para essa validação: excluir grupos vazios e preenchidos nas duas políticas; criar/renomear grupos e to-dos sem perder foco; concluir/reabrir tarefas; editar cores; navegar por datas já carregadas, reduzir/ampliar dias e voltar pelo navegador; selecionar períodos com painel aberto; abrir um treino e conferir a execução completa. Drag and drop e novas regras de recorrência seguem fora desta entrega.
