# Página dedicada de treino e editor de planos

## Estado

Para a entrega atual de Meu Dia e para a revisão visual do executor já existente, seguir o [plano consolidado](MEU-DIA-IMPLEMENTACAO.md). Este documento registra o planejamento anterior de detalhe e autoria.

Planejamento solicitado. Implementação da interface depende da aprovação deste recorte. A etapa imediata é navegação da agenda e consulta do treino. Execução, seleção do catálogo e autoria de planos são etapas seguintes com dependências explícitas.

Entradas verificadas: [arquitetura](../architecture/TARGET-ARCHITECTURE.md), [página atual](../../src/app/treino/page.tsx), [consulta do dia](../../src/features/training/application/get-training-day.ts), [consultas Prisma](../../src/features/training/data/training-queries.ts), [card atual](../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx), [modelo de treino](../../prisma/models/training.prisma) e [catálogo](CATALOG-IMPORT-PLAN.md).

## Decisões de produto

- Treinos mostra cards das atividades de uma data. Clicar num treino estruturado abre sua página. O card deixa de expandir exercícios.
- Visualizar a agenda ou o treino é leitura. Iniciar cria rascunho local. Finalizar transmite resultados ao servidor.
- Um treino reutilizável pertence a um plano. Criar e editar acontece dentro de Planos.
- Editor e execução compartilham a organização visual de exercícios e séries. Metas são editáveis no editor; resultados são preenchidos durante execução.
- O catálogo fornece identidades de exercícios e seus perfis. Cada exercício aparece uma vez por treino e sessão.
- Planos são editáveis e não têm versões persistidas. A sessão iniciada captura sua prescrição, e o treino concluído guarda o contexto próprio.
- Os dados antigos são de teste e serão descartados numa operação específica aprovada. Não reconstruir planos antigos nem criar mapas de compatibilidade para preservá-los.
- O destino de data/ é guardar catálogos. Planos e dietas passam a ser dados do aplicativo.

## Comportamento encontrado no código

TrainingActivityCard é Client Component, abre/recolhe conteúdo, monta o hook de rascunho e coordena fase, exercícios e timers. getTrainingDay chama ensureScheduledTrainingDay antes de ler. As consultas dependem de definições e versões importadas. As janelas atuais de edição e o identificador de exercício do rascunho também dependem do modelo antigo.

Mudar somente o destino do clique manteria a gravação na consulta e as demais divergências. O primeiro incremento deve provar que o carregamento da nova página e da agenda não executa mutações.

## Navegação proposta

| Destino | Caminho proposto | Identidade |
|---|---|---|
| Agenda diária | /treino?date=YYYY-MM-DD | Data civil |
| Treino previsto | /treino/atividade/[occurrenceKey]?date=YYYY-MM-DD | Regra semanal ou exceção explícita + data |
| Resultado finalizado | /treino/sessoes/[sessionId] | ID persistido da execução |
| Lista de planos | /planos | Domínio treino/alimentação |
| Detalhe do plano | /planos/treino/[planId] | Plano |
| Editor de treino | /planos/treino/[planId]/treinos/[workoutId] | Treino daquele plano |

São propostas de URL, sem criar rotas vazias antecipadamente. Uma occurrenceKey prevista deve ser derivada de IDs estáveis da programação, não do título ou da posição. Precisa ser validada com a data, o plano e o workspace no servidor. Antes do início, não exige uma linha de ocorrência no banco.

Na agenda, um resultado finalizado substitui o card previsto que lhe deu origem. Usar chave de ocorrência e sessão para evitar duplicação. Uma atividade avulsa mantém identidade própria e sobrevive à troca de plano.

O botão voltar retorna à mesma data. Usar um destino interno calculado; não aceitar URL arbitrária do cliente. Voltar pelo navegador e abrir em nova aba devem funcionar. Nome e área principal do card formam um link. Editar e excluir são controles irmãos, sem botões interativos dentro do link.

Atividade simples sem exercícios mantém as ações de finalização no card. Uma atividade com preparação ou bloco estruturado abre detalhe. Essa condição depende do conteúdo e das permissões, não apenas do texto do tipo.

## Estados e layout

| Estado | Conteúdo | Ação |
|---|---|---|
| Previsto | Nome, data, origem, estimativa, preparação e exercícios prescritos | Iniciar, somente após a etapa de execução |
| Rascunho local | Contexto capturado e progresso digitado | Retomar, pausar, finalizar ou descartar |
| Concluído | Contexto e resultados persistidos | Consultar e editar histórico |
| Referência indisponível | Mensagem explicativa e retorno à data | Voltar |

Ao abrir, renderizar consulta sem iniciar rascunho. Consultar localmente um rascunho existente pode atualizar o indicador de retomada. A hidratação não deve trocar silenciosamente uma prescrição iniciada pela atual. O primeiro incremento entrega a consulta; o botão iniciar só entra com o fluxo funcional e validado na etapa seguinte.

Cabeçalho com voltar, título, data e estado relevante. Lista de exercícios com aquecimento e treino na mesma ordem visual. Cada exercício apresenta nome, prioridade, descanso e séries. No modo de consulta, mostrar metas como texto legível. Evitar simular resultados realizados em inputs desabilitados.

Na execução, manter colunas de identificação/tipo, Anterior, medidas realizadas e checkbox. Anterior é apenas informativo. Em exercícios por tempo ou distância, usar os campos definidos pelo perfil. Em telas estreitas, permitir composição responsiva sem perder unidades ou rótulos acessíveis.

No editor do plano, editar metas e descanso na própria tela, com salvar ao final. Timers, checkbox de realização e iniciar pertencem à execução. Confirmar saída com alterações não salvas na etapa do editor. A preparação prescrita deve ser visível e configurável.

## Contratos de leitura

Criar DTO de detalhe com identity, civilDate, origin, prescription e capabilities. Identidade distingue ocorrência prevista de sessão persistida. Prescription inclui IDs canônicos, ordem, séries com IDs estáveis, tipo, metas, unidades, descanso e estimativa. Capabilities é calculado no servidor e não constitui autorização suficiente para uma mutação.

O detalhe concluído vem exclusivamente dos dados próprios da sessão. Pode ser consultado depois da exclusão do plano. O detalhe previsto resolve a última alteração salva aplicável à data, sem inventar uma prescrição antiga para registro retroativo.

O servidor valida data, chave, escopo e ownership. Referência ausente resulta em tela de indisponibilidade/404. Campos externos não definem workspace. Não carregar toda a pesquisa científica do catálogo para renderizar a lista de séries. Consultar somente nomes, perfis e dados necessários ao detalhe.

## Página de execução

Start cria sessionId, IDs de exercícios/séries, data efetiva e snapshot local da prescrição. Há apenas uma sessão aberta, sem expiração. Antes de iniciar outra, oferecer retomar ou resolver a atual. O indicador global só lê o resumo local até a retomada. Navegação não inicia nem pausa automaticamente o cronômetro.

Durante a sessão, alterações de resultados são locais. Série válida conta na finalização mesmo desmarcada. Série parcial bloqueia finalização e recebe foco. Série vazia não gera resultado. Zero séries válidas oferece continuar ou descartar. Descanso segue o ciclo e o descanso-base local, com exceções dos blocos drop.

Finalização usa identidade idempotente e transação. Resposta perdida conserva o rascunho; reenvio recupera o resultado anterior. Corrigir histórico atualiza os mesmos registros, sem versões anteriores de correções. Histórico corrigido pode ser editado em qualquer data.

Essas regras exigem novos contratos de sessão e persistência antes de ativar os controles na página. Uma migração visual do hook atual não comprova atendimento.

## Seleção compartilhada do catálogo

Busca em português e inglês, filtros de grupo muscular, equipamento e calistenia. A busca considera variantes e aliases. O resultado apresenta nome, grupo e equipamentos essenciais. Filtro por equipamento descreve compatibilidade material, sem indicar adequação pessoal. A pesquisa regional só aparece com a evidência e condição registradas.

No editor, permitir selecionar vários exercícios, voltar à lista e configurar as prescrições inline. Durante execução, abrir modal de seleção e configuração. IDs presentes no treino/sessão aparecem como já adicionados. Ao confirmar, gerar identidade própria do item e séries. Cancelar mantém os valores anteriores.

Em sessão, escolher Somente este treino ou Este e os próximos para a alteração estrutural selecionada. A promoção afeta apenas o treino correspondente daquele plano e exige gravação confirmada. Se o plano estiver arquivado ou excluído, apresentar a limitação e permitir alteração local. Resultados realizados nunca alteram metas automaticamente.

## Etapas e arquivos afetados

### 1 — Consulta e navegação

- Editar src/app/treino/page.tsx e training-day-content para montar a agenda de cards.
- Simplificar training-activity-card, seus tipos/estilos e testes para navegação.
- Criar src/app/treino/atividade/[occurrenceKey]/page.tsx, loading.tsx e tratamento de referência inválida conforme necessidade.
- Criar application/get-training-detail.ts, seus DTOs e porta de leitura.
- Criar data/training-detail-queries.ts e consulta Prisma de detalhe com projeção seletiva.
- Criar ui/components/training-detail-page/ e componentes necessários em pastas próprias.
- Refatorar get-training-day.ts e a porta do repositório para leitura de programação e exceções, removendo materialização na consulta.
- Adaptar mensagens em português e inglês.

Dependência real: agenda prevista precisa de contrato de programação que produza occurrenceKey sem persistir. Pode ser desenhado com leitura dos IDs existentes durante o desenvolvimento da navegação; nenhum dado de plano antigo será convertido para o modelo novo. Se a base nova ainda não tiver planos criados, o estado normal é agenda vazia. Fixtures de teste validam a navegação e a página completa.

Aceite: abrir agenda e detalhe, refresh, prefetch e voltar não alteram contagens nem timestamps no banco e não criam rascunho. O card deixa de expandir. São mantidos aquecimento, ordem, metas e unidades. Link profundo funciona e chave/data inválida é tratada.

### 2 — Plano e sessão no banco novo

- Propor e aprovar esquema mutável de plano, treino e séries, programação/exceções e sessão com snapshot próprio.
- Definir identidade local/persistida, datas efetivas, duração confirmada e idempotência.
- Substituir consumidores das versões importadas. Retirar dados de teste e arquivos de plano/dieta apenas no recorte autorizado, com inventário de dependências.

Aceite: nenhum versionamento de planos; sessão independente da entidade plano; nenhuma linha diária criada por navegação. A decisão de tipos de atividade simples e campos de finalização deve estar coberta.

### 3 — Execução na página

- Evoluir ui/hooks/use-training-activity-draft e os controles para o contrato novo.
- Extrair a apresentação hoje aninhada no card para componentes de treino reutilizáveis.
- Alterar src/app/treino/training-actions.ts e contratos de finalização com validação no servidor.
- Integrar página /treino/sessoes/[sessionId], correções e indicador global de retomada.

Aceite: uma sessão, rascunho sem expiração, recuperação, falha de rede, reenvio, séries válidas desmarcadas, parciais, drops e duração confirmada.

### 4 — Editor dentro de Planos e seleção do catálogo

- Criar as rotas de Planos e treinos somente quando os casos de uso forem entregues.
- Criar feature de consulta ao catálogo com portas na aplicação e adaptador Prisma.
- Reutilizar apresentação dos exercícios, sem fazer um componente único controlar todos os modos e persistências.
- Implementar autoria de plano, treino, séries e programação semanal.
- Integrar seleção em lote no editor e modal na execução.

Aceite: criar plano padrão inicial; criar e editar treino; trocar programação; selecionar variantes distintas; impedir exercício repetido; salvar metas sem resultados; promover somente uma alteração estrutural da sessão.

## Validação e entrega

Testes de aplicação verificam consulta com repositório que só oferece leituras. Integração PostgreSQL verifica ausência de escrita também no carregamento da agenda. Testes de interface cobrem link, teclado, foco, retorno, carregamento e layout. Uma jornada no navegador deve percorrer data, card, detalhe e volta em desktop e mobile.

Ao implementar código, executar validação Prisma, formato, lint, tipos, estrutura, i18n, testes proporcionais e build conforme scripts do projeto. Validar manualmente teclado móvel quando houver edição.

## Riscos e decisões delimitadas

- O fluxo atual grava ao consultar. Esse conflito deve ser resolvido antes do primeiro aceite.
- A base local pode ainda ter somente planos de teste. Não preencher a nova agenda com migração de conteúdo antigo.
- Mesmo treino pode ocorrer mais de uma vez na data. Regra semanal ou exceção e data precisam distinguir as ocorrências.
- Hidratação deve restaurar snapshot local sem exibir como atual uma prescrição posterior.
- Falha na promoção ao plano exige mensagem e rascunho preservado, sem afirmar que próximos treinos foram alterados.
- Página própria de catálogo no menu continua fora da decisão de navegação aprovada. O consumidor imediato é o editor de planos e o modal da sessão.
- Posição definitiva do indicador de retomada e preferência visual entre abas ou seções contínuas para preparação/treino podem ser fechadas no protótipo.
- Implementação da alimentação tem plano próprio. A entrada em Planos não justifica criar um editor de dieta vazio.
