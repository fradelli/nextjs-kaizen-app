# Kaizen — contexto consolidado do projeto

> Nota de preservação em 26/10/2026: este documento registra uma análise anterior.
> As descrições de implementação, versões e conflitos abaixo podem estar
> desatualizadas. Use [a tarefa ativa](roadmap/ACTIVE.md) e
> [o roadmap](roadmap/README.md) para confirmar o estado atual.

Este documento consolida o contexto funcional e técnico encontrado no repositório para apoiar conversas futuras sobre o produto. Ele separa princípios estáveis do domínio do estado da implementação, que deve ser revisto à medida que o produto evolui.

## Instruções estáveis para o Projeto do ChatGPT

O Kaizen é um aplicativo pessoal para centralizar planejamento e acompanhamento de treino, alimentação e, futuramente, outros aspectos da rotina. Seu propósito é reduzir o atrito para consultar o dia e registrar o que aconteceu, preservando a diferença entre planejamento, realização, alteração e omissão, bem como a versão do plano vigente.

Princípios para conversas sobre o produto:

- Plano representa o que deveria acontecer; execução representa o que realmente aconteceu. Não assumir que uma atividade planejada foi realizada.
- Distinguir três níveis: **plano** (definições e padrões), **dia/agenda** (atividades concretas previstas para uma data) e **histórico** (o que foi registrado como realizado, alterado ou pulado).
- Planos são versionados. Uma mudança cria nova versão; registros históricos continuam associados à versão usada naquele momento.
- Programação semanal pode sugerir atividades para uma data, mas não é a agenda concreta nem uma execução. Alterações específicas do dia não devem ser confundidas com mudanças na programação semanal.
- Preservar resultados reais mesmo quando diferem da prescrição. Não ajustar o registro para fazê-lo coincidir com o plano.
- Não inferir execução, carga, alimentação, avaliação, conclusão ou métricas ausentes. Manter ausências e incógnitas explícitas.
- Modalidade esportiva é contexto da atividade e não precisa definir um tipo estrutural distinto para cada esporte.
- Preparação/aquecimento pode acompanhar uma atividade, mas permanece conceitualmente separada e não se conclui automaticamente junto com a atividade principal.
- O plano alimentar define refeições, opções e tipos de dia. Não inferir automaticamente consumo, qualidade nutricional ou tipo de dia sem regra explícita.
- Priorizar regras de negócio, experiência, fluxos e impactos de decisões; considerar arquitetura quando relevante ao produto. Evitar complexidade sem consumidor.
- Distinguir comportamento atual, decisão de produto, decisão planejada, inferência e sugestão. Quando fontes divergirem, apontar a divergência em vez de escolher silenciosamente uma interpretação.

O produto inicialmente atende um proprietário em um workspace único. Evolução para múltiplos usuários não é requisito atual.

---

# CONTEXTO DO PRODUTO

## 1. Visão geral

O Kaizen é um aplicativo pessoal de treino e alimentação. Combina planos aprovados com registros operacionais do que aconteceu em cada dia. A experiência pretendida permite descobrir rapidamente o que está previsto e registrar o que foi cumprido, alterado ou pulado, preservando histórico confiável.

O público inicial comprovado pela documentação é um único proprietário em um workspace pessoal. Identidade, faixa etária ou outros perfis de usuário não são necessários para explicar o produto e não são inferidos aqui. As áreas principais são Treino e Dieta; a implementação atual delas é descrita separadamente em **Estado atual da implementação**.

Referência normativa: [`docs/product/P0.md`](docs/product/P0.md).

## 2. Conceitos e entidades do domínio

- **Plano/versão:** definição aprovada de treino ou alimentação. Prescreve sessões, exercícios, doses, tipos de dia, refeições e opções. Versões são históricas e imutáveis depois de importadas.
- **Ponteiro ativo/ativação:** identifica a versão vigente por domínio e ambiente. A ativação pode mudar sem substituir definições antigas nem reescrever registros históricos.
- **Biblioteca de exercícios:** catálogo com IDs estáveis e informações para executar cada exercício, como medida, aplicabilidade de carga, instruções e alertas.
- **Programação semanal:** padrão que sugere atividades conforme dia da semana. Não é a atividade concreta de uma data nem evidência de execução.
- **Dia/agenda:** conjunto de atividades concretas associados a uma data e workspace. Pode partir da programação, receber alterações pontuais e conter mais de uma atividade.
- **Atividade:** unidade operacional planejada, como treino estruturado, prática esportiva, treino específico ou mobilidade. A modalidade (por exemplo, futevôlei) é um atributo descritivo, separado do tipo estrutural.
- **Sessão/exercício prescrito:** uma sessão agrupa exercícios com dose, séries, medida e instruções. A prescrição orienta, mas não limita o resultado real registrado.
- **Preparação:** sessão ou atividade ligada à principal, mas mantida separada. Pendências de preparação não são convertidas automaticamente em conclusão.
- **Execução/histórico:** fatos registrados sobre atividade, intervalos, exercícios, séries, medidas, avaliação e comentários. O histórico deve continuar ligado ao plano usado.
- **Tipo de dia alimentar:** classificação do dia escolhida pelo usuário, ligada a faixas e refeições aplicáveis. Não é inferida automaticamente a partir da agenda.
- **Refeição/opção:** definições do plano alimentar. No fluxo previsto, cada refeição pode permanecer pendente, seguir uma opção, registrar alternativa ou ser pulada.
- **Workspace:** limite de ownership dos dados operacionais. No P0 existe um workspace fixo resolvido no servidor, não selecionável pelo cliente.
- **Lote de importação:** proveniência de uma definição importada, incluindo fonte, hash, versão do schema e commit de origem.

Modelo central para discussões de calendário e histórico:

```text
PLANO → DIA/AGENDA → HISTÓRICO DE EXECUÇÃO
```

Cada seta representa uma relação, não equivalência: o plano pode sugerir o dia; o dia pode ser editado; e somente registros de execução dizem o que foi informado como realizado.

## 3. Regras de negócio

- **Definições versus operação →** planos, biblioteca, agenda semanal e metadados têm fonte versionada no Git. Atribuições e execuções são registros operacionais no banco. A interface não edita definições canônicas.
- **Versionamento →** mudança material em definição aprovada cria nova versão. Ativar uma versão nova não altera atribuições ou execuções históricas.
- **Importação →** fontes passam por validação de schema, referências, hash e proveniência. Reimportação idêntica é no-op; o mesmo ID/versão com conteúdo divergente é conflito; uma falha não deve substituir a ativação válida.
- **Programação e dia →** a programação semanal sugere atividades, mas o dia concreto pode receber mudanças próprias. Remover intencionalmente uma atividade materializada não deve fazê-la reaparecer em consulta posterior.
- **Dia sem programação →** falta de definição não autoriza inferir treino. O sistema deve expor a lacuna em vez de inventar uma sessão.
- **Datas →** data civil usa `America/Sao_Paulo`; timestamps persistidos usam UTC. Há uma janela futura de consulta/materialização de hoje até hoje + 4 dias. As permissões de mutação atualmente implementadas e a regra futura aprovada estão detalhadas na seção de estado atual.
- **Execução →** atividade planejada não prova que foi executada. Registros preservam o que foi realizado, ainda que difira da prescrição.
- **Medições →** valores precisam ser finitos, não negativos e compatíveis com a medida prescrita. Medidas por lado devem preservar cada lado; carga só aparece quando aplicável e usa kg no P0. Dose prescrita não limita o resultado registrado.
- **Progresso →** a interface apresenta uma série de cada vez e exige medida positiva para avançar. Valores vazios ou zero podem ser persistidos como zero ao finalizar, sem inferência sobre motivo.
- **Pendências →** finalizar com pendências requer confirmação e não transforma séries ou preparação em itens concluídos.
- **Preparação →** permanece separada da atividade principal, não exige carga e não bloqueia a principal por estar pendente.
- **Avaliação →** atividades principais podem registrar intensidade percebida (`low`, `moderate`, `high`) e energia durante a atividade (`tired`, `normal`, `energized`). Mobilidade não usa esses campos.
- **Correções →** valores e comentários de uma atividade concluída podem ser corrigidos explicitamente sem alterar horários realizados.
- **Exclusão →** atividades removidas são excluídas logicamente para preservar auditoria. Atividade iniciada exige confirmação; concluída não pode ser removida.
- **Concorrência →** cada registro mutável usa revisão esperada. Uma edição obsoleta é rejeitada como conflito em vez de sobrescrever silenciosamente a gravação concorrente.
- **Comentários →** texto simples opcional até 1.000 caracteres. A descrição de refeição alternativa prevista é obrigatória, não vazia após trim, até 500 caracteres.
- **Dieta →** o tipo do dia deve ser escolhido explicitamente quando ausente. Completude é derivada das refeições obrigatórias pendentes; não há nota de qualidade, estimativa de consumo ou contador contínuo de calorias no P0.
- **Ownership/servidor →** workspace é resolvido somente no servidor. Server Actions validam origem e entrada; nunca confiam em `workspace_id` do cliente.

### Separação de ciclos de estado

Os estados da **atividade** e da **execução** são contratos distintos e não devem ser tratados como sinônimos:

- Atividade diária: `scheduled`, `in_progress`, `paused`, `completed`, `skipped`.
- Execução associada à atribuição diária: `not_started`, `in_progress`, `completed`, `followed_different`, `skipped`.
- Atribuição de dia: `training`, `mobility`, `rest`, `unassigned`.
- Itens de preparação/séries: `pending`, `completed`, `skipped`.

Esses status operam em níveis diferentes. Uma atividade pode agrupar seus intervalos e resultados; uma atribuição diária descreve a programação/histórico de uma data. Ao discutir transições, identificar qual entidade está sendo alterada.

## 4. Fluxos principais do produto

### Planejar um período e materializar um dia

1. Uma programação versionada define sugestões para dias da semana.
2. Ao consultar uma data elegível ainda não materializada, o sistema pode criar o registro do dia e as atividades sugeridas.
3. A pessoa pode ajustar a agenda daquele dia, sem necessariamente alterar a programação semanal.
4. A intenção explícita de remover uma atividade deve ser preservada em consultas futuras.

### Registrar uma execução

1. A pessoa abre uma atividade planejada.
2. A preparação e a atividade principal são apresentadas separadamente, quando houver.
3. Medidas e comentários são inseridos para refletir a execução real.
4. Conclusão persiste os dados operacionais associados à atividade, à data e à versão do plano.
5. Correções posteriores mantêm os horários e a associação histórica.

### Registrar alimentação — fluxo aprovado, ainda sem UI completa

1. Resolver tipo de dia explicitamente e versão de plano aplicável.
2. Exibir refeições e opções na ordem definida.
3. Registrar por refeição opção seguida, refeição diferente, item pulado ou pendente, com comentário opcional.
4. Derivar contagens e completude sem avaliar qualidade nutricional.

### Importar e ativar definições

1. Ler fontes versionadas do Git.
2. Validar schema, referências, hashes e proveniência.
3. Persistir lote e projeções em transação.
4. Ativar o ponteiro somente após validação e gravação consistentes.
5. Preservar ativações e versões anteriores em caso de falha.

## 5. Decisões de produto identificáveis

### Comprovadas

- P0 se concentra em Treino e Dieta, combinando consulta de planos com registro operacional.
- Um proprietário usa um workspace único; autenticação real está adiada e é um gate antes de múltiplos usuários ou dados considerados sensíveis.
- O modo atual é público e sem login; qualquer pessoa com a URL pode usar as operações disponíveis no mesmo workspace. A decisão aceita explicitamente esse risco, sem alegar privacidade.
- Planos e regras são editados via Git/PR; a operação diária é gravada no banco.
- Histórico preserva a versão utilizada; não há exclusão física de histórico no P0.
- Esporte é contexto descritivo da atividade, não necessariamente um tipo estrutural próprio.
- Valores desconhecidos não são completados por estimativa.
- O plano alimentar público foi aprovado para uso pessoal, mas não validado profissionalmente.
- Sono, tarefas, notificações, recomendações automáticas, IA, contagem completa de calorias e colaboração estão fora do P0.

### Inferências prováveis

- O foco parece ser acompanhamento pessoal com baixo atrito e histórico fiel, não recomendação automática nem painel analítico.
- Workspace e revisões preparam a evolução do modelo, mas não indicam que produto multiusuário seja requisito atual.

## 6. Usuários, papéis e permissões — decisão de produto

Não há papel ou autorização técnica por pessoa implementados. “Proprietário” é o usuário-alvo inicial, não um papel de aplicação. O workspace fixo isola estruturalmente as consultas e gravações; não autentica quem acessa. A decisão exige autenticação antes de abrir o produto a outros usuários, armazenar dados considerados sensíveis ou prometer privacidade.

## 7. Dados importantes

- **Versionados no Git:** planos, versões, biblioteca, agenda semanal, metadados e ponteiros ativos.
- **Projetados no banco:** lotes de importação, definições imutáveis importadas e ativações por ambiente.
- **Operacionais no banco:** workspace, atribuições diárias, atividades, execuções, intervalos, medidas de exercícios/séries e, quando a jornada alimentar for implantada, tipos de dia e execuções de refeições.
- **Derivados:** resumos, rótulos e completude são calculados a partir do plano e dos registros; não representam fatos adicionais.
- **Rascunhos:** execução em andamento é estado temporário de navegador; a persistência principal ocorre na conclusão. O mecanismo atual usa `localStorage`, conforme seção de estado.
- **Datas:** data civil e timestamps têm semânticas distintas; horários planejados e realizados são mantidos separadamente.
- **Proveniência:** importações guardam caminho, hash, schema e commit, evitando misturar cópia operacional com fonte canônica.

## 8. Arquitetura técnica resumida

Aplicação Next.js full-stack, sem backend separado. Componentes de servidor leem projeções do plano e operação por casos de uso/repositórios; Server Actions recebem mutações, validam origem, entrada, data, workspace e revisão e delegam à aplicação/dados. O PostgreSQL persiste os dados operacionais; Prisma e migrations definem relações e constraints. Definições chegam do Git por importação unidirecional validada e transacional.

Domínio e UI não dependem diretamente do Prisma. Não há autenticação, sessão ou processamento assíncrono de produto nesta fase. Uma consulta de treino pode ter efeito persistente de materialização do dia — detalhe importante descrito no estado atual.

## 9. Stack e dependências relevantes

- TypeScript, Next.js App Router e React.
- PostgreSQL, Prisma ORM e adapter `pg`.
- Zod para validação de ações e Ajv/JSON Schema para contratos de dados versionados.
- `@fradelli/ui` e Tailwind CSS como base visual compartilhada.
- Vitest e Testing Library para testes.
- Node.js 24 e pnpm.
- Vercel e Neon são provedores escolhidos na arquitetura de publicação futura; configuração ativa não é comprovada neste documento.

## 10. Referências normativas do produto

- [`docs/product/P0.md`](docs/product/P0.md) — escopo e jornadas aprovadas.
- [`docs/decisions/DATA-SOURCE-TRANSITION.md`](docs/decisions/DATA-SOURCE-TRANSITION.md) — ownership de definições e operação.
- [`docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md`](docs/decisions/PUBLIC-SINGLE-WORKSPACE-MODE.md) — modo público e limite de autorização.
- [`docs/architecture/DATA-MODEL.md`](docs/architecture/DATA-MODEL.md) — conceitos e persistência.
- [`docs/guides/TRAINING-RULES.md`](docs/guides/TRAINING-RULES.md) e [`docs/guides/NUTRITION.md`](docs/guides/NUTRITION.md) — conteúdo de domínio e limites.

# ESTADO ATUAL DA IMPLEMENTAÇÃO

> Esta parte envelhece. Confirme código, testes e roadmap antes de usar datas, estados de tarefa, implantação ou comportamento atual como fatos recentes.

## 11. Funcionalidades existentes e ausentes

### Implementadas

- `/treino` consulta uma data, plano ativo, atividades e execução; oferece navegação e retorno a hoje.
- O servidor materializa sugestões da programação semanal para datas elegíveis.
- A agenda permite adicionar, editar e remover logicamente atividades dentro da janela de mutação atualmente aceita.
- Há tipos estruturados, prática esportiva, treino específico e mobilidade; preparação pode acompanhar a atividade.
- A execução cobre intervalos, pausa/retomada local, medidas por tipo, carga aplicável, comentários e avaliação.
- Atividades concluídas permitem correções explícitas; exclusões preservam histórico.
- Importação versionada, validação de integridade e ferramentas de teste local de backup/restauração existem.
- O shell e a página de foundations visual estão implementados.

### Ainda não implementadas como jornada do produto

- `/dieta` é atualmente um placeholder. Há dados, schemas e modelos de persistência, mas não a tela operacional de refeições.
- Sono e atividades genéricas não estão no P0 implementado.
- Importação de planos externos tem documentação de desenho, mas não está identificada como integração implantada.

## 12. Ciclos de vida e comportamentos técnicos observados

### Consulta com efeito de materialização

`getTrainingDay` chama `ensureScheduledTrainingDay` durante a consulta do dia. Se não existir atribuição nem atividade (inclusive linha excluída logicamente), e a data estiver elegível, a rotina pode inserir atribuição/atividades sugeridas em uma transação serializável. Isso significa que uma leitura da página pode criar registros operacionais.

A rotina evita recriar plano quando encontra atividade existente, incluindo excluída logicamente. A materialização só opera entre hoje e hoje + 4; datas anteriores a ontem não são materializadas por essa rotina. É uma interação relevante entre automação de agenda e intenção explícita de remoção.

### Estados distintos no banco atual

- `TrainingDayActivity.status`: `scheduled`, `in_progress`, `paused`, `completed`, `skipped`.
- `TrainingExecution.status`: `not_started`, `in_progress`, `completed`, `followed_different`, `skipped`, associado ao modelo de atribuição diária.
- `DailyTrainingAssignment.kind`: `training`, `mobility`, `rest`, `unassigned`.
- Série/preparação: `pending`, `completed`, `skipped`.

Os estados de atividade e execução pertencem a entidades diferentes. A existência de valores semelhantes (`in_progress`, `completed`, `skipped`) não os torna intercambiáveis. O modelo atual contém tanto o ciclo de execução da atribuição quanto o ciclo operacional de atividade; verificar qual entidade uma mudança afeta antes de alterar regras.

### Rascunho de execução

O rascunho é gravado no `localStorage` do navegador, indexado por data e atividade. Pode sobreviver a recargas e fechamento/reabertura do navegador enquanto o armazenamento local permanecer disponível; não é persistência sincronizada no servidor. Limpeza do armazenamento, indisponibilidade ou falha local pode perder mudanças ainda não concluídas. A interface expõe erro de armazenamento. Ao concluir, a ação envia dados ao servidor e a persistência passa a ser a fonte confirmada.

### Janela de datas

- Consulta/URL aceita datas civis até hoje + 4; data futura além disso é inválida.
- A materialização automática também se limita a hoje até hoje + 4.
- A camada de aplicação atualmente permite mutações de hoje e ontem e bloqueia outras datas.
- A tarefa E06-T22 registra como regra aprovada permitir inclusão, exclusão e edição de agenda de amanhã até hoje + 4, mantendo início/retomada/finalização de execução futura bloqueados. Essa distinção ainda precisa ser verificada contra a implementação presente antes de cada conversa de mudança.

## 13. Integrações e dependências externas — estado observado

- **PostgreSQL:** dependência de leitura e escrita das áreas operacionais. O banco local é usado no desenvolvimento/testes; Neon é a opção arquitetural para preview/produção.
- **Git:** fonte dos JSONs que o importador lê. Não é sincronização bidirecional.
- **GitHub Packages (`@fradelli/ui`):** registry da biblioteca visual compartilhada, relevante a instalação/build.
- **GitHub Actions:** CI do repositório.
- **Docker:** auxilia banco de desenvolvimento/testes e validação local de backup/restauração.
- **Vercel/Neon:** escolhidos na arquitetura, mas o roadmap de publicação pessoal aparece planejado; não assumir implantação operacional sem evidência nova.
- Não foi identificada API de runtime para alimentação, calendário ou exercício.

## 14. Pontos em evolução, conflitos e incógnitas

### Pontos em evolução

- A página de Dieta está placeholder; execução alimentar é uma etapa posterior.
- E06-T22 aprova planejamento futuro independente de execução antecipada, ainda não refletido na janela de mutações descrita acima.
- Execução de treino permanece em evolução no épico E06; há tarefas futuras para validação, melhorias e integração externa.
- Sono, atividades genéricas, i18n e release pessoal aparecem como escopo futuro.

### Conflitos documentais observados na análise

- O README diz que não há feature de negócio ou banco implementado e aponta uma etapa inicial como próxima; isso diverge da rota funcional de treino, das migrations e do roadmap mais recente.
- `data/schedule.json` lista atividades de segunda a quinta e sessões estruturadas em terça, quinta e sexta. `docs/product/P0.md` ainda contém texto sobre um modelo com jogo no sábado confirmado.
- `roadmap/ACTIVE.md` aponta E06-T22 como READY, enquanto `roadmap/README.md` ainda marca E06-T14 como IN_PROGRESS e descreve um estado incompatível com o ponteiro ativo.

Essas divergências não devem ser resolvidas por inferência sem confirmar qual fonte foi atualizada mais recentemente e qual decisão permanece vigente.

### Ambiguidades

- **Comprovado:** P0 é público e sem autenticação; qualquer pessoa com a URL pode usar as operações.
- **Comprovado:** plano alimentar aprovado para uso pessoal não tem validação profissional.
- **Não foi possível determinar:** implantação ativa, URL pública e estado de bancos remotos.
- **Não foi possível determinar:** agenda atual de jogos pretendida, devido à divergência JSON/documentação.
- **Não foi possível determinar:** formato, fonte permitida e política da futura importação externa de planos.
- **Não foi possível determinar:** quando haverá múltiplos usuários, login, colaboração ou exportação/exclusão definitiva.
- Dados operacionais reais não estão nos JSONs versionados; o repositório, por si só, não comprova o que foi efetivamente treinado ou consumido.

## 15. Resumo para uso como contexto permanente

### Contexto estável do produto

Kaizen é um aplicativo pessoal para planejamento e acompanhamento de treino e alimentação. Preserve a distinção entre **plano** (o que deveria acontecer), **dia/agenda** (atividades concretas de uma data) e **histórico** (o que foi registrado). Programação semanal sugere o dia, mas não é sua execução. Planos são versionados; registros históricos mantêm a versão utilizada. Preservar o realizado mesmo quando divergir da prescrição e não inferir fatos ausentes. Atividade e preparação são conceitos separados. Esporte é contexto, não necessariamente novo tipo estrutural. A alimentação não deve inferir consumo, qualidade ou tipo de dia sem regra explícita. O produto atende inicialmente um proprietário em workspace único; não assumir autenticação ou multiusuário como escopo atual. Distinguir fatos, decisões, estado atual, hipóteses e sugestões; destacar conflitos entre fontes.

### Estado atual, sujeito a revisão

Treino é a área mais implementada, com consulta diária, agenda, execução, medidas, comentários, avaliação e correções. A consulta pode materializar o dia e atividades da programação para hoje até hoje + 4; remoções intencionais são preservadas. Rascunhos de execução usam `localStorage` e só viram persistência confirmada no servidor ao concluir. Atividade (`scheduled/in_progress/paused/completed/skipped`) e execução (`not_started/in_progress/completed/followed_different/skipped`) são ciclos distintos. Atualmente mutações aceitam hoje e ontem; E06-T22 aprovou edição de agenda até hoje + 4 sem execução antes da data, mas essa mudança ainda não está implementada. Dieta ainda é placeholder. O produto usa Next.js, TypeScript, PostgreSQL e Prisma; Vercel/Neon são alvos arquiteturais, sem implantação comprovada. README, índice do roadmap e descrição da agenda apresentam divergências que precisam de confirmação antes de serem tratadas como estado vigente.
