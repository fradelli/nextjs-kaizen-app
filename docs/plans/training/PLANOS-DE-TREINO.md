# Implementação de Planos de treino

- **Tipo:** Plano.
- **Área:** Treino.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Planejamento técnico de 17 de novembro de 2026. A primeira entrega termina quando um plano criado na aplicação pode ser salvo, reaberto pela URL, editado e consultado após recarga. A [experiência aprovada](../../product/telas/planos.md), o [wireframe](../../product/telas/planos-wireframe.html) e o [modelo proposto](../../architecture/MODELO-DE-TREINO-PROPOSTO.md) são as referências de produto. Os nomes de arquivos e contratos abaixo são propostas para implementação.

## Entrega e fronteiras

O primeiro incremento cobre planos do workspace, composição e ordenação de treinos, grupos de equipamentos, catálogo com seleção múltipla e prescrição por série. Entrega leitura durante execução e bloqueio transacional de edição. Duplicar, arquivar e ativar planos dependem da identidade e das revisões dessa entrega. Ativação integrada, previsão de calendário, arraste entre dias e decisão após treino fora de ordem vêm depois. A sequência B → A já precisa sobreviver sem dia ou hora. Ocultar controles de programação até existir o consumidor efetivo dessas preferências.

| Ponto do código | Responsabilidade proposta |
|---|---|
| src/app/plans/page.tsx, new/page.tsx e [planId]/page.tsx dentro da mesma rota | Server Components para lista, criação e detalhe. Resolver workspace, buscar apenas dados da tela e responder com notFound para ID ausente ou inacessível. Usar a URL permanente após criar. |
| src/app/plans/plan-actions.ts | Adaptar formulários e comandos, validar origem e entrada com Zod, resolver workspace, invocar o caso de uso, invalidar lista/detalhe após commit. Seguir [training-actions.ts](../../../src/app/workout/training-actions.ts). |
| src/features/training/domain | Contrato de dose e carga, validação da prescrição, ordenação por identidade e compatibilidade. Extrair regras existentes somente quando prescrição e execução compartilham a mesma semântica. |
| src/features/training/application | Casos listTrainingPlans, getTrainingPlan, saveTrainingPlan, searchCatalogExercises e saveEquipmentGroup. Portas focadas nos dados consumidos. A aplicação define a unidade transacional do salvamento. |
| src/features/training/data | Adaptador Prisma server-only específico para planos e consultas ao catálogo. Evitar aumentar o repositório da agenda para acomodar o editor. Projeções pequenas para lista e catálogo. Árvore completa somente no detalhe. |
| src/features/training/ui | Componentes do editor de plano, sequência, editor de treino, catálogo, grupo e prescrição. Uma pasta por componente. Estado interativo junto ao editor. Componentes privados ficam sob quem os usa. |
| App shell, messages/pt-BR.json e messages/en.json | Integrar Planos à navegação, rota ativa e retorno. Traduzir rótulos, unidades, plural, erros e anúncios de reordenação. |

Seguir a [arquitetura do projeto](../../architecture/TARGET-ARCHITECTURE.md). O domínio recebe valores tipados. Componentes cliente recebem dados serializáveis. Consultas iniciais partem do servidor. Para busca interativa, usar paginação e filtros no servidor com resposta vinculada à consulta mais recente. Seleções pendentes sobrevivem a mudança de filtro ou página.

## Persistência e semântica

1. Reutilizar Workspace e o [catálogo Prisma](../../../prisma/models/catalog.prisma). Manter IDs públicos de variantes e equipamentos. Criar plano do workspace com identidade estável, nome e versão concorrente. TreinoPlano liga plano, sessão reutilizável e revisão vigente daquela inclusão. Posição única por plano. Mover o treino muda a posição. Seus IDs e os IDs dos filhos permanecem estáveis.
2. Materializar a árvore imutável revisão de sessão → bloco → item de exercício → série → etapa segundo o dicionário de arquitetura. Usar bloco principal simples para a primeira adição. Preservar campos e blocos de revisões anteriores inclusive quando o editor oferece edição parcial. Uma mudança de ordem dos treinos dispensa copiar séries. Uma mudança de dose gera nova revisão somente do treino afetado. Publicar revisão e atualizar vínculo na mesma transação.
3. Em cada série persistir tipo, posição e descanso após o conjunto. Na etapa, dose tipada, dimensão, alvo e carga decimal opcional. Carga zero, alvo em branco e carga inaplicável precisam sobreviver ao percurso formulário → comando → leitura. Usar string decimal na fronteira com o cliente, converter no adaptador e validar escala. Repetições inteiras positivas, descanso inteiro não negativo, duração e contatos com unidades explícitas. Congelar o contrato utilizado no item. Não interpretar texto livre da prescrição para decidir lateralidade.
4. Grupo de equipamentos tem ID, workspace, nome e versão. Relação grupo/equipamento com chave composta impede duplicatas. Presets são listas de códigos do catálogo validadas no seed. “Salvar e usar” persiste o grupo independentemente de salvar o plano. Guardar preferência de último grupo no workspace e referência opcional por treino quando o usuário a escolher explicitamente. Uma troca para explorar o catálogo modifica o contexto da busca. Editar o inventário preserva a prescrição existente.
5. Conferir com o seed a semântica de CatalogRequirement.configuration e optional. Para configurações alternativas completas, basta uma configuração com todos os requisitos obrigatórios satisfeitos. Acessórios opcionais não bloqueiam. Ausência de dados só indica peso corporal quando a variante o declara. Retornar compatível, incompatível com itens faltantes, ou indeterminado. Filtrar por primaryGroups e pesquisar nomes/aliases a partir de correspondências verificadas. Permitir visualizar todos e escolher conscientemente uma variante incompatível.
6. Garantir pertencimento nas FKs privadas e nas consultas. Bloquear referências cruzadas entre workspaces. Revisões usadas em histórico têm exclusão restrita. Definições importadas mantêm proveniência e IDs externos. Importar como revisão inicial por origem estável, sem reposicionar o ponteiro de uma revisão personalizada em reimportação.

## Gravação, repetição e concorrência

O comando de salvamento contém ID do plano (gerado uma vez na criação), revisão esperada, ID estável da tentativa e a composição ordenada. Cada elemento carrega seu ID lógico. O servidor deriva posições da ordem recebida e rejeita IDs repetidos, referências externas inválidas e IDs pertencentes a outro agregado. Usar limites de payload e coleção proporcionais aos planos reais, definidos a partir das fontes versionadas. Validar o conteúdo inteiro antes de publicar. Um plano em montagem admite nome e sequência vazia. Linha de série iniciada e inválida permanece no rascunho até correção.

Em uma transação PostgreSQL, adquirir bloqueio na linha do workspace, reconhecer primeiro uma tentativa já confirmada com a mesma assinatura, verificar execução ativa, comparar versão e aplicar as mudanças. A revisão publicada registra a chave e assinatura do comando ou usa um registro de recibos por workspace/comando quando a operação só muda a ordem do plano. Preservar recibo mesmo depois de nova edição. Mesma chave e conteúdo devolvem o resultado original. Mesma chave e conteúdo diferente geram conflito. Reordenar com posições temporárias livres ou constraint diferível para que trocar A e B não viole unicidade durante a transação. Uma falha no último item reverte todo o plano.

Distinguir no retorno sucesso, erro em campo identificado pelo ID lógico, conflito de revisão, treino em andamento e indisponibilidade temporária. Em conflito, manter o rascunho e oferecer consultar a versão persistida. Chave de reenvio e conteúdo ficam congelados até chegar confirmação. Uma edição posterior é um novo comando. Estas garantias também precisam valer para a gravação independente do grupo.

## Dependência crítica do executor

Hoje o [rascunho de execução](../../../src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts) vive no navegador e a conclusão chega por Server Action. O bloqueio precisa detectar um treino iniciado **em outro dispositivo**. Proposta de incremento coordenado:

- Ao iniciar, fixar ocorrência e revisão original no servidor antes de exibir execução iniciada. Usar o mesmo bloqueio de workspace do salvamento e unicidade de execução ativa por workspace. Repetição do mesmo início recupera a ocorrência.
- Pausa mantém a reserva. Finalizar com sucesso ou descartar explicitamente encerra a reserva. Rede indisponível preserva o rascunho e informa operação pendente. Não liberar a reserva ao fechar uma aba. Se o armazenamento local se perder, oferecer recuperação ou descarte explícito.
- Na transição, reconhecer rascunhos locais anteriores na retomada e reconciliar resultado já concluído antes de registrar reserva. Um rascunho legado nunca sincronizado em outro dispositivo é invisível ao servidor. Para ambientes existentes, finalizar ou reconciliar sessões antigas antes de liberar edição compartilhada. Em desenvolvimento reproduzível, testar também com workspace vazio.
- Se uma aba estiver editando quando outra iniciar treino, a tentativa de salvar conserva as entradas e explica o bloqueio. Uma consulta ao abrir a tela sozinha não resolve a corrida. Manter operantes a leitura do plano e a retomada global.

## Editor e navegação

Criar um rascunho versionado por workspace, ID do plano e revisão-base. Gerar chaves estáveis ao inserir itens. Carregar a versão publicada no servidor e reconciliar o rascunho no cliente após hidratação. Guardar dados parciais localmente e mostrar falha se o armazenamento estiver indisponível. “Salvar plano” publica explicitamente. Ao voltar de um treino ou do catálogo, preservar o estado do plano. Limpar somente o rascunho correspondente ao salvamento confirmado.

Reaproveitar controles Mira e a composição de campos do executor quando forem puramente visuais. Extrair campos com consumidores concretos nos dois fluxos. Contratos de valores previstos e realizados permanecem separados. O editor não mostra anterior, ✓ ou timer. Renderizar carga por lado no afundo e omitir campo de carga inaplicável. Usar vírgula decimal na apresentação pt-BR. Drag and drop e botões de mover usam a mesma operação por ID. Manter foco no treino movido e anunciar sua posição. A ordem visual deve corresponder à ordem do DOM.

No celular o catálogo ocupa a tela. No desktop pode usar painel lateral Mira. Manter grupo, busca, filtros e seleção durante a edição. Confirmar seleção insere os movimentos uma única vez, na ordem selecionada, com foco no primeiro exercício adicionado. Ao sair sem confirmar, preservar o plano. Grupos salvos continuam reutilizáveis. Apresentar estado vazio com ação para configurar equipamentos ou limpar filtros. Verificar exports efetivamente disponíveis na versão instalada do design system antes de extrair componentes.

## Sequência de entrega e critérios de saída

| Incremento | Mudança revisável | Evidência para avançar |
|---|---|---|
| 1. Contrato e dados | Inventariar variantes e lacunas de medida, fixar mapeamento do plano importado, modelar tabelas e preparar migration aditiva em banco de teste. Documentar autoria operacional versus seed Git. | Partir de banco vazio, aplicar migrations, carregar workspace e catálogo, importar duas vezes e comparar IDs e contagens. Conferir nutrição e agenda legadas. |
| 2. Reserva de execução | Integrar início, pausa, retomada, conclusão e descarte ao servidor. | Dois clientes disputam início e edição. O resultado respeita a ordem dos commits. Descarte e conclusão liberam a edição uma vez. |
| 3. Leitura e publicação | Implementar adaptadores, casos de uso, Server Actions e leitura por ID. | Criar, editar, inverter dois vínculos, recusar referência alheia, reprocessar resposta perdida e falhar no último item sem estado parcial. |
| 4. Jornada visual | Navegação, editor, catálogo, grupos reutilizáveis e prescrição com Mira. | Testar por teclado, toque e mouse. Voltar do catálogo, recarregar rascunho, salvar e reabrir pelo detalhe em pt-BR e en. |
| 5. Integração e liberação | Executar fluxo completo, preservar histórico antigo e verificar reimportação após personalização. | Aceite funcional abaixo e gates do projeto. Só então expor edição na navegação de uso normal. |
| Seguinte. Agenda | Consumir vínculo ordenado, ocorrência, revisão e conclusão idempotente. Resolver ativo por workspace. | Usar os [cenários aprovados do calendário](../../product/telas/agenda-sequencia.html), inclusive mover uma ocorrência sem mudar a sequência. |

**Aceite ponta a ponta.** Criar “Força”, adicionar A e B, mover B para a primeira posição. Em A, salvar “Minha academia”, selecionar agachamento e afundo. Prescrever no agachamento aquecimento 10 × 20 kg/45 s, trabalho 12 × 40/90 s e trabalho 8 × 50/120 s. No afundo confirmar kg por lado. Salvar, abrir a URL em outra sessão de navegador e conferir B → A, grupo e séries. Alterar apenas o segundo descanso para 75 s. Reabrir e conferir 45/75/120. Demonstrar em teste de integração que a revisão anterior continua com 45/90/120. Repetir o salvamento simulando perda da resposta. O banco deve conter um único resultado lógico.

Testar invariantes de medidas e compatibilidade em unidade, transações concorrentes em PostgreSQL real e navegação/persistência no navegador. Usar scripts existentes de validação Prisma, integração, estrutura, i18n e CI descritos no [contrato do repositório](../../../AGENTS.md). Rodar a cadeia completa antes de liberar, incluindo instalação a partir do lockfile e seed em banco limpo. Para reversão no primeiro incremento, retirar exposição do editor e voltar ao leitor anterior mantendo as tabelas e revisões criadas. A recriação de um banco local descartável pode simplificar o ensaio, sem ser requisito do deploy.

## Pontos a resolver no primeiro incremento

Confirmar o mapeamento de variantes importadas com metadados incompletos, quais formatos de dose o editor pode criar e quais deve abrir em consulta preservando seus dados. Conferir a disponibilidade de componentes Mira no pacote usado pelo build. Validar a escolha de recibo idempotente para comandos que alteram apenas metadados ou ordem. Essas verificações mudam detalhes do código e não reabrem as regras aprovadas de Planos e Calendário.

## Andamento da implementação

Em 17/11/2026 foi iniciada a base de persistência. O arquivo prisma/models/workout-plans.prisma adiciona plano, treino ordenado, versões de prescrição, blocos, exercícios, séries, etapas e grupos de equipamentos. A migration 20261117010000_workout_plan_prescriptions é aditiva e foi gerada por comparação entre schemas, sem aplicação ao banco em uso. Revisões de treino são identificadas por número crescente. A leitura da revisão vigente, publicação concorrente e preservação imutável dependem dos próximos casos de uso.

O domínio workout-prescription valida medidas por chave, unidade, carga decimal opcional, obrigatoriedade dos lados, identidade das etapas e descanso. Cinco testes passaram, assim como validação do schema e tipos TypeScript. O teste de migração em PostgreSQL vazio, seed, mapeamento das variantes e reserva de execução continuam pendentes. A verificação estrutural aponta um arquivo solar.png preexistente na pasta do componente kaizen-logo. A página /plans e as mutações permanecem nas próximas etapas.
