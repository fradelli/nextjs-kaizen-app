# Ajustes da agenda

> Consulte a [reconciliação da agenda](RECONCILIATION.md) para distinguir código integrado, validações pendentes e propostas. Os vínculos abaixo cobrem o recorte de agenda.

- **Tipo:** Plano.
- **Área:** Agenda.
- **Tarefas relacionadas:** [E11-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T01-validate-integrated-schedule.md), [E11-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T02-prototype-calendar-interactions.md), [E11-T03](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T03-persist-calendar-interactions.md), [E11-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T04-edit-individual-reservations.md), [E11-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T05-link-common-activities.md), [E11-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T06-define-calendar-extension-rules.md), [E11-T07](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T07-plan-recurrence-and-time-records.md), [E11-T08](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T08-define-overlap-presentation.md).

Plano em formação para uma entrega conjunta. Referência vigente da interface em [Padrões visuais da agenda](../../product/telas/agenda-padroes-visuais.md).

## Escopo da primeira interface

As descrições de arraste neste documento especificam uma etapa posterior. Na primeira entrega, clicar ou tocar em um horário livre abre o editor com o início preenchido. Na lista, a ação Agendar permite escolher dia, horário e bloco. O editor de um card permite alterar início e término, e a lista oferece a ação Mover para grupo. Todos usam as mesmas prévias, confirmações e regras de conflito previstas para o gesto futuro. O calendário deve poder ser operado por teclado. Adiar instalação do kit, alças de redimensionamento e indicadores de arraste.

## Grade e cabeçalho

- Usar 48 px por hora no desktop e 44 px no mobile. Aplicar a escala ao posicionamento e à altura dos eventos, à linha do horário atual, à rolagem e ao cálculo dos horários durante o arraste.
- Reduzir um pouco os números das datas no topo e dos horários na lateral. Usar o mesmo token de cor nos dois. Escolher o tamanho final na grade real.
- Alinhar mês e ano à esquerda e agrupar seletor de visão, seta anterior, Hoje e seta seguinte à direita na mesma linha.
- Conferir eventos consecutivos de 15 e 30 minutos. Com 44 px por hora, eles ocupam 11 e 22 px. Priorizar o título quando só couber uma linha e garantir acesso individual pela lista do dia.

## Cards e interação

- Já há uma primeira implementação local com Item Mira, horário inicial acima do título, fundo opaco por categoria, tom mais discreto a partir do dia seguinte e cursor padrão. Falta revisar em desktop e mobile.
- Remover o menu de três pontos do card. Clique seleciona a atividade e abre a lateral. Arrastar o corpo move dia ou horário preservando duração. Arrastar a borda inferior altera o término preservando o início.
- Prever prévia do intervalo durante o gesto, confirmação ao soltar, cancelamento e acesso por teclado. Manter edição de data e horário acessível para quem não usa arraste.
- O agendamento por arraste e sua alternativa sem gesto seguem a jornada prioritária abaixo.

## Dois drawers da Schedule

- **Esquerdo — lista de tarefas.** É o ponto de criação de todos os to-dos. O usuário pode escolher um agrupamento padrão, criar um agrupamento pessoal, mover um to-do entre grupos da lista, marcar sua conclusão e arrastá-la da lista para a grade. O card agendado e a lista representam a mesma tarefa.
- **Direito — criação e edição de atividades.** Selecionar um intervalo na grade abre o editor com dia, início e fim preenchidos. Selecionar um card existente abre esse mesmo drawer com os dados da atividade e as ações de editar e excluir. Em Treino, o usuário seleciona uma sessão já existente no plano.
- **Mobile.** Prever acesso alternado à lista, à grade e ao editor, com alternativa ao arraste para escolher o horário.

## Criação de atividades, planos e tags

- Regra definida: selecionar um intervalo livre da grade clicando e arrastando cria um card naquele dia, com início e fim selecionados, e abre o painel lateral para editar a atividade. A seleção começa no fundo da grade. Um card existente mantém o gesto de mover.
- Regra definida: o usuário cria tags como Estudo, Trabalho, Tarefas de casa, Entretenimento e Saúde, e escolhe a cor de cada uma em uma paleta com mais de dez cores.
- Direção de produto: a página Planos organiza planos de treino, estudo e dieta. A agenda reúne as ocorrências desses planos e as atividades criadas diretamente pelo usuário. O painel do exemplo é referência de disposição.
- O drawer direito cria atividades e agenda treinos existentes. Para agendar um to-do, selecionar uma tarefa já criada na lista esquerda. Estudo pode ser organizado por grupo e assunto. Refeição avulsa tem entrada na Dieta. Origem, tipo e tags são independentes.
- Proposta: ao soltar, mostrar o novo card como rascunho e permitir escolher o tipo no painel. Salvar confirma a atividade e cancelar descarta o rascunho. Arrastar uma tarefa existente agenda a própria tarefa. Selecionar uma atividade de plano mostra também o plano e o conteúdo correspondente.
- Proposta: uma tag principal determina a cor do card quando há várias. Sem tag principal, usar a cor padrão do tipo. Datas passadas usam um tom mais discreto da mesma família. O agrupador de intervalos idênticos usa a superfície neutra prevista.
- A decidir: semântica da projeção de plano, escopo das alterações futuras e eventual registro especializado de estudo. Alimentação segue discussão própria.

## Sobreposição

- Permitir múltiplas atividades compatíveis com início e término idênticos. Mostrar até duas individualmente em ordem estável. A partir da terceira, usar uma terceira faixa neutra com a quantidade restante. Três produzem +1, quatro produzem +2 e cinco produzem +3.
- Ao abrir o agrupador, listar apenas as atividades representadas por ele, com o intervalo comum no título. Diálogo centralizado no desktop e ancorado embaixo no mobile.
- Para contenção simples, planejar a maior ao fundo e a menor na metade direita. Eventos consecutivos podem compartilhar a faixa. O agrupador conta apenas coincidências exatas.
- Pendente decidir intervalos cruzados, contenções ambíguas e colunas estreitas. Avaliar três faixas estáveis no exemplo 14h–17h, 14h–15h e 14h30–16h.

## Permissões e aceite

- Planejar abertura, edição e exclusão de atividades de ontem, hoje e datas futuras. Aguardar complementação para datas anteriores e reflexos sobre mover, redimensionar e editar treinos executados.
- Antes da entrega conjunta, verificar cabeçalho em tela estreita, leitura de datas e horas, abertura por clique e teclado, distinção entre clique e arraste, acesso a cada atividade agrupada e recuperação após falha ao salvar.
### Esclarecimento sobre os pontos de entrada

O botão “+” sai da Schedule. Ao selecionar um intervalo na grade, o usuário abre o painel lateral para adicionar uma atividade. Escolher Treino nesse painel permite selecionar um treino existente do plano e agendar sua ocorrência. A criação de treinos pertence à tela de Planos de treino, onde também será possível iniciar um treino existente.

A criação de refeição avulsa pertence à página Dieta. As demais regras de alimentação ficam pendentes.
### Proposta para sessões de estudo

Reservar um intervalo único na agenda e permitir organizar seu conteúdo em blocos de foco e pausas. Um intervalo das 14h às 19h comporta cinco blocos de foco de 50 minutos e quatro pausas intermediárias de 10 minutos, com 10 minutos finais disponíveis. Decidir se a última pausa é opcional e como registrar foco efetivamente realizado, independentemente da duração reservada e da conclusão do objetivo.

## Jornada prioritária e sequência proposta

1. **Primeira entrega: organizar uma manhã.** Capturar um to-do sem horário na lateral esquerda, atribuir grupo e assunto opcional e encontrá-lo pelos filtros Sem horário, Agendadas ou Concluídas. Reservar Matemática das 6h às 12h. Ao soltar “Resolver lista 3” às 8h, mostrar a prévia dentro da tarefa principal Matemática. A grade aceita o início em intervalos de 15 minutos. Usar a estimativa da tarefa quando disponível ou sugerir 30 minutos (8h–8h30). Confirmar agenda o mesmo to-do como subtarefa de Matemática. Cancelar mantém o to-do sem horário na lista. Fora de um período compatível, apresentar novo período do grupo com a tarefa dentro. O drawer permite ajustar o término antes de confirmar. Cancelar também descarta qualquer período proposto.
2. **Completar a primeira jornada.** Mover ou redimensionar uma reserva, distribuir uma tarefa por vários horários, retirar só uma reserva e reabrir a agenda. Preservar identidade, prazo e conclusão. Concluir pelo checkbox sincroniza lista e card e exibe uma mini animação no ponto da ação, respeitando a preferência por movimento reduzido. O efeito visual será escolhido depois. Se houver reservas futuras, oferecer revisão. Permitir também reservar tempo livre sem tarefa. Validar alternativa de teclado e toque para os gestos. Aplicar ajustes de grade e drawer nessa entrega; tratar a geometria de sobreposições como frente independente.
3. **Medir o uso do tempo.** Checklist simples, notas, cronômetro livre ou ciclos configuráveis, pausa, retomada e registro manual corrigível. Foco opcional em tarefa ou período, inclusive estudo e trabalho. Apurar estimativa, reserva, foco real e pausas separadamente. Relatório semanal por tarefa, assunto e grupo; tarefa concluída sem duração informada aparece como tal. A subtarefa agendada mantém o ID do to-do original.
4. **Evoluções.** Recorrência avulsa, exceções e notas por reserva; desfazer e reagendar em lote; visão opcional dos registros reais; sugestões de horários com prévia usando duração, prazo e prioridade. Integrações opcionais em ordem de dependência: ler disponibilidade, publicar reservas, publicar Focus Time quando elegível, avaliar sincronização bidirecional. Não Perturbe do dispositivo requer decisão própria por plataforma.

Ao soltar uma subtarefa em um horário livre dentro da tarefa pai, a prévia usa a menor das duas durações: a estimativa da tarefa (ou 30 minutos por padrão) e o tempo livre contínuo a partir do horário escolhido. Esse espaço termina no início da próxima subtarefa ou no fim da tarefa pai, o que vier primeiro. O ajuste do término no drawer respeita o mesmo limite.

- Se Matemática termina às 12h, soltar às 11h45 uma tarefa sem estimativa gera a prévia das 11h45 às 12h.
- Se uma subtarefa termina às 9h e a seguinte começa às 9h15, soltar às 9h uma tarefa estimada em 45 minutos gera uma reserva de 15 minutos, das 9h às 9h15. A estimativa continua sendo 45 minutos.

### Conflitos dentro da tarefa pai

| Ação | Regra | Texto sugerido para o toast de erro Mira do design system |
|---|---|---|
| Soltar dentro do horário ocupado por outra subtarefa do mesmo bloco | Recusar a reserva naquele horário. A tarefa conserva sua posição anterior ou permanece sem horário. | Esse horário já tem uma subtarefa. Escolha um intervalo livre. |
| Excluir um bloco que contém reservas de subtarefas | Bloquear a exclusão enquanto houver reservas vinculadas. | Para excluir este bloco, mova ou retire as subtarefas da agenda. |
| Encurtar um bloco | Aceitar se todas as reservas internas ainda couberem. Bloquear se o novo limite cortar ou deixar de fora qualquer reserva. | Há uma subtarefa fora do intervalo escolhido. Ajuste o bloco ou mova a subtarefa. |

Cada recusa preserva integralmente o último estado confirmado. A regra de ocupação vale entre reservas da mesma tarefa pai. Atividades independentes continuam seguindo as regras de sobreposição da grade.

Ao mover um período, preservar os deslocamentos internos das tarefas planejadas. Mover Matemática das 6h para as 7h leva a tarefa das 8h para as 9h. Os registros de execução real conservam seus horários originais. Ainda falta detalhar as permissões retrospectivas.

## Modelo alvo proposto a partir das regras de produto

Cada registro pertence ao espaço de trabalho. IDs estáveis distinguem objetos iguais em título ou horário. O escopo abaixo é o cronograma e suas relações com planos e execução.

| Registro | Uma linha representa | Campos e relações essenciais |
|---|---|---|
| Grupo | Área pessoal como Trabalho ou Matemática | ID, nome, ordem |
| Assunto | Conteúdo opcional de um grupo | ID, grupo, nome |
| Tarefa | Entrega com conclusão própria | ID, grupo e assunto opcionais, título, notas, prazo opcional, estimativa em minutos, instante de conclusão |
| Reserva | Intervalo concreto no calendário | ID, início, fim, fuso, título, revisão; grupo para período temático; tarefa para reserva de tarefa; período pai opcional; referência à sessão prescrita para treino |
| Tag e associação | Categoria pessoal e sua aplicação a tarefa ou reserva | Nome, token de cor, vínculo ao objeto; no máximo uma principal se essa proposta for aprovada |
| Item de checklist | Passo simples da tarefa | Tarefa, título, posição, conclusão |
| Registro de foco | Intervalo real ou duração informada | Reserva ou tarefa de contexto, início/fim ou minutos manuais, natureza foco/pausa, origem e correção |
| Plano, versão e sessão prescrita | Fonte da prescrição usada na reserva | Identidade de plano, versão vigente, identidade da sessão; histórico referencia versão efetivamente usada |
| Execução de treino e suas séries | Resultado real, associado à prescrição utilizada | Identidade própria, vínculo à ocorrência quando aplicável, intervalos e medidas reais por série |

Uma tarefa admite zero ou várias reservas. Uma reserva de tarefa pertence a no máximo um período, no mesmo espaço. O grupo atual da lista orienta a escolha do bloco ao criar a reserva. Fim posterior ao início; horários idênticos entre atividades compatíveis são válidos. Gravar novo período e primeira reserva juntos; cancelar ou repetir a confirmação não pode deixar períodos vazios acidentais ou duplicar a tarefa. Remover reserva preserva a tarefa. As reservas internas devem caber integralmente no período pai e podem ser consecutivas. Reservas irmãs não podem se sobrepor. Um período só pode ser excluído quando estiver sem reservas internas. Reagendar nunca altera os tempos reais. Usar datas civis para prazos sem horário e instantes com fuso de apresentação para intervalos. Para congelar o histórico por assunto/grupo, definir se relatórios respeitam a classificação da época ou a atual.

Totais de agenda ocupada usam a união dos intervalos; horas de tarefas dentro do período não voltam a somar à duração do período. Exemplo: reserva de 6h com tarefa de 1h dentro ocupa 6h. Se houver 45 min de foco registrado, o realizado é 45 min. Checkbox, animações, prévias do drawer, faixas e agrupador +N não geram registros de duração. Modelar série recorrente, exceções e vínculos externos somente nas entregas correspondentes.

### Modelo lógico da primeira entrega

**Proposta de representação.** A tarefa pertence à lista e é dona do título, da estimativa e do checkbox. O bloco é uma reserva que organiza um intervalo da grade. A relação de subtarefa pertence ao agendamento: “Resolver lista 3” pode ocupar a manhã de segunda e a tarde de quarta, com um único checkbox. O grupo Matemática pode existir antes de qualquer bloco e pode ter vários blocos na mesma semana.

| Entidade lógica | Identidade, vínculos e valores | Regra de leitura |
|---|---|---|
| Grupo | ID, espaço de trabalho, nome e ordem | Reúne tarefas e identifica períodos compatíveis. A compatibilidade usa o ID do grupo inclusive quando dois grupos têm o mesmo nome. |
| Assunto | ID, espaço, grupo obrigatório e nome | Um grupo contém zero ou mais assuntos. O assunto classifica o conteúdo. Sua origem permanece identificável mesmo se o usuário reorganizar o to-do em outra lista. |
| Tarefa | ID, espaço, grupo opcional, assunto opcional, título, notas, prazo civil opcional, estimativa positiva opcional e instante de conclusão opcional | A lista e todas as reservas leem a conclusão da mesma tarefa. A estimativa vazia continua vazia quando se usa a sugestão de 30 minutos. |
| Reserva | ID, espaço, finalidade, início, fim, fuso e revisão. Vínculos conforme a tabela abaixo | O ID identifica aquela ocorrência mesmo após mudança de dia. A duração planejada deriva de fim menos início. |

| Finalidade da reserva | Título e grupo | Relações |
|---|---|---|
| Atividade avulsa | Título próprio. Pode receber tags. | Independente na grade. |
| Bloco temático | Grupo obrigatório e título de exibição, por padrão o nome do grupo | Independente na grade. Pode estar vazio ou conter várias reservas de tarefa. |
| Reserva de tarefa | Título lido da tarefa e contexto de agendamento definido pelo bloco | Uma tarefa obrigatória e, quando interna, um bloco pai. Uma reserva interna pertence a exatamente um bloco. |

A relação com a tarefa pai na primeira entrega tem um nível. O bloco tem identidade de agenda própria. Se futuramente o bloco também precisar ser um to-do concluível na lista, essa será uma decisão de produto. A definição de Treino e o registro de foco já descritos acima entram nas suas respectivas entregas.

**Integridade e operações**

- Usar intervalos com início inclusivo e fim exclusivo. Uma reserva que termina às 9h libera a vaga das 9h. A grade oferece inícios nos minutos 00, 15, 30 e 45. A duração inicial é o menor valor entre a estimativa (ou 30 minutos) e os minutos livres contínuos. O bloqueio por ocupação tem como escopo as subtarefas do bloco escolhido.
- Criar a prévia é transitório. Na confirmação, conferir novamente a disponibilidade. Se outro usuário ou outra aba tiver ocupado o intervalo, recusar com o toast e preservar o estado anterior. Confirmar duas vezes a mesma operação produz uma única reserva. Criar um bloco fora do período compatível e reservar a tarefa dentro dele constitui uma única operação.
- Reagendar uma reserva interna preserva seu ID e o da tarefa. Ao mover um bloco, aplicar o mesmo deslocamento a todas as reservas internas em conjunto. Ao encurtar ou excluir, aplicar as regras de conflito acima antes de gravar qualquer alteração. Ao retirar a última reserva de uma tarefa em aberto, ela volta a aparecer em “Sem horário”.
- A confirmação do checkbox atualiza a conclusão da tarefa uma vez. Com várias reservas, a conclusão aparece em todas. Tempo efetivo depende de registro próprio. Ausência de registro permanece desconhecida no relatório.
- Toda relação usa registros do mesmo espaço de trabalho. As consultas iniciais precisam encontrar tarefas por espaço, grupo e conclusão, listar reservas da tarefa, listar as filhas de um bloco e buscar reservas que cruzem o intervalo visível do calendário.

**Exemplo de persistência.** Matemática (grupo G) contém Funções (assunto A). A tarefa T, “Resolver lista 3”, pertence a G e A. O bloco B ocupa segunda das 6h às 12h. Confirmar T às 11h45 cria R, vinculada a T e B, das 11h45 às 12h. Retirar R mantém T, A, G e B. Concluir T sem registro de foco dá uma tarefa concluída, 15 minutos planejados se R estiver presente e tempo real desconhecido.

### Grupo da subtarefa e compatibilidade temporal

O usuário pode arrastar um to-do entre agrupamentos na lista. A movimentação preserva a identidade e o checkbox da tarefa. Os agrupamentos padrão correspondem aos cinco tipos iniciais; o usuário também pode criar agrupamentos pessoais, como Matemática e Português. O vínculo de uma reserva interna com seu bloco na agenda continua estável. Reagrupar na lista altera apenas o grupo atual do to-do. Cada reserva existente conserva seu bloco, tipo e horário, inclusive quando a tarefa passa para um grupo de outro tipo.

Para a mesma pessoa, blocos independentes do mesmo tipo de atividade não podem coincidir, nem parcialmente. Blocos de tipos diferentes podem coincidir em qualquer intervalo. Intervalos consecutivos são permitidos inclusive entre blocos do mesmo tipo. O tipo para essa validação é a natureza da atividade (por exemplo, estudo ou atividade física), independentemente do nome, tag, cor e origem manual ou de plano. A subtarefa interna compõe o intervalo do pai e segue as regras de espaço livre entre irmãs. Validar a compatibilidade também ao criar automaticamente um período, mover, ampliar ou confirmar uma ocorrência planejada. Para uma colisão, preservar os horários confirmados e mostrar o toast de erro do design system. O agrupador +N só representa combinações permitidas.

| Combinação simultânea | Resultado |
|---|---|
| Matemática + Matemática, ou Matemática + Português | Bloquear. Ambos são blocos de estudo. |
| Matemática + lavar louça | Permitir. Estudo e tarefa doméstica podem compartilhar horário. |
| Corrida + futebol | Bloquear. Ambas são atividades físicas. |
| Corrida + estudo | Permitir em qualquer formato de estudo. |

Os cinco tipos iniciais são Estudo, Trabalho, Atividade física, Tarefas domésticas e Lazer. A lista poderá evoluir após os testes. Criar um agrupamento pessoal organiza a lista. A validação de conflitos usa o tipo da atividade, independentemente do nome do agrupamento.

### Catálogo de atividades físicas

O modelo atual distingue treino estruturado, prática esportiva, treino específico e mobilidade. A intensidade tem três níveis. O contrato semanal de plano aceita dias da semana e também descanso. Ver [modelos de treino](../../../prisma/models/training.prisma) e [contrato semanal](../../../schemas/schedule.schema.json).

Cada modalidade tem identidade própria no catálogo do Kaizen, nome em português e sinônimos para busca. A seleção manual na Schedule e a programação em Planos usam a mesma modalidade. Futebol de campo pode ser agendado uma vez ou toda quarta à noite. O tipo Atividade física determina os conflitos de horário; a modalidade identifica a prática. Um treino estruturado continua referenciando a prescrição criada em Planos. As 43 modalidades propostas na pesquisa são o ponto de partida da curadoria. A estimativa de calorias fica fora do escopo desta entrega e da modelagem atual.

## Desenho das tabelas da primeira entrega

Proposta para revisão, em ordem de dependência. Os nomes identificam tabelas candidatas. O escopo das validações de agenda é a pessoa dona do calendário, inclusive se um espaço passar a ter vários usuários.

| Tabela | Chave e campos principais | Relações e restrições |
|---|---|---|
| Tipo de atividade | ID, código único estável, nome de exibição | Catálogo inicial com os cinco tipos aprovados. |
| Grupo da lista | ID, espaço, dono, nome, posição, tipo padrão opcional, indicador de agrupamento padrão | Um agrupamento padrão por dono e tipo. Grupos pessoais admitem o mesmo tipo, como Matemática e Português. |
| Assunto | ID, espaço, dono, grupo de origem, nome | Pertence a um grupo. Identifica o conteúdo independentemente de onde o to-do aparece na lista hoje. |
| Tarefa | ID, espaço, dono, grupo atual opcional, assunto opcional, título, notas, prazo, estimativa em minutos, conclusão, revisão | Uma linha por to-do. Reagrupar atualiza apenas o vínculo organizacional e a revisão. Uma estimativa informada deve ser positiva. |
| Modalidade física | ID, nome brasileiro, termos alternativos de busca | Catálogo compartilhado entre plano e agenda. Um nome alternativo aponta à mesma modalidade. |
| Reserva | ID, espaço, dono, finalidade, início, fim, fuso, revisão, título próprio opcional, tipo, grupo de contexto opcional, tarefa opcional, reserva pai opcional, modalidade opcional | Bloco temático tem grupo de contexto e título. Reserva de tarefa referencia o to-do. Reserva interna obtém o grupo pelo pai e conserva o tipo do bloco. Atividade avulsa tem título próprio. Modalidade só se aplica a atividade física. |
| Tag e vínculos com tarefa ou reserva | ID da tag, dono, nome e token de cor; pares de IDs nas tabelas de vínculo | Cada par é único. Tags podem ser compartilhadas entre atividades e não participam da validação de horários. |

**Contexto da reserva.** Toda reserva independente recebe um tipo explícito na confirmação. O grupo pode sugerir o tipo. O bloco temático guarda o ID do grupo usado no agendamento. Para a reserva interna, o pai deve ser um bloco temático do mesmo dono e espaço. O contexto de uma eventual reserva de tarefa independente fica na própria reserva. As consultas da grade usam esses vínculos. A lista filtra pelo grupo atual da tarefa. Referências usadas por reservas existentes exigem preservação de identidade.

**Restrições que precisam resistir a gravações simultâneas**

- Para reservas independentes, impedir a interseção de intervalos por dono e tipo. Para reservas internas, impedir a interseção por pai. Em ambos os casos o fim é exclusivo. A reserva interna fica inteiramente dentro do pai e tem o mesmo tipo. No PostgreSQL, exclusões condicionais por intervalo são candidatas para as duas regras de interseção.
- Validar vínculos entre registros do mesmo dono e espaço. Serializar as alterações do bloco com a criação ou edição de reservas filhas. Mover pai e filhas em uma operação atômica, validando o estado final. Impedir a exclusão do pai enquanto houver filhas. Encurtar o pai exige que todas as filhas caibam.
- Ao confirmar novamente a mesma criação, reutilizar a identidade da operação. Uma falha ao criar a filha desfaz também o novo bloco criado para ela. Reorganizar a lista atualiza a tarefa independentemente dessas operações de agenda.
- Indexar grupo atual e conclusão para a lista; tarefa e pai para recuperar reservas; dono e intervalo para a grade. Para conflitos envolvendo treinos, todos os caminhos de gravação precisam consultar e proteger a mesma ocupação, inclusive a materialização de um plano semanal.

**Cenário de aceite do reagrupamento.** Agendar “Resolver lista 3” no bloco Matemática de segunda às 8h. Mover o to-do para Revisão da prova no drawer esquerdo e recarregar. Deve haver uma tarefa em Revisão da prova e a mesma reserva às 8h em Matemática. Concluir pela lista atualiza o checkbox da reserva. Retirar a reserva mantém o to-do em Revisão da prova.

## Comparação posterior com os modelos atuais

Comparação documental com os [modelos Prisma](../../../prisma/models) do repositório. A estrutura efetivamente aplicada em cada ambiente precisa ser conferida antes de qualquer migração.

| Parte do modelo alvo | Evidência atual | Consequência para a refatoração |
|---|---|---|
| Grupos, assuntos, tarefas e reservas internas | Os modelos de plataforma, catálogo, nutrição e treino não oferecem esse fluxo de produtividade | Introduzir primeiro o conjunto mínimo para a jornada de Matemática. Começar com reserva avulsa, período temático e reserva de tarefa. |
| Reserva de treino | TrainingDayActivity reúne horários previstos e reais e tem relações específicas do treino | Definir um único proprietário do horário previsto antes de expor treino à nova agenda. Preservar o ID do treino durante reagendamentos. |
| Prescrição versionada | TrainingPlanVersion, TrainingSessionDefinition e TrainingExerciseDefinition já representam a prescrição | Reaproveitar a referência à sessão na versão correta. O drawer seleciona o treino e exibe sua origem. |
| Execução e histórico | Existem intervalos e séries de execução ligados a TrainingDayActivity, além do fluxo de DailyTrainingAssignment e TrainingExecution | Mapear leitores e escritores dos dois fluxos antes de trocar vínculos. Conservar preparação, medidas por série e restrições de alteração após progresso. |
| Foco, checklist, recorrência e integrações de produtividade | Não há modelos dedicados para o conjunto proposto | Adiar a persistência específica até aprovar a respectiva jornada. Manter alimentação no domínio de Dieta. |

O [teste de agendamento de treino](../../../tests/integration/training-activity-scheduling.test.ts) documenta identidade estável ao mover, preservação do aquecimento, concorrência e recuperação após falha. Usar esses casos como critérios de regressão ao conectar treino à Schedule. A regra proposta de edição retroativa exige conciliação explícita com as restrições existentes após progresso.

### Caminho atual do horário no código

| Fluxo verificado | Onde ocorre | Efeito observado |
|---|---|---|
| Prescrição semanal → atividade de um dia | [Construção e materialização do dia](../../../src/features/training/data/ensure-scheduled-training-day.ts) | Lê o plano ativo, resolve as entradas para a data e constrói os minutos previstos. A materialização grava a atribuição diária, as atividades e eventuais preparações. |
| Consulta da semana → grade | [Consulta semanal](../../../src/features/training/application/get-training-week.ts) e [repositório, findTrainingDay](../../../src/features/training/data/prisma-training-repository.ts) | A semana solicita sete dias. A leitura diária reúne atividades persistidas e projetadas pelo plano e ordena pelo início previsto. Um horário visível pode ainda ser uma projeção. |
| Inclusão e edição manual | [Ações de treino](../../../src/app/workout/training-actions.ts) e [repositório, addTrainingActivity/updateTrainingActivity](../../../src/features/training/data/prisma-training-repository.ts) | As ações recebem data e horários. O repositório valida os minutos, grava a atividade e trata a preparação. |
| Mudança de dia e retirada | [Reagendamento](../../../src/features/training/data/training-activity-rescheduling.ts) e repositório de treino | Ao mover, o fluxo materializa o destino, conserva o ID da ocorrência real e registra um marcador na origem para impedir sua recriação. Exclusão usa marca de remoção. A preparação e o progresso afetam a operação. |
| Execução | [Modelo de treino](../../../prisma/models/training.prisma) | Horários previstos e reais coexistem em TrainingDayActivity. Intervalos e séries registram a prática. O vínculo pai representa preparação. |

### Plano vigente, consulta semanal e alterações diárias

O plano tem início de vigência e fim opcional. Uma consulta por semana, no fuso do calendário, resolve todas as versões vigentes em cada data do intervalo, expande suas entradas recorrentes e combina o resultado com atividades avulsas, exceções e estados diários. A consulta é somente leitura, inclusive quando uma nova versão entra em vigor no meio da semana. Uma ocorrência projetada tem identidade mesmo sem linha de reserva persistida.

| Acontecimento | Gravação proposta |
|---|---|
| Abrir semana idêntica ao plano | Nenhuma. A resposta contém as ocorrências previstas. |
| Adicionar atividade avulsa | Inserir somente a atividade no dia correspondente. |
| Alterar ou cancelar apenas uma ocorrência | Registrar exceção com a identidade estável da entrada recorrente e a data original. Ao mover entre semanas, suprimir na origem e incluir no destino, inclusive se o início original estiver fora do intervalo consultado. |
| Alterar esta e as próximas | Encerrar a vigência anterior e iniciar a nova regra a partir da ocorrência escolhida em uma operação. Preservar o passado e as demais entradas do plano. Preservar alterações e cancelamentos individuais futuros. Se a nova regra gerar conflito ou tornar ambíguo o vínculo de uma exceção, pedir resolução antes de confirmar. |
| Marcar checkbox ou finalizar dia | Registrar o fato no contexto correto. Conclusão de um to-do continua única na tarefa; se houver registro diário da ação, vincular à tarefa/ocorrência. O ✓ de descanso do treino mantém sua semântica no executor. Fechamento do dia tem data e instante próprios. |
| Horário passou sem interação | Derivar “horário passado · sem registro” do relógio. A passagem do horário não grava alteração diária nem indica omissão. |

**Histórico diário aprovado.** Ao terminar cada data civil no fuso do calendário, persistir o retrato daquele dia, inclusive se estiver idêntico ao plano. Incluir ocorrências efetivas, horários e referências à versão usada. Prever recuperação idempotente de dias ainda sem retrato após indisponibilidade do serviço. Mudanças posteriores no plano não reescrevem dias passados. Reagendamentos explícitos continuam permitidos em qualquer data e atualizam os dias afetados. Antes do fechamento, atividades avulsas e diferenças em relação ao plano já são persistidas. A leitura da semana continua sem gravações.

**Tabelas diárias propostas.** Um registro de dia por dono e data civil quando há fatos a guardar, com fechamento opcional. As atividades avulsas e as exceções individuais são detalhes ligados ao dia; a abertura de uma semana não cria sete registros nem copia a lista projetada. A exceção referencia a versão original usada e tem chave única por dono, entrada recorrente estável e data original. Consultar tanto as origens quanto os intervalos de destino. O executor mantém os dados de execução efetiva. A tabela Reserva do desenho inicial armazena os intervalos persistidos; o horário efetivo da grade resulta da composição de plano, exceções e avulsas.

**Conflitos.** Validar a composição efetiva do intervalo antes de confirmar uma alteração, inclusive entre duas regras recorrentes com vigências sobrepostas. Para planos semanais sem fim, comparar dias da semana e horários durante a vigência comum, considerando exceções. Serializar alterações concorrentes da agenda do dono para impedir que duas confirmações aceitem a mesma vaga do mesmo tipo. Uma restrição sobre reservas gravadas sozinha não detecta uma ocorrência apenas projetada.

### Referências e critérios de desempenho

A API do Outlook entrega ocorrências, exceções e eventos avulsos para o intervalo pedido. O Google Calendar identifica uma ocorrência reagendada pelo início original e alerta para o custo de criar muitas exceções ao alterar uma série inteira. O iCalendar também conserva o início original como identidade da ocorrência movida. São referências de comportamento público. A persistência proposta é uma decisão do Kaizen. [Microsoft Graph](https://learn.microsoft.com/en-us/graph/api/calendar-list-calendarview?view=graph-rest-1.0) · [Google Calendar](https://developers.google.com/workspace/calendar/api/guides/recurringevents) · [RFC 5545, seção 3.8.4.4](https://www.rfc-editor.org/rfc/rfc5545#section-3.8.4.4)

- Buscar em lote as versões vigentes, avulsas, exceções e estados necessários à janela. Expandir somente as entradas relevantes à semana no fuso da regra, incluindo atividades que começaram antes e continuam na janela. Carregar os detalhes de exercícios e séries quando o treino for aberto.
- Indexar por calendário e vigência, por identidade original da ocorrência e por intervalo efetivo das reservas alteradas. Uma atividade movida entre semanas deve desaparecer na origem e aparecer uma vez no destino mesmo quando só uma das semanas é consultada.
- Validar semana sem alterações com zero gravações. Medir latência p95, consultas ao banco por abertura e volume de registros lidos para semanas comuns, semanas densas e planos sem fim iniciados há anos. Conferir que a leitura não percorre todo o histórico. Decidir sobre cache a partir dessas medidas.

### Organização ao implementar

Concentrar em Schedule as regras de intervalo, compatibilidade, encaixe e alteração de reservas. Planos define a prescrição e Treino registra a execução. Organizar por responsabilidade dentro dessas funcionalidades: domínio para regras puras, aplicação para operações, persistência para transações e UI para grade, lista e editor. Reutilizar componentes Mira exportados pelo design system. Formulário, teclado e futuro arraste devem chamar a mesma operação de aplicação. Extrair componentes quando compartilham comportamento e semântica; a organização final de pastas será definida no código.

## Primeira entrega verificável: consultar a semana e editar uma ocorrência

### Contrato de leitura

Uma abertura solicita o calendário para uma data civil de referência. No P0, o servidor resolve o workspace pessoal fixo e o fuso do calendário. A semana usada hoje vai de domingo a sábado; a janela começa à meia-noite de domingo e termina no domingo seguinte, exclusivo. Calcular os limites em datas civis locais. No celular, selecionar um dia da semana já carregada usa a mesma resposta.

| Parte da resposta | Conteúdo necessário |
|---|---|
| Janela | Início, fim exclusivo, fuso e os sete dias, incluindo dias vazios e eventual fechamento registrado. |
| Card | Identidade estável da ocorrência, título, tipo, origem, início e fim efetivos, vínculo com bloco ou tarefa quando aplicável e estado pertinente. |
| Contexto de edição | Para atividade de plano, identificar a entrada da série e a ocorrência original, mesmo após reagendamento. Entregar revisão que permita detectar mudança de regra ou exceção desde a abertura. Para avulsa, usar sua identidade e revisão próprias. |

Ler em lote regras vigentes na janela, avulsas, exceções e estados. Combinar por identidade: substituir ou suprimir a ocorrência original e incluir o destino efetivo se cruzar a janela. Trazer exceções movidas para dentro mesmo quando a versão original já não estiver vigente na semana de destino. Filtrar por início anterior ao fim da janela e término posterior ao início. Ordenar por início efetivo e identidade para que leituras repetidas tenham ordem estável. A resposta pode conter outras ocorrências da mesma série, cada qual com identidade própria.

### Contrato de edição pelo drawer direito

1. O clique no card abre o dia e horário efetivos. O usuário ajusta data, início e término. Fechar ou cancelar a prévia descarta as mudanças locais.
2. Ao salvar uma atividade de plano com alterações, oferecer **Somente esta atividade** e **Esta e as próximas**. Para uma avulsa, salvar diretamente. Enviar a identidade original, o novo intervalo com fuso, o escopo escolhido, a revisão lida e uma chave para reconhecer repetição da mesma confirmação.
3. O backend valida autorização, revisão, intervalo e conflitos da agenda efetiva. Em “Somente esta”, grava ou atualiza uma exceção. Em “Esta e as próximas”, aplica o corte pela posição original da ocorrência na série e grava a nova vigência, preservando exceções individuais. Havendo conflito ou associação ambígua, a operação inteira aguarda resolução.
4. Sucesso retorna o horário confirmado e a abrangência da alteração. Atualizar as semanas de origem e destino; numa alteração de série, descartar também resultados carregados a partir do corte, inclusive destinos de exceções afetadas. Repetir a confirmação após perda da resposta recupera o mesmo resultado.
5. Em conflito de horário, o drawer conserva a tentativa, identifica a atividade conflitante e permite escolher outro intervalo. Se a revisão ficou desatualizada, carregar os dados atuais e permitir revisar antes de reenviar. O toast Mira comunica a causa. Nenhum desses erros grava parte da alteração.

### Cenários de aceite antes de liberar

| Cenário | Resultado observável |
|---|---|
| Futebol de sábado 21/11/2026 às 20h movido para domingo 22/11 às 19h, somente esta atividade | Abrir isoladamente 15–21/11 e depois 22–28/11, inclusive na ordem inversa. A ocorrência do dia 21 aparece apenas no destino, com o mesmo vínculo ao plano. O futebol regular de sábado 28 permanece. Recarregar mantém o resultado. |
| Corrida já prevista no domingo às 19h | A mudança do futebol é recusada mesmo que a corrida só exista como projeção. O futebol fica no sábado e o usuário pode corrigir o horário. |
| Alteração a partir do futebol de sábado 28 | O futebol movido do dia 21 mantém seu destino. Uma ocorrência futura já cancelada continua cancelada. Uma exceção futura com destino próprio permanece nesse destino e conflitos exigem resolução. |
| Plano muda na quinta ou segue sem data final | Cada dia usa a versão correspondente. A leitura de uma semana sem exceções produz zero gravações, inclusive ao reabrir a semana depois que o horário de uma atividade passou. |
| Duas abas ou confirmação repetida | Uma edição obsoleta recebe conflito de revisão. Uma repetição da mesma confirmação bem-sucedida deixa uma única exceção. |
| Cancelar a prévia ou editar uma atividade avulsa | Cancelar mantém os dados anteriores. Uma avulsa altera somente sua própria reserva. |

O [plano técnico da Schedule](SCHEDULE-PLANO-TECNICO.md) organiza as dependências, os arquivos envolvidos e a validação de cada etapa.

## Próximas tarefas antes do drag and drop

Pendentes em 16/11/2026. Executar a correção do card primeiro, depois separar o domínio da agenda e por fim revisar os contratos legados. Usar a [especificação da Schedule](SCHEDULE-PLANO-TECNICO.md) para as regras de grupos, horários e conflitos.

### 1. Exibir cards concluídos independentemente da permissão de editar

Uma atividade concluída continua editável em qualquer data civil, passada, presente ou futura. O editor permite mudar data, horários e demais campos da agenda. O reagendamento preserva a identidade da ocorrência e os registros de execução. A gravação continua validando o intervalo e a revisão para evitar conflitos entre alterações simultâneas.

Aceite: abrir o card concluído, editar, mover para outra data e reabrir após recarregar. Verificar o título, o estado de conclusão e o histórico da execução.

### 2. Separar tarefas, reservas de tempo e execução de treino

Começar pelo fluxo lista → reserva na agenda. Hoje a consulta semanal retorna dias de treino e o formulário chama mutações de treino. Definir a identidade da tarefa e sua reserva, a referência opcional ao bloco pai e o contrato de leitura por intervalo. O editor deve escolher os campos e a ação de salvar conforme o tipo. Manter a integração com o executor para treinos vinculados. A tarefa comum nasce na lista de to-dos e recebe horário quando agendada; preservar a identidade e o checkbox entre as duas telas.

Aceite: com zero planos de treino, criar uma tarefa de Matemática na lista e agendá-la para as 8h em um bloco de estudo. Confirmar que a mesma tarefa aparece na grade, que recarregar preserva o vínculo e que nenhuma ocorrência ou execução de treino foi criada. Alterar o horário pelo formulário deve funcionar antes de ligar o gesto de arrastar. Repetir o teste com uma tarefa de Trabalho e verificar a abertura de um treino vinculado no executor.

### 3. Encerrar os contratos antigos de rascunhos e datas

Inventariar os consumidores de serialização do editor, do aviso de limpeza e da janela de quatro dias em `ensureScheduledTrainingDay`, incluindo importadores e testes de integração. Remover o emissor sem ouvinte ou encaminhar uma falha real de limpeza ao mecanismo de feedback usado pela aplicação. Manter o estado temporário do formulário em memória. Revisar separadamente o rascunho de execução que permite retomar um treino em andamento. Identificar se a materialização ainda tem consumidor real antes de alterar a política de datas.

Aceite: fechar e reabrir o formulário descarta a edição, retomar um treino mantém o progresso e abrir a agenda vazia não gera aviso nem gravação. Testar reagendamento em datas além de quatro dias, histórico e conflitos de revisão. Atualizar os testes de comportamento antigos, mantendo as verificações de execução e concorrência. Na auditoria anterior a suíte unitária registrou 425 testes aprovados e 41 falhas; separar expectativas obsoletas de regressões antes de considerar a suíte validada.
