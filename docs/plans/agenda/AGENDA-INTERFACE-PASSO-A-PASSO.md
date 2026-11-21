# Interface da agenda — passo a passo

- **Tipo:** Plano.
- **Área:** Agenda.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

**Checkpoint histórico de 17/11/2026, anterior à entrega da interface:** complementa o [roteiro geral](AGENDA-ROTEIRO-DE-IMPLEMENTACAO.md). A tela semanal e o editor de treino existem. A nova Server Action está em src/app/workout/schedule-actions.ts. Naquele checkpoint, os painéis de to-dos e os cards de reservas ainda precisavam ser implementados. O estado posterior está registrado abaixo e em desempenho e organização.

A [refatoração de desempenho de 18/11](../../evidence/agenda/AGENDA-PERFORMANCE-E-ORGANIZACAO.md) registra a organização atual da grade/cache e seus limites de validação.

O [plano de drag and drop de 20/11](AGENDA-DRAG-AND-DROP.md) registra o primeiro incremento, a POC sem escrita no banco e as decisões ainda pendentes.

## Estado verificado em 17/11

**Atualização aprovada em 18/11.** As tarefas ficam no painel direito, abaixo do editor. Abrir o painel sem seleção exibe somente as tarefas. Selecionar um período na grade mostra o formulário de criação acima da lista. Cancelar ou pressionar Esc oculta o formulário. Ctrl+/ abre o painel de tarefas. A edição de um card existente permanece acessível pelo próprio card. Esta decisão substitui a disposição em dois painéis descrita nas etapas históricas abaixo.

Painéis esquerdo e direito, formulários, cards e checkboxes estão conectados à persistência. O percurso de criar lista e tarefa, reservar em bloco novo, concluir pelo card, mover o pai mantendo horários e excluir o pai mantendo a reserva foi verificado no navegador, incluindo recarga. O editor inferior foi conferido em 390 px. Listas e tags permitem edição de nome/cor; os nomes das tags padrão são protegidos. A origem de treino mantém o acesso ao formulário existente quando há plano disponível.

Os testes direcionados cobrem cache de dias, retry de formulário, atividade sem horário e operações PostgreSQL. A sobreposição parcial com agrupador +N, recorrência, registro manual de tempo e gestos de drag and drop continuam nos incrementos seguintes. A geometria atual mantém cards independentes em colunas e representa reservas contidas dentro do pai.

O pacote Mira local ganhou o componente Toast, adaptado da receita oficial Base Mira. A dependência da aplicação aponta para o tarball candidato em vendor. Publicação do pacote segue o fluxo próprio do design system.

Validação desta entrega: 13 integrações PostgreSQL, 2 testes dos painéis, regressões da grade/cache e teste de interação do Toast no DS passaram. Build de produção do Kaizen, TypeScript e lint dos arquivos alterados passaram. A versão de produção foi iniciada na porta 3100. Registros temporários de conferência foram arquivados/removidos logicamente da agenda.

Checks globais ainda apontam itens anteriores: solar.png na pasta do componente de logo, texto literal “kaizen” e entidade de seta no formulário legado de treino. O typecheck global do DS aponta a variante elevated em item.test.tsx, cujo componente admite default/outline/muted. O build do pacote, que exclui os testes, passou. A CLI do Next também emitiu aviso de versão vulnerável; a atualização de dependência segue pendente. Estes resultados impedem declarar o CI global integralmente aprovado.

## 1. Preparar os dados que a tela precisa

Aplicar as migrations validadas no banco local e gerar Prisma. Implementar leitura paginada de listas e tarefas em src/features/schedule/data, retornando DTOs definidos em application. Lista fornece id, nome, cor e revisão. Tarefa fornece id, título, revisão, conclusão, estimativa e listId. Reserva fornece id, horário, revisão, tarefa e pai. Atividade fornece identidade, intervalo ou data sem horário, tag, pai e revisão.

A leitura semanal já implementada em read-schedule-range.ts deve ser integrada à carga inicial em src/app/workout/page.tsx. A leitura incremental de calendar-day/route.ts recebe o mesmo contrato composto. Manter resultados de treino e agenda identificados por origem e chave estável. Ampliar a grade consulta apenas datas ausentes. Reduzir mantém o cache.

**Aceite:** abrir semana vazia sem plano, abrir semana com treino e atividade comum, carregar um oitavo dia e retornar a sete sem novas consultas dos dias recebidos. Erro de leitura usa feedback existente e permite tentar novamente.

## 2. Montar a estrutura dos painéis

Criar schedule-workspace como coordenador da seleção, abertura de painéis e mutações, mantendo o calendário existente como área central. Painel esquerdo reúne listas e to-dos. Painel direito edita a seleção. No desktop, ambos ocupam espaço no conteúdo abaixo do header global. O painel direito compartilha a linha dos controles do calendário e usa o mesmo ícone para abrir e recolher.

No mobile, o editor abre pela parte inferior. Para a lista de tarefas no mobile, implementar primeiro o acesso por controle acessível; a posição final desse controle deve ser revisada visualmente antes de concluir. Preservar Ctrl+/ para criar atividade e a seleção de período existente.

Componentes de entrada, botões, checkbox, seleção, diálogos e toast devem vir de exports verificados de @fradelli/ui. Se uma primitiva faltar, adicionar no design system e consumir a versão atualizada. Layout e posicionamento usam tokens do mesmo pacote.

**Aceite:** grade e cabeçalhos continuam alinhados ao abrir os painéis; controles permanecem alcançáveis em largura estreita; fechar o editor devolve foco ao acionador.

## 3. Entregar listas e criação de to-dos

Criar componentes privados em pastas próprias sob src/features/schedule/ui/components. Componentes esperados: todo-panel, todo-list-section, todo-row e todo-editor. Cada pasta possui componente e tipos quando necessários; estilos pertencem ao próprio componente.

Permitir criar lista com nome e cor, inclusive neutra; criar tarefa dentro da lista; editar título e estimativa; concluir ou reabrir; mudar de lista por seleção explícita. Sem estimativa, reservar usa 30 minutos. Estimativas usam múltiplos de 15.

Completar antes os comandos ausentes de edição de tarefa e lista. O escritor atual já cobre criação, conclusão e troca de lista. Cor aceita somente chaves existentes na paleta. A edição de cor exige preservação histórica conforme o plano de dados.

Cada envio mantém operationId estável durante retry. Desabilitar apenas as ações afetadas enquanto a gravação ocorre. Sucesso reconcilia revisão e dados. Erro mostra toast curto e conserva os campos. Uma conclusão atualiza todas as reservas carregadas da mesma tarefa.

**Aceite:** criar duas listas, criar tarefa, recarregar, marcar e reabrir, trocar de lista. Uma reserva em andamento conserva a cor anterior e as futuras recebem a classificação nova.

## 4. Criar e editar atividades pelo painel direito

Primeira linha compacta com seleção da classificação e ícone de recolher alinhado à barra do calendário. Campos acessíveis com rótulos para leitores de tela; conteúdo visual minimalista, sem descrição redundante de criação ou mensagens de draft salvo.

Atividade comum permite título, tag opcional, data e início/fim. Seleção de período preenche os horários. Oferecer atividade datada sem horário para a faixa superior. Completar create_activity para suportar essa forma e adicionar update_activity antes de expor os campos. Para treino vinculado, selecionar treino existente e conservar o destino de abertura do executor.

O botão Salvar ou Adicionar fica imediatamente após os campos. Abaixo, separar outras seções do painel por linha. Nunca preencher uma tarefa de treino a partir da mera tag Treino.

**Aceite:** criar atividade comum com e sem horário, editar no passado, recarregar e abrir novamente; nenhum seletor oferece 01h17. Atividade contínua entre dias mantém uma única identidade.

## 5. Reservar uma tarefa pelo formulário

Na tarefa, ação Agendar abre editor de reserva com bloco de destino e início. Buscar destinos da data selecionada, com identidade própria, mesmo quando vários coincidem. Mostrar prévia com o intervalo resultante, sem escrever no banco. Compartilhar o cálculo puro de encaixe com o servidor.

Confirmar envia revisão da tarefa e do bloco. Cancelar conserva a lista. Ao reservar na área livre, a criação do bloco e da reserva precisa ser atômica; acrescentar esse comando antes de disponibilizar a opção. Para editar ou remover somente uma reserva, acrescentar comandos específicos, preservando tarefa e outras reservas.

**Aceite:** 11h45 num bloco até 12h oferece 15 minutos; início ocupado gera toast; outra reserva do mesmo to-do conserva um checkbox único; cancelar não cria bloco nem reserva.

## 6. Exibir os novos itens na grade

Extrair contratos de apresentação da TrainingWeekGrid para aceitar atividades e reservas comuns com origem explícita. Reutilizar a geometria, a rolagem e o relógio existentes. Card comum abre editor; card de treino abre executor; checkbox de reserva apenas altera conclusão e não abre o editor.

Recortar intervalos multidia por data apenas na apresentação. Encontrar reservas pelo próprio intervalo e desenhar o pai quando aplicável. Uma reserva fora do pai permanece visível e conserva a cor herdada. Usar título e hora inicial compactos, fundo opaco e tons da paleta.

Faixa sem horário recolhida mede metade de uma linha horária, alinhada às colunas; expande no hover. Acrescentar expansão por foco e controle por toque como proposta de acessibilidade a conferir visualmente. Preservar edição de itens concluídos.

A geometria de +N em cruzamentos parciais ainda exige a decisão de layout indicada nas regras. Implementar primeiro as coincidências já definidas e tornar todos os itens acessíveis pelo agrupador.

**Aceite:** horários coincidentes, bloco de cinco dias, reserva fora do pai, atividade sem horário e checkbox sincronizado depois de recarregar.

## 7. Conectar movimento e exclusão

Editar início apresenta Mover com opções Reajustar horários e Manter horários. Excluir mostra contagem de itens por vínculo, inclusive os externos, opções Manter na agenda e Remover da agenda, botões Cancelar e Excluir. No bloco vazio, confirmação simples.

Enviar revisão usada para montar o diálogo. Se houve alteração concorrente, atualizar os dados e solicitar nova confirmação com o conjunto correto. Preservar a intenção até resolver o conflito. Atualizar datas antigas e novas, incluindo reservas fora do pai, e descartar respostas de fetch anteriores à mutação.

**Aceite:** mover Trabalho de 9h–12h para 11h–14h mantendo Revisar PR às 9h30; recarregar; excluir Trabalho mantendo itens; reserva conserva horário e passa à cor da lista. Repetir com remoção e conferir que o to-do permanece.

## 8. Validação e entrega local

Adicionar testes de interface para os fluxos e regressões reais, integração para comandos novos e verificação de navegador em desktop e mobile. Usar tarefas de teste identificáveis e conferir persistência após reload.

Executar Prisma validate, typecheck, lint nos arquivos alterados, validação de boundaries, traduções, testes de integração da agenda e regressões da grade e executor. Compilar antes de abrir o app local.

Ao entregar, informar o endereço e quais percursos foram verificados. Atualizar o roteiro com funcionalidades efetivamente conectadas. A interface só está concluída quando criação, reserva, conclusão, edição, troca de lista, movimento e exclusão funcionarem pelas entradas normais da tela.

## Ordem das entregas

Dados e estrutura → listas/to-dos → editor de atividades → reservas → cards/checkbox → diálogos → validação local. Cada etapa reaproveita os mesmos comandos transacionais. O drag and drop será conectado posteriormente a esses comandos.
