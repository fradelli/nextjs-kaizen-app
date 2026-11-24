# Changelog

## 2026-11-24 — Roadmap moved to the playbook (KZ-E00-T17)

- `roadmap/`, the local roadmap view, `scripts/build-roadmap-view*`, and the unused `vite` dev dependency were removed. The roadmap lives in [`fradelli/playbook: projects/kaizen/`](https://github.com/fradelli/playbook/blob/main/projects/kaizen/README.md); the view returns there with PB-E03-T01.
- The governance check accepts `[KZ-E00-T00] type(scope): summary` titles and `claude/KZ-...` branches, validates the ID against the public playbook index, and reads English pull request sections. PR templates follow the playbook standard.
- `docs:check` is split into `docs:catalog` and `docs:links`; task rules moved to the playbook `roadmap:check`.
- 224 links from `docs/`, `README.md`, and this changelog now point to the playbook. `CLAUDE.md` is in English with a `Playbook` section, and `AGENTS.md` points to it.

## 2026-11-23 — Gates de CI reforçados

- O CI passa a rodar `pnpm i18n:check` e `pnpm db:format:check`; o validador de i18n ignora entidades HTML e a marca, cobre todas as superfícies de produto e acusa chaves sem uso. 75 chaves órfãs removidas.
- Schema do Prisma formatado (só espaços). Vitest separado em projetos `node` e `dom`, com a suíte unitária de 144 s para 55 s.
- A cobertura passa a considerar todo `src/` (cerca de 60%); os thresholds viram esse piso até a integração medir cobertura. Cache de dependências do CI mantido desligado por decisão registrada.

## 2026-11-23 — Claude Code como agente de desenvolvimento

- Contratos de agente renomeados de `AGENTS.md` para `CLAUDE.md` na raiz e em `roadmap/`, `docs/`, `docs/migration/` e `data/`; o contrato raiz deixa de citar o Codex.
- O validador de governança aceita somente branches `claude/<ID>-descricao`; padrão de PR e decisão de branching atualizados.
- Instalações locais de outros agentes (`.agents/`, `.windsurf/`, `skills-lock.json`) removidas; skills do Prisma ficam em `.claude/skills/`, fora do Git.
- Auditoria técnica registrada como E00-T12 a E00-T16 e no épico [E12](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E12-code-health/README.md).

## 2026-11-22 — Visualização do roadmap com o design system

- A página de `roadmap/view/` passa a usar `@fradelli/ui` (preset Mira), o logo solar, IBM Plex Sans, Figtree e o tema escuro do Kaizen, com as mesmas telas e controles.
- A matriz usa Table e os épicos usam Progress, novos no design system a partir das receitas oficiais Mira.
- Continua fora do app Next e abre do disco depois de `pnpm roadmap:view`. `vite` declarado na versão já presente no lockfile. Nenhum estado alterado.

## 2026-11-22 — Visualização local do roadmap

- `pnpm roadmap:view` gera uma página local, sem servidor nem rede, com visão geral, épicos, matriz onda × status, kanban, tarefas e documentos navegáveis.
- A página só lê `roadmap/` e `docs/`; ondas, pendências e prontidão são calculadas pelo gerador, com testes. Nenhum estado alterado.

## 2026-11-22 — Padronização da documentação existente

- Todas as tarefas com as sete seções do modelo; ausências marcadas como não registradas, com a seção equivalente quando existe. Nenhuma seção renomeada ou movida.
- Cabeçalho comum (tipo, área e tarefas relacionadas) em todos os documentos de conteúdo; condições externas no frontmatter; tabelas dos épicos alinhadas às dependências.
- `pnpm docs:check` e `pnpm docs:preservation` mantêm o padrão e comprovam a preservação. [Evidência](docs/evidence/documentation/E00-T09-DOCUMENTATION-STANDARDIZATION.md). Estados, prioridade e tarefa selecionada preservados.

## 2026-11-21 — Visão geral e reconciliação dos demais planos

- [Visão geral por área](https://github.com/fradelli/playbook/blob/main/projects/kaizen/OVERVIEW.md) e [reconciliação](docs/plans/RECONCILIATION.md) distinguem entregas registradas, validações residuais e trabalho futuro.
- Treino, catálogo, Mira, alimentação, idiomas e publicação ligados às fontes existentes; lacunas de tarefas e divergências documentais explícitas. Nenhum estado, dependência ou código de aplicação alterado nesta etapa.

## 2026-11-21 — Reconciliação dos planos da agenda

- [Mapa de código integrado e trabalho restante](docs/plans/agenda/RECONCILIATION.md), com limites das evidências.
- E11 reúne oito tarefas planejadas; vínculos nos planos e índices atualizados. Estados anteriores e tarefa selecionada preservados. Nenhuma alteração de aplicação ou dependência.

## 2026-11-21 — Organização documental por finalidade e assunto

- Planos agrupados por assunto; relatórios e artefatos reunidos em evidências; diagnósticos substituídos identificados como histórico; prompts separados em pesquisa.
- [Índice geral](docs/README.md), [catálogo](docs/CATALOG.md), [padrão e modelos](docs/DOCUMENTATION-STANDARD.md) e [mapa da reorganização](docs/REORGANIZATION-2026-11.md).
- Caminhos e notas de vigência reconciliados. IDs, estados das tarefas e regras de produto preservados; nenhuma implementação de aplicação ou dependência adicionada.

## 2026-11-20 — Plano de drag and drop da agenda

- [Plano de implementação](docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) com recorte inicial, pontos de integração, POC sem escrita no banco e critérios de aceite.
- Resize superior, gestos multidia no mobile e semântica de treinos concluídos permanecem decisões pendentes. Nenhuma implementação ou dependência adicionada nesta entrega.

## 2026-11-18 — Desempenho e organização da agenda

- Mutações de atividades comuns, grupos e to-dos retornam atualizações direcionadas, preservando cache/paginação e revisão, sem refresh global da agenda.
- Grade organizada na feature schedule, com seleção por coluna e leitura resumida de treino; detalhes do executor são carregados ao abrir.
- Cache de datas com limite de memória/concorrência e navegação local; escritas de exclusão e classificação usam lotes com histórico.
- [Registro técnico e limites de validação](docs/evidence/agenda/AGENDA-PERFORMANCE-E-ORGANIZACAO.md). Testes e navegador não executados nesta etapa, por orientação do usuário.

## 2026-11-17 — Interface de atividades e tarefas da agenda

- Painel esquerdo de listas e to-dos, editor lateral no desktop e inferior no mobile.
- Atividades com horário ou data, reservas de tarefa, checkbox compartilhado, mudança de lista e edição de cores usando componentes Mira.
- Diálogos de movimento e exclusão integram as políticas aprovadas. Feedback de erro usa Toast incorporado ao candidato local do design system.
- Recarga e preservação da tarefa após mover/excluir o pai verificadas no navegador. Recorrência e drag and drop seguem em incrementos próprios.

## 2026-11-17 — Persistência inicial da agenda

- Schema aditivo para listas, tarefas e reservas, histórico por revisão e recibos de operação.
- Casos de uso transacionais para reserva, conclusão, troca de lista, movimento e exclusão com manutenção ou remoção dos itens.
- Consulta por intervalo encontra reservas fora do horário do pai. Integrações PostgreSQL cobrem concorrência, reenvio, rollback e preservação de histórico. A integração visual segue pendente.

## 2026-11-14 — Executor e diálogos Mira

- Executor modal consistente após reload, superfície escura uniforme e ações superiores com mesma geometria. Clique externo recolhe o treino.
- Duração abre controles de pausa. Resumo exclui aquecimentos e usa carga unilateral por lado. Séries realizadas dependem das medidas válidas, com destaque de linha e ✓ dedicado ao descanso.
- Campos E/D ou L/R lado a lado, Switch Mira do pacote e diálogos inferiores no mobile. Barra usa variantes oficiais e preserva o halo do indicador.
- 64 testes direcionados e 18 integrações PostgreSQL aprovados. Build e checks estáticos aprovados. Navegador em 1440, 390 e 320 px. Candidato local do DS, com release seguindo o fluxo próprio.


## 2026-11-13 — Barra de retomada flutuante pelo design system

- Item Mira, indicador de status, ícone e alvo de toque consumidos do candidato
  local do DS. Indicador verde pulsa durante execução e fica estático ao pausar
  ou solicitar movimento reduzido.
- Barra sobreposta ao conteúdo, acima da navegação móvel, sem padding condicional
  que encolha a agenda. Descarte e retomada continuam independentes.
- Validação em 1440, 390 e 320 px; 21 testes direcionados, build e checks estáticos
  aprovados. Candidato local, sem release ou deploy. Ajustes do executor e nova
  regra de contagem documentados como pendentes, sem mudança funcional nesta entrega.

## 2026-11-13 — Preparação da migração Mira e primeiro Select

- E10-T09 registrada com plano de conclusão e retomada verificável.
- Candidato local com Select instalado pelo pnpm; aquecimento do formulário usa
  o export público e preserva sugestões, rascunho e payload.
- Banco local atualizado; formulário validado em desktop e mobile emulado com
  envio real e retorno de foco. Build e checks estáticos aprovados, 68 testes
  direcionados aprovados. Release e migração integral permanecem pendentes.
- Popover de opções interceptando cliques na exclusão aninhada registrado como
  achado da agenda; exclusão por teclado confirmada.


## 2026-11-12 — Consolidação documental e contexto do Codex

- Roteiro por tarefa/seção, vigência visual e rotas atuais documentados; referências Prisma locais fora do versionamento.
- Pacotes E04, resumo diário e contexto consolidado substituídos por fontes específicas com origens imutáveis no relatório único.
- Código, dados, dependências e trabalho visual paralelo preservados; nenhuma publicação nesta entrega.
## 12/11/2026 - Revisão local da adoção do design system

- Execução dedicada mantém a prévia bloqueada e o contador parado antes do início, com campos de séries compostos por Field e Input.
- Aquecimento usa Collapsible ao lado do treino principal; rotina só de aquecimento permanece aberta e acessível pela rota de detalhe existente.
- Títulos interativos da agenda recebem CardTitle diretamente. Exemplos das fundações incluem os controles realmente exportados pelo artefato local, e os ícones do aplicativo usam Lucide.
- 475 testes aprovados, cobertura de branches de 80,19%; lint, tipos, formato, estrutura e traduções aprovados. Build e aceite visual desktop/mobile bloqueados pelo carregamento nativo do SWC no ambiente.
- Inventário e pendências de distribuição registrados em [componentes compartilhados](docs/product/telas/componentes-shadcn.md). Nenhuma publicação realizada.

## 12/11/2026 — Cursor padrão nos controles

- Botões, links com aparência de botão e controles de divulgação usam a seta padrão. O hover, o foco visível e o acionamento por toque continuam indicando interação.

## 11/11/2026 — Semana fixa e referência visual da agenda

- Desktop consulta sempre domingo a sábado, com sete colunas de largura constante. No celular, permanece visível apenas o dia selecionado.
- Navegação por dia no celular e por semana no desktop. Cabeçalho mensal, marcador vermelho para hoje e diferenciação sutil dos fins de semana.
- Agenda usa as fontes IBM Plex Sans e Figtree, controles de data em Lucide e sombras discretas nos eventos.

## 11/11/2026 — Cores de ações

- Padrão compartilhado por finalidade: menta para iniciar, lilás para adicionar e amarelo para a seleção de hoje.
- Estados de interação e indisponibilidade derivados das mesmas cores.

## 11/11/2026 — Agenda e navegação

- Rotas principais em inglês, com redirecionamento das URLs anteriores e preservação da data.
- Navegação somente por ícones acessíveis, com calendário para Meu Dia.
- Data acima dos controles compactos de navegação e título de Meu Dia visualmente oculto.
- Grade visual com linhas e rótulos de hora em hora. Novos horários planejados em blocos de 15 minutos. Estimativas são arredondadas para cima ao reservar o intervalo.
- Validação de horários no formulário e no servidor. Duração real continua registrada com precisão.
- 57 testes de formulário, cálculo de horários, navegação e grade aprovados.

## 2026-11-11 — sessões de segundos na agenda

- Sessões concluídas preservam a precisão dos intervalos registrados na grade, inclusive quando início e fim caem no mesmo minuto.
- Marcadores compactos e lista “Menos de 1 min” permitem localizar e abrir sessões breves sem aumentar sua duração real.
- Horários corrigidos, recuperação de rascunhos e cálculo das sobreposições permanecem preservados.

## 2026-11-11 — avaliação em rede local

- Corrigido bloqueio do formulário de avaliação em acesso HTTP por IP, quando o navegador não disponibiliza `crypto.randomUUID`.
- Identificadores dos rascunhos de avaliação e edição usam aleatoriedade criptográfica compatível com esse acesso, mantendo o formato UUID e a identificação de escritas concorrentes.

## 2026-11-11 — recuperação de cópias locais após conclusão

- Agenda e detalhe reconhecem cópias locais que correspondem à execução já concluída, limpando a barra de retomada sem gravar no banco.
- Divergências e falta da avaliação da aba impedem a limpeza automática; o detalhe orienta a conferir o resultado antes do descarte.
- Estado concluído bloqueia retomada local por eventos antigos e início acidental de outro cronômetro para a mesma ocorrência.

## 2026-11-11 — treino sobre a agenda e reenvio da finalização

- Rota paralela abre o executor sobre a página de origem, com retorno pelo histórico e acesso direto pela URL.
- Descanso e diálogos internos compartilham o contexto da sobreposição e liberam a rolagem ao fechar.
- Repetição idêntica de uma finalização reconhece o resultado salvo; dados divergentes continuam protegidos por conflito.
- Falha na resposta preserva o snapshot e permite reenviar a finalização com o encerramento original.

## 2026-11-11 — retomada global e menu de atividades

- Card de retomada recupera o treino local ao navegar entre páginas e confirma o descarte da execução.
- Menu de três pontos reúne mudança de dia ou horário e exclusão da ocorrência, com bloqueio durante execução.
- Executor dedicado concentra controles de execução; agenda recupera a posição de rolagem por data.
- Testes cobrem sincronização, falhas de armazenamento, descarte e preservação de uma execução pausada no PostgreSQL.

## 2026-11-10 — grade responsiva do Meu Dia

- Grade de 24 horas conectada às atividades reais, com um dia no celular e os dias restantes da semana no desktop.
- Posicionamento proporcional, sobreposições, itens sem intervalo e lista acessível pelo cabeçalho do dia.
- Tema grafite, categorias pastel e relógio local com marcador e contraste por passagem do tempo.

## 2026-11-10 — consulta semanal do Meu Dia

- Consulta de uma data até sábado com programação calculada sem persistência pela visita.
- Ocorrências previstas usam identidade comum à consulta e à gravação; exclusões permanecem ocultas.
- Mutações rejeitadas revertem efeitos parciais. Consulta futura cobre a semana completa.
- Validação com 24 testes unitários, 27 testes de PostgreSQL descartável, lint, tipos e formatação.

## 2026-10-29 — execução independente de séries

- Confirmação local por série, aquecimentos e séries adicionais, com envio ao finalizar o treino.
- Descanso recuperável com ajustes de 15 segundos; referência anterior por tipo e histórico durante execução.
- Layout compacto com faixa de estado, toggle e dicas em dialog; contratos e migração preservam registros legados.

## 2026-10-29 — interface em português e inglês

- Idioma automático do navegador, HTML/metadados e interface de treino traduzidos com next-intl.
- Catálogos com 290 mensagens por idioma, pluralização, datas e validação no CI.
- 408 testes e build aprovados; HTML verificado em seis cenários HTTP. Conteúdo editorial aguarda integração com o catálogo novo.

## 2026-10-28 — Hoje e entrada do aplicativo

- Hoje amarelo e desabilitado na data atual; cinza com hover/foco amarelo nas demais. Badge redundante removido.
- Marca leva à raiz; entrada do aplicativo redireciona para treino de hoje em São Paulo.

## 2026-10-28 — correções da revisão de rascunhos

- Descarte da avaliação preserva o horário de stop recuperado; eventos de armazenamento são isolados e falhas de limpeza legada não impedem a recuperação da sessão.
- Edição não agenda persistência; superfícies dos diálogos usam composição base única. Três regressões permanentes adicionadas.

## 2026-10-28 — rascunhos de formulário por sessão

- Criação/finalização usam sessionStorage; edição fica em memória e descarta alterações ao fechar, sem confirmação adicional. Execução permanece separada.
- Finalizar atividade usa formulário sem card interno, mensagem da sessão e exclusão de rascunho no rodapé.

## 2026-10-28 — ações consistentes nos diálogos

- Exclusão e descarte à esquerda em vermelho; ação principal à direita, inclusive em 320px.
- Confirmações reutilizam o modal compartilhado: X, clique fora, Escape, foco seguro e proteção durante envio; removida duplicação de comportamento e estilos.
- Diálogos compartilham divisórias de conteúdo/rodapé, tipografia e espaçamento; edição dispensa descrição redundante.
- Confirmação de exclusão abre com foco em Manter atividade. Navegação permanece acima do vidro do cabeçalho.

## 2026-10-28 — linguagem visual, ícones e registro de treino

- Kaizen alinhado à linguagem estática do portfólio: Inter, vidro, superfícies, bordas, geometria, espaçamento e estados compartilhados, sem estrelas ou animações.
- Design System 0.6.0 publicado oficialmente e instalado por pin exato; ícones Phosphor consumidos somente pelo pacote, com guard contra SVG de ação e bibliotecas paralelas.
- Player de treino no cabeçalho com Play/Pausa/Stop. Atividades externas usam conclusão direta, sem cronômetro nem horários inventados.
- Registro em modal com avaliação recuperável, proteção durante envio, erro preservado e confirmação de exercícios incompletos. Stop captura a pausa antes de abrir o formulário.
- Dicas com superfície elevada e contorno arredondado em hover/foco; botões usam cursor e hover oficiais do DS.
- Migration adicional permite minutos reais iguais e virada do dia; timestamps e intervalos preservam a duração exata, sem modificar registros existentes.

Mudanças materiais do projeto serão registradas neste arquivo.

## 2026-10-26 — correção da auditoria de dependências

- Atualizados Next.js/eslint-config-next para 16.4.2, Zod para 4.6.7 e Vitest/coverage-v8 para 4.1.12.
- Corrigidas as resoluções transitivas de Vite, Undici e fast-uri sem adicionar overrides permanentes.
- Auditoria local reduzida de 19 achados a zero; sem mudanças de dados, migrations ou regras do aplicativo.

## 2026-10-26 — fim planejado automático do treino

- Treino do plano sugere fim pelo início e duração da sessão; ajustes manuais são preservados e o usuário pode retomar o cálculo explicitamente.
- Edição mantém horários salvos e a sessão histórica quando não há troca de sessão; envio e falhas preservam consistência do formulário.
- Cobertos cálculo, limite do dia, conflitos, reset e falta de conexão; integrações PostgreSQL e jornada em Chrome com banco isolado aprovadas.
- Auditoria inicial com 19 achados, corrigidos separadamente pela PR #68 antes da integração desta entrega.

## 2026-10-26 — reauditoria de resíduos e apresentação do produto

- Removidas duas cópias temporárias incompletas de validação, após backup Git verificado e preservação do estado local para recuperação.
- Preservados os commits locais, branches com histórico exclusivo, stashes, configurações privadas e arquivos com consumidores confirmados.
- Evidências e limitações da verificação registradas no diário operacional; nenhuma alteração funcional ou no banco.
- README reorganizado por público, recursos disponíveis, jornada, planejamento e limites, com instalação conferida nos scripts e detalhes técnicos recolhíveis.

## 2026-10-26 — organização local e preservação de pendências

- Preservados o plano visual, o contexto histórico e as orientações de acesso local em documentação versionada.
- Corrigido o resumo desatualizado do README e selecionada a validação pendente da E06-T23, mantendo os estados de conclusão e bloqueio existentes.
- Removidas cópias auxiliares e arquivos gerados após preservar trabalho antigo em commit e backup Git local verificável.
- Nenhuma mudança funcional ou alteração dos dados operacionais nesta limpeza.

## 2026-10-12 — registro retrospectivo de atividades externas em revisão

- Futevôlei e atividades externas aceitam registro em hoje e ontem sem cronômetro, horários reais ou aquecimento obrigatório.
- Preparação opcional permanece consultável; registro aparece no fim do cartão expandido e desaparece ao recolher.
- Migration aditiva preserva histórico e horários ausentes; aplicada localmente em 04/10. Integrações PostgreSQL pendentes por indisponibilidade do Docker.
- CI das PRs #61 e #62 aprovou integrações PostgreSQL, backup/restore, build, qualidade, dados, governança e auditoria. PR #62 atualiza Next.js e transitivos e inclui um fork interno de `braces` com limite de profundidade.

## 2026-09-27 — edição da agenda futura implementada

- Separadas as permissões de organização da agenda e de execução nas camadas de domínio, aplicação e interface.
- Liberadas inclusão, edição e exclusão entre ontem e hoje + 4, preservando o fuso `America/Sao_Paulo` e o bloqueio de execução futura.
- Cobertos limites temporais, chamadas diretas às mutações e regressões de dias materializados; CI completa da PR #56 aprovada.

## 2026-09-27 — importação externa de planos planejada

- Criada a E06-T21 para projetar uma entrada externa de planos por JSON, com futura adaptação de template Excel sobre o mesmo contrato intermediário.
- Separadas validação, prévia, persistência e ativação, sem implementar endpoint, interface, parser ou migration nesta entrega.
- Preservados o importador Git, os dados ativos, o histórico versionado e a E06-T18 já reservada aos blocos combinados.

## 2026-09-27 — evolução futura e internacionalização planejadas

- Ordenadas as entregas futuras de sono e atividades gerais após a publicação e validação do MVP pessoal.
- Tornada explícita a dependência do i18n em relação às jornadas concluídas de treino, alimentação, sono e atividades gerais.
- Planejadas arquitetura i18n, política English-first, internacionalização do produto e conteúdo canônico, migração da documentação e validação multilíngue.
- Preservados fora do escopo atual implementação, traduções, novas dependências e alterações da tarefa ativa.

## 2026-09-27 — E06-T12 concluída e ficha em inglês ativada

- Corrigida projeção do estado do toggle, associação de aquecimento Futevôlei/Footvolley e proteção de rascunhos fora da janela de edição.
- Versão 1.1.0 importada do commit fbd544e e ativada localmente; reimportação no-op, sem alterar histórico operacional ou alimentação.
- CI local completa aprovada, incluindo 272 testes unitários, 41 integrações e auditoria sem vulnerabilidades conhecidas.
- Dias já materializados mantêm sua versão original; i18n, navegação inferior e reconciliação futura continuam adiados.

## 2026-09-26 — correções do fluxo diário em revisão local

- Conclusão parcial com confirmação curta, preservando o rascunho em falhas e sem exigir séries do aquecimento.
- Início e alterações apenas hoje/ontem no fuso São Paulo; datas futuras e históricas continuam consultáveis.
- Cards expandem e recolhem pelo título, sem iniciar o cronômetro.
- Preparada versão 1.1.0 com dados de treino em inglês, sem sobrescrever definições anteriores; ainda não importada porque o usuário pediu manter alterações sem commit.
- Navegação inferior e i18n continuam futuros; idiomas iniciais confirmados: português, espanhol e inglês.

## 2026-09-26 — nova programação implementada e ativada localmente

- Adicionada ficha aprovada com três sessões às 17h e futevôlei de segunda a quinta, 12h–13h30; jogos permanecem manuais e variantes reserva fora do plano ativo.
- Agenda 2.0 independente de jogo de fim de semana, mantendo leitura histórica e o limite de hoje + 4 dias.
- Preservados blocos A/B em campos estruturais das prescrições, com subtítulo provisório e navegação manual; condução guiada planejada na E06-T18.
- Adicionados quatro aquecimentos e suporte a preparação versionada para atividades esportivas, com duração incluída na janela principal.
- Preparada importação somente do treino ativo para o reinício local, sem alterar o comportamento padrão de importação histórica.
- Backup local atualizado e restaurado com sucesso; reinício transacional restrito ao treino concluído. Nova ficha importada e ativada localmente; alimentação preservada e reimportação idempotente.

## 2026-09-25 — roadmap de treino realinhado para a nova programação

- Sincronizadas E06-T02 e E06-T03 com as PRs #45 e #48 integradas; a E06-T03 registra a regra final de rascunho local e persistência na conclusão.
- Selecionada E06-T11 para rever a materialização do dia antes de modificar a agenda semanal.
- Planejadas E06-T15 a E06-T17 para agenda genérica, reinício controlado dos dados após revisão do usuário e importação posterior do próximo plano com sessões reserva.
- Exercícios combinados adiados porque o próximo plano não os exige; nenhuma limpeza, importação, implementação ou ativação foi feita nesta atualização.

## 2026-09-16 — página de treino do dia implementada

- Substituído o placeholder por uma página server-rendered com data civil canônica, navegação anterior/Hoje/seguinte e estados explícitos de treino, mobilidade, descanso e dia não atribuído.
- Mantidos loading, indisponibilidade, data inválida, referência inconsistente e erro inesperado sem expor detalhes de infraestrutura ou aceitar ownership do navegador.
- Organizados componentes, tipos, estilos e auxiliares por responsabilidade, com error boundary como único limite Client obrigatório.
- Refinados o cabeçalho e a leitura móvel após validação visual: marca `改善`, navegação antes da data e destaque semântico para o dia atual.
- Aprovados 196 testes unitários, 33 integrações PostgreSQL, cobertura, validadores, build de produção e auditoria sem vulnerabilidades conhecidas.

## 2026-09-16 — projeções de treino do dia implementadas

- Separadas as projeções públicas do plano e operacionais do treino da data em DTOs discriminados, sem expor Prisma, JSON bruto ou ownership ao navegador.
- Implementados casos de uso independentes da infraestrutura, regras explícitas de domínio e repositório PostgreSQL server-only com leitura consistente.
- Comprovados isolamento por workspace, preservação histórica, estados de treino, mobilidade, descanso e dia não atribuído, além do overlay de execuções parciais.
- Validado o incremento pelo pipeline completo com 177 testes unitários, 33 testes PostgreSQL, build de produção e auditoria sem vulnerabilidades.

## 2026-09-15 — modo público com workspace único aprovado

- Cancelada E05-T06 no escopo de sessão e pareamento; nenhuma dependência ou tela de autenticação foi adicionada.
- Registrado o risco aceito de leitura e alteração por quem descobrir a URL enquanto houver somente um usuário e dados considerados não sensíveis.
- Mantido o workspace fixo resolvido exclusivamente no servidor, sem aceitar ownership do cliente e com filtros estruturais nos repositórios.
- Autenticação real tornou-se gate explícito antes de múltiplos usuários, dados sensíveis ou qualquer promessa de privacidade; E06-T01 ficou pronta para implementação.

## 2026-09-15 — recuperação local comprovada

- Automatizados `pg_dump` e `pg_restore` entre dois PostgreSQL 18.6 descartáveis, sem tocar bancos ou volumes existentes.
- Validada a restauração de definições canônicas e de um canário operacional com migrations, planos ativos, contagens, vínculos e identidades preservados.
- Adicionados comando, runbook e job dedicado `Backup restore`; a prova real restaurou 151.376 bytes e todos os sete gates da PR passaram.
- Mantidos fora do escopo dados reais, Neon, retenção, RPO/RTO gerenciado e restauração de produção.

## 2026-09-14 — integridade persistida comprovada

- Implementado auditor server-only `REPEATABLE READ`/`READ ONLY` de paridade das definições canônicas e proveniência dos bytes Git, sem imprimir dados privados nem reparar divergências.
- Adicionada CLI protegida para `kaizen_test`, com resultados distintos para banco válido, divergente e não importado; executada em cenários preparados pelos testes da CI.
- Ampliados testes relacionais de pais ausentes, unicidade, ownership alimentar, limites, medidas, carga e isolamento de ativações; concorrência real em dois Clients preserva somente a gravação vencedora por revisão.
- Confirmados 144 testes unitários/validadores, 30 integrações e 29 regressões dos scripts, além dos gates completos e audit sem vulnerabilidades; migrations, planos, shells e volumes intactos.
- Refinada a semântica da implementação: fontes discriminadas, DTOs e mapeadores por entidade, regras de paridade coesas, fixtures fora da aplicação e códigos de falha distintos para argumentos, banco, fonte e infraestrutura.
- Adicionado gate automatizado para impedir dependências incompatíveis entre domínio, aplicação, dados, UI e fronteiras `use client`.

## 2026-09-14 — validação Docker da E05-T02 concluída

- Subidos PostgreSQL local e de teste pelo Compose com saúde, volume persistente e tmpfs independente confirmados.
- Tornada configurável a porta de teste, preservando o padrão 5433 e permitindo coexistência com outros projetos sem interromper seus containers.
- Confirmadas aplicação em banco vazio, reexecução sem pendências e persistência da migration após restart; gates completos passaram com 17 integrações no PostgreSQL Docker.
- Encerrada a pendência da E05-T02 sem apagar volumes, alterar migrations ou publicar credenciais.

## 2026-09-14 — importação canônica idempotente por CLI

- Criada importação server-only de bytes Git fixados, com validação antes da escrita, origem/hash e documentos JSONB preservados.
- Projetadas definições de treino/alimentação e ativações em transação serializable; segunda execução é no-op, conflitos não reescrevem versões e falhas não deixam projeção parcial.
- Validados versão nova com ID estável, concorrência, rollback SQL real, referências alimentares e preservação operacional em PostgreSQL isolado; gates completos e auditoria passaram.
- Compartilhadas as regressões do validador de dados com a cobertura e ancoradas exclusões de formatação na raiz para não ignorar os módulos `data/` das features.
- Documentado comando e fluxo seguro de atualização. Shells e JSON canônicos permanecem intactos; Docker segue pendente na E05-T02 conforme autorização explícita de sequência.
- Refinada a semântica em `plan-definition-import`: nomes ligados a definições versionadas, etapas de persistência separadas com transação centralizada, validação única antes do cliente do banco e manifesto com propriedades nomeadas.
- Tornada permanente a revisão semântica: convenções na arquitetura, leitura obrigatória para mudanças de código no AGENTS e checklist no template de PR.

## 2026-09-14 — organização do Prisma e regras permanentes

- Integrada correção isolada da auditoria pela PR #37: override restrito de deepmerge-ts 8.0.2, com compatibilidade Prisma e gates completos confirmados em developer e na composição E05-T02; Docker permanece pendente.
- Separados schemas de plataforma, treino e alimentação, sem alterar a migration inicial.
- Separadas configuração tipada server-only, limites de pool e validação pura; adicionados testes das proteções da CLI.
- Tornada automática a geração do Client nos comandos de desenvolvimento, build, tipos e testes; documentadas convenções normativas na arquitetura e referência no AGENTS.
- Mantidas as pendências de auditoria e inicialização Docker da E05-T02; nenhuma entrega marcada como concluída.

## 2026-09-13 — persistência local implementada, entrega pendente

- Criados schema Prisma P0, migration transacional e constraints/triggers de ownership, versões, doses, carga, medidas, estados alimentares e preservação histórica.
- Separados runtime server-only lazy, migrations diretas e PostgreSQL descartável de testes; adicionada geração explícita do Client aos gates e testes reais sem mocks/SQLite.
- Confirmada aplicação em bancos PostgreSQL 18.6 vazios, reexecução sem migrations pendentes e testes de integridade; telas e dados canônicos permanecem intactos.
- Corrigidos os findings mysql2 com override restrito 3.23.1; auditoria deepmerge-ts e inicialização dos containers Docker locais permanecem pendentes, sem bypass do gate ou tarefa marcada como concluída.

## 2026-09-12 — modelo P0 e metadados especificados

- Documentadas as 18 entidades conceituais com ownership, vínculos de versão, unicidade, checks, índices e preservação histórica.
- Revisados os 38 exercícios usados nos planos versionados, com doses explícitas, segundos por lado, direções e qualificadores preservados.
- Criado schema estrito e ampliada a validação de dados para bloquear classificação ausente, referências inválidas, carga incompatível e normalizações não revisadas.
- Nenhum plano histórico, banco, migration, Prisma Client, dependência ou endpoint foi alterado/criado.

## 2026-09-11 — estrutura React padronizada

- Reduzidas as entradas de Dieta, Treino e Foundations à composição server-side, com placeholder compartilhado e ilha Client mínima para o exemplo interativo.
- Encapsulados componentes compartilhados e filhos privados em pastas próprias, mantendo tipos, estilos, constantes, hooks, utilitários e testes junto de seus responsáveis.
- Registrada a convenção na arquitetura e adicionada validação estrutural local e na CI para impedir componentes soltos ou arquivos auxiliares misturados.
- Preservados conteúdo, acessibilidade e comportamento visual; formato, lint, tipos, testes, dados, build e auditoria passaram.

## 2026-09-11 — shell acessível do Kaizen concluído

- Criado shell mobile-first sobre `@fradelli/ui@0.1.0` com landmarks, skip link e navegação Dieta/Treino identificando a rota atual.
- Mantido o shell como Server Component e isolado `usePathname` em uma ilha Client mínima, com tipos, constantes, estilos, hook e utilitário separados por responsabilidade.
- Adicionados placeholders explícitos sem dados de domínio e redirecionamento de `/` para `/dieta`, preservando `/foundations`.
- Validados teclado, foco, viewport de 320 px, ausência de overflow, testes, build e auditoria; criada E04-T09 para padronizar separadamente as páginas existentes.

## 2026-09-11 — integração versionada do Design System concluída

- Fixados `@fradelli/ui@0.1.0`, Tailwind CSS `4.3.3`, `@tailwindcss/postcss@4.3.3` e PostCSS `8.5.28` com instalação congelada comprovada em worktree limpo.
- Integrados Inter variável, tema dark explícito, CSS público único e detecção do `dist` publicado via `@source`.
- Criada `/foundations` com primitives públicas, estados rotulados, foco, teclado, responsividade e movimento reduzido, sem antecipar domínio ou shell.
- Configurado acesso efêmero `packages: read` somente nos jobs de CI que instalam dependências; nenhuma credencial foi versionada.
- Gates locais e os seis jobs obrigatórios da PR #30 passaram, incluindo instalação autenticada, build estático, auditoria e árvore única de React.

## 2026-09-10 — prontidão do Design System avaliada

- Confirmados runtime, peers, exports, CSS público e arquivos publicados de `@fradelli/ui@0.1.0` sem instalar o package.
- Reexecutados os gates locais e remotos com sucesso e registrada a estratégia segura de autenticação local e do CI.
- Emitida decisão NO-GO porque a leitura autenticada do GitHub Packages não foi comprovada; E04-T08 permanece bloqueada.
- Nenhuma dependência, credencial, configuração autenticada ou mudança de aplicação foi adicionada.

## 2026-09-10 — CI mínimo e proteção de branches concluídos

- Integrada a E04-T05 pela PR #27 com gates separados de governança, qualidade, testes, integridade dos dados, build e auditoria de dependências.
- Ativados rulesets sem bypass para exigir pull request e os seis checks em `developer`, `staging` e `master`.
- Restringido `developer` a squash e promoções a merge commit; rebase merge foi desabilitado.
- Configurado o Dependabot semanal para dependências npm e GitHub Actions.

## 2026-09-10 — fronteira server-only criada

- Adicionados contrato mínimo de ambiente e resolvedor fixo de workspace protegidos por `server-only`.
- Limitada a configuração desta etapa a `APP_ENV` e `PERSONAL_WORKSPACE_ID`, sem antecipar banco, sessão ou autenticação.
- Criado erro discriminado e sanitizado que não inclui valores de ambiente.
- Adicionados testes de validação, cache, imutabilidade e resolução exclusiva no servidor.
- Comprovado que um Client Component não consegue importar a boundary e que nenhum marcador privado aparece no bundle cliente.

## 2026-09-10 — adoção documental do Design System compartilhado

- Criada a decisão local que adota por referência o ADR normativo e registra o contrato publicado de `@fradelli/ui@0.1.0`.
- Substituída explicitamente a fundação visual exclusiva local, preservando as demais decisões e resultados de E03/E04-T01.
- Definidos ownership, segurança do registry, riscos e rollback por versão, sem copiar tokens, primitives ou domínio.
- Criadas E04-T07 e E04-T08 para separar prontidão sem instalação da integração técnica pelo GitHub Packages.
- Reordenada E04 para concluir CI, prontidão e integração antes do shell; telas de Treino e Dieta passam a depender do shell.
- Nenhum package, Tailwind, fonte, componente, credencial ou código de aplicação foi adicionado nesta atualização.

## 2026-09-10 — qualidade estática configurada

- Integrada a E04-T02 pela PR #24 com Prettier, ESLint, Vitest, Testing Library e cobertura mínima de 80%.
- Adicionados scripts reproduzíveis de formato, lint, tipos, testes, cobertura e build.
- Alinhados ESLint 9.39.5 e TypeScript 6.0.3 aos peers suportados pelo Next.js 16.3.4.
- Preservados documentação, dados, CI, Design System, banco, boundaries e features fora do escopo da tarefa.

## 2026-09-07 — aplicação Next.js inicial criada

- Fixados Node.js 24.20.0, pnpm 11.25.0, Next.js 16.3.4, React 19.2.8 e TypeScript 7.0.2.
- Criado o App Router mínimo com metadados de privacidade, página inicial responsiva e TypeScript estrito.
- Gerado e versionado o lockfile de instalação reproduzível sem adicionar banco, autenticação ou features de negócio.
- Desabilitada a geração automática de instruções do Next.js para preservar o contexto enxuto e controlado do `AGENTS.md`.
- Validados instalação, build de produção e carregamento local com HTTP 200.
- Concluída E04-T01 e liberada E04-T02 para configurar qualidade estática e testes.

## 2026-09-02 — contexto e sequência pré-MVP saneados

- Reduzido o contrato raiz e distribuídas instruções específicas para `roadmap/`, `data/`, `docs/` e migração.
- Modularizado o guia de implementação em cinco pacotes de E04 e pacotes concisos para E05–E08.
- Substituídas entradas vagas das tarefas futuras por caminhos exatos e contexto limitado.
- Criada E05-T06 para implementar sessão, autorização e pareamento antes dos fluxos operacionais.
- Limitado E05-T05 ao backup/restore local; Neon e restore gerenciado permanecem em E08.
- Renomeados os diretórios E06–E08 para refletir execução e publicação pessoal, com links atualizados.
- Normalizadas as checklists concluídas de E02/E03 e mantida E04-T01 como próxima tarefa pronta.
- Concluída E00-T07 sem criar aplicação, dependência, workflow, banco ou ambiente.

## 2026-09-02 — guia de implementação do P0

- Convertidas as decisões aprovadas em uma ordem incremental de E04-T01 a E08-T05, com uma PR por tarefa.
- Pinadas as versões iniciais de runtime, framework, qualidade, banco, testes e segurança.
- Documentados conteúdos completos do scaffold inicial, ações por arquivo, dependências, validações e rollback.
- Associadas as decisões futuras dependentes de evidência às tarefas responsáveis, sem criar código prematuro.
- Concluídos E03-T05 e o épico E03; liberados E04 e E04-T01 para iniciar a aplicação Next.js.

## 2026-09-02 — arquitetura alvo do MVP

- Escolhidos Node.js 24 LTS, Next.js 16 App Router, React 19, TypeScript estrito e pnpm pinado.
- Escolhidos PostgreSQL local/Neon e Prisma ORM 7 estável com conexões pooled e direta separadas.
- Definidos boundaries de UI, aplicação, domínio e dados, sem backend ou API interna separados.
- Especificados modelo conceitual, metadados explícitos de execução, transações, concorrência, migrations, segurança e testes.
- Alinhadas E05, E06 e E07 ao registro operacional aprovado de dieta e treino.
- Concluída E03-T04 e liberada E03-T05 para produzir o guia copiável.

## 2026-09-02 — privacidade e operação do MVP

- Escolhidas Vercel e Neon PostgreSQL, com URL gerada e sem domínio próprio ou cadastro no MVP.
- Separada leitura pública dos planos de atribuições, execuções e comentários privados.
- Definidos pareamento do dispositivo, cookie seguro e autorização server-side para toda operação pessoal.
- Isolados local, previews, staging e produção com bancos, dados e segredos próprios.
- Definidos RPO de 24 horas, RTO de 4 horas, backup cifrado, restore mensal e evolução futura para contas.
- Concluída E03-T03, corrigido o escopo de publicação pessoal em E08 e liberada E03-T04.

## 2026-09-02 — transição da fonte de verdade

- Mantidos Git e JSON como fonte editável das definições de planos durante o MVP.
- Definido o banco como fonte exclusiva de atribuições, execuções, séries, escolhas e comentários.
- Especificadas importação transacional e idempotente, versões imutáveis, ativações e conflitos bloqueantes.
- Definidos backup, exportação, rollback e cutover futuro sem dual-write.
- Concluída E03-T02 e mantida E03-T03 como próxima tarefa pronta.

## 2026-09-02 — jornadas operacionais do P0

- Limitado o P0 às áreas Dieta e Treino, com navegação por data em `America/Sao_Paulo`.
- Definido o registro de opção alimentar seguida, refeição diferente, item pulado e comentário.
- Definidos treino, mobilidade e descanso, com preparação separada, execução por série, carga somente quando aplicável e comentários.
- Especificados estados de leitura e gravação, conflitos, histórico, acessibilidade e critérios comportamentais.
- Concluída E03-T01 e liberadas E03-T02 e E03-T03, mantendo execução sequencial por E03-T02.

## 2026-09-02 — fundação alimentar validada

- Validados 13 artefatos E02 na origem privada e os três derivados públicos pelos hashes versionados.
- Confirmados schema, ponteiros, referências cruzadas, relação com o treino ativo, links e separação entre fonte, revisão e plano.
- Revisados unknowns, limites não clínicos e privacidade sem encontrar falha bloqueante.
- Publicado relatório reproduzível e definido o procedimento para marcar o merge com `nutrition-foundation-v1`.
- Concluída E02-T06, encerrado o épico E02 e liberada E03-T01.

## 2026-09-02 — contratos do plano alimentar

- Criado o ponteiro canônico para `nutrition_2026_09_personal_v1` com caminhos do plano, schema e guia.
- Adicionado JSON Schema Draft 2020-12 permissivo para a estrutura vigente, sem inventar metas ou regras clínicas.
- Publicado guia humano derivado com tipos de dia, horários, limites de uso e procedimento de versionamento.
- Documentada a precedência do JSON e mantidas referências cruzadas como validação complementar.
- Concluída E02-T05 e liberada E02-T06 para o gate final da fundação alimentar.

## 2026-09-02 — plano alimentar pessoal estruturado

- Registrada a aprovação do proprietário para uso e publicação do derivado sanitizado da alimentação vigente.
- Criado o plano `nutrition_2026_09_personal_v1` com seis tipos de dia, cinco refeições, vinte opções e faixas energéticas rastreáveis ao legado.
- Separados uso pessoal e validação profissional; metas ausentes permanecem `null` e nenhuma inferência clínica foi adicionada.
- Excluídos identidade, contexto médico, suplementos, protocolo cognitivo e caminhos privados.
- Concluída E02-T04 e liberada E02-T05 para criar ponteiro, schema e guia.

## 2026-09-02 — revisão alimentar segura

- Comparados privadamente os estados prescrito, praticado e proposto em 23 decisões rastreáveis.
- Preservados no Kaizen somente metadados e resumo sanitizados, sem alimentos, refeições, quantidades, medidas ou contexto médico.
- Mantido o modelo por tipo de dia como candidato e exigida reconciliação com o plano de treino ativo v2.
- Rejeitadas metas pessoais exatas e protocolos de suplementos sem dados ou validação suficientes; nenhum diagnóstico foi produzido.
- Concluída E02-T03 e bloqueada E02-T04 até aprovação explícita das decisões que podem entrar na proposta.

## 2026-09-01 — preservação privada da fonte alimentar

- Publicado no legado privado o snapshot alimentar `0d6456a68329f51fb9f83e1230cb285fe82f5996` e a tag `kaizen-nutrition-source-v1`.
- Preservados oito artefatos sob aliases neutros com identidade dos objetos Git e hashes SHA-256 confirmados contra o inventário.
- Registradas no manifesto somente referências seguras como `SKIP/DO_NOT_PUBLISH`, sem conteúdo alimentar, caminhos históricos ou dados pessoais.
- Concluída E02-T02 e liberada E02-T03 para revisão segura da fonte original, alimentação praticada e plano derivado.

## 2026-09-01 — correção do inventário alimentar

- Ampliada a descoberta para todas as refs remotas do legado após o inventário inicial ter pesquisado somente o snapshot de treino e o worktree observado.
- Localizados oito artefatos alimentares em commit privado remoto, com tamanhos e hashes calculados diretamente dos blobs.
- Registradas dieta original, alimentação praticada, contexto, plano derivado, receita, auditoria e guia sem copiar conteúdo ou expor caminhos pessoais.
- Mantidos todos os candidatos como `DO_NOT_PUBLISH` até decisão específica por artefato.
- Ajustada E02-T02 para preservação privada segura e alterado seu estado de `BLOCKED` para `READY`.

## 2026-09-01 — inventário das entradas alimentares

- Verificados o snapshot privado, o worktree conhecido e o anexo disponível sem localizar uma dieta ou registro da alimentação praticada.
- Classificados perfil, agenda e plano de treino somente como contexto público sanitizado.
- Registrados fatos, fontes ausentes, decisões profissionais indisponíveis e `unknowns` sem inferir valores nutricionais.
- Mantido o manifesto inalterado e nenhum arquivo criado em `data/nutrition/`.
- Concluída E02-T01 e bloqueada E02-T02 até o fornecimento e a classificação da dieta original.

## 2026-09-01 — fundação de treino validada

- Verificados o snapshot privado, os 23 artefatos do manifesto e os hashes dos 19 destinos publicados.
- Corrigido o ponteiro ativo para usar o `artifact_id` do original privado e o caminho vigente do guia humano.
- Confirmados 9 JSONs, 3 aplicações de schema, 38 IDs únicos e 87 referências de exercícios resolvidas.
- Sanitizado o critério público de agenda e registrada a aceitação do histórico anterior sem reescrita.
- Publicado o relatório sem falhas abertas, encerrada E01 e liberada E02-T01.

## 2026-09-01 — schemas de treino

- Copiados literalmente os contratos Draft 2020-12 da biblioteca e dos planos, preservando seus hashes de origem.
- Confirmada a validação estrutural da biblioteca e dos planos v1 e v2 com `Test-Json`.
- Transformado o README para remover o script ausente e explicitar cobertura, permissividade, formatos e lacunas.
- Mantidas unicidade, referências cruzadas e seleção do plano ativo como validações separadas dos schemas.
- Verificados os três artefatos da E01-T05; manifesto sem pendências e E01-T06 liberada.

## 2026-09-01 — documentação humana de treino

- Publicados cinco guias compactos, derivados dos dados canônicos e sem agenda ou contexto pessoal.
- Mantidas evidências e limitações com proveniência, sem apresentar a migração como nova revisão científica.
- Publicados três templates vazios com preenchimento exclusivamente privado e proibição de versionar respostas.
- Removidas instruções, caminhos e duplicidades do legado; prompts restantes foram rotulados como exemplos não canônicos.
- Verificados no manifesto os oito artefatos da E01-T04; tarefa concluída e E01-T05 liberada.

## 2026-08-31 — histórico de treino

- Migrado literalmente o plano v1 como versão histórica, sem alterar seu `status` embutido nem o ponteiro ativo para a v2.
- Mantido o treino original do coach exclusivamente no snapshot privado como `SKIPPED/DO_NOT_PUBLISH`.
- Publicada a revisão com referência auditável ao `artifact_id` privado, sem link quebrado para arquivo ausente.
- Publicada a análise histórica sem dias, horários exatos ou questão de saúde.
- Registrados hashes e tratamentos dos quatro artefatos; concluída E01-T03 e liberada E01-T04.

## 2026-08-31 — dados canônicos de treino

- Migrados literalmente o ponteiro ativo, a biblioteca de exercícios e o plano vigente v2 a partir do snapshot imutável.
- Publicado o perfil sem identidade, medidas corporais, contexto de saúde ou `unknowns` médicos.
- Publicada a agenda sem dias, horários exatos ou modelos semanais, preservando as regras de distribuição.
- Registrados e verificados no manifesto os hashes de origem e destino dos cinco artefatos.
- Concluída E01-T02 e liberada E01-T03 para decisão de exposição do histórico.

## 2026-08-31 — snapshot imutável do treino

- Publicado no legado privado o snapshot `d1acad309e2b81b714d1aa375e9371a310ad6ed0`.
- Criada a tag privada `kaizen-training-source-v1` para preservar a referência imutável.
- Inventariados 23 artefatos candidatos ou excluídos com SHA-256 calculado diretamente dos blobs do commit.
- Mantidos fora do snapshot arquitetura, prompts, saídas geradas, temporários e o script local não rastreado.
- Nenhum arquivo de treino foi copiado para o Kaizen.
- Concluída E01-T01 e liberada E01-T02 para a migração canônica após revisão de exposição.

## 2026-08-31 — política pública e proveniência do legado

- Mantido o repositório público por decisão do proprietário para a governança de CI/CD no GitHub.
- Cancelada a tarefa de tornar o repositório privado, preservando seu histórico e motivo.
- Definida uma política de publicação por allowlist com classificação de exposição por artefato.
- Registrado o repositório legado privado e seu commit-base remoto verificável.
- Criado o contrato do manifesto de migração sem copiar dados pessoais, planos ou código.
- Concluído o épico E00 e liberada E01-T01 para escolher o snapshot definitivo do treino.

## 2026-08-30 — fundação do repositório e roadmap

- Inicializado o repositório com as branches `developer`, `staging` e `master`.
- Definido `developer` como branch padrão de integração.
- Criada a governança documental sem código, dependências ou aplicação.
- Criado um roadmap hierárquico com status consolidado no arquivo pai.
- Adaptado o padrão de títulos, descrições e promoções de pull request do Sandicts para IDs locais do roadmap.
- Definida a governança futura de CI/CD com gates próprios para Next.js e integridade dos dados do Kaizen.
- Registrada a associação futura de `staging` com preview e `master` com produção; a Vercel ainda não está configurada.
- Inicialmente bloqueada a migração de dados pessoais enquanto a estratégia de exposição ainda não estava decidida.
