# Prompt para pesquisar as decisões pendentes da agenda do Kaizen

- **Tipo:** Pesquisa.
- **Área:** Agenda.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Pesquise como produtos de agenda e produtividade resolvem as decisões abaixo. Escreva em português do Brasil para uma equipe pequena que vai aprovar regras de produto antes de desenhar o banco. Quero decisões verificáveis por exemplos de uso. Dispense código, schemas, bibliotecas e planos de implementação.

## Para quem estamos construindo

Considere uma estudante que prepara uma prova para sexta. Na segunda, ela reservou Matemática das 6h às 12h, precisa resolver a lista 3, revisar erros e estudar inglês. Considere também um programador com entrega na quinta, reuniões, revisão de PR e estudo técnico. Ambos treinam, organizam refeições, têm hobbies e querem reservar tempo para leitura, devocional e água. Não prescreva rotinas de saúde. Queremos descobrir quando vale reservar tempo no calendário e quando basta marcar algo como feito.

## Regras já aprovadas que sua recomendação deve respeitar

- Atividades comuns podem ficar vazias ou receber subtarefas. Uma tag principal define a cor. Treino e Alimentação são permanentes, com cor editável. O usuário cria outras tags. Um vínculo com um treino de plano ou com a dieta define o destino do clique. Uma tag sozinha apenas classifica.
- Os to-dos nascem na lista esquerda, organizados por grupos do usuário. Ao agendar um to-do, ele conserva identidade, grupo e checkbox. A troca explícita de lista é permitida também para tarefas agendadas. Sair da lista Trabalho encerra a herança da cor de Trabalho e o card passa a aparecer separado. Manter o horário ao mover o bloco pai preserva o vínculo e a cor mesmo que a reserva fique fora do intervalo. O editor de atividades fica à direita no desktop e abre por baixo no mobile.
- Blocos principais podem coincidir livremente, inclusive com a mesma tag e os mesmos horários. Duas atividades aparecem individualmente e as adicionais são agrupadas em +N. Soltar sobre um bloco identifica o destino. Soltar sobre +N abre a escolha. Soltar em espaço livre propõe novo bloco do grupo com a tarefa dentro.
- Início e fim de blocos e reservas seguem passos de 15 minutos (00, 15, 30 ou 45). Sem estimativa, a prévia usa 30 minutos. O limite é o trecho contínuo livre dentro do bloco. Às 11h45 em um bloco que termina às 12h, cabem 15 minutos. Início ocupado por uma reserva irmã gera erro. Cancelar a prévia conserva a tarefa original. Ao excluir o bloco, o usuário escolhe manter ou remover os itens vinculados da agenda. Encurtar o fim do bloco cortando uma reserva exige ajustá-la antes.
- Marcar o checkbox sincroniza agenda e lista e admite uma animação breve. Concluir, planejar duração e medir execução são fatos distintos. O usuário pode editar itens passados, concluídos e futuros. Plano recorrente, ocorrência e execução têm identidades distintas. Mudanças no plano preservam dias anteriores. Ausência de execução registrada não implica omissão.
- A agenda e o executor de treino já existem. As regras acima orientam o produto desejado. Não pressuponha que toda a experiência está pronta. Não desenhe um executor de estudos, uma página de dieta nem novos tipos por profissão.

## Questões a investigar, por ordem

1. **Grupos, tags e destino.** Como manter Matemática como grupo e Estudo como tag sem exigir cadastro duplicado? Como descobrir a tag de um novo bloco criado a partir do grupo? Se o usuário soltar um to-do de Matemática diretamente em Trabalho, como lidar com o destino escolhido e manter seu grupo? Compare alternativas e explicite o custo de cada uma.
2. **Recorrência, prazos e hábitos.** Para “prova sexta”, “inglês toda terça”, “ler todos os dias” e “beber água várias vezes”, quando usar compromisso, prazo de to-do, bloco recorrente ou checklist? Qual é o menor conjunto que atende aos dois perfis? Uma ocorrência passada sem marcação fica em que estado? Como remarcar apenas uma ocorrência e como tratar a conclusão das futuras?
3. **Tempo real e tarefas longas.** Compare registro manual, cronômetro e ausência de medição no primeiro lançamento. Como registrar 42 minutos reais numa reserva de 30? Como continuar a mesma tarefa amanhã, concluí-la uma única vez e evitar dupla contagem entre bloco e subtarefa? Como agregar por assunto e projeto?
4. **Foco e pausas.** Para uma manhã de estudo ou programação, compare um bloco com pausas opcionais e ciclos internos de 50/10. Quando essa complexidade se justifica? O que pode aguardar evidência de uso?
5. **Colisões visuais e acessibilidade.** Para A das 14h às 15h, B das 14h às 17h e C das 14h30 às 16h, como manter os cards estáveis e as atividades acessíveis quando o número de coincidências muda? Como escolher as duas visíveis e operar +N com toque e teclado? Como escolher o destino quando um bloco está totalmente coberto?
6. **Limites de data e duração.** Para 21h de hoje até 12h de amanhã e para um bloco de cinco dias, como distinguir um período contínuo de um compromisso de dia inteiro? Como exibir reservas internas, editar um trecho e distinguir essa edição de uma série recorrente?

## Pesquisa e formato da resposta

Escolha de três a cinco produtos relevantes, por exemplo Morgen para levar tarefas à agenda, Todoist ou TickTick para tarefas recorrentes, Notion Calendar ou Google Calendar para intervalos e Toggl Track para tempo real. Escolha pela pertinência de cada fluxo. Consulte documentação oficial ou demonstrações públicas do próprio produto. Para cada padrão citado, inclua link direto e data de consulta. Quando não encontrar evidência, declare a lacuna. Identifique claramente o que o produto documenta e o que você recomenda para o Kaizen.

Entregue, nesta ordem:

1. Uma tabela curta com questão, produto, comportamento observado, fonte e limite da comparação.
2. Para cada questão, duas alternativas plausíveis, recomendação mínima, motivo, principal desvantagem e decisão que ainda exige aprovação. Se a solução mínima for adiar uma funcionalidade, diga como o usuário resolve o caso hoje.
3. Dois percursos completos, um de cada perfil, desde a criação na lista até a revisão semanal. Inclua um cancelamento, uma tarefa dividida entre dias e uma atividade concluída sem medição de tempo.
4. Um recorte para a primeira versão e uma lista curta do que pode aguardar. Para cada decisão prioritária, dê um critério de aceite com entrada, ação e resultado observável.
5. No máximo cinco perguntas finais para o responsável pelo produto. Priorize respostas que realmente mudariam o comportamento da agenda.
