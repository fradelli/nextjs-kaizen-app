# Execução de séries e referência histórica

## Estado e limites

Proposta em revisão em 29/10/2026. Não autoriza implementação nem altera decisões aprovadas. Pesquisa documental e quatro capturas fornecidas pelo usuário são referências, não instruções de execução. D1 tem a correspondência por tipo aprovada; D2 e o núcleo de D3 estão aprovados. Descanso em mobile/desktop, adição de séries por tipo e ajustes de layout foram solicitados explicitamente. Casos de borda indicados abaixo continuam pendentes. Prioridade atual: fechar regras antes de detalhar a implementação.

Base local: `codex/E10-T08-today-navigation`, commit `cb16868` da PR #74. Ajustes de navegação E10-T08 permanecem sem commit e devem ser preservados. A referência remota não foi reconfirmada por indisponibilidade de DNS na investigação inicial. Nenhum commit, push, PR, merge, dependência ou alteração do DS faz parte desta etapa.

Entradas normativas: [arquitetura](../architecture/TARGET-ARCHITECTURE.md), [adoção do DS](../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md), [tarefa ativa](../../roadmap/ACTIVE.md), [E06-T07](../../roadmap/epics/E06-training-execution/T07-show-previous-set-performance.md) e [E06-T08](../../roadmap/epics/E06-training-execution/T08-require-applicable-fields-before-next-set.md). O PDF e as capturas permanecem externos ao repositório; não copiar seus arquivos para o projeto público.

## Evidência das referências

| Referência | Observação verificável | Consequência proposta |
| --- | --- | --- |
| Foto 1 | Onboarding com gráfico de progresso e seletores de métricas. | Inspiração futura; não é requisito de histórico durante execução. |
| Foto 2 | Linhas W e numeradas, Previous, carga, reps, controle por linha e Add Set. Previous aparece como traço. | Adotar organização legível por série; não incluir tipos especiais ou séries adicionais automaticamente. |
| Fotos 3 e 4 | Primeiro campo de reps mostra 8; demais mostram 8–12. Descanso aparece em painel inferior com ajustes e Skip. Contador de séries permanece 0. | Distinguir meta e dado digitado explicitamente; não inferir confirmação ou regra de contagem dessas capturas. |
| Conjunto | Ações auxiliares ocupam faixa horizontal; painel inferior cobre parte da lista. | Manter controles essenciais acessíveis sem rolagem horizontal obrigatória e sem obstrução pelo teclado. |

As capturas não demonstram conclusão fora de ordem, desmarcação, cópia do Previous, seleção histórica, persistência nem recuperação. O benchmark distingue evidências documentais e recomendações; seu desenho conceitual não substitui o modelo existente.

## Implementação atual e riscos concretos

- `training-exercise.tsx` escolhe a borda por `completed`; no modo persistido agrega `completed` e `skipped`. O switch do exercício não verifica todas as séries e reabrir preserva os dados locais.
- `isTrainingSetPerformed` exige medida positiva no total, em ambos os lados ou em todas as direções exigidas. Não compara com mínimo/máximo prescrito e não exige carga. A validação numérica do servidor continua sendo necessária; positividade na interface não substitui validação de formato.
- `isSetResultPerformed` reproduz a regra no servidor. Entretanto, `hasSetExecutionMeasurement`, usado na projeção persistida, aceita qualquer medida positiva. Um lado preenchido pode ser projetado como concluído apesar de não atender ao predicado usado para avanço. Não usar o status projetado como única prova de realização integral.
- O editor mostra uma série por vez, bloqueia avanço e pode limpar posteriores ao zerar anterior, mediante confirmação. O servidor também proíbe lacunas e exige exatamente a quantidade prescrita, numerada consecutivamente.
- O rascunho guarda valores e finalização do exercício, sem confirmação por série. `TrainingActivitySetExecution` não tem status explícito; `TrainingSetExecution`, do modelo legado, tem. DTOs não bastam para distinguir essas origens sem adaptação.
- O fluxo ativo usa `localStorage` v1 por data e atividade, com revisão e eventos entre abas. Na finalização, o dialog envia snapshot; o servidor valida e grava em transação. O formulário de avaliação tem rascunho separado em `sessionStorage`. Correções de registros persistidos também existem: o contrato local não descreve todas as mutações do aplicativo.
- Aquecimento de preparação não aceita séries no servidor. Mobilidade tem contexto próprio e não deve herdar uma grade de força por suposição.
- Ausências podem ser serializadas como zero no contrato atual. Não reinterpretar retroativamente esses zeros como omissão explicitamente confirmada pelo usuário.

## Escopo inicial recomendado

1. Unificar a definição de medidas realizadas em regra pura de domínio com consumidores na UI e servidor; preservar diferenças históricas como informação de origem, sem reescrever fatos.
2. Distinguir finalização do exercício e completude das séries, com contagem e estado textual acessível.
3. Permitir edição independente das séries prescritas e retirar limpeza em cascata e bloqueio sequencial das duas camadas, conforme proposta ainda sujeita ao fechamento das regras de edição.
4. Separar prescrição, referência anterior, valores editados e confirmação. A confirmação explícita foi aprovada e será local durante o treino; compatibilidade depende de D7.
5. Mostrar Anterior por série e histórico compacto do exercício durante a execução, com data e contexto de origem. Anterior é apenas referência visual, sem cópia nesta versão. Aquecimentos por série entram no planejamento por decisão explícita do usuário, separados da preparação geral.
6. Preservar salvamento local durante execução e gravação transacional na finalização.

7. Adicionar aquecimento ou série válida durante a execução, mantendo aquecimentos antes das válidas.
8. Iniciar descanso ao confirmar série, no mobile e no desktop, com −15 s, +15 s e Pular; mesmo descanso para aquecimento e trabalho.
9. Remover card externo dos exercícios no mobile e abrir dicas/cuidados em dialog pelo botão compacto abaixo do título.

Ficam separados: remover/reordenar livremente séries; falha/drop set; gráficos/recordes/volume; conversão kg/lb; sincronização entre dispositivos; catálogo público e construtor. Não instalar bibliotecas nem modificar o DS sem necessidade demonstrada.

## Decisões de negócio e pendências

| ID | Decisão | Recomendação para revisão |
| --- | --- | --- |
| D1 | Qual sessão e quais séries fornecem Anterior? | Aprovado: válidas correspondem às respectivas válidas da última execução do mesmo exercício, mesmo em outro treino. Aquecimentos correspondem aos respectivos aquecimentos da última sessão desse exercício que teve aquecimento. Seleção independente por tipo; parcialidade e lacunas ainda pendentes. |
| D2 | Consulta ou cópia? | Aprovado: somente referência visual nesta primeira versão, sem ação de copiar. |
| D3 | Confirmar, editar e desmarcar? | Aprovado: ✓ confirma realização e inicia descanso localmente, sem envio ao backend até finalizar o treino inteiro. Digitar não confirma. Aprovado posteriormente: corrigir valores válidos mantém realizada sem reiniciar descanso; desmarcar preserva valores e cancela somente o descanso associado. Ainda pendente: validação para marcar e efeito de apagar medidas obrigatórias. |
| D4 | Carga, dose e unidade | Manter medidas já suportadas e unidades declaradas; não exigir carga positiva como nova condição sem decisão. Peso corporal sem carga aplicável não exige kg; não inferir massa ou assistência. Definir explicitamente zero, ausência e cargas assistidas antes de ampliar suporte. |
| D5 | Finalização parcial e omissão | Permitir finalizar com pendências, mostrando resumo. Zero realizadas deve aparecer como “Finalizado sem séries realizadas”; “Pulado” fica reservado para omissão explícita ou estado legado identificado. |
| D6 | Aquecimento e mobilidade | Aquecimento por série entra no planejamento para atender D1, sem ser confundido com preparação geral. Aprovado: Adicionar série oferece Aquecimento ou Série válida; novo aquecimento entra antes das válidas e usa o mesmo descanso. Aprovado: aquecimentos participam da completude; verde somente quando tudo estiver realizado. Ainda definir quantidade inicial prescrita. Preparação geral mantém proposta de confirmação por exercício, sem contagem inventada. Mobilidade só usa séries quando o contrato real as comportar; demais casos mostram confirmação da atividade/exercício. |
| D7 | Registros e rascunhos antigos | Preservar interpretação histórica identificada como inferida; não inventar checkbox marcado. Rascunho v1 permanece recuperável e visível até migração segura ou conclusão no modo compatível. |

D1 também exige aprovar a regra temporal: proposta usa instante real da sessão quando disponível, e não data de edição do registro. Para legado apenas com data civil, excluir candidatos temporalmente ambíguos e informar ausência de referência. Mesmo dia exige ordenação determinística com instante e ID; correções não mudam a posição cronológica da sessão. Não misturar dados futuros em consultas de sessões antigas.

### Correspondência aprovada de Anterior

- Válida 1 corresponde à válida 1; válida 2 à válida 2, e assim por diante, da última execução do mesmo exercício, independentemente do treino.
- Aquecimento 1 corresponde ao aquecimento 1; aquecimento 2 ao aquecimento 2, da última sessão do mesmo exercício que teve aquecimento.
- As duas origens podem ter datas diferentes. No exemplo aprovado, as válidas de quinta podem referenciar terça e os aquecimentos referenciar a quinta anterior.
- “Válida” identifica uma série de trabalho, não significa automaticamente “realizada”. A confirmação/realização continua sendo uma dimensão separada.
- Contar a posição dentro do tipo, nunca a posição absoluta: inserir dois aquecimentos antes não desloca válida 1 para válida 3.
- Não foi aprovado procurar uma data diferente para cada lacuna dentro de um tipo. Falta decidir sessão parcial, segunda série ausente e exercício repetido na mesma sessão. Recomendação pendente: manter uma sessão de origem por tipo e mostrar “Sem referência” nas lacunas.

Identidade proposta: exercício canônico e compatibilidade de medidas; não restringir à mesma rotina nem usar nome isolado. Confirmar continuidade entre versões pela identidade existente e assinatura de dose (unidade, escopo e aplicabilidade de carga). Na dúvida, sem referência. Não equiparar variações nem equipamentos por semelhança. Histórico lista a sessão parcial sem esconder suas lacunas. O resultado anterior mostra carga e repetições ou as medidas aplicáveis, com data/contexto por tipo.

O contrato de séries precisa representar tipo (aquecimento/trabalho) e posição dentro do tipo em prescrição, rascunho, persistência e DTO. A criação durante o treino oferece os dois tipos; quantidade inicial e eventual mudança de tipo ainda precisam de decisão; o catálogo e construtor continuam fora do escopo. Não inferir aquecimento em registros antigos pela carga menor ou posição. Uma migração deve distinguir tipo conhecido de classificação legada indisponível.

## Regras aprovadas de registro, descanso e novas séries

- ✓ confirma a realização da série e inicia o cronômetro de descanso tanto no mobile quanto no desktop.
- Durante o treino, digitação, marcação e adição de séries permanecem no rascunho local. Não enviar mutações ao backend a cada série; enviar o conjunto ao finalizar o treino inteiro. Finalizar um exercício não equivale a finalizar o treino. Consulta de histórico continua sendo leitura.
- Aquecimentos e séries válidas usam o mesmo descanso do exercício.
- No mobile, o descanso aparece no painel inferior com −15 s, +15 s e Pular. Desktop também tem cronômetro; posicionamento ainda será definido. Controles equivalentes são a proposta para desktop.
- Adicionar série oferece Aquecimento ou Série válida. Aquecimentos ficam antes de todas as válidas, inclusive quando adicionados depois de iniciar estas. A ordem visual não deve modificar identidade, dados, marcações nem referências das séries existentes.
- Aquecimentos exibem W amarelo com rótulo acessível; válidas numeram 1, 2, 3 por grupo. Proposta: nova série vazia e não confirmada ao final do grupo escolhido; não modificar a prescrição do plano.
- Mobile sem card externo por exercício. Dicas ficam em botão/card compacto abaixo do título e abrem dialog de execução/cuidados, seguindo o padrão compartilhado. Aprovado: faixa lateral pequena no cabeçalho, acompanhada de texto, sem recolocar card externo. O toggle de finalização permanece e recolhe o exercício para título e alguns botões.

### Descanso aprovado e pendências de séries

- Aprovado: um único descanso ativo; marcar outra série substitui o timer anterior. Editar série marcada não reinicia descanso. Desmarcar cancela apenas o timer ainda associado àquela série.
- Aprovado: Pular/expirar encerra somente descanso, sem confirmar próxima série. −15 s limita em zero; +15 s altera somente o descanso corrente, sem reescrever a prescrição.
- Calcular tempo restante por instante de término para tolerar background/recarregamento; recuperar estado local sem replay de confirmação. Ainda decidir efeito de pausa do treino, última série, ausência de descanso prescrito e notificações.
- Revisar limite de séries, remoção acidental e tipo inicial das séries legadas antes de implementar. O servidor hoje exige quantidade igual à prescrita: aceitar séries adicionais precisa preservar a prescrição e validar identidade/tipo separadamente, não apenas remover a validação.
- Adicionar e inserir aquecimento exige identidade estável da série independente do índice visual; vincular timer à identidade, não à posição que mudou. Contratos, migração e testes dessa adição serão detalhados após fechar regras.

## Estados visuais e interação

| Estado | Token proposto do DS | Texto visível |
| --- | --- | --- |
| Não finalizado, mesmo com todas as séries realizadas | `status-info-border` | Em aberto · X/Y séries realizadas |
| Finalizado com todas realizadas | `status-success-border` | Finalizado · Y/Y séries realizadas |
| Finalizado com pendências ou medidas incompletas | `status-warning-border` | Finalizado parcialmente · X/Y séries realizadas |
| Finalizado sem nenhuma realizada | `status-destructive-border` (vermelho sugerido pelo usuário, regra de ausência abaixo ainda proposta) | Finalizado sem séries realizadas |
| Pulado explícito | `border` e texto neutro | Pulado |
| Legado sem informação suficiente | `border` e texto neutro | Registro antigo · detalhamento indisponível |

Amarelo para parcial e faixa no cabeçalho foram aprovados. Vermelho para ausência de execução foi sugerido pelo usuário; verde para completo foi aprovado; azul para aberto permanece proposta. Aquecimentos, válidas e séries adicionadas participam da completude: exercício finalizado só fica verde quando todas estiverem realizadas. Qualquer série pendente impede o verde. Cor sempre acompanhada de texto; ícones opcionais somente pelos exports `@fradelli/ui/icons/*`. Nenhuma série é classificada como realizada apenas por alcançar a prescrição. Exercício reaberto volta a “Em aberto” preservando valores e confirmações das séries, salvo decisão posterior diferente.

Grade proposta: identificação da série, Anterior, campos aplicáveis e controle de realização. Meta prescrita aparece como texto rotulado, nunca como valor digitado. Em telas estreitas, Anterior e meta podem ocupar linha secundária; medidas por lado/direção quebram em linhas com rótulos, sem comprimir cinco ou mais campos numa única linha. Histórico abre usando `TrainingActivityModal`, preservando foco e execução; não pausa cronômetro implicitamente.

### Toggle e resumo recolhido

Aprovado: manter o toggle para finalizar e minimizar o exercício. Essa ação é local e não finaliza nem envia o treino ao backend. Proposta de resumo recolhido: título, faixa de estado, texto curto de contagem, toggle e botões de dicas/histórico. Reabrir preserva valores e confirmações, conforme regra já proposta; composição exata dos botões ainda será definida no layout.

Proposta para vermelho: usar quando o exercício estiver finalizado e não houver execução confirmada nem evidência parcial de medidas. Não usar vermelho enquanto o exercício estiver aberto. Medidas unilaterais incompletas ou valores digitados não confirmados precisam de estado parcial/pendente explícito, não da afirmação de que nenhuma repetição ocorreu. A regra deve abranger segundos e contatos, não apenas repetições. Registros antigos sem evidência suficiente continuam neutros. Definição final dessa fronteira e efeito de campos apagados ainda pendentes.

## Responsabilidades e arquivos afetados

Todos os caminhos abaixo são relativos à raiz do repositório; alterações são propostas, não realizadas.

| Camada | Arquivos | Responsabilidade |
| --- | --- | --- |
| Domínio | `src/features/training/domain/training-day.types.ts`; novo `src/features/training/domain/training-set-execution.rules.ts` e teste correspondente | Separar evidência de medidas, confirmação e resumo do exercício; regras compartilhadas sem React/Prisma. |
| Contratos | `src/features/training/application/training-dto.ts`; `src/features/training/application/training-mutation.types.ts`; `src/features/training/application/training-repository.ts` | Preservar origem legada, confirmação e projeção de histórico; entradas mínimas. |
| Leitura | `src/features/training/application/get-training-day.ts`; `src/features/training/data/prisma-training-repository.ts`; `src/features/training/data/prisma-training-repository.types.ts` | Consulta histórica por workspace, compatibilidade e temporalidade, sem consulta por linha; corrigir divergência de projeção explicitamente. |
| Escrita | `src/features/training/application/mutate-training-day.ts`; `src/app/treino/training-actions.ts`; `src/features/training/data/prisma-training-repository.ts` | Validar novos estados e retirar restrição sequencial sem retirar ownership, revisão ou atomicidade. |
| Banco, conforme D1/D3/D7 | `prisma/models/training.prisma`; nova migração em `prisma/migrations/` | Representar tipo de série e sua ordem relativa, além de confirmação separada dos valores, de modo aditivo; formato final somente após decisões. |
| Rascunho | `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.types.ts`; `src/features/training/ui/hooks/use-training-exercise-draft/use-training-exercise-draft.utils.ts`; `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types.ts`; `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.utils.ts`; `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts` | Versionar e recuperar dados antigos, persistir confirmação e retirar limpeza em cascata. |

Componentes existentes, todos sob `src/features/training/ui/components/training-day-page/components/`:

- `training-session/components/training-exercise/training-exercise.tsx` e `training-exercise.styles.ts`: resumo e bordas.
- `training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx` e `training-local-exercise-editor.styles.ts`: grade independente e campos por dose.
- `training-session/components/training-exercise/components/training-completed-exercise-correction/training-completed-exercise-correction.tsx`: correção coerente com novos estados.
- `training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.tsx`: revisar caminho de edição persistida.
- `training-activity-completion-dialog/training-activity-completion-dialog.tsx` e `training-activity-controls/training-activity-controls.utils.ts`: resumo de pendências e finalização sem perda.
- Novo `training-session/components/training-exercise/components/training-exercise-history/training-exercise-history.tsx`, tipos e estilos próprios: consulta histórica limitada, usando `training-activity-modal/training-activity-modal.tsx` sem mudar seu contrato compartilhado.

## Compatibilidade, dependências e ordem

1. Aprovar decisões e reconciliar roadmap: E06-T07 cobre Anterior; E06-T08 pressupõe sequência e precisa de revisão explícita. E06-T04 trata proveniência documental, não deve ser reutilizada silenciosamente para histórico de execução. Criar tarefa de estados/edição apenas após aprovação, sem marcar implementação em andamento nesta etapa.
2. Fixar fixtures de legado, série com um lado, zeros e rascunho v1. Extrair regra compartilhada e definir a projeção compatível antes de mudar cores. A divergência de leitura deve ter teste de regressão e mudança de apresentação documentada.
3. Para a confirmação explícita aprovada, adotar representação aditiva que distinga legado de confirmado/não confirmado. Não preencher registros antigos como se houvesse ação humana. Servidor deve compreender formatos antigos durante transição; migration e leitor precedem novo escritor.
4. Manter leitura v1 e introduzir versão nova somente com adaptação testada. Não apagar origem antes de gravar e validar cópia convertida; manter falha recuperável. Evitar duas execuções concorrentes em chaves v1/v2 e testar abas com versões diferentes. Se conversão não for inequívoca, retomar em modo compatível e informar a limitação.
5. Implementar edição/estados após contratos; histórico visual após resolver casos de borda de D1 e compatibilidade. Manter dados digitados não confirmados separados de medidas realizadas no histórico e em agregações.
6. Validar UI, banco e dispositivo real; somente depois considerar entrega. Não iniciar rollout com rascunhos existentes descartáveis por mudança de schema.

Rollback proposto: desativar nova edição mantendo leitor compatível; preservar colunas aditivas e valores. Reverter para binário que ignora confirmação pode interpretar rascunhos como realizações, portanto não é rollback seguro. Definir versão mínima compatível antes da migração; não fazer down migration destrutiva.

## Validação e critérios de aceite

| Área | Casos obrigatórios e resultado esperado |
| --- | --- |
| Semântica | Total, segundos, contatos, ambos os lados e direções; um lado apenas não significa série integral. Meta acima/abaixo do executado não altera realização. Carga preenchida sozinha não confirma. |
| Edição | Série 3 antes da 2; zerar/desmarcar 1 preserva 2 e 3; Anterior não preenche campos; editar realizada segue D3; reabrir exercício não apaga medidas. |
| Finalização | Verde exige toggle finalizado e todas as séries realizadas, incluindo aquecimentos e séries adicionadas. Válidas 4/4 com aquecimento 1/2 permanece amarelo. Todas, algumas e nenhuma realizadas; exercício ainda aberto; omissão explícita; preparação sem séries; mobilidade. Resumo idêntico antes/depois de recarregar, respeitando origem legada. |
| Descanso e adição | Mobile e desktop iniciam ao marcar; testar ajustes, Pular, zero, background e regras aprovadas de troca/desmarcação. Inserir aquecimento antes de válidas já realizadas preserva dados, IDs e referência; mesma duração entre tipos. |
| Persistência | Confirmar/editar/adicionar séries não envia mutação ao servidor; finalizar envia o conjunto. Recarregar, fechar/retomar, armazenamento indisponível, rascunho inválido, revisão divergente, duas abas, falha de envio e resposta incerta. Erros preservam dados; sucesso confirma transação antes de limpar recuperação. |
| Histórico | Ausência, séries extras/ausentes, sessão parcial, mesmo dia, retroativo, alteração posterior, exclusão lógica, mudança de plano/unidade/escopo, exercício repetido e outro workspace. Válidas de terça e aquecimentos da quinta anterior devem coexistir como referências; aquecimentos não deslocam índices de trabalho. Origem rastreável; nenhuma mistura silenciosa de sessões. |
| Migração | Legado e v1 intactos; ausência de confirmação diferenciada de false; valores sem confirmação não viram realização; recuperação e rollback compatíveis testados. |
| Acessibilidade | Nome acessível por exercício/série/campo, estado anunciado, Tab/Shift+Tab, Space/Enter, foco ao abrir/fechar histórico, erro associado e texto além de cor. Contraste medido nos tokens usados. |
| Responsividade | 320, 375/390, 768 e 1440 px; zoom 200%, fonte ampliada, teclado virtual, rotação e área segura. Alvos de pelo menos 44 CSS px; campos e ação de conclusão não encobertos. Dispositivo real permanece necessário. |

Ampliar os testes existentes em `use-training-exercise-draft.test.ts`, `use-training-activity-draft.test.tsx`, `training-day-page.test.tsx`, `tests/integration/training-mutations.test.ts` e `tests/integration/training-projections.test.ts`; acrescentar testes de domínio e componentes novos pelos comportamentos acima. Na implementação executar formato, lint, estrutura, tipos, testes pertinentes, integração em banco descartável e build; não reutilizar resultados da E10-T08 como evidência desta mudança.

Aceite do planejamento: decisões abertas identificadas, escopo inicial/futuro separado, caminhos e responsabilidades revisados, compatibilidade e verificações definidas. Aceite da implementação: todas as regras aprovadas e casos pertinentes comprovados, sem alteração de prescrição/histórico por efeito colateral.
