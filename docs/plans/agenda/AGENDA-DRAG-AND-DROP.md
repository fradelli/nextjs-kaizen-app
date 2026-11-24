# Plano de drag and drop da agenda

> Consulte a [reconciliação da agenda](RECONCILIATION.md) para distinguir código integrado, validações pendentes e propostas. Os vínculos abaixo cobrem o recorte de agenda.

- **Tipo:** Plano.
- **Área:** Agenda.
- **Tarefas relacionadas:** [E11-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T01-validate-integrated-schedule.md), [E11-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T02-prototype-calendar-interactions.md), [E11-T03](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T03-persist-calendar-interactions.md), [E11-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T04-edit-individual-reservations.md), [E11-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T05-link-common-activities.md), [E11-T06](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/T06-define-calendar-extension-rules.md).

Registro de 20/11/2026. Direção técnica: `@dnd-kit/react` na grade própria, com Pointer Events para seleção de intervalos e redimensionamento. O primeiro incremento e sua POC são descritos abaixo; funcionalidades e critérios ainda não executados permanecem pendentes.

Base conferida: `developer`, commit `27536ef`, integrada pela PR #86. Branch de trabalho: `codex/E06-drag-and-drop-agenda`. O merge em conflito observado na investigação anterior foi resolvido antes da criação desta branch. Este registro não altera o status canônico das tarefas do roadmap nem declara a implementação iniciada.

## Fontes e precedência

- [Regras aprovadas da agenda](../../product/telas/agenda-regras-de-produto.md): identidades, sobreposição, destinos internos, movimento de pais e reservas.
- [Interface da agenda](AGENDA-INTERFACE-PASSO-A-PASSO.md): atualização de 18/11 sobre painel direito e editor inferior; descrições anteriores de dois painéis são históricas.
- [Desempenho e organização](../../evidence/agenda/AGENDA-PERFORMANCE-E-ORGANIZACAO.md): cache, patches e fronteiras de renderização.
- [Modelo conceitual](../../architecture/MODELO-CONCEITUAL-DA-AGENDA.md) e [tabelas propostas](../../architecture/AGENDA-TABELAS-E-CONSULTAS-PROPOSTAS.md): distinguir propostas do modelo efetivamente implementado.
- [Arquitetura](../../architecture/TARGET-ARCHITECTURE.md): antes de editar código, ler semântica, boundaries, organização React, Client/Server Components e, para persistência, Server Actions, segurança e transações.
- [Guia de estilo](../../product/telas/guia-de-estilo.md): componentes e tokens Mira.

A especificação de dnd-kit fornecida pelo usuário orienta a solução técnica. Seus exemplos de CalendarBlock, comandos e sete colunas não substituem os contratos reais. Permanecem vigentes a grade variável, sobreposição livre, prévia de 30 minutos sem estimativa e múltiplas reservas por tarefa. Não pesquisar biblioteca substituta nem trocar a grade.

## Primeiro incremento acordado

1. Selecionar um período atravessando dias, mantendo uma única atividade.
2. Mover atividades comuns entre horários e dias, preservando duração.
3. Arrastar tarefas para a agenda e entre grupos.
4. Redimensionar a extremidade final de atividades comuns, respeitando itens internos.

A primeira validação será uma POC sem gravação no banco. Instalação, código, testes e integração persistente são etapas posteriores a este registro. A POC deve interceptar intenções em estado local, sem chamar Server Actions de escrita ou usar dados reais como destino de mutações. Nenhuma rota de demonstração deve ser publicada por padrão.

Resize de reserva individual exige contrato novo e pertence a uma etapa posterior. O recorte de resize inferior não autoriza simular a alteração de uma reserva movendo seu pai.

## Estado comprovado e lacunas

| Área | Base existente | Trabalho necessário |
| --- | --- | --- |
| Seleção | CalendarDayColumn usa Pointer Events e passos de 15 minutos por coluna | Seleção entre colunas, data final e limite de meia-noite |
| Atividade | create_activity, update_activity e move_activity; início/fim absolutos | Adaptador do gesto, prévia e resize inferior |
| Reserva | reserve e reserve_new; mesma tarefa pode ter várias reservas | Gesto de agendamento; posteriormente mover/editar reserva por identidade |
| Grupo | change_list e histórico de classificação | Destinos de grupo; não implica reordenação manual |
| Pai | Políticas shift/keep e confirmação existente | Ligar a soltura à confirmação antes de gravar |
| Vínculo entre atividades | parentActivityId no modelo | Comando público de vincular/desvincular, ciclos e apresentação interna |
| Sem horário | scheduledDate e faixa superior com hover/foco | Conversão por gesto e decisão de duração ao ganhar horário |
| Treino | Projeção, DTO resumido e ações próprias de reagendamento | Adaptador específico; separar planejamento e execução |

Pontos de integração:

- [CalendarDayColumn](../../../src/features/schedule/ui/components/calendar-grid/components/calendar-day-column/calendar-day-column.tsx), [CalendarGrid](../../../src/features/schedule/ui/components/calendar-grid/calendar-grid.tsx) e [layout](../../../src/features/schedule/ui/schedule-layout.ts).
- [ScheduleCard](../../../src/features/schedule/ui/components/schedule-card/schedule-card.tsx), [TodoTaskRow](../../../src/features/schedule/ui/components/todo-task-row/todo-task-row.tsx) e [TodoGroup](../../../src/features/schedule/ui/components/todo-group/todo-group.tsx).
- [ScheduleWorkspace](../../../src/features/schedule/ui/components/schedule-workspace/schedule-workspace.tsx), [estado do painel](../../../src/features/schedule/ui/components/schedule-workspace/hooks/use-schedule-panel.ts) e [tipos do editor](../../../src/features/schedule/ui/components/schedule-workspace/schedule-workspace.types.ts).
- [Comandos](../../../src/features/schedule/application/schedule-command.ts), [escritor](../../../src/features/schedule/data/schedule-writer.ts), [prévia de reserva](../../../src/features/schedule/domain/reservation-preview.ts) e [mutações cliente](../../../src/features/schedule/ui/components/schedule-workspace/hooks/use-schedule-mutations.ts).

O cache atual conserva até 84 dias e limita leituras concorrentes a quatro. Reduzir o intervalo reaproveita datas; ampliar busca as ausentes. Mutações retornam patches direcionados. Preservar carga inicial no servidor e detalhes de treino carregados ao abrir o executor.

## Recursos da biblioteca

Versão candidata da especificação: `@dnd-kit/react@0.5.3`. Seus metadados aceitam React 18/19 e declaram licença MIT. Fixar a versão somente na etapa de implementação e verificar tipos, lockfile e build com a base então instalada. Usar pnpm. Declarar `@dnd-kit/dom` diretamente se sensores/plugins forem importados; fazer o mesmo para outros pacotes importados diretamente.

| Necessidade | Avaliação | Referência oficial |
| --- | --- | --- |
| Mover cards e tarefas | Suporte direto ao gesto, composição temporal própria | [useDraggable](https://dndkit.com/react/hooks/use-draggable/), [useDroppable](https://dndkit.com/react/hooks/use-droppable/) |
| Contexto compartilhado | Um provider cobrindo lista e calendário | [DragDropProvider](https://dndkit.com/react/components/drag-drop-provider/) |
| Mouse, toque e teclado | Sensores disponíveis; ativação e passos temporais exigem configuração | [Sensores](https://dndkit.com/react/guides/sensors/) |
| Destinos aninhados | Colisão configurável; regra de vínculo pertence ao Kaizen | [Colisões](https://dndkit.com/react/guides/collision-detection/) |
| Rolagem | Plugin por eixo; não cria dias nem navega datas automaticamente | [AutoScroller](https://dndkit.com/extend/plugins/auto-scroller/) |
| Prévia e anúncios | Overlay e acessibilidade disponíveis; conteúdo e intervalo próprios | [Overlay](https://dndkit.com/react/components/drag-overlay/), [Accessibility](https://dndkit.com/extend/plugins/accessibility/) |
| Seleção e resize | Composição com Pointer Events; não são calendário pronto | [Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events) |

A documentação consultada acompanha a linha atual e não comprova execução da versão candidata no Kaizen. Não usar exemplos legados de DndContext/useSensors. Não usar sortable como modelo temporal. Não foi identificado recurso pago necessário. [Metadados da versão](https://registry.npmjs.org/@dnd-kit/react/0.5.3).

## Responsabilidades e fluxo

- Domínio: encaixe em 15 minutos, intervalos, ocupação interna e vínculos.
- Geometria: coordenadas do viewport, retângulos das colunas, escala real de 48/44 px por hora, scroll e segmentos por dia.
- Interação: origem, revisão, deslocamento temporal do ponto segurado, destino e prévia transitória.
- Apresentação: cards existentes, camada de prévia, overlay e alças. Usar exports reais de @fradelli/ui; Dialog já compõe o editor inferior.
- Persistência: comandos explícitos com IDs, revisão e intervalos; nunca coordenadas do ponteiro.

Iniciar o gesto captura um snapshot. Durante o movimento, atualizar apenas a prévia local. Soltura válida produz uma intenção; criação abre o formulário, agendamento apresenta a confirmação pertinente e movimento de pai abre ScheduleConfirm. Cancelar antes do envio não grava. Na integração real, confirmar gera uma operação idempotente e aplica a resposta canônica.

O primeiro incremento deve manter a confirmação após resposta do servidor, com prévia pendente separada, evitando introduzir rollback otimista de toda a agenda. Timeout tem resultado incerto: reconciliar ou repetir com o mesmo operationId. Conflito não sobrescreve revisão mais recente. Conferir também ordem de chegada de patches concorrentes, além da proteção já existente contra leituras antigas.

Uma atividade multidia mantém um ID persistente e um intervalo. Cada segmento recebe identidade visual própria, composta por entidade e data. Ao segurar um segmento intermediário, preservar o deslocamento desde o início real da atividade. Alça de término representa o fim real, não cada meia-noite visual.

O snap deve ter política única documentada para mover, selecionar, agendar e redimensionar. A escolha entre piso e arredondamento permanece proposta de interação para a POC. Não somar scroll duas vezes. Recalcular a prévia com autoscroll mesmo sem novo pointermove. Desabilitar destinos ocultos/carregando e tratar desaparecimento do alvo com cancelamento seguro na POC.

O corpo dos cards e o título dos to-dos são botões: o sensor padrão evita controles interativos. Configurar ativação conscientemente, preservando clique, edição, checkbox e foco. Não aplicar touch-action:none à grade inteira. Um resize não pode ativar simultaneamente o arraste do corpo.

Prévia e overlay não entram no contexto de dados persistentes. Atualizar os segmentos e destinos envolvidos sem recalcular todos os cards a cada pixel. Estado local por coluna continua útil, mas seleção multidia exige coordenação transitória acima das colunas. Medir renders; não prometer zero rerenders.

## Etapas e critérios de aceite

| Etapa | Dependência e entrega | Aceite |
| --- | --- | --- |
| 0. Preparação | Base limpa; plano registrado; conferir tarefa formal antes de iniciar código | Branch baseada em developer; contratos e pendências identificados |
| 1. Geometria e seleção | Evoluir seleção, datas do editor e recorte visual | 21h até 12h do dia seguinte e intervalo de cinco dias; uma entidade; prévia neutra sem borda |
| 2. POC de DnD | Após 1, provider, sensores, alvos e overlay | Movimento com grade rolada e número variável de colunas; clique e controles preservados |
| 3. Fluxos locais | Após 2, mover, agendar, trocar grupo e resize inferior | Intenções corretas sem chamar backend; cancelamento/no-op fora do destino geram zero comandos |
| 4. Persistência do recorte | Após aprovação dos resultados da POC; comandos existentes e validação servidor | Recarregar preserva IDs; retry não duplica; pai aplica shift/keep atomicamente |
| 5. Reservas individuais | Novos comandos e histórico | Mover/resize afeta apenas a reserva escolhida e mantém checkbox único |
| 6. Vínculos de atividades | Contrato, ciclos, concorrência e zonas aprovadas | Daily entra/sai de Trabalho sem duplicação; soltura inválida preserva estado |
| 7. Sem horário e treino | Decisões específicas abaixo | Conversão explícita; execução intacta; sem duplicar ocorrência projetada |

Validação transversal ao primeiro incremento:

- [ ] Seleção nos dois sentidos, meia-noite, cinco dias e cancelamento antes de salvar.
- [ ] Mover 09h–10h30 para outro dia às 14h15 resulta em 14h15–15h45.
- [ ] Segurar pelo meio ou por segmento intermediário não desloca o início indevidamente.
- [ ] Autoscroll com ponteiro parado mantém prévia e destino coerentes.
- [ ] Dias ocultos, datas em carregamento, expansão da faixa e mudança de viewport não geram drop incorreto.
- [ ] Reserva às 11h45 em pai até 12h usa 15 minutos; destino ocupado gera toast Mira.
- [ ] Sobreposição independente é permitida, inclusive com mesma tag.
- [ ] Resize inferior mantém início fixo e não corta item interno protegido.
- [ ] Pai com keep preserva reserva externa vinculada; atividade comum externa segue regra própria de desvinculação.
- [ ] Troca de grupo alcança reservas futuras; preserva encerradas/em andamento, identidade e histórico.
- [ ] Escape, pointercancel, destino inválido e operação sem mudança não gravam.
- [ ] Cliques, checkbox, edição de nome e foco continuam utilizáveis.
- [ ] Teclado anuncia destino e intervalo; alternativa por clique/toque usa o editor sem botão permanente em cada to-do.
- [ ] Cache reaproveita datas e atualiza somente registros/dias afetados.
- [ ] Integração testa concorrência, resposta perdida, reenvio e falha transacional.
- [ ] Safari iOS e Chrome Android reais: rolagem, ativação, cancelamento e acesso ao formulário.

Testes puros cobrem geometria/tempo; testes de componentes cobrem interação e foco; integração PostgreSQL cobre persistência; navegador e dispositivos reais cobrem scroll/toque. Typecheck, lint, estrutura e build seguem os gates do projeto. Não declarar sucesso de testes apenas pela existência das suítes.

## Decisões pendentes e etapas posteriores

| Decisão | Limite atual e recomendação |
| --- | --- |
| Resize superior | Alterar início hoje pode executar lógica de mover o pai. Definir efeitos sobre filhos antes de criar alça superior |
| Multidia no mobile | Dias não selecionados ficam ocultos. Autoscroll não troca datas; manter formulário equivalente e validar navegação durante gesto separadamente |
| Lista móvel para grade | Painel modal pode bloquear o destino. Não presumir que portal resolve acesso através do diálogo |
| Treinos concluídos | Grade prioriza horários realizados; reagendamento altera planejamento. Definir representação movida sem reescrever execução nem arredondar duração realizada |
| Atividade sem horário | Definir duração ao ganhar horário e expansão por toque; não equiparar scheduledDate a dia inteiro |
| Zonas internas/laterais | Intenções constam nas regras aprovadas; propor dimensões e prioridade de colisão na POC, sem aprová-las implicitamente |
| Profundidade e pausas | Escritor rejeita árvores profundas; não anunciar suporte irrestrito a aninhamento |
| Datas históricas | Conversões usam -03:00 fixo em alguns pontos; resolver semântica de fuso antes de prometer suporte a todas as transições históricas |

Recorrência e “esta e as próximas”, agrupador +N, árvores profundas e reordenação manual ficam fora do primeiro incremento. Projeção de treino existente não equivale à recorrência completa de atividades comuns. Não materializar todos os dias futuros para habilitar DnD.

A alternativa sem arraste deve respeitar a experiência do painel direito e não depender do menu de três pontos. Seu ponto de entrada precisa ser validado junto com teclado/toque. [WCAG 2.2 sobre arraste](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements).

## Evidência e próxima ação

Esta entrega registra o plano e seu recorte; nenhuma dependência, schema, componente ou comando foi alterado. POC, medições e critérios acima continuam por executar. O trabalho está vinculado ao E11. Próxima etapa prevista: validar a base em E11-T01 e depois executar a POC em E11-T02, quando a tarefa for selecionada. Esta reconciliação não inicia implementação.
