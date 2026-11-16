# Modelo de dados de treino do Kaizen

Proposta de arquitetura · 14 de novembro de 2026 · planejamento

## 1. Contrato de produto

A prescrição descreve o que fazer. A execução registra o que aconteceu. O usuário pode consultar ambas depois de concluir, mesmo que mude o plano ou o catálogo. Os registros locais de desenvolvimento são descartáveis.

Cada exercício e série tem posição estável na sequência, independente da sua identidade. Uma série prescreve tipo, dose, carga alvo opcional e descanso após a série. Uma série normal tem uma etapa. Cada redução de um drop set é uma etapa da mesma série. O descanso é acionado uma vez para o conjunto. O ✓ inicia o temporizador, continua marcado depois de pular ou terminar, e desmarcar e marcar reinicia o descanso. A conclusão depende das medidas obrigatórias.

Carga unilateral é por lado. Zero informado, campo vazio e carga inaplicável têm significados distintos. Aquecimento feito aparece no histórico, com zero séries válidas e zero volume contabilizado. Uma seção de preparação pode conter instruções para consulta ou movimentos acompanhados de medidas. A preparação consultiva nunca gera resultados automaticamente.

Enquanto houver treino em andamento, inclusive pausado, a edição direta do plano fica bloqueada. No executor, **cada alteração da prescrição pede escopo antes de ser aplicada**. Isso inclui adicionar, remover, substituir ou mover exercícios e séries, alterar etapas, dose, carga alvo ou descanso. Cancelar mantém o estado anterior. Digitar o peso levantado, informar repetições reais, pausar ou tocar no ✓ são registros de execução. Recomenda-se rotular separadamente “Carga prevista” e “Carga realizada” para a pessoa saber quando está editando o plano.

## 2. Modelo proposto

### Identidade, vigência e agenda

O workspace fixo do P0 é a fronteira de propriedade e representa um único praticante. O servidor resolve o workspace. Uma sessão reutilizável pertence ao workspace. Cada inclusão dela num plano ganha um vínculo próprio. “Nos próximos” atinge as próximas ocorrências **daquele vínculo**, inclusive em outros dias da semana que usam o mesmo vínculo. Outra inclusão da mesma sessão mantém a própria revisão. A agenda resolve a revisão vigente ao iniciar. Uma ocorrência iniciada fixa sua revisão original para sempre. Uma prévia futura ainda não iniciada acompanha mudanças. A data civil usa America/Sao_Paulo e instantes usam UTC.

~~~mermaid
erDiagram
    WORKSPACE ||--o{ PLANO : possui
    WORKSPACE ||--o{ SESSAO : possui
    SESSAO ||--|{ REVISAO : publica
    PLANO ||--o{ TREINO_PLANO : inclui
    REVISAO ||--o{ TREINO_PLANO : vigente
    REVISAO ||--o{ BLOCO : organiza
    BLOCO ||--o{ ITEM : ordena
    EXERCICIO ||--o{ ITEM : identifica
    ITEM ||--o{ SERIE : prescreve
    SERIE ||--|{ ETAPA : detalha
    TREINO_PLANO ||--o{ AGENDA : programa
    AGENDA o|--o{ OCORRENCIA : origina
    TREINO_PLANO o|--o{ OCORRENCIA : referencia
    REVISAO o|--o{ OCORRENCIA : original
    OCORRENCIA ||--o{ RESULTADO : registra
    OCORRENCIA ||--o{ PAUSA : desconta
    OCORRENCIA ||--o{ CORRECAO : documenta
~~~

### Dicionário

IDs são opacos. FKs de objetos privados devem garantir pertencimento ao mesmo workspace, também nas mutações. Exclusão de definições referenciadas é lógica. Nos filhos de revisão, a chave lógica sobrevive a cópias entre revisões. A posição é única dentro do pai. Publicar uma revisão valida e grava a árvore inteira atomicamente.

| Tabela e unidade de registro | Chaves, relações, campos e restrições | Uso concreto |
|---|---|---|
| Workspace, um espaço operacional | PK id. Identidade fixa no P0. Pai de planos, sessões e ocorrências. | Isolar agenda, bloqueio e histórico. |
| Exercicio, um movimento de catálogo | PK id, código único, nome, equipamento, ativo, contrato padrão de medidas e carga. Catálogo público compartilhado. | Selecionar e substituir movimentos, agrupar histórico pelo mesmo movimento. |
| Plano, um programa do workspace | PK id, FK workspace, código externo único por workspace, título, vigência e estado. | Escolher programa e impedir edição durante execução. |
| Sessao, um modelo reutilizável | PK id, FK workspace, título, FK revisão publicada da própria sessão. | Incluir o mesmo modelo em vários planos ou dias. |
| Revisao, uma composição imutável da sessão | PK id, FK sessão, FK anterior opcional, título e metadados de duração congelados, origem e data. Uma sessão admite ramificações. | Reconstituir a prescrição original e publicar alterações específicas de um vínculo. |
| Treino_plano, uma inclusão da sessão no plano | PK id, FKs plano, sessão e revisão vigente dessa sessão, nome de uso, versão concorrente. | Delimitar “neste e nos próximos”. |
| Bloco, um grupo ordenado numa revisão | PK id, FK revisão, chave lógica, posição, fase preparação/principal, organização simples, circuito ou combinado, voltas e instruções. | Exibir seções e alternar exercícios. Cada série realmente prescrita tem identidade própria, inclusive por volta. |
| Item, uma participação de exercício no bloco | PK id, FK bloco e exercício, chave lógica, posição, nome e contrato congelados, instruções, modo consultivo ou mensurável. | Preservar dois usos do mesmo movimento e o sentido histórico de seus campos. |
| Serie, uma série prescrita | PK id, FK item, chave lógica, posição, tipo aquecimento/trabalho/drop, volta opcional, descanso em segundos ≥ 0. | Prescrever individualmente e contar uma série por conjunto. |
| Etapa, uma dose de uma série | PK id, FK série, chave lógica, posição, alvos tipados, carga alvo e unidade opcionais. Uma ou mais por série. | Registrar cada redução e prescrever valores ou faixas sem interpretar texto na UI. |
| Agenda, uma regra de horário | PK id, FK treino_plano, início e fim civis, dias da semana, intervalo em semanas, hora local, fuso e duração. Permite data única. | Projetar a semana sem criar linhas ao consultar. Alterar padrão encerra vigência e cria sucessor. |
| Ocorrencia, uma atividade concreta ou exceção de agenda | PK id, FK workspace, FKs opcionais agenda, treino_plano e revisão original. Chave única (agenda, data civil original) para agendadas. Data/hora exibidas, estado, título, categoria, início/fim reais, avaliação, nota geral, versão, chave e assinatura de finalização, composição final congelada. | Cancelar ou mover uma data sem recriá-la, iniciar, bloquear, concluir e ler histórico. Atividade avulsa admite composição própria e ausência de vínculo. |
| Resultado, um exercício efetivamente apresentado na execução concluída | PK id, FK ocorrência, chave lógica de execução única na ocorrência, movimento de catálogo, referência lógica ao item original opcional, ordem real, nota e séries/etapas realizadas em documento tipado. | Ler histórico por exercício e ocorrência. As medidas filhas são sempre consumidas nesse contexto. |
| Pausa, um intervalo de interrupção | PK id, FK ocorrência, início e fim, dentro da execução sem sobreposição. | Recalcular duração ativa e apresentar pausas. |
| Correcao, uma revisão explícita do histórico | PK id, FK ocorrência, versão anterior e posterior, instante, valores anteriores e novos dos campos editados. Única por ocorrência e versão. | Corrigir lançamento mantendo auditável a finalização original. |

### Contratos internos e cálculos

Uma dose contém entradas com unidade (repetições, segundos, contatos ou contagem direcional), dimensão (total, lado, direção ou lado × direção), rótulo e obrigatoriedade. Um alvo admite valor exato ou mínimo/máximo. O realizado contém números por chave de medida. Para sentidos nomeados, por exemplo frente, trás, esquerda e direita, recomenda-se uma entrada por direção quando a prescrição discrimina os sentidos. O total é derivado. A carga externa em kg admite decimal não negativo. Uma etapa sem carga aplicável omite o campo. Para exercício com carga exigida, zero explícito satisfaz a presença. Medidas de esforço precisam ser positivas para uma etapa completa. Uma etapa unilateral exige ambos os lados quando ambos estão prescritos. Contratos de distância podem ser acrescentados quando houver exercício concreto. Cada documento embutido leva versão de formato e passa por validação de unidade, dimensionalidade, chaves, finitude e cardinalidade no servidor.

A composição final na ocorrência registra a prescrição que ficou em vigor naquele dia, inclusive itens sem resultado. O resultado guarda posição e IDs locais de série e etapa, referências de origem quando existirem, motivo estrutural (acrescentado ou substituído) e medidas reais. A substituição cria uma identidade de execução ligada à anterior. A diferença para a revisão original revela remoções. Reordenar preserva IDs. Ao excluir medidas já digitadas, a confirmação de descarte se soma à escolha de escopo. Notas de exercício e avaliação pertencem à execução.

Volume externo = soma das cargas × repetições medidas, por etapa e lado. Bilateral usa o peso externo total informado. Tempo, contatos e direções têm totais próprios. Aquecimentos são excluídos. Drop de 8 × 40, 6 × 30 e 5 × 20 soma 600 kg e uma série. Se só as duas primeiras etapas foram feitas, são 500 kg e zero séries completas. Não inferir carga ausente como zero. Para séries comuns incompletas, mostrar as medidas conhecidas e contar volume apenas dos pares carga/repetições efetivamente registrados. Duração ativa = fim − início − intervalos de pausa. Descanso entre séries integra a duração ativa.

### Transações, rascunho e falhas

1. Iniciar cria ou recupera a ocorrência pelo identificador estável e fixa sua revisão. Índice único parcial por workspace para estado em andamento/pausado impede dois treinos simultâneos. Início e edição direta do plano serializam pelo mesmo bloqueio de workspace. O servidor verifica a regra em ambas as rotas. O botão desabilitado é apenas a expressão visual dessa regra.
2. O navegador guarda composição corrente, entradas parciais, notas, pausas abertas, ✓ e prazo absoluto do timer, vinculados ao workspace, ocorrência e revisão. Recarregar restaura esse estado. A presença durável do treino ativo permite bloquear a edição também em outra aba. Descartar requer ação explícita que encerra o bloqueio no servidor; se o rascunho se perder, oferecer descarte da execução ativa.
3. “Somente neste treino” modifica a composição local. “Neste e nos próximos” publica imediatamente uma revisão do vínculo por comando idempotente com revisão esperada e aplica a mesma operação ao rascunho. Persistir chave do comando e assinatura na revisão com unicidade por vínculo/comando. Guardar a operação pendente localmente antes do envio. Repetição recupera a revisão publicada. Falha mantém a operação pendente visível. Publicação já confirmada continua válida se o treino for descartado. Copiar somente a alteração escolhida sobre a prescrição vigente evita propagar edições anteriores de escopo local.
4. Se um comando futuro depender de um item criado só hoje, mostrar exatamente o que precisa ser incluído no futuro e pedir confirmação conjunta. Para mover em relação a um vizinho ausente, pedir posição válida na lista futura. Remover item já ausente no futuro tem efeito apenas hoje, informado na escolha. Em treino avulso sem vínculo, o diálogo explica que só existe esta ocorrência.
5. Finalizar congela o payload e a chave local de tentativa. Em uma transação, o servidor valida a revisão esperada, grava composição final, resultados, pausas e avaliação, marca concluído e libera o bloqueio. Mesma ocorrência, chave e assinatura canônica retornam o resultado anterior, inclusive após perda da resposta. Conteúdo divergente exige revisão explícita e nunca cria segunda execução. Conferir confirmação antes de limpar o rascunho. Corrigir depois usa versão esperada, grava auditoria e preserva horários e prescrição.
6. Persistem no histórico as medidas e alterações de prescrição aplicadas, inclusive o descanso previsto após cada série. O timer e os toques no ✓ pertencem ao rascunho. O produto aqui proposto não consulta segundos efetivamente descansados. Totais, estado de série e projeções semanais são calculados.

### Exemplo de aceitação de ponta a ponta

Segunda e quinta usam o mesmo vínculo “Força A”. Segunda inicia com agachamento (aquecimento 10 × 20 kg/45 s, trabalho 12 × 40/90 s e 8 × 50/120 s), afundo unilateral com 10 kg por lado e panturrilha sem carga externa prescrita. A tela do plano fica bloqueada.

| Ação na segunda | Histórico ao finalizar | Quinta ao abrir |
|---|---|---|
| Faz o aquecimento conforme previsto | 10 × 20 registrados, zero séries válidas e zero volume | 10 × 20, 45 s |
| Troca 90 por 75 s só hoje e faz 11 × 42 com ✓ desmarcado | Original 12 × 40/90 s, prescrição final 12 × 40/75 s, realizado 462 kg e uma série | 12 × 40, 90 s |
| Troca 120 por 105 s neste e nos próximos, faz 8 × 50 e pula o descanso | 400 kg e uma série, descanso prescrito 105 s, ✓ continua marcado no executor | 8 × 50, 105 s |
| Faz afundo 8 à esquerda e 10 à direita sem ✓ | 180 kg e uma série | Alvos originais de cada lado |
| Adianta panturrilha só hoje e adiciona a ela uma série de 10 para hoje e próximas; deixa as duas sem execução | Ordem adaptada e série extra visíveis na composição do dia, zero séries feitas de panturrilha | Ordem original, série adicional presente |

O histórico da segunda soma **1.042 kg e três séries válidas**. Um reenvio da finalização conserva o mesmo total. Em uma variante, substituir o agachamento por leg press e remover sua série de 8 só hoje mantém o agachamento original consultável no histórico; a próxima ocorrência abre com agachamento e a série de 8. Uma alteração direta na quinta, feita após finalizar segunda, também preserva as três perspectivas da segunda: original, adaptada e realizada.


## 3. Comparação com o repositório e transição

A comparação abaixo usa os arquivos de definição e os caminhos de leitura e escrita do repositório. O banco em execução não foi consultado.

| Implementação observada | Decisão para a implementação futura | Comportamento afetado |
|---|---|---|
| [Schema de treino](../../prisma/models/training.prisma) mantém ExerciseDefinition e o [catálogo](../../prisma/models/catalog.prisma) possui CatalogExercise, aliases, equipamentos e requisitos. | Aproveitar o catálogo, mapeando cada código dos exercícios do plano para um único movimento. Manter aliases, equipamentos e proveniência no subsistema de catálogo. Transferir contrato padrão de medição para o movimento e congelar o contrato usado em cada item. Validar correspondências ambíguas no seed. | Busca de substitutos e comparabilidade do histórico. |
| TrainingPlanVersion e TrainingSessionDefinition vêm de versões publicadas. TrainingExerciseDefinition concentra sets, descanso e posição de bloco no exercício. A [migration dos blocos](../../prisma/migrations/20260926010000_validate_training_block_shape/migration.sql) impõe formato. | Aproveitar IDs externos e regras de ordenação. Criar vínculo editável e revisões imutáveis, materializar bloco, séries e etapas individuais. | A segunda série pode ter dose e descanso próprios. Alterar uma sessão em um plano tem alcance definido. |
| O [plano ativo](../../data/plans/2026-09-training-v1-1.json) inclui alternância e descanso de transição que substitui o descanso final. Os [metadados](../../data/training-execution-metadata.json) distinguem 8 em duas direções e 15–20 segundos em quatro direções. | No bloco guardar ordem de alternância e descanso de transição/faixa; no cálculo resolver o último descanso substituindo-o pelo da transição, sem somar. Explicitar na UI o descanso efetivo que está sendo editado; alteração individual explícita prevalece sobre o padrão. Importar unidade e dimensão independentemente, preservando faixa. Se só houver quantidade de direções, usar índices estáveis e manter rótulos desconhecidos. | Executar um bloco na ordem correta e registrar tempo por direção. |
| DailyTrainingAssignment e TrainingDayActivity coexistem com projeções semanais. O [repositório](../../src/features/training/data/prisma-training-repository.ts) combina projeções e atividades persistidas, busca histórico anterior e trata ocorrências removidas. | Aproveitar leitura semanal sem escrita e exceções por data. Substituir a resolução por regras de agenda mais ocorrência com chave de origem estável. Manter motivos de descanso, mobilidade e preparação vinculada com categoria, motivo e FK opcional para ocorrência principal. Preservar horário previsto e duração mesmo ao mover a atividade. | Agenda sem duplicatas, dias de descanso, atividade avulsa, remoção e reagendamento. |
| TrainingExecution/TrainingExerciseExecution/TrainingSetExecution coexistem com a família TrainingDayActivity/TrainingActivity*; a [migration de unificação](../../prisma/migrations/20260919040000_unify_training_activity_execution/migration.sql) registra a evolução. | Concentrar escrita e leitura no caminho ocorrência/resultado/pausa. Remover estruturas antigas depois de verificar consumidores, inclusive validação e relatórios. Converter intervalos ativos em pausas equivalentes no novo contrato. | Um único resultado na agenda, no detalhe e no histórico. |
| TrainingActivitySetExecution tem value com default 0, leftValue, rightValue, loadKg e [kind/confirmed](../../prisma/migrations/20261029190000_training_set_confirmation/migration.sql). | Substituir colunas fixas pelo contrato de medidas da etapa. Carregar resultados anteriores por movimento e dimensão compatível. Não usar confirmed como critério de realização. | Valores ausentes, carga zero, drop parcial, direções e volume unilateral ficam distinguíveis. |
| [Rascunho de execução](../../src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts) usa localStorage, eventos entre abas e pausa de outros rascunhos. A conclusão compara dados já gravados em completeTrainingActivityFromDraft. | Aproveitar recuperação, comparação, transação e revisão otimista. Criar reserva durável ao iniciar, comando de publicação por escopo e assinatura de fechamento. Versionar formato local; oferecer descarte explícito de rascunhos antigos incompatíveis. | Bloqueio entre dispositivos, confirmação após resposta perdida e retorno ao mesmo descanso após recarga. |
| [Importador](../../scripts/import-versioned-plan-definitions.ts) lê um commit, valida snapshot e persiste definições; [active.json](../../data/active.json) identifica a versão vigente. A [regra dos dados](../../data/AGENTS.md) declara Git como editor exclusivo no P0. | Manter Git como fonte reprodutível da prescrição inicial. Aprovar a mudança de responsabilidade: revisões operacionais do usuário pertencem ao workspace no banco. Reimportar a mesma origem deve localizar sua revisão inicial sem avançar o ponteiro editado pelo usuário. | Uma atualização de seed preserva ajustes feitos para os próximos treinos. |

### Plano de implementação posterior

1. **Fixar contratos.** Aprovar mudança da regra de autoria Git, contrato de medidas, bloqueio entre dispositivos e revisão por vínculo. Mapear cada tela, leitor e comando para o exemplo de aceitação. Especificar comportamento de descartes, conflitos e correções.
2. **Banco.** Construir o schema em banco local novo e isolado. Manter o histórico de migrations compartilhadas; preferir uma migration de substituição do domínio de treino sobre a cadeia existente se ela também instala plataforma, nutrição e catálogo. Validar FKs, constraints, bloqueio concorrente e rollback em transação. Recriar o banco **local de desenvolvimento** é a opção recomendada após demonstrar a reconstrução. Dispensa converter registros descartáveis e preserva a capacidade de voltar ao ambiente anterior durante o teste.
3. **Importação.** Com um checkout identificado, aplicar a cadeia em banco vazio, criar workspace, carregar catálogo, validar fontes versionadas e importar plano, metadados e agenda; restaurar os demais domínios a partir de suas fontes. Adaptar os comandos existentes db:deploy, workspace:ensure, catalog:apply, data:import e data:check:persisted. Tratar desconhecidos sem inventar carga ou rótulos. Executar duas vezes, comparar chaves e contagens e comprovar que reimportar após uma edição futura preserva a revisão personalizada.
4. **Aplicação.** Migrar agenda e prévia, depois início e bloqueio server-side, executor por série/etapa, diálogo de escopo em cada operação, rascunho versionado, pausa, conclusão e correção. Atualizar importador, consultas anteriores, resumos e histórico em conjunto antes de retirar leitores antigos.
5. **Validação.** Reproduzir em navegador segunda e quinta do exemplo, recarga durante descanso, edição só hoje seguida de edição futura, remoção com medidas e cancelamento do diálogo. Testar duas abas e dois clientes disputando início/edição, perda de resposta de publicação e finalização, reenvio divergente, pausa atravessando meia-noite, correção após mudança do plano, cancelamento de ocorrência e reimportação. Conferir os 1.042 kg, o drop parcial de 500 kg e as quatro durações direcionais. Validar também plano sem treino principal e sessão curta.
6. **Aceite de transição.** Partir de um segundo banco vazio, usando somente repositório e configuração documentada; abrir agenda, iniciar, concluir e consultar o treino. Comparar com o primeiro ambiente reconstruído. Só então trocar o banco de desenvolvimento e retirar código sem consumidores. Em ambiente com histórico real, exigir transição própria com ensaio de preservação antes de qualquer substituição.
