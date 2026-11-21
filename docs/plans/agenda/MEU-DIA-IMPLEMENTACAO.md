# Plano de implementação do Meu Dia e da revisão visual da execução

> Consulte a [reconciliação da agenda](RECONCILIATION.md) para distinguir código integrado, validações pendentes e propostas. Os vínculos abaixo cobrem o recorte de agenda.

- **Tipo:** Plano.
- **Área:** Agenda.
- **Tarefas relacionadas:** [E11-T01](../../../roadmap/epics/E11-schedule-evolution/T01-validate-integrated-schedule.md), [E11-T06](../../../roadmap/epics/E11-schedule-evolution/T06-define-calendar-extension-rules.md), [E11-T08](../../../roadmap/epics/E11-schedule-evolution/T08-define-overlap-presentation.md).

> Diagnóstico e fases da base anterior. Consulta semanal, grade, retomada e sobreposição têm entregas posteriores no [diário](../../worklog/index.md) e nas [telas](../../product/telas/README.md). `/treino` abaixo é histórico; rota atual `/workout`. Fases restantes não estão concluídas por esta nota.

Preparado para iniciar em entregas pequenas. As referências aprovadas são [Meu Dia](../../product/telas/meu-dia.md), [execução](../../product/telas/execucao.md) e [medidas](../../product/telas/medidas.md). Os exemplos dos wireframes têm datas e atividades fictícias. As fases abaixo são trabalho planejado.

## Ponto de partida

- [Navegação atual](../../../src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.constants.ts) expõe Dieta e Treino. O mapa de produto prevê Meu Dia, Planos e Alimentação. Ainda é necessário entregar um destino real para Planos.
- [Página do dia — fonte histórica](https://github.com/fradelli/nextjs-kaizen-app/blob/f3c5170d80362cd4005e5600f3b5fa8826c4beea/src/app/treino/page.tsx) resolve uma data e consulta um dia de treino. [Consulta atual](../../../src/features/training/application/get-training-day.ts) chama a materialização da agenda antes de ler. Carregar a semana repetindo essa operação poderia gravar ocorrências apenas pela visita.
- A rota local `src/app/treino/atividade/[occurrenceKey]/page.tsx` procura pelo ID da atividade na data e aceita uma sessão de preparação como motivo para abrir o detalhe. É preciso resolver também ocorrências projetadas e restringir a entrada ao treino estruturado. Preservar acesso direto e recarga.
- O [componente de atividade](../../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx) já coordena séries, controles, cronômetro e descanso. O redesenho interno é visual. Retomar a partir da agenda e abrir sobre a página são entregas de integração separadas.
- A tarefa apontada em [ACTIVE](../../../roadmap/ACTIVE.md) está concluída. Existem alterações locais de navegação, card, testes e traduções. Antes de codificar, comparar a árvore com a base da nova tarefa e aproveitar o trabalho em andamento. A arquitetura de referência para as tarefas é [TARGET-ARCHITECTURE](../../architecture/TARGET-ARCHITECTURE.md).

## 1. Tema e navegação responsiva

Implementação iniciada em 10/11/2026. Aplicados fundo grafite, superfícies e bordas, medidas estáveis de texto, navegação móvel com ícones e rótulos, nomes Meu Dia e Alimentação, remoção da superfície externa do executor, agrupamento por exercício e campos de série de 16 px com altura de 44 px. Planos aguarda um destino utilizável. A grade e a consulta sem escrita são as próximas entregas.

Editar [estilos globais](../../../src/app/globals.css), [estrutura da aplicação](../../../src/components/shared/app-shell/app-shell.tsx), seu módulo CSS e os componentes de navegação. Aplicar os papéis de cor e medidas nos escopos da agenda e do treino. No desktop, cabeçalho horizontal. No celular, barra inferior com ícone, rótulo, área segura e estado ativo. Atualizar as mensagens em português e inglês. Reutilizar as rotas de treino e dieta enquanto recebem os novos nomes; integrar Planos quando houver página utilizável.

Aceite: a agenda ocupa o fundo inteiro. Rolar até o último item funciona com navegação e card de retomada presentes. Conferir data, foco por teclado e navegação existente para alimentação. Esta etapa visual pode começar imediatamente.

## 2. Consulta da agenda sem escrita

A consulta diária passou a projetar a programação em memória. A chave calculada considera workspace, data, plano e posição da entrada. A projeção e a gravação usam a mesma chave; registros removidos funcionam como exceções para evitar reaparecimento. A finalização materializa apenas a atividade escolhida dentro da transação e reverte a criação quando o resultado é rejeitado. As consultas e ações antigas continuam atendendo ocorrências já persistidas. A agenda com atribuição diária antiga ainda segue a leitura histórica atual.

A consulta semanal foi implementada em [get-training-week](../../../src/features/training/application/get-training-week.ts), com entrada em [training-queries](../../../src/features/training/data/training-queries.ts). Resolve o workspace uma vez e consulta entre um e sete dias, terminando no sábado. Cada dia usa uma transação de leitura consistente; uma alteração de plano durante a carga pode ser observada em um dos dias seguintes. Descanso previsto chega pelo campo opcional plannedRestReason. A consulta de datas futuras foi liberada para permitir a semana inteira.

Validação inicial concluída com 24 testes unitários de consulta e datas, 27 testes de integração em PostgreSQL descartável, lint, tipos e formatação. Os testes relacionais cobrem leitura sem escrita, atividades avulsas após troca de plano, finalização inválida sem efeitos parciais, finalização concorrente, exclusão e repetição após resposta perdida. O reconhecimento de uma repetição idêntica foi acrescentado na fase 4. As mutações rejeitadas revertem sua transação integralmente.

O formato da chave é transitório enquanto o banco usa versões importadas de plano; o novo modelo de planos precisará de IDs estáveis para as entradas semanais, independentes da posição. A grade visual e a apresentação do descanso previsto seguem na fase 3. Os caminhos antigos de materialização explícita e de preparação continuam atendendo os consumidores atuais até a revisão própria desses vínculos.

Trabalhar em [consulta do dia](../../../src/features/training/application/get-training-day.ts), [tipos de dependência](../../../src/features/training/application/get-training-day.types.ts), [consultas de dados](../../../src/features/training/data/training-queries.ts) e [resolução de datas](../../../src/features/training/application/resolve-training-day-date.ts). Mapear os consumidores de [materialização diária](../../../src/features/training/data/ensure-scheduled-training-day.ts) antes de desacoplar a leitura. Preservar as operações explícitas de criação e gravação.

Propor uma consulta por intervalo civil no workspace resolvido no servidor. Unir programação calculada, exceções datadas, atividades avulsas e resultados confirmados. Cada item precisa de chave estável, data, origem, tipo, horário opcional, duração conhecida ou ausente, título, estado e referência ao treino ou resultado quando aplicável. Uma chave calculada deve distinguir dois horários do mesmo treino no mesmo dia e permitir retomar a mesma ocorrência após recarga. Validar a resolução no servidor ao executar ações. O rascunho é local e deve ser associado pela mesma identidade.

Aceite: consultar repetidamente dia, semana e prévia deixa as tabelas intactas. Uma atividade avulsa continua no dia ao trocar o plano padrão. A finalização sobre uma ocorrência prevista produz um único item visível. Testar também treino espontâneo, ontem pendente, dia sem plano, data futura, duração desconhecida e travessia de mês. Preservar o histórico real de treinos e as regras próprias dos blocos de rotina.

## 3. Grade e relógio

Grade integrada à rota de treino usando a consulta semanal. O celular mostra a primeira data e o desktop mostra as datas restantes até sábado. O relógio atualiza a linha e o contraste em memória a cada 30 segundos e ao retornar à aba, preservando a rolagem manual. O cabeçalho da coluna abre a lista do dia para facilitar a seleção de intervalos curtos. Esportes reutilizam o diálogo de registro existente; treinos estruturados abrem o detalhe com a data selecionada. Itens sem intervalo e descanso previsto aparecem fora do eixo. A área da agenda usa a altura disponível entre cabeçalho e navegação inferior.

A revisão visual foi parcial no navegador de teste, em larguras de desktop e celular. O controle foi interrompido porque a ferramenta não conseguiu confirmar o endereço da janela do navegador instalado. A confirmação manual de interações no aparelho continua pendente. As ações de edição ainda usam os formulários atuais; o menu de ocorrência e o card global de retomada pertencem à fase 4.

Integrar o intervalo à [página — fonte histórica](https://github.com/fradelli/nextjs-kaizen-app/blob/f3c5170d80362cd4005e5600f3b5fa8826c4beea/src/app/treino/page.tsx) e à [composição do dia](../../../src/features/training/ui/components/training-day-page/training-day-page.tsx). Isolar grade, eixo horário e apresentação dos eventos em componentes da funcionalidade. Calcular posição pela fração do dia e altura pela duração. Calcular sobreposições por dia; manter itens sem horário fora do eixo. O relógio usa um único instante de São Paulo e atualiza o desenho sem consultar o banco a cada minuto. Recalcular hoje na virada do dia e ao retornar à aba.

Aceite: em terça, cinco colunas no desktop e uma no celular; em sábado, uma nos dois. Percorrer de 00h a 24h, abrir outra data e voltar a hoje. Conferir o marcador nas bordas de hora, evento em curso, dias passados, sobreposição e os dois eventos de 15 min. Conferir contraste do texto atenuado. A rolagem manual conserva sua posição durante atualizações do relógio. A grade pode ser validada com dados de exemplo enquanto a consulta é preparada; a entrega integrada depende da fase 2.

## 4. Ações, detalhe e retomada

Retomada global e menu implementados em 11/11/2026. [ActiveTrainingBar](../../../src/features/training/ui/components/active-training-bar/active-training-bar.tsx) lê os rascunhos válidos do navegador, sincroniza mudanças na mesma aba e entre abas e confirma o descarte com verificação de atualização concorrente. O nome opcional da atividade complementa os rascunhos existentes. O cálculo do tempo é compartilhado com o executor. O menu usa popover nativo e reutiliza os formulários atuais de edição e exclusão.

A exclusão fica bloqueada para rascunhos locais e para execuções persistidas em andamento ou pausadas; o servidor valida o estado persistido. O executor dedicado perdeu os controles de edição e exclusão da ocorrência. A grade armazena a posição de rolagem por data no sessionStorage.

Validados recuperação, cancelamento, falha de armazenamento, atualização durante confirmação, sincronização entre duas visualizações, bloqueio de menu e exclusão no PostgreSQL. Abertura e fechamento nativos do menu por Escape foram conferidos no navegador. A validação interativa completa no aparelho segue pendente.

A rota paralela foi implementada em src/app/@workout. Navegar pelo aplicativo abre o executor sobre a página de origem, ocupando a tela no celular. Voltar e Escape retornam pelo histórico; abrir diretamente a URL ou recarregá-la utiliza a página dedicada. O detalhe aceita apenas treinos estruturados. O painel de descanso usa o contêiner do diálogo ativo. O bloqueio de rolagem é compartilhado entre os diálogos para permitir desmontar a tela e uma avaliação interna na mesma navegação.

O servidor reconhece a repetição de uma finalização com a mesma revisão de origem, início e intervalos, séries normalizadas e avaliação. Retorna a revisão já salva sem atualizar o resultado. Dados divergentes geram conflito. Quando a resposta falha, o formulário conserva o snapshot e permite repetir o envio com o horário original de encerramento. A limpeza local ocorre após confirmação de sucesso. A promoção de alterações para Planos segue pendente.

Ao recarregar o detalhe ou a agenda que contém uma sessão concluída, a [reconciliação local](../../../src/features/training/ui/hooks/use-training-activity-draft/reconcile-completed-training-draft.ts) compara a revisão, o início, os intervalos, as séries e a avaliação com o resultado recebido do servidor. Exige a assinatura do snapshot na cópia de avaliação da mesma aba. Somente uma correspondência completa remove as cópias locais e atualiza a barra de retomada. Dados divergentes, avaliação ausente e falhas de armazenamento preservam os dados ainda não confirmados; o detalhe avisa para conferir o resultado antes do descarte manual. A leitura não chama ações de escrita nem altera o banco. A conferência não consulta sessões fora das datas carregadas e não remove automaticamente rascunhos sem a cópia de avaliação da aba.

Os 33 testes focados de interface passaram, incluindo retorno, reenvio após resposta perdida, painel de descanso dentro do diálogo e desbloqueio da rolagem ao desmontar diálogos aninhados. Os 20 testes de integração PostgreSQL passaram; a suíte semanal foi repetida com rejeição de séries divergentes. A validação em aparelho físico permanece pendente; a conferência posterior no navegador está descrita abaixo.

Na conferência de navegação de 11/11/2026, a versão local compilada abriu o treino sobre a agenda, iniciou a execução local, voltou à mesma data, retomou pela barra e recuperou o cronômetro após recarga direta da URL. O descarte do rascunho de teste restaurou o estado não iniciado. Essa primeira conferência não finalizou nem gravou resultados.

A rodada da reconciliação aprovou 55 testes de interface e rascunhos. Inclui correspondência com carga normalizada, divergências de revisão, início, intervalo, série, confirmação e avaliação, alteração da cópia durante a conferência, falha de remoção, aviso no detalhe e bloqueio de eventos antigos após conclusão.

Na rodada seguinte, a finalização foi conferida com PostgreSQL efêmero exclusivo, dados sintéticos e a versão compilada. Um proxy temporário descartou a resposta somente depois que o servidor terminou de processá-la. No primeiro caso, o navegador preservou os campos e permitiu reenviar; o banco manteve uma execução na revisão 1, um intervalo e duas séries. No segundo, a página foi recarregada após perder a resposta; exibiu o resultado concluído e limpou a barra de retomada sem outro envio. O total permaneceu em duas execuções, dois intervalos e quatro séries, após três envios e duas respostas descartadas. A instância e os processos temporários foram encerrados, sem usar a base de desenvolvimento.

Essa rodada encontrou e corrigiu o carregamento infinito da avaliação em HTTP por IP: `crypto.randomUUID` não está disponível nesse contexto. Os identificadores locais de avaliação e edição agora usam `getRandomValues`, mantendo UUID v4. Os 29 testes relacionados, lint, estrutura, tipos e build passaram. Permanecem pendentes teclado e área segura em aparelho físico.

O ajuste seguinte preserva segundos no posicionamento de sessões concluídas. Usa o primeiro início e o último encerramento dos intervalos quando correspondem aos horários reais, incluindo pausas no intervalo visual. Horários corrigidos continuam prioritários. Na ausência dos timestamps, uma duração real de zero minutos pode usar os segundos ativos registrados para uma sessão de menos de um minuto; sem essa evidência, permanece sem intervalo. A duração persistida não é alterada.

Sessões com menos de um minuto aparecem como marcadores de pelo menos 3 px no horário real, sem expandir seu intervalo para calcular sobreposições. O botão “Menos de 1 min” abre uma lista filtrada com alvos de toque de 44 px para abrir cada treino. Os marcadores não criam alvos minúsculos de interação e continuam executando a reconciliação de rascunhos concluídos. O cabeçalho do dia mantém acesso à lista completa. Uma atividade longa recortada pela meia-noite não é classificada como breve.

Essa alteração passou em 26 testes de geometria, interface e reconciliação. Uma prévia sintética foi conferida no navegador em 1280 e 390 px, com duas sessões de dez segundos no mesmo minuto e uma sessão longa fora do filtro. A lista exibiu as duas sessões breves separadamente. A prévia foi removida após a conferência, sem gravar os exemplos no banco.

Integrar a agenda com a rota de detalhe existente e o [ponto de entrada das ações — fonte histórica](https://github.com/fradelli/nextjs-kaizen-app/blob/f3c5170d80362cd4005e5600f3b5fa8826c4beea/src/app/treino/training-actions.ts). No desktop usar rota paralela/interceptada sobre a agenda; no celular ocupar a tela. Preservar a mesma data e posição ao fechar. Esporte registra diretamente pelo diálogo. O menu da ocorrência oferece mover ou remover. Preparação antes do esporte é outra atividade estruturada programada. A alteração estrutural no banco para retirar vínculos antigos de preparação exige tarefa própria.

Localizar a execução ativa pelo rascunho do navegador e exibir a retomada também fora do detalhe. Confirmar o descarte antes de apagar os dados locais. Uma finalização só libera o rascunho após confirmação do servidor. Ao perder a resposta, reconciliar pela identidade da execução antes de tentar gravar de novo.

Aceite: abrir → iniciar → preencher → sair → recarregar → retomar → finalizar → voltar à mesma data. Repetir com descarte e reinício, falha de rede e resposta perdida. Esporte e atividade avulsa também devem funcionar sem abrir o executor. A exclusão de uma ocorrência e o descarte do rascunho são comandos distintos.

## 5. CSS da execução existente

Editar os estilos do [card da atividade](../../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.module.css) e dos componentes de exercício, editor de séries e descanso. Remover a superfície externa, manter o agrupamento por exercício e aplicar tipografia, estados, ícones e alvos de toque. A ordem dos controles, as colunas por tipo de exercício e as transições atuais são a referência para a regressão. Pode avançar após a fase 1, em paralelo ao trabalho de dados.

Aceite: executar os cenários da [especificação visual](../../product/telas/execucao.md) e comparar prévia, treino ativo, pausa e resultado concluído. No celular real, preencher carga e repetições, fechar teclado, confirmar série, ajustar descanso e finalizar. Verificar que a barra inferior e o teclado deixam as ações alcançáveis.

## 6. Integração de rotinas, resumo e planos

Entregar os tipos de bloco e seus formulários conforme suas fontes estiverem disponíveis. O resumo distingue tempo atribuído por atividade, tempo coberto pela união dos intervalos e duração real confirmada de treino. Exemplo de aceite: trabalho de 3 h e treino confirmado de 1 h com meia hora de sobreposição totalizam 4 h atribuídas e 3 h 30 cobertas. Programar uma refeição ou treino não comprova consumo ou execução.

Na frente de Planos, primeiro plano padrão por modalidade, troca válida desde hoje, treino reutilizável dentro do plano, edição sem versões e agenda semanal. A atividade avulsa continua independente. O editor usará o catálogo para configurar exercícios e séries na própria tela. Adicionar exercício durante uma sessão tem escopo local; promover para os próximos treinos exige escolha explícita. O desenho das telas de autoria, recorrência, alimentação e correção histórica segue o [mapa de navegação](../../product/telas/README.md). Manter essas entregas fora da mudança de CSS.

## Validação, riscos e decisões pendentes

1. Na implementação, começar pelos testes de navegação, consulta e atividade já existentes. Cobrir especificamente a ausência de escrita na leitura, o fim de semana, a virada de data, ocorrências repetidas e retomada após recarga. Usar relógio controlado nos testes de tempo.
2. Executar formatação, lint, tipos, testes focados e a verificação completa do repositório (`pnpm run ci`) antes de integrar. Validar a ausência de escritas com banco descartável e o ciclo de finalização com falha simulada.
3. Revisar em 390 e 1280 px, tela estreita, texto ampliado e aparelho com teclado virtual. Verificar a versão em inglês, foco de retorno, seleção entre eventos curtos adjacentes e os destinos da barra.
4. Definir na fase 2 o formato da chave de ocorrência e o contrato para eventos que cruzam a meia-noite ou têm duração desconhecida. Na fase 3 validar o gesto para eventos curtos. Antes de liberar os três destinos de navegação, definir a primeira página utilizável de Planos. Esses pontos permitem iniciar tema e estrutura hoje.
5. Separar entregas visuais das mudanças de persistência para permitir reverter uma etapa isoladamente. Qualquer alteração de esquema terá plano próprio de migração, teste e reversão. Nenhum reset é necessário para revisar o tema ou a grade.
