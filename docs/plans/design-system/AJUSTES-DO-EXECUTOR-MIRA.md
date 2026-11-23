# Ajustes do executor e dos diálogos do Kaizen

- **Tipo:** Plano.
- **Área:** Design system.
- **Tarefas relacionadas:** [E10-T09](../../../roadmap/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md)

> Reconciliação de 21/11/2026: A verificação de 14/11 cobre o pacote descrito naquele checkpoint; a próxima rodada proposta e o candidato atual exigem avaliação própria. [Escopo e evidências](../RECONCILIATION.md#design-system).

Plano para o agente implementador. A implementação foi autorizada pelo proprietário em 13/11/2026. As etapas abaixo formam um único pacote de produto, com verificações intermediárias para localizar regressões. O código de partida inclui alterações locais nos dois repositórios. Conferir o diff antes de trabalhar e preservar essas alterações.

## Entradas e decisões aprovadas

Ler os contratos de agente dos dois repositórios (`CLAUDE.md` no Kaizen; `AGENTS.md` no design system), a [tarefa ativa](../../../roadmap/ACTIVE.md), o [guia visual](../../product/telas/guia-de-estilo.md) e as [decisões recentes do executor](../training/TRAINING-SET-EXECUTION-AND-HISTORY-PLAN.md#cabeçalho-do-executor--layout-aprovado-em-13112026). As decisões de novembro sobre contagem prevalecem sobre o histórico de outubro. Componentes, variantes, estados, tokens e movimento vêm de receitas Mira exportadas pelo design system. Composição da tela, textos e regras de treino pertencem ao Kaizen.

Decisões aprovadas em 13/11/2026. Aquecimentos são excluídos do numerador, denominador e volume do resumo. Carga unilateral é por lado. Uma série de 10 kg com 8 repetições à esquerda e 10 à direita soma 180 kg. A implementação do pacote foi autorizada. Preservar a interpretação de registros antigos.

## 1. Corrigir o Switch primeiro no design system

Diagnóstico conferido no código do app, na dependência instalada e no fonte do pacote. O interruptor do exercício importa `@fradelli/ui/switch`. A implementação instalada e `design-system/src/components/switch/index.tsx` desenham um button com role switch e um span. A [receita oficial base-mira/switch](https://ui.shadcn.com/r/styles/base-mira/switch.json) usa Root e Thumb de Base UI e oferece os tamanhos default e sm. Migrar o mesmo export público para a receita oficial. Manter o significado de concluir/reabrir o exercício.

1. No DS, obter a receita do preset adotado, registrar origem e versão/hash conforme a governança, adaptar imports ao pacote e mapear os tokens existentes. Usar geometria, estados e área de interação da receita. Conferir os consumidores do contrato atual antes de trocar a assinatura.
2. No Kaizen, revisar `training-exercise.tsx`, `training-warmup-toggle.tsx` e `training-completed-exercise-correction.tsx`. O primeiro hoje inverte o estado em onClick. Usar uma única transição por acionamento. O aquecimento usa Switch com type submit e campos ocultos, incluindo revisão. Verificar o DOM e a submissão com a nova primitiva. Se precisar adaptar, disparar a ação uma única vez, preservando payload, estado pendente, erro e revisão. Inspecionar também correções persistidas e exemplos em foundations.
3. Exercitar ligado/desligado, desabilitado, foco, teclado e toque. Confirmar uma única mutação por gesto. Uma troca de aparência do switch nunca deve completar medidas de uma série.

## 2. Estabelecer um padrão responsivo para todos os diálogos

Inventariar ocorrências em todo o app, inclusive componentes que encapsulam diálogos. Começar por `training-activity-modal.tsx`, `training-workout-overlay.tsx`, consumidores, confirmações e foundations. Buscar Dialog, AlertDialog, Sheet, showModal, role dialog/alertdialog e portais. Registrar por fluxo o acionador, formulário ou rascunho, destino do foco e forma de fechar.

- Desktop usa diálogo centralizado. Mobile abre da borda inferior e permanece ancorado nela. Conteúdos curtos usam sua altura natural. Conteúdos longos rolam dentro do painel com ações alcançáveis, teclado virtual e área segura. O executor completo é o caso de altura integral no mobile. Seus diálogos internos seguem o padrão inferior sobre o treino.
- Conferir no DS Dialog, AlertDialog e Sheet contra as receitas Mira. O catálogo local inclui Sheet com revisão de compatibilidade pendente. A [receita Sheet](https://ui.shadcn.com/docs/components/base/sheet) oferece o lado bottom. Preferir composição responsiva do pacote com uma única instância aberta, mesmo conteúdo e estado. Preservar a semântica de alerta nas confirmações destrutivas.
- Usar o breakpoint de layout mobile do app e testar imediatamente dos dois lados. Manter o mesmo conteúdo durante hidratação e redimensionamento. A animação curta de entrada vem do DS. Verificar a política de movimento estático em globals.css e aplicar eventual exceção só à transição acordada. Respeitar movimento reduzido.
- Conferir título acessível, foco contido no painel superior, retorno ao acionador, Escape fechando uma camada, bloqueio da rolagem de fundo e portal de Select dentro de modal. No menu da atividade, corrigir o popover nativo que intercepta a confirmação de exclusão. Encerrar o menu ao abrir a confirmação e verificar clique real em cancelar/confirmar.

## 3. Empacotar e integrar

Concluir o candidato do DS antes de migrar os consumidores. Incluir a limpeza das variantes locais da barra (icon-touch e elevated) após localizar demais usos. Para o indicador pulsante, compor primitivas e tokens oficiais e documentar o movimento solicitado. Evitar novas variantes de botão. Rodar testes direcionados, Storybook, build, validação do pacote e fixtures de consumo do DS. Atualizar catálogo e changeset conforme o contrato afetado.

Gerar o tarball pelas rotinas do DS e registrar hash. No Kaizen, atualizar dependência e lockfile pelo pnpm, conferir instalação congelada e imports reais. Preservar o candidato anterior para comparação/retorno. Releases seguem o workflow próprio do DS. Usar este fluxo local para validar antes da publicação.

## 4. Unificar a abertura do treino

Comparar as entradas em `src/app/workout`, a rota de atividade, a abertura pela agenda, o overlay e `tests/training-detail-route.test.tsx`. Compartilhar a composição do executor entre navegação interna, URL direta, retomada e reload. Desktop deve recompor a agenda do dia atrás do modal mesmo em entrada direta. No mobile o executor cobre toda a janela. Usar a mesma superfície mais escura do DS nas margens internas, conteúdo e cards. Usar bordas e espaçamento para distinguir exercícios.

Clicar no fundo externo do modal recolhe o treino pelo mesmo fluxo da seta de voltar, preservando o rascunho. Verificar voltar no overlay. Hoje ele chama router.back(). Em entrada direta prever retorno à agenda do dia mesmo sem entrada anterior do Kaizen. Preservar data, ocorrência, rascunho, relógio e rolagem da agenda ao recolher. Evitar montar dois executores ou iniciar intervalos duplicados.

## 5. Aplicar a regra de série realizada antes de ligar os contadores

Partir de `src/features/training/domain/training-set-execution.rules.ts`. Reutilizar as regras de medida por tipo, lados e direções. Exigir carga válida quando aplicável, preservando a diferença entre vazio e zero. Exigir os dois lados nas unilaterais. Usar apenas valores realizados. Meta, faixa prescrita e referência anterior têm função informativa.

Rastrear leitores e escritores de confirmed desde o editor, use-training-exercise-draft e use-training-activity-draft até training-activity-controls.utils, get-training-day, reconciliação e prisma-training-repository. Separar a decisão de realização da ação que inicia o descanso. Compartilhar o mesmo predicado entre progresso por exercício, linha verde, resumo, finalização, projeção e histórico de novos registros. Preservar o significado do switch do exercício e os fluxos de edição de registros persistidos.

O ✓ inicia o descanso prescrito. Acioná-lo preserva as medidas, o volume e a contagem. Completar as medidas atualiza os totais imediatamente. Editar uma medida recalcula o resultado uma vez. Apagar um lado obrigatório retira a série dos totais e do destaque. Na leitura de versões antigas, respeitar dados ausentes, zeros legados e registros históricos. Cobrir com fixtures de rascunho e treino finalizado antes de alterar persistência. Se houver necessidade real de mudar o schema, documentar compatibilidade e migração aditiva antes de aplicá-la.

## 6. Montar a tabela e o cabeçalho

- No editor local e na apresentação persistida correspondente, usar uma coluna de carga e duas subcolunas de medida de igual largura em séries unilaterais. Um cabeçalho abrange as duas medidas. Exibir E e D em português, L e R em inglês, com nomes completos acessíveis por série/lado. Manter repetições ou segundos na mesma linha e um campo na bilateral. As letras ocupam sua largura natural, e cada input preenche o espaço restante sem intervalo amplo após a letra. Usar Input disabled onde a carga estiver bloqueada. Validar dados enviados, pois campos desabilitados são omitidos pelo navegador.
- Dar à linha completa o verde discreto do tema ao realizar a série. Expor o estado também de forma acessível. Destacar aquecimento, numerar séries de trabalho e preservar ações de adicionar ambos os tipos, histórico e comentário.
- No topo, seta à esquerda, Aquecimento e Finalizar treino à direita, no estilo do botão de aquecimento e com cores distintas do DS. Iniciar treino usa o mesmo tamanho e variante. Manter as ações alcançáveis durante a rolagem. Usar o fluxo de finalização e avaliação existente. Retirar o título e metadados duplicados do topo e preservar o título da seção abaixo.
- Logo abaixo, duração ativa com cor de destaque e algarismos de largura fixa, volume e séries realizadas/previstas. Calcular a partir do mesmo snapshot. Uma série bilateral de 40 kg × 10 soma 400 kg. Segundos e contatos não são repetições para tonelagem. Uma série válida de peso corporal pode contar com volume externo zero. Excluir aquecimentos dos totais e aplicar a carga por lado nas séries unilaterais.
- Clicar ou tocar na duração abre o diálogo de duração, também acessível por teclado. Mostrar tempo ativo e instante real de início localizado. Pausar treino e Retomar treino ficam exclusivamente nesse diálogo durante a execução. Reusar o relógio do rascunho. Ao pausar, congelar o valor em todos os lugares. Retomar continua do acumulado. Abrir/fechar apenas consulta o estado. Atualizar PT-BR e EN juntas.

## 7. Descanso e barra de retorno

Reusar training-rest-timer, prazo de término e controles −15 s, +15 s e Pular. Manter o painel sobreposto sem alterar a geometria da página. Conferir combinações com navegação móvel, teclado e modais. A pausa do tempo ativo preserva a regra existente do descanso.

Em active-training-bar, medir o recorte do ponto e do halo durante o pulso. Inspecionar overflow e line-clamp no título. Aplicar truncamento somente ao texto e dar espaço ao indicador no componente apropriado. Aplicar a superfície elevada opaca exportada pelo DS ao Item com borda para cobrir o conteúdo atrás da barra. Usar Button Mira oficial para descartar, com nome acessível e confirmação independente do link de retomada. Treino ativo pulsa suavemente, pausado fica estático, movimento reduzido mantém o indicador estático. A barra continua flutuando acima da navegação.

## 8. Aceite e entrega ao revisor

| Cenário | Resultado exigido |
| --- | --- |
| Abrir treino pela agenda, F5, abrir URL direta e retomar pela barra | Mesma ocorrência, dados e relógio. Agenda visível atrás no desktop e executor integral no celular. |
| Abrir duração, histórico, comentário, edição, finalização e confirmação | Centro no desktop e borda inferior no mobile. Validar modal sobre modal, teclado, rotação, foco e clique, incluindo confirmação aberta a partir de menu. |
| Unilateral com carga bloqueada | Um lado preenchido continua incompleto. Dois lados válidos resultam em 1 série e linha destacada. Tab e toque pulam o campo bloqueado. Apagar um lado reverte o resultado. |
| Carga aplicável, bilateral e séries temporizadas | Vazio e zero têm semânticas distintas. Nenhuma meta preenche a série. Conferir contagem e volume após editar, salvar, recarregar e consultar histórico. |
| Marcar ✓ e ajustar/pular descanso | A contagem e o volume permanecem os mesmos. O prazo do descanso sobrevive ao reload conforme a regra vigente. |
| Pausar, recolher, recarregar, retomar | Duração consistente no resumo, diálogo e barra. Nenhum intervalo de pausa soma ao treino. |
| Finalizar, cancelar, corrigir treino antigo | Uma submissão por ação, preservação dos dados, revisões e histórico. Testar também falha de submissão e reabertura de rascunho. |
| Barra e botões | Conferir halo durante o pulso, movimento reduzido, nome longo, tradução, descarte por toque e área do conteúdo antes/depois da barra. |

Executar os testes de domínio, drafts, reconciliação, persistência, rota e componentes tocados. Rodar os gates definidos em package.json dos dois projetos e instalação congelada do candidato. Validar jornadas em navegador desktop e mobile (incluindo 320 e 390 px), abertura direta e navegação interna. Usar registros sintéticos para finalização/descarte. Guardar capturas antes/depois, hash e lista de gates com resultado real. Distinguir emulação de validação em aparelho físico. Registrar pendências, atualizar inventário e tarefa ativa com a entrega efetiva. Em regressão, isolar a etapa afetada e restaurar apenas suas mudanças e a dependência correspondente, preservando dados e trabalho local prévio.

## Verificação local — 14/11/2026

Pacote implementado com Switch oficial Mira no DS, diálogos responsivos, executor uniforme e modal também em URL direta/reload. Cabeçalho com ações de mesma altura, duração com diálogo de pausa, resumo sem aquecimentos e carga por lado. Campos unilaterais horizontais e compactos, linha realizada por medidas, ✓ para descanso e persistência correspondente. Barra usa variantes oficiais, com espaço para o halo. Clique externo e seta recolhem pelo mesmo fluxo.

Kaizen: 64 testes direcionados de domínio, drafts, reconciliação, card e rota, além de 18 testes de integração PostgreSQL. Build, lint, estrutura, fronteiras, ícones e 342 traduções aprovados. DS: build, cinco testes direcionados, tarball e fixtures npm/pnpm com React único aprovados. Navegador em 1440, 390 e 320 px confere posição do executor e do diálogo de duração, pausa/retomada, medidas e destaque, alinhamento dos campos e recolhimento pelo fundo. As fixtures de integração tiveram datas fixadas e término ajustado à grade vigente de 15 minutos para alcançar as mutações.

Candidato consumido: `vendor/fradelli-ui-mira-executor-verified.tgz`. SHA-256 `0d445bdb10441a77711d9c2875c03efcfa19f613ca58cc0a3c76f2a9fb973133`. Distribuição local de desenvolvimento. Release do DS e aparelhos físicos continuam como etapas da migração global.
## Próxima rodada proposta — séries, resumo do exercício e descanso editável

Escopo de planejamento. Executar estes itens em conjunto após a revisão.

1. No editor local, usar a mesma validação de medidas para contagem e destaque. Ao completar a série, aplicar borda de sucesso somente aos inputs aplicáveis, preservando foco visível e fundo neutro da linha. Ao apagar uma medida obrigatória, retirar o destaque. Reduzir a tipografia de E/D e L/R no mobile, mantendo rótulos acessíveis e a largura útil dos campos. O ✓ continua acionando descanso.
2. Usar marcador quadrado não interativo para cada série. Numerar visualmente só as séries válidas. Exibir W em amarelo semântico para aquecimento, com descrição acessível. Preservar identificadores de armazenamento e associação com histórico e descanso. Usar componentes e tokens exportados pelo DS. Resolver apresentação compartilhada no DS antes de consumir no Kaizen.
3. Substituir as duas ações de inclusão por Adicionar série. No diálogo Mira, selecionar Série válida (work, padrão proposto) ou Aquecimento (warmup), únicos tipos aceitos pela restrição atual. Confirmar acrescenta exatamente uma série, cancelar preserva a lista. Aquecimentos ficam fora dos totais de séries e volume do treino.
4. Em TrainingExercise, manter nome e controle de reabertura no card recolhido. Mostrar somente prioridade, estado com contagem real e bloco quando presentes. Remover a quantidade prescrita isolada, dose e descanso desse resumo. Preservar a dose no card aberto. No aberto, agrupar Descanso, Como executar, Histórico e Nota em botões Mira de mesma altura com ícones do DS e quebra de linha no mobile. Traduzir Comment para Note em inglês e Comentário para Nota em português no fluxo de anotação do exercício, reaproveitando comment e os dados existentes.
5. Exibir a duração efetiva no botão de descanso (por exemplo, 1 min 30 s). Se ausente, mostrar Definir descanso. Abrir editor com minutos e segundos, validar inteiros não negativos, segundos de 0 a 59 e limites vigentes do domínio. Proposta para zero: sem temporizador. Continuar abre a etapa de escopo no diálogo padrão. Cancelar antes da confirmação descarta a alteração. Desktop centralizado, mobile ancorado embaixo. Devolver foco ao acionador e manter contexto do treino.
6. Somente neste treino: gravar duração opcional no draft do exercício, isolada por ocorrência e prescrição. Distinguir ausência de substituição de zero explícito. Rascunhos antigos usam o valor prescrito. Centralizar a resolução do valor para botão e acionamento do ✓. Preservar endsAt de um descanso já iniciado. Minimizar, reabrir ou recarregar recupera a escolha local.
7. Neste e nos próximos treinos: identificar a prescrição TrainingExerciseDefinition da sessão e versão corretas, validar escopo do usuário no servidor e verificar regras de versão e leitura histórica antes de escolher a escrita. Usar o fluxo de edição/versionamento do plano que preserve execuções passadas, isolando a alteração de outras prescrições do mesmo exercício. Após sucesso, atualizar o treino atual, reconciliar a substituição local e invalidar as leituras do plano pertinentes. Em falha ou conflito, manter o valor anterior ativo e permitir nova tentativa sem perder o valor digitado. Impedir envio duplo.
8. Validar com duas ocorrências do mesmo treino e uma segunda prescrição do mesmo exercício. Alteração local só afeta a primeira ocorrência, permanente alcança a próxima, a outra prescrição e o histórico mantêm seus valores. Cobrir rascunho legado, cancelamento nas duas etapas, falha ao salvar, descanso em andamento, nota antiga, persistência após recarga e sequência W/W/1. Conferir PT/EN em 320, 390 e 1440 px, navegação por teclado, nomes acessíveis, foco e ausência de rolagem horizontal.
