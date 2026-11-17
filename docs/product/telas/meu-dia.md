# Meu Dia

Sessões registradas com menos de um minuto mantêm a precisão dos horários reais. A grade mostra marcadores compactos, e o botão “Menos de 1 min” abre uma lista filtrada com áreas de toque confortáveis. A apresentação não aumenta a duração registrada nem substitui os horários por aqueles previstos no plano.

[Mapa de navegação](README.md) · [Wireframe de celular e desktop](meu-dia.svg) · [Explorar as 24 horas](meu-dia-grade.html)

## Composição proposta

A agenda ocupa a página diretamente. Reservar cards para atividades e para a retomada do treino. No celular, a barra inferior reúne ícones e rótulos de Meu Dia, Planos e Alimentação acima da área segura. No desktop, os mesmos destinos ficam no cabeçalho. Apenas a grade rola entre as barras.

Ao abrir Meu Dia, o celular mostra apenas hoje. No desktop, a primeira coluna é hoje e as seguintes vão até o fim da semana. O exemplo usa a convenção do calendário de referência, de domingo a sábado. Em uma terça aparecem cinco colunas; em um sábado aparece uma. A navegação por data continua disponível para consultar outros dias.

O estudo rolável usa 64 px por hora no desktop e 80 px no celular, independentemente da largura da janela. Um bloco de 90 minutos ocupa 96 ou 120 px, respectivamente. No exemplo, a grade permite rolar até qualquer hora. As atividades dos dias seguintes são ilustrativas.

A grade integrada usa os mesmos intervalos. Selecionar o cabeçalho de uma coluna abre uma lista das atividades daquele dia com alvos amplos. Essa lista dá acesso aos eventos curtos sem aumentar sua altura na grade. Itens com horário ou duração ausentes ficam em uma área anterior ao eixo. As sobreposições ocupam colunas vizinhas dentro do mesmo dia. O desenho de um intervalo que atravessa meia-noite termina na borda de 24h; o resultado completo continua disponível no detalhe, e a continuação na coluna seguinte exige especificação própria.

No celular, a grade ocupa o espaço entre o cabeçalho com a data e a navegação inferior. Durante uma execução, reservar espaço para o card de retomada acima da navegação. Usar controles com alvo de toque de pelo menos 44 × 44 px, mesmo quando o ícone é pequeno. O resumo pode abrir em painel.

No desktop, usar navegação principal no cabeçalho, grade de horários e resumo ao lado quando houver largura. Nos dois tamanhos, a grade é contínua de 00h até o limite de 24h. O topo do bloco marca o início e sua altura representa a duração. Horários sobrepostos ocupam colunas vizinhas. A imagem mostra um trecho visível; o estudo rolável permite consultar inclusive as horas vazias. “Ir para” é um atalho de inspeção do estudo. Exibir “Sem horário” fora do eixo quando houver itens nessa condição.

No estudo visual, o fundo é grafite neutro (`#191919`), com contornos de 1 px em grafite. Cores pastel identificam as categorias na lateral e tingem levemente o interior dos eventos. O card de retomada usa grafite quase opaco. Os horários usam 12 px, títulos de atividade 16 px e título de página 24 px. Ícones de navegação têm 20 px. Para eventos muito curtos, preservar a geometria do intervalo e mostrar os detalhes ao selecionar; a proposta de interação para eventos adjacentes ainda precisa de validação no celular.

A borda fina delimita cada atividade sobre o fundo da página. A data aparece no cabeçalho. O texto de estado acompanha qualquer sinal de cor. A etiqueta “Fora do plano” identifica uma atividade avulsa. O desenho usa horários e durações fictícios.

## Hoje e passagem do tempo

- Fundo base de referência medido no print do Notion: `#191919`. Hoje usa `#171717`; a região anterior ao horário atual recebe um sombreado suave.
- Quando uma consulta incluir dias anteriores, atenuar a coluna inteira e seus eventos. Na coluna de hoje, atenuar horários passados e eventos cujo fim previsto já passou. Um evento que atravessa a linha mantém o destaque até o fim do intervalo. Datas futuras mantêm o contraste habitual.
- O efeito é apenas visual. O estado de execução, os comandos disponíveis e os registros continuam seguindo suas regras próprias.
- Posicionar o marcador pelo minuto corrente em America/Sao_Paulo. Mostrar a hora no eixo; ao coincidir com uma legenda horária, dar prioridade ao marcador. A linha atravessa todas as colunas visíveis com 1 px suave e usa 2 px em coral vivo na coluna de hoje. No celular aparece o trecho correspondente ao dia consultado.
- A imagem fixa exemplifica 12h08. No estudo rolável, a semana é ilustrativa e o relógio acompanha a hora de São Paulo. Ao abrir, o estudo enquadra a região próxima ao marcador; a atualização do relógio preserva a posição de rolagem.

## Ações e subtelas

| Entrada | O que abre | Resultado e retorno |
| --- | --- | --- |
| Data, anterior, seguinte e Hoje | Calendário ou dia vizinho | Consultar outra data preserva os dados. Mostrar Hoje quando outra data estiver selecionada. |
| Adicionar | Escolha entre bloco de agenda, atividade específica ou realizar treino existente | A atividade avulsa pertence à data. Criar uma nova prescrição exige abrir um plano. |
| Card de treino estruturado | Prévia com URL própria, em tela cheia no celular e sobre a agenda no desktop | Fechar retorna à data e posição de origem. Em acesso por link direto, voltar à agenda daquela data. Abrir a prévia é somente leitura. |
| Registrar treino no esporte | Diálogo Finalizar atividade | Confirmar duração e finalizar grava a atividade. Cancelar volta ao card. O aquecimento, quando desejado, é outro treino com horário próprio. |
| Menu ⋯ no card | Mudar dia ou horário, remover ocorrência | Confirmar a alteração do dia. Para mudança recorrente, oferecer abrir o plano. Durante execução, bloquear remoção da ocorrência. |
| Fora do plano | Diálogo para incluir no plano | Ao aceitar, escolher dias da semana e horário. Cancelar mantém a atividade avulsa. |
| Voltar ao treino, no card ou na barra inferior | Execução em andamento | Reabrir os dados preenchidos do rascunho local. |
| Lixeira na barra de execução | Confirmar descarte | Explicar a perda das séries preenchidas. Ao confirmar, limpar o rascunho e liberar novo início. Preservar treino e agenda. |
| Resumo | Detalhe dos tempos do dia | Diferenciar blocos atribuídos pelo horário de treinos registrados pela duração real confirmada. Contar apenas uma vez o intervalo sobreposto no tempo coberto. |

## Estados a validar

- Dia vazio com plano e sem atividades mostra a data e permite adicionar. Sem plano, oferecer criar ou escolher um plano e continuar permitindo atividades avulsas.
- Hoje e futuro exibem a programação. Visitar qualquer dia não gera execuções. No passado, mostrar treinos efetivamente registrados, respeitando a janela acordada para concluir pendências de ontem. Blocos comuns seguem suas próprias regras de histórico.
- Iniciar cria um rascunho local. Sair da tela ou trocar de data mantém a retomada. Finalizar só libera o rascunho após confirmação da gravação. Se falhar, permitir tentar novamente sem duplicação.
- No exemplo, Estudo já ocupa 1 h. As durações planejadas das três atividades físicas e os minutos do treino em andamento ficam fora do total realizado.
- Em tela estreita, títulos longos quebram linha. O menu tem nome acessível por atividade. Diálogos devolvem o foco à origem. Mudar horário por formulário deve ser possível com teclado e sem arrastar.

## Revisão integrada com a execução

O card global de retomada aparece fora do detalhe do treino, acima da barra inferior no celular e no canto inferior direito no desktop. Ele recupera a data de origem, o nome disponível e o tempo ativo do rascunho. O descarte exige confirmação e é interrompido se o armazenamento falhar. Quando outra tela atualiza os dados durante a confirmação, o usuário precisa confirmar novamente.

Para rascunhos antigos simultâneos, priorizar o que está em andamento e, em seguida, o início mais recente. Os demais rascunhos continuam armazenados. Na agenda, o menu de três pontos reúne mudar dia ou horário e excluir a ocorrência. Ele aparece nos cards com espaço suficiente e na lista do dia, acessível pelo cabeçalho. Durante uma execução, essas ações ficam bloqueadas. A posição da grade é recuperada por data na mesma sessão do navegador.

Verificar se o usuário encontra como registrar o futevôlei, retomar a musculação e descartar somente a execução. Conferir se a rotina preparatória aparece como item independente e se a última ação da lista continua acessível com a barra inferior visível. Aplicar as [medidas comuns](medidas.md) e validar o retorno a partir da [execução existente](execucao.md).
