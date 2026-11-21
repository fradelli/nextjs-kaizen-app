# Plano técnico da Schedule

- **Tipo:** Plano.
- **Área:** Agenda.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Este é o roteiro de implementação proposto na base anterior. A organização posterior da grade está em [Desempenho e organização](../../evidence/agenda/AGENDA-PERFORMANCE-E-ORGANIZACAO.md); a descrição de dois drawers abaixo é histórica, substituída pelo painel direito registrado em [Interface da agenda](AGENDA-INTERFACE-PASSO-A-PASSO.md). As [regras de produto e cenários de aceite](AJUSTES-DA-AGENDA.md) são a referência para comportamento. A primeira entrega cobre consulta semanal, exceções, atividades avulsas, to-dos, blocos e dois drawers. Todas as operações usam clique, toque ou teclado. A primeira fatia demonstrável é mover uma única ocorrência de treino entre semanas e reabrir a agenda.

## Ponto de partida verificado

| Ponto de entrada atual | Mudança planejada |
|---|---|
| [Página do calendário](../../../src/app/workout/page.tsx) | Manter a navegação por data e visão durante a transição. Trocar a leitura e composição da grade por Schedule. Preservar o acesso ao detalhe do treino, inclusive por URL direta. |
| [Leitura semanal](../../../src/features/training/application/get-training-week.ts) e [consultas de treino](../../../src/features/training/data/training-queries.ts) | A leitura atual solicita sete dias. Criar uma consulta enxuta por janela que também sirva à visão mobile. |
| [Grade atual](../../../src/features/schedule/ui/components/calendar-grid/calendar-grid.tsx) | Aproveitar navegação e geometria que passarem nos testes. Remover o acoplamento da grade aos DTOs e às ações de treino. |
| [Repositório de treino](../../../src/features/training/data/prisma-training-repository.ts) e [ações atuais](../../../src/app/workout/training-actions.ts) | Inventariar os escritores de horários e transferi-los para a operação de agenda. Manter prescrição, descanso, séries e execução no domínio de treino. |
| [Workspace](../../../src/lib/security/workspace.ts) | O P0 usa um workspace pessoal fixo resolvido no servidor. Neste escopo ele delimita o calendário. Não pressupor sessão autenticada nem aceitar o dono no formulário. |

## Organização proposta

Seguir as [fronteiras e convenções React do repositório](../../architecture/TARGET-ARCHITECTURE.md). Os nomes abaixo indicam destinos propostos; criar cada arquivo quando sua etapa tiver um consumidor.

| Local | Responsabilidade |
|---|---|
| `src/app/workout/page.tsx` e `schedule-actions.ts` adjacente | Server Component resolve data e visão e chama a consulta diretamente. Server Actions validam origem e entrada, resolvem o workspace e traduzem os resultados de aplicação. |
| `src/features/schedule/domain/` | Datas civis, identidade original, projeção semanal, aplicação de exceções, conflitos e encaixe da subtarefa. Funções puras recebem os dados e o relógio necessário. |
| `src/features/schedule/application/` | Casos de uso: consultar semana, criar atividade avulsa, editar ocorrência, cancelar ocorrência, agendar tarefa, reagrupar e concluir. Tipos de entrada e resultados discriminados por operação. |
| `src/features/schedule/data/` | Consultas Prisma em lote, seleções de campos, mapeamento e transações. Projetar os dados do plano em um contrato pequeno: série, versão, vigência, fuso, horário e referência de treino. |
| `src/features/schedule/ui/components/` | Uma pasta por componente. Página compõe cabeçalho, grade, lista de tarefas e editor. Card apresenta uma ocorrência; o editor controla o rascunho; a lista controla filtros e seleção. O detalhe do treino continua com Training. |
| `prisma/models/schedule.prisma`, `prisma/migrations/`, `messages/` | Estrutura operacional, constraints versionadas e mensagens PT-BR/EN. Definições importadas dos planos seguem o fluxo de importação até eventual substituição explícita. |

**DRY na prática.** Uma função calcula o intervalo efetivo; consulta e validação de conflito usam a mesma regra. Prévia e confirmação de agendamento usam o mesmo cálculo de encaixe, com revalidação no servidor. Os dois drawers disparam a mesma operação para concluir um to-do. DTO da grade carrega apenas dados de exibição e edição. Mensagens de erro são traduzidas a partir de códigos, e componentes visuais vêm dos exports Mira de `@fradelli/ui`. Verificar os exports reais antes de usar um componente; se faltar uma primitiva, entregá-la primeiro no design system.

## Ordem de implementação e aceite

### 1. Contratos e regras puras

- Definir `ScheduleWeek`, ocorrência e origem manual ou recorrente. Distinguir data original, intervalo efetivo e revisão. A identidade da série permanece estável entre versões. Registrar o início original de forma inequívoca quando houver mais de uma entrada no mesmo dia.
- Receber uma data civil; construir domingo inclusivo até o domingo seguinte exclusivo no fuso do calendário. Expandir apenas regras cuja vigência intercepte a consulta. Aplicar exceções, cancelamentos e avulsas por identidade. Ordenar empates de forma determinística.
- Aceite com fixtures pequenas: troca de versão na quinta, plano sem fim, reserva que atravessa meia-noite, intervalos consecutivos e ocorrência movida para dentro/fora da janela. Uma data passada sem execução conserva o estado “sem registro”.

### 2. Persistência e migração

- Introduzir em incrementos as entidades do [desenho relacional](AJUSTES-DA-AGENDA.md): primeiro séries versionadas, exceções, avulsas e fatos diários; depois grupo, assunto, tarefa, bloco e vínculo interno. Usar o vínculo com a versão prescrita para o executor. Uma série semanal não gera sete registros quando a semana é aberta.
- Modelar unicidade da exceção por workspace, série e ocorrência original; unicidade do fechamento por dia; fim posterior ao início; vínculos no mesmo workspace. Indexar vigência, origem e intervalo efetivo. Para as reservas persistidas, validar interseção por tipo nas independentes e por bloco nas filhas. Avaliar constraints SQL quando a expressão exceder o que Prisma representa.
- Especificar conversão dos planos com uma identidade estável por entrada. Tratar mudança de horário como nova vigência da mesma entrada. Testar importação repetida. Antes da troca de fonte, identificar projeções, horários persistidos, preparações e exceções antigas. Para dados de desenvolvimento descartáveis, prever reconstrução por seed e validar o caminho do zero. Para qualquer ambiente a preservar, migrar e conferir contagens, vínculos e histórico antes de retirar colunas; documentar restauração.
- Aceite em PostgreSQL com plano sintético, ocorrência manual, exceção movida e cancelamento. Verificar integridade e isolamento do workspace.

### 3. Leitura semanal e primeira integração com a grade

- Implementar uma consulta de aplicação com leituras em lote: versões vigentes, atividades avulsas, exceções pela origem **e** pelo destino, fechamentos e conclusões necessárias. Se o destino for visível e a versão original já tiver expirado, carregar a referência original pela chave. Compor a resposta em uma visão consistente dos dados.
- Usar a rota de calendário existente. Carregar a semana uma vez; selecionar outro dia já carregado só altera a apresentação. Carregar séries e exercícios apenas ao abrir o executor. Preservar estado vazio, data inválida, erro recuperável e foco após navegação.
- Aceite: recarregar a semana não executa gravações. Inspecionar consultas emitidas; o número de idas ao banco deve depender das famílias de dados da consulta, sem crescer por dia ou por card. Comparar semanas vazia, densa e distante do início de um plano sem fim.

### 4. Edição pelo drawer direito e comandos de recorrência

- Clicar em um card abre seus dados efetivos. Clicar em um horário livre abre criação avulsa. O formulário usa dia, início, fim e tipo; para atividade física, permite modalidade. A ação de treino de plano seleciona uma prescrição existente. Reservar e executar têm entradas distintas.
- Para alteração recorrente, exibir os dois escopos ao salvar. “Somente esta” grava exceção pela origem. “Esta e as próximas” encerra a vigência anterior e abre a seguinte em uma transação; preservar exceções individuais e cancelamentos. Se a mudança de dia da semana tornar uma associação ambígua, informar quais datas precisam de resolução e conservar o estado confirmado. Avulsas usam sua própria revisão.
- Para cada comando aplicar validação de origem, workspace, intervalo, revisão e idempotência. Uma chave de confirmação repetida com o mesmo conteúdo devolve o resultado anterior; com outro conteúdo, recusar. Proposta inicial: serializar gravações concorrentes do calendário pessoal em transação curta e conferir a ocupação efetiva já sob essa proteção. Comparar recorrências semanais pelas vigências e dias locais em comum, considerando exceções. Usar a mesma proteção para ativação de plano e gravação manual.
- Sucesso atualiza semanas de origem e destino e quaisquer semanas carregadas afetadas pela nova vigência. Erro de horário preserva o rascunho; conflito de revisão oferece recarregar o registro antes de reenviar. Fechar ou cancelar a prévia descarta mudanças. Para exclusão, mostrar alcance e preservar os fatos de execução existentes.
- Aceite da primeira fatia: mover o futebol de sábado 21/11/2026 para domingo 22/11, consultar cada semana isoladamente, inclusive na ordem inversa. Repetir o envio após perda da resposta e confirmar uma única exceção. Simular duas abas disputando o mesmo intervalo.

### 5. Lista de to-dos e blocos

- No drawer esquerdo, criar to-do, grupo pessoal e assunto; usar os cinco grupos padrão e o checkbox compartilhado. Oferecer **Mover para grupo** e **Agendar**. Reagrupar altera a organização atual e conserva reservas existentes.
- Em Agendar, escolher dia, início a cada 15 minutos e bloco compatível. Calcular a prévia pela estimativa ou pelos 30 minutos padrão, limitada ao fim do bloco ou à próxima reserva irmã. Se o início estiver ocupado, devolver o conflito. Fora de bloco compatível, confirmar criação do bloco do grupo e da reserva interna na mesma transação. Para grupo personalizado sem tipo definido, propor escolha do tipo antes de confirmar uma reserva independente.
- Pelo editor, alterar início/término ou retirar reserva. Ao mover o bloco inteiro, aplicar o deslocamento às filhas e validar o conjunto. Bloquear exclusão de bloco ocupado e redução que corte uma filha. Marcar o checkbox conclui o to-do e aciona o feedback visual local, respeitando movimento reduzido. O efeito final da animação continua uma escolha visual.
- Aceite: às 11h45 em Matemática até 12h, reservar 15 minutos; repetir em uma lacuna de 15 minutos. Reagrupar o to-do e conferir a reserva original. Cancelar, concluir, reabrir e retirar a reserva pelo teclado e por toque.

### 6. Acabamento da grade e opções acessíveis

- Conferir o cabeçalho aprovado com mês e ano à esquerda e os controles Dia/Semana, anterior, Hoje e próximo à direita, na mesma linha. Remover o botão “+” da Schedule quando a criação por clique/toque no horário livre estiver disponível. O cabeçalho de cada dia apresenta dia da semana e data como texto.

- Migrar a grade e os cards por responsabilidade, extraindo componentes apenas quando o markup ou o comportamento justificar. Usar o cabeçalho em uma linha, a mesma cor para datas e horas, as escalas de 48/44 px por hora e os tons semânticos especificados. Um único cálculo de geometria posiciona eventos e linha do horário atual. Eventos muito curtos também ficam acessíveis pela lista do dia.
- Desktop: lista à esquerda, editor à direita e grade utilizável. Mobile: alternar lista, dia e editor. Dialogs usam o comportamento responsivo Mira. Associar rótulos aos campos, devolver foco ao fechar e anunciar erros. Retirar o menu antigo quando editar, mover e excluir estiverem disponíveis no drawer. Não exibir alças, cursor de arraste ou controles sem ação.
- Tratar sobreposição visual em incremento separado após estabilizar a leitura. Testar duas atividades compatíveis coincidentes, a terceira como +1, quatro como +2 e abertura do agrupador por teclado. Sobreposição visual consome os intervalos já válidos. Resolver a disposição de cruzamentos parciais antes de fechar essa etapa.

### 7. Corte, regressão e validação

- Apontar todos os leitores e escritores de horários para Schedule antes de habilitar em conjunto inclusões manuais e de plano. No detalhe do treino, resolver a ocorrência pela identidade estável e manter o vínculo com a prescrição executada. Verificar acesso por link, minimizar/retomar e históricos. Remover caminhos de escrita substituídos após verificar seus consumidores.
- Testes de domínio junto à feature; integração com PostgreSQL para migração, persistência, concorrência e projeções cruzando semanas; Testing Library para formulários, foco, checkbox e erros. Validar desktop e mobile em navegador, incluindo recarga após salvar e perda de resposta. Repetir testes de agendamento e executor afetados.
- Usar os scripts do pacote: `pnpm db:validate`, `pnpm typecheck`, `pnpm structure:check`, `pnpm i18n:check`, testes direcionados e `pnpm test:integration`. Para integrar, rodar `pnpm run ci`. Registrar latência p95, quantidade de consultas e linhas lidas nas três semanas de referência; decidir sobre cache após medir.

## Entrega posterior

Após validar a jornada por formulário, o arraste poderá chamar os mesmos comandos de agendar, mover, redimensionar e reagrupar. A página Planos completa, foco, tempo real de estudo, integrações e calorias ficam fora desta sequência. A forma de editar datas retrospectivas e as ações sobre treinos já executados exigem fechamento das regras antes de liberar essas mutações.
