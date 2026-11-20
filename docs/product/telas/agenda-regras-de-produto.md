# Agenda do Kaizen — regras de produto aprovadas

Decisões de 16 de novembro de 2026. Este documento descreve o comportamento desejado. A agenda e o executor de treinos existem. O fluxo completo de to-dos descrito abaixo é requisito de produto. A aprovação destas regras não comprova sua implementação.

## 1. O que o usuário organiza

| Conceito | Significado na agenda |
|---|---|
| Atividade ou bloco | Reserva um período com início e fim. Pode ficar vazio ou receber tarefas com horário próprio. |
| Tag | Classifica visualmente a atividade. Uma tag principal fornece a cor do card pela paleta do design system. Até a escolha, a prévia é cinza, sem borda. |
| Grupo | Organiza a lista de to-dos. Por exemplo, Matemática pode ser o grupo de tarefas e Estudo a tag do bloco. O usuário escolhe seus grupos. |
| To-do | Item com identidade e checkbox próprios, criado inicialmente na lista à esquerda. Pode ficar sem horário. |
| Subtarefa agendada | O mesmo to-do, agora reservado dentro de um bloco. A lista e a agenda apresentam a mesma tarefa. |
| Execução | Registro do que realmente aconteceu. Uma reserva de 30 minutos mede tempo planejado. Marcar o checkbox informa conclusão, mas não comprova 30 minutos de execução. |

Treino e Alimentação são tags padrão permanentes, com nome fixo e cor editável. O usuário pode criar outras tags e escolher suas cores. Estudo, Trabalho, Tarefas domésticas e Lazer são exemplos de classificação, sem exigir modelos especializados. O usuário pode mover um to-do entre grupos na lista esquerda, inclusive quando já está agendado.

## 2. O que acontece ao abrir um card

- Uma atividade comum abre o editor da agenda, inclusive quando concluída ou em data passada. A edição se aplica também a atividades futuras.
- Um treino selecionado do plano abre o treino correspondente para visualizar ou executar. Séries e exercícios pertencem ao fluxo de treino. Aplicar a tag Treino a uma partida avulsa de futevôlei mantém a partida como atividade comum.
- Uma ocorrência vinculada à dieta deve levar à página de dieta. Refeições avulsas serão criadas naquela página. Os detalhes de integração ficam para a definição do produto de alimentação.
- O painel esquerdo reúne grupos e to-dos. O direito permite criar e editar atividades. No mobile, o editor abre de baixo para cima. Os controles e mensagens usam o design system Mira.

### Faixa de atividades com data e sem horário

Acima da grade, cada dia lista suas atividades com data e sem horário. A faixa recolhida mede metade da altura de uma linha horária da grade e expande ao passar o mouse. Um to-do sem data continua na lista esquerda. Um intervalo com início e fim aparece na grade, inclusive quando atravessa a meia-noite. A interação de expansão por toque e teclado ainda precisa de definição.

## 3. Sobreposição de blocos

O usuário pode reservar dois ou mais blocos de qualquer tag no mesmo intervalo. Início e fim idênticos, cruzamentos parciais e coincidência de tags são válidos. A coincidência por si só não gera erro, aviso nem confirmação. Esta decisão substitui a restrição anterior entre atividades do mesmo tipo.

Para coincidências, as duas primeiras atividades ficam identificáveis. A terceira em diante é representada por um card neutro com a quantidade adicional. Quatro coincidentes resultam em dois cards e `+2`. Ao abrir o agrupador, o usuário pode identificar as atividades reunidas. A ordem das duas visíveis e o desenho de cruzamentos parciais ainda precisam de especificação.

### Arrastar uma atividade comum para dentro ou para o lado

Decisão aprovada em 17/11/2026. Durante o arraste, a posição vertical escolhe o horário em passos de 15 minutos. Mesmo quando o card ocupa toda a coluna, há dois destinos visíveis:

| Destino | Prévia e resultado da soltura |
|---|---|
| Corpo do card | Destaca o bloco pelo nome e mostra a atividade dentro dele no horário escolhido. A atividade conserva identidade, duração e recorrência e ocupa esse trecho do bloco. |
| Faixa lateral | Abre espaço e mostra a atividade ao lado. Ao soltar, ela fica independente, inclusive quando os horários coincidem. |

Para vincular, todo o intervalo deve caber no tempo disponível do bloco, respeitando pausas, reservas e atividades já vinculadas. A prévia indica conflitos e uma soltura inválida preserva horário e vínculo originais. Ao arrastar uma atividade vinculada para a faixa lateral na mesma altura, remove-se apenas o vínculo. Destinos coincidentes são identificados pelo nome. Sobre o agrupador `+N`, o usuário escolhe o bloco.

Para uma atividade recorrente, escolher o destino precede a escolha de escopo. “Somente esta” afeta a ocorrência selecionada. “Esta e as próximas” aplica o vínculo à ocorrência correspondente do bloco em cada dia. Cancelar preserva o estado anterior.

**Critério de aceite:** arrastar a Daily das 10h–10h15 para dentro de Trabalho e depois para a faixa lateral às 10h. Ao final existe uma única Daily, independente, das 10h às 10h15.

### Alterar o início de uma atividade com outras atividades dentro

Uma atividade interna tem identidade e funções próprias. O vínculo opcional permite desenhá-la dentro do bloco e identificar quais atividades participam da escolha de horários. Ao arrastar o bloco para começar em outro horário, o diálogo oferece **Reajustar horários internos** ou **Manter horários atuais**. A presença de uma atividade que ficaria fora do novo intervalo não bloqueia essa escolha.

- Reajustar aplica a diferença entre o início antigo e o novo ao horário das atividades internas, preservando a duração e a distância ao início do bloco.
- Manter conserva os horários das atividades. Cada atividade que continua inteiramente dentro do novo intervalo mantém o vínculo. Uma atividade que fica fora, mesmo parcialmente, passa a aparecer por conta própria no mesmo horário.
- Cancelar conserva os horários e os vínculos originais.

Exemplo: mover Trabalho de 9h–12h para 11h–14h. A Daily das 9h30 passa às 11h30 e continua vinculada se o usuário reajustar. Se mantiver, a Daily continua às 9h30 e aparece independente.

### Reserva de to-do fora do horário do pai

Ao mover Trabalho e escolher **Manter horários atuais**, uma reserva de to-do que sair do intervalo aparece separada na grade. Conserva o horário, o vínculo com Trabalho e a cor herdada. Essa regra é específica do to-do. Ao mover explicitamente o to-do da lista Trabalho para outra lista, a reserva deixa de herdar a cor de Trabalho e passa a ter card próprio, inclusive quando os horários coincidem. O horário, a identidade e o checkbox são preservados. Após a troca de lista, o card usa a cor do novo pai. Se a lista de destino for neutra, usa a cor neutra. Mover o to-do na lista reorganiza todas as reservas futuras, preservando seus horários. Reservas já encerradas conservam a cor e o vínculo históricos. Reservas em andamento conservam a cor e o vínculo atuais até terminar. A troca de lista alcança reservas cujo início seja igual ou posterior ao instante da alteração. Arrastar um card na grade altera somente a reserva escolhida. O checkbox continua único para o mesmo to-do.

## 4. Como uma tarefa ganha horário

1. O usuário cria o to-do na lista e escolhe seu grupo. A tarefa pode permanecer ali até que ele decida agendá-la.
2. Ao soltar diretamente sobre um bloco, esse bloco é o destino pretendido. Sobre um agrupador `+N`, o usuário escolhe o bloco da lista antes de confirmar. Em uma área livre, a prévia propõe criar o bloco correspondente ao grupo e colocar o to-do dentro dele.
3. O ponto de soltura define o início. Tanto o início quanto o fim de blocos e reservas ficam nos minutos 00, 15, 30 ou 45. As durações planejadas são múltiplos de 15 minutos. A prévia usa a estimativa da tarefa, quando houver, ou 30 minutos por padrão. O fim é limitado pelo término do bloco e pelo início da próxima reserva interna. A tarefa ocupa apenas o trecho livre contínuo a partir do horário escolhido.
4. Se o início estiver ocupado por outra subtarefa do mesmo bloco, mostrar um toast de erro Mira. Reservas de outro bloco coincidente não entram nesse cálculo. Uma tag compartilhada também não torna dois blocos intercambiáveis.
5. Confirmar vincula a mesma tarefa ao horário. Cancelar preserva a lista e descarta a prévia, inclusive um novo bloco apenas proposto. O checkbox da lista e o do card refletem a mesma conclusão. A conclusão terá uma animação breve, com efeito visual ainda a definir.
6. Ao encurtar o fim do bloco de forma que corte uma reserva, o usuário deve ajustar as reservas antes. Para exclusão, aplicar o diálogo abaixo.

### Diálogos de exclusão e movimento

- **Excluir “Trabalho”?** Exibir a quantidade de itens vinculados, incluindo reservas fora do intervalo. Opções: **Manter na agenda** (inicial) e **Remover da agenda**. Botões: **Cancelar** e **Excluir**.
- Manter exclui o bloco e conserva os itens em seus horários, independentes dele. A reserva do to-do passa a usar a cor da lista. Remover retira as ocorrências e reservas abrangidas, preservando o to-do, checkbox e histórico.
- Com o bloco vazio, basta o título e os dois botões. Para recorrência, indicar o escopo escolhido antes de confirmar.
- **Mover “Trabalho”?** Opções: **Reajustar horários** e **Manter horários**. Botões: **Cancelar** e **Mover**. Cancelar preserva o estado anterior.
- Usar os componentes Mira do design system, com diálogo centralizado no desktop e abertura inferior no mobile.

## 5. Plano, calendário e histórico

Um plano define a programação recorrente e pode ter vigência aberta ou data final. Ao abrir uma semana, a agenda exibe as ocorrências dos planos vigentes, as atividades avulsas e as alterações do período. A simples consulta de uma semana futura idêntica ao plano dispensa a criação de cópias diárias.

Ao alterar uma ocorrência de plano, oferecer “Somente esta” e “Esta e as próximas”. Uma exceção pontual, inclusão avulsa ou conclusão é registrada para o dia correspondente. A programação dos dias passados deve continuar recuperável como estava antes de uma alteração posterior do plano. O usuário pode editar o histórico intencionalmente. A passagem do horário, sozinha, não marca uma atividade como feita ou omitida.

## 6. Exemplos para validar o comportamento

| Situação | Resultado esperado |
|---|---|
| Segunda, Matemática das 6h às 12h. Soltar “Resolver lista 3” às 8h, sem estimativa | Prévia das 8h às 8h30. Confirmar ou cancelar preserva a identidade do to-do. |
| Soltar às 11h45 no mesmo bloco | Prévia das 11h45 às 12h. O bloco termina às 12h. |
| Há apenas 15 minutos livres entre duas subtarefas | Soltar no início da lacuna usa os 15 minutos disponíveis. |
| Matemática e Trabalho coincidem. Matemática já tem uma reserva às 8h | Agendar em Trabalho às 8h é válido se houver espaço dentro de Trabalho. Agendar em Matemática às 8h gera o toast. |
| Quatro blocos de Estudo vão das 14h às 15h | Todos são válidos. O agrupador mostra +2 e permite escolher um destino ao receber um to-do. |
| O programador marca “Revisar PR” no calendário | O item aparece concluído na lista do projeto. O total de tempo real continua dependente de registro de execução. |

## 7. Próximas decisões

Usar o [prompt de pesquisa](../PROMPT-PESQUISA-AGENDA.md) para decidir recorrência de tarefas e hábitos, registro de tempo real, organização de grupos e tags e casos de agendamento ainda ambíguos. Depois da aprovação, desenhar o modelo de dados a partir das regras, comparar com o banco existente e validar primeiro o percurso lista → bloco → conclusão. O gesto de arrastar pode ser acrescentado sobre esse mesmo fluxo.
