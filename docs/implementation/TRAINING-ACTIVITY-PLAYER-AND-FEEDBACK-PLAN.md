# Player da atividade, registro em modal e estados de interação

## 1. Execução autorizada e contrato final

Implementação autorizada em 27/10/2026 e continuada em 28/10/2026. A fundação
E10-T01 foi validada com `@fradelli/ui@0.6.0`, publicado oficialmente após as PRs
[19](https://github.com/fradelli/design-system/pull/19) e
[20](https://github.com/fradelli/design-system/pull/20). O catálogo completo contém
1.512 desenhos da Phosphor 2.1.10, consumidos por subpaths públicos individuais.
A PR anterior do Kaizen, [71](https://github.com/fradelli/nextjs-kaizen-app/pull/71),
já foi integrada em developer.

Contrato aprovado: treino guiado e mobilidade usam Play/Pausa/Stop; prática esportiva
e treino específico sem execução iniciada usam CheckCircle para registro direto,
sem cronômetro. O desenho CheckCircle foi aprovado pelo usuário. Mobilidade preserva
a regra vigente de somente comentário. Nenhuma avaliação é preenchida automaticamente.

O teste no navegador revelou uma restrição antiga que rejeitava execuções dentro do
mesmo minuto. A migration `20261028010000_allow_short_training_activity_times` valida
a faixa dos minutos de relógio sem exigir duração fictícia nem impedir a virada do
dia. Timestamps e intervalos continuam responsáveis pela ordem e duração reais.
Não alterar migrations anteriores; rollback de aplicação pode manter essa migration.

As seções seguintes descrevem a especificação e os achados na base auditada. As linhas
referenciadas são da auditoria. Critérios comprovados ficam na tarefa E10-T02.

## 2. Achados concretos

| Achado | Evidência | Efeito no plano |
|---|---|---|
| Dicas muito escuras | `training-exercise.styles.ts:13` usa `bg-background`, abaixo da superfície sólida do exercício | Trocar a superfície local por um token elevado, sem criar nova paleta |
| Contorno retangular interno | `<details>` tem padding horizontal; `<summary>` não tem raio próprio nem foco gerenciado; o DS aplica outline amarelo a elementos não gerenciados | Tratar hover e foco separadamente, com contorno externo arredondado |
| Hover não é a única hipótese | A captura mostra o sintoma; o outline do summary é uma causa compatível com o código | Confirmar mouse, clique e Tab no navegador antes de atribuir tudo ao hover |
| Cursor ausente no Button | DS `src/components/button/index.tsx:8` não declara `cursor-pointer` | Corrigir no DS para todas as variantes e composições habilitadas |
| Hover amarelo atual | Variante default usa `hover:brightness-95` | Adotar alteração de fundo mais sutil, sem desbotar texto/ícone |
| Iniciar ocupa uma linha inteira | `training-activity-controls.tsx:47` retorna Button dentro de um grid | Remover esse gatilho visual e colocar o play no grupo de ações do cabeçalho |
| Registro inline duplicado por localização | Card monta `TrainingActivityControls` antes do corpo e dentro da expansão | Ter um único controlador de encerramento por atividade, independente da expansão |
| Pausa assíncrona para React/storage | `use-training-activity-draft.ts:136` altera state; persistência acontece em effect | Stop precisa receber um snapshot explícito, sem ler um state ainda antigo |
| Horário final atual é o envio | Repositório grava `actualEndMinute` pelo relógio do servidor na finalização | Planejar o instante do stop separadamente do tempo gasto preenchendo o modal |
| Tipos externos têm regra própria | `supportsRetrospectiveTrainingRecord` e repositório diferenciam registro sem cronômetro | Não aplicar o novo player a esses tipos apenas escondendo a regra existente |
| Mobilidade descarta avaliação | Repositório força intensidade/disposição para null em Mobilidade | Exibir esses campos exige também mudar a validação/persistência, se aprovado |

Caminhos completos estão no inventário da seção 9. As imagens fornecidas confirmam
o aspecto visual relatado. Não houve inspeção pós-ajuste de hover/foco nesta revisão.

## 3. Decisões de produto

**Regra corrigida pelo usuário:** atividades como futevôlei não iniciam cronômetro.
Elas abrem diretamente o modal de registro/finalização. Esta orientação substitui
a resposta anterior que permitia player em todos os tipos.

**Regra preservada:** Mobilidade mantém somente comentário, sem ampliar campos de avaliação.

### 3.1 Execução guiada e registro direto têm ações distintas

- Treino do plano usa Play para iniciar, Pausa para interromper, Play para retomar
  e Stop para abrir o registro final. Mobilidade guiada conserva seu fluxo cronometrado
  existente; os campos de avaliação de Mobilidade permanecem os já existentes.
- Prática esportiva e Treino específico, incluindo futevôlei, abrem diretamente
  **Registrar atividade realizada**, sem pausa, intervalos ou horários reais fabricados.
- A distinção vem do tipo e da capacidade já definidos no domínio, não da palavra
  Futevôlei no nome. Não reutilizar a associação automática de aquecimento para
  escolher qual modo de execução um botão oferece.
- Decisão aprovada pelo usuário: usar **CheckCircleIcon** no registro direto, com nome
  acessível Finalizar atividade: NOME. Reservar PlayIcon para iniciar/retomar cronômetro.
- O servidor mantém record_completed próprio para tipos externos: scheduled, sem
  início nem executionDraft, sem preencher horários/intervalos fictícios. Não remover
  a restrição atual de complete só para habilitar um cronômetro que deixou de ser pedido.
- Se existir execução externa histórica com intervalos, preservá-la e permitir concluir
  com seu contrato válido. Não apagar dados/cache antigo nem convertê-los silenciosamente
  em registro sem horário para acomodar a nova apresentação.

### 3.2 Campos de Mobilidade — preservar a regra atual

O modal de Mobilidade mantém somente comentário e null para intensidade/disposição no servidor.
Os demais tipos usam os três campos. O cadastro, aquecimento e a edição de data/horários
permanecem nos seus modais atuais.

## 4. Design System primeiro

### 4.1 Catálogo e contrato público

Concluir o gerador, manifesto, wrappers SSR, exports individuais, tipos, Storybook,
allowlist fechada de tarball e fixtures do plano de ícones. Preservar o agregado
`@fradelli/ui/icons` e os exports antigos; preferir subpaths individuais no Kaizen.
Não instalar Phosphor diretamente no app, criar registry por string ou copiar dist.

Desenhos de ação necessários agora: PencilSimple, Plus, Trash, X, CaretUp, CaretDown,
Play, Pause, **Stop**, ArrowLeft, ArrowRight e ChatCircle; **CheckCircle** é a
recomendação adicional para finalizar sem cronômetro. Barbell/ForkKnife continuam
na navegação. Todos pertencem ao catálogo completo, não a uma lista restritiva do DS.

### 4.2 Cursor e hover do Button

Responsabilidade do DS, pois afeta todos os consumidores:

- Cursor pointer nos botões habilitados de todas as variantes e nos links compostos
  com `asChild`. Desabilitado, aria-disabled e pending não aparentam ação disponível.
- Variante primária: usar aproximadamente **98% de opacidade apenas no fundo amarelo**
  no hover, por exemplo `hover:bg-primary/98`, substituindo brightness-95 nessa variante.
  Validar a classe real gerada pelo Tailwind antes de escolher a sintaxe definitiva.
- Não aplicar `opacity: .98` ao botão inteiro: texto, ícone e foco permanecem íntegros.
- Size controla dimensões; variant continua controlando material/cor. Não alterar
  variantes secundária, outline, ghost ou destrutiva para resolver o amarelo.
- No Kaizen a alteração é imediata, conforme a política sem animações já aprovada.
  O pacote mantém sua política genérica de movimento e reduced-motion.
- Validar hover em dispositivo que realmente suporta hover; touch não ganha estado preso.

Testar cursor computado, cor do fundo antes/depois, texto/ícone sem perda de opacidade,
disabled, pending, foco e Button variant × size no Storybook. É uma correção compatível
patch, que pode acompanhar a minor do catálogo com Changesets claros.

### 4.3 O que não criar no DS nesta tarefa

O DS fornece ícones, Button, Field, Input, AlertDialog, PendingButton e superfícies.
Cronômetro, transporte de treino, rascunhos e formulário de avaliação pertencem ao Kaizen.
Não criar WorkoutPlayer, flags de produto ou um componente de dicas de treino no pacote.
Não há um Disclosure público na versão analisada; preservar details/summary nativos
no app resolve o caso atual sem admitir outra primitive sem necessidade comprovada.

### 4.4 Publicação e upgrade

1. Finalizar os ajustes e gates do DS em branch própria, com conteúdo em inglês.
2. Abrir/revisar a PR do pacote, registrar SemVer e aprovação do contrato público.
3. Integrar pelo fluxo do DS e deixar o Release de main criar a PR de versão.
4. Publicar exclusivamente pelo workflow oficial; nunca npm publish local.
5. Consultar registry e instalar a versão exata publicada no Kaizen pelo pnpm.
6. Conferir export map, tipos, CSS, peers e resolução de `icons/Stop` no artefato instalado.
7. Somente então migrar os ícones/hover no consumidor e seguir para o player.

Enquanto o usuário mantiver esta etapa em planejamento, os passos acima não são executados.

## 5. Dicas de execução: superfície e contorno

Manter a semântica nativa e o texto **Ver dicas de execução**, sem trocar o componente
por um botão que simula disclosure.

- O details passa a ter superfície sólida elevada, pelo token público
  `--fd-color-surface-elevated`, borda pública e o raio da composição atual. A cor
  aparece mais clara que o fundo da página e combina com os campos/superfícies do DS.
- Mover padding horizontal da raiz para o summary e o corpo. O summary ocupa toda a
  largura da área de cabeçalho; o corpo aberto mantém seu próprio inset.
- Hover do summary destaca **a borda do details inteiro**, incluindo curvas. O conteúdo
  não ganha uma segunda moldura retangular; o hover não muda o estado aberto/fechado.
- Foco de teclado destaca o contorno externo do details. Usar seletor restrito ao
  summary com `:has(> summary:focus-visible)`; não acender o bloco por qualquer foco nos
  campos internos. O summary só recebe foco gerenciado quando o anel substituto existir.
- Prever fallback de foco arredondado no próprio summary para navegadores sem :has.
  Nunca remover outline sem oferecer outro indicador visível.
- Fechado: geometria arredondada completa. Aberto: summary com cantos superiores
  coerentes; corpo com separador e espaçamento, sem vazamento de fundo nas curvas.
- Evitar overflow hidden que corte foco. Não adicionar blur em cada disclosure aninhado.
- Cursor pointer no summary; navegação Enter/Espaço e marcador nativo preservados.
- Tratar abertura de toque, mouse, clique seguido de foco e Tab como cenários separados.

A correção é local no Kaizen. O foco global de fallback do DS continua atendendo
outros elementos; não deve ser desativado globalmente para resolver este summary.

## 6. Player no cabeçalho

### 6.1 Estados e ações

| Estado da atividade | Ações de execução | Resultado |
|---|---|---|
| Carregando rascunho | Controles temporariamente desabilitados | Não iniciar outra execução antes da restauração |
| Não iniciada, elegível a execução | Play | Inicia uma única vez, escolhe a etapa de aquecimento existente e expande o card |
| Em andamento | Pausa e Stop | Pausa congela tempo; Stop prepara o encerramento e abre o modal |
| Pausada | Play e Stop | Play retoma; Stop abre o mesmo registro sem criar intervalo ativo |
| Modal aberto | Player sem interação por trás do modal | Não retomar, editar ou excluir enquanto o encerramento é coordenado |
| Salvando | Ações e fechamento bloqueados | Um único envio; estado pendente visível |
| Concluída | Sem play/pausa/stop | Ação textual compacta Corrigir avaliação no cabeçalho abre o modal sem confundir a edição da agenda |
| Não realizada ou fora da janela de execução | Sem ações de execução indisponíveis | Consulta continua funcionando |
| Externa ainda não iniciada | Gatilho de finalização direta; CheckCircle recomendado | Abre registro sem cronômetro e sem criar intervalos |

Grupo recomendado: **Play/Pausa · Stop | Editar · Excluir**. Antes do início, Stop não
aparece e Play fica imediatamente ao lado de Editar. Depois do início, as ações de
execução formam um grupo curto separado das ações de gestão pelo espaçamento.
Excluir permanece destrutivo; Stop representa **encerrar e registrar**, não apagar.

- Phosphor regular, desenhos de 20px; expansão de 16px; navegação de 24px.
- Alvos de 44×44px, incluindo Play, Pausa, Stop, finalização direta, edição e exclusão.
- Labels: Iniciar atividade: NOME; Pausar atividade: NOME; Retomar atividade: NOME;
  Encerrar e registrar atividade: NOME. Não depender de tooltip para nome acessível.
- Ícones decorativos com aria-hidden/focusable; o Button recebe eventos e foco.
- Play inicial pode usar o amarelo primário. Pausa/retomar e Stop usam variantes
  discretas coerentes; Stop não usa o vermelho da lixeira.
- Remover o botão largo Iniciar treino/Iniciar atividade e o formulário inline de
  encerramento. Não manter duas cópias ocultas/controladores concorrentes no card.

### 6.2 Cabeçalho responsivo

Em 320px, quatro ações de 44px mais o cronômetro podem exceder a largura interna do
card. Não comprimir alvos ou título para forçar uma única linha.

- Título e descrição podem ocupar uma linha de layout própria, com min-width: 0 e quebra.
- Cronômetro/status ficam juntos no bloco de metadados; ações formam grupo flexível.
- Em larguras estreitas, ações passam para a linha seguinte; Play/Pausa e Stop nunca
  se separam em grupos distantes. Em desktop podem voltar ao lado do título.
- Nenhuma rolagem horizontal, ícone cortado, sobreposição da lixeira ou salto de layout
  ao alternar Play/Pausa. Reservar dimensões iguais para os dois desenhos.
- A abertura do modal independe de o corpo do card estar expandido.
- Manter startedLocally nos editores/exclusão: uma execução só em cache também impede
  remarcação ou troca de aquecimento como antes. O status ainda scheduled no servidor
  não deve liberar esses campos por engano.

## 7. Stop, tempo ativo e rascunho de execução

### 7.1 Captura segura

Uma função explícita, como `prepareTrainingActivityCompletion`, prepara o snapshot:

1. Bloquear cliques repetidos por uma referência síncrona, antes do próximo render.
2. Capturar um único instante de stop.
3. Se estiver em andamento, fechar só o último intervalo aberto nesse instante e
   mudar o rascunho para paused. Se já estiver pausado, não criar/fechar outro intervalo.
4. Retornar o snapshot resultante diretamente ao controlador; não depender de ler
   execution.draft logo depois de chamar uma função que apenas agenda setState.
5. Persistir o snapshot e atualizar a referência/state usada por timer e formulário.
6. Abrir o modal com esse snapshot. Tempo de leitura/preenchimento não entra no tempo ativo.

Fechar/cancelar o modal deixa a atividade **pausada**. Retomar exige um clique explícito
em Play. Cancelamento não conclui a atividade, não zera séries e não limpa rascunhos.
Novo clique em Stop reutiliza os dados atuais e não duplica intervalos fechados.

Exemplo de aceite: 12 segundos ativos, pausa de 30 segundos, mais 18 segundos ativos
e Stop resultam em 30 segundos de tempo ativo. Dois minutos preenchendo o modal não
mudam esse valor. Se cancelar e retomar depois, somente o novo intervalo entra na soma.

Se o storage falhar, congelar o relógio em memória, informar que a pausa não pôde ser
guardada no navegador e permitir salvar o registro no servidor com o snapshot correto.
Não prometer restauração após reload. Fechamento com dados voláteis exige aviso claro
e nova tentativa de guardar; nunca apagar execução como efeito colateral desse aviso.

### 7.2 Hora real de fim

Decisão técnica recomendada para o novo fluxo: o horário real de fim corresponde ao
clique em Stop, inclusive se o usuário já estava pausado. Tempo ativo continua sendo
a soma dos intervalos, sem pausas nem preenchimento.

- Acrescentar `completionRequestedAt` opcional ao comando de finalização, parser e tipos.
  É preenchido pelo controlador, não por um novo campo editável do formulário.
- O servidor valida ISO, atividade/revisão, início, último intervalo, limite futuro e
  coerência com o horário da requisição. Não confiar no timestamp do cliente sem validar.
- `actualEndMinute` deriva desse instante no fuso America/Sao_Paulo.
- `completedAt` pode manter o instante de confirmação no servidor, preservando a
  semântica atual de finalização/persistência. Documentar a distinção explicitamente.
- Clientes anteriores sem o novo campo mantêm o fallback do servidor; mudança aditiva.
- Registro retrospectivo continua sem fabricar horários reais ou intervalos.
- Durante retry do mesmo envio, manter snapshot e instante de stop; não trocar por agora.
- Não é necessária migration: o modelo já tem horário real e timestamps separados.

Essa recomendação deve ser revisada junto da semântica dos campos existentes antes
de implementar; não corrigir o relógio apenas alterando a copy ou o timer visual.

### 7.3 Conflitos e outra atividade ativa

Preservar a confirmação existente antes de pausar outra atividade e iniciar/retomar
esta. Se a confirmação virar AlertDialog, representar uma intenção pendente antes de
alterar timestamps: não converter uma função síncrona em Promise sem redesenhar seus callers.
Cancelar não altera nenhuma atividade.

Ao abrir/salvar o registro, detectar mudança de revisão, exclusão, alteração do plano
ou gravação local de outra aba. Bloquear o envio de um snapshot desatualizado, manter os
valores preenchidos e oferecer conferência/recarga. Comparação de localStorage não é
um lock transacional; a revisão e o ownership do servidor continuam obrigatórios.

## 8. Modal Registrar atividade realizada

### 8.1 Estrutura e campos

Reutilizar o shell visual/acessível de `TrainingActivityModal`: título, descrição com
nome/data, corpo rolável, X e footer fora do formulário. Não usar Sheet nem outro drawer.

| Campo/ação | Contrato |
|---|---|
| Intensidade | Leve=`low`, Moderada=`moderate`, Alta=`high`; usar valor salvo ou Selecione, sem presumir uma resposta nova |
| Disposição durante a atividade | Cansado=`tired`, Normal=`normal`, Disposto=`energized`; mesmas regras de preenchimento |
| Comentário | Opcional, texto preservado em erro, limite de 1.000 caracteres e normalização atual do servidor |
| Salvar registro | Única ação primária, no canto inferior direito do footer; PendingButton durante envio |
| Mobilidade | Campos dependem da decisão da seção 3; não mostrar valores que serão descartados |

Intensidade/disposição são obrigatórias nos tipos que as exigem. A edição de avaliação
carrega o que já foi salvo. No modo de correção o título pode ser Corrigir avaliação,
mantendo os mesmos campos e a ação Salvar avaliação. O formulário não repete os campos
de cadastro da atividade e não inclui lixeira.

### 8.2 Modos de envio

| Origem | Ação enviada | Dados que acompanha |
|---|---|---|
| Execução iniciada por Play | `complete` | Snapshot de execução, revisão e instante de stop validado |
| Registro direto de atividade externa | `record_completed` | Avaliação e revisão; sem executionDraft/horários inventados |
| Correção de atividade concluída | `update_feedback` | Avaliação e revisão; sem recalcular intervalos ou tempo ativo |

Todos conservam civilDate, activityId e expectedRevision. Workspace e ownership
continuam resolvidos/validados no servidor. Não escolher a action a partir do texto do título.

### 8.3 Fechamento, cache e erro

Criar cache próprio para avaliação, separado do editor de cadastro e da execução:
`kaizen:training-completion-draft:v1:<action>:<civilDate>:<activityId>`.
O segmento action aceita exatamente complete, record_completed ou update_feedback;
atividade e data vêm do card, nunca de um texto digitado pelo usuário.

- Guardar versão, modo, atividade/data, revisão base, valores, escritor e validade.
  Reutilizar a retenção de sete dias e debounce de 400ms do editor como política;
  não forçar valores de avaliação no schema do editor de cadastro.
- Ao fechar: sem mudanças, imediato; com mudanças, flush e fechamento se guardou.
  Se não guardou, oferecer continuar, tentar novamente ou descarte explícito só da avaliação.
- Ao reabrir: restaurar valores compatíveis e avisar que ainda não foram registrados.
  Se a execução foi retomada por ação explícita, capturar um novo snapshot de stop e
  reutilizar somente os valores de avaliação, sem restaurar intervalos antigos.
- Preservar o primeiro instante de stop quando reabrir o mesmo snapshot pausado;
  nova execução/intervalo gera uma nova intenção de encerramento.
- Contexto/revisão divergente, expiração, formato inválido e outra aba têm estados
  claros; não sobrescrever os dados mais novos silenciosamente.
- Em erro de validação/rede/conflito: manter modal, campos, séries e snapshot; mostrar
  mensagem e permitir recuperação apropriada. Retry nunca ocorre automaticamente se
  não for possível saber se o servidor já salvou.
- Durante envio: bloquear X, Escape, backdrop, salvar repetido e ações de execução.
- Limpar os dois rascunhos somente após resposta saved. Efetuar limpeza/fechamento na
  continuação da action antes de refresh/desmontagem, preservando a correção da E06-T25.
- Descartar avaliação, fechar modal ou cancelar confirmação nunca limpa o rascunho de execução.

### 8.4 Exercícios incompletos e foco

Após validar os campos, conservar a confirmação de finalização com exercícios/séries
pendentes. Usar AlertDialog público, com Voltar ao formulário e Salvar mesmo assim.
Cancelar mantém valores e execução pausada; não marcar exercícios como feitos.
Consentimento vale só para o envio confirmado e é limpo após erro/alteração relevante.
Não aninhar forms nem permitir dupla submissão via requestSubmit.

O foco entra no título/campo adequado, permanece no modal e retorna ao gatilho Stop
ao fechar. Confirmação temporária devolve foco ao modal pai, sem disparar fechamento
do pai por Escape. Se o card sair da tela após sucesso, usar o fallback de foco do dia.

## 9. Inventário e integração por arquivo

Os nomes novos abaixo são propostos, não APIs já implementadas. Cada componente
React terá pasta própria; tipos, estilos, hook e utilitários ficam com seu responsável.
Este é um plano de implementação, não um conjunto de arquivos finais para copiar/colar.

### 9.1 Design System — caminhos relativos ao repositório do pacote

| Ordem | Ação | Arquivo | Mudança e verificação |
|---|---|---|---|
| DS-1 | Edit/Review | `scripts/generate-icons.mjs` | Geração determinística/check; validar todos os exports reais e rejeitar arquivos imprevistos |
| DS-1 | Generate/Review | `src/icons/catalog.json`, `src/icons/generated/*.tsx`, `src/icons/index.tsx` | Catálogo completo e agregado compatível, sem registry runtime |
| DS-1 | Review | `src/icons/icon.types.ts`, `src/icons/icons.test.tsx` | Preservar props/ref e desenhos antigos; verificar pesos, SSR e acessibilidade |
| DS-2 | Edit | `src/components/button/index.tsx` | Cursor habilitado e fundo primário 98%, sem mudar size/variant |
| DS-2 | Edit | `src/stories/components/button/Button.stories.tsx` | Ensaios de hover, cursor, disabled, pending e tamanhos com CSS computado |
| DS-2 | Edit | `src/stories/foundations/Icons.stories.tsx` | Exemplos representativos, incluindo Stop; tamanhos/pesos sem montar todo o catálogo |
| DS-3 | Edit/Review | `package.json`, `scripts/validate-package.mjs`, `src/testing/public-exports.test.ts` | Wildcard fechado por manifesto; exports/types/tarball sem aceitar qualquer dist |
| DS-3 | Review | `fixtures/npm-consumer/typecheck.ts`, `fixtures/npm-consumer/smoke.mjs`, `fixtures/pnpm-consumer/typecheck.ts`, `fixtures/pnpm-consumer/smoke.mjs` | Imports individuais e agregado em artefato; NodeNext e React único |
| DS-3 | Review | `fixtures/next-consumer/`, `scripts/test-icon-next-fixture.mjs` | Next restrito à fixture privada, SSR/Client/HMR/build e fonte dos módulos do cliente |
| DS-4 | Edit/Create | `.changeset/complete-phosphor-icon-catalog.md`, `.changeset/button-interaction-states.md`, `docs/governance/iconography.md` | Descrever minor de API e correção de interação; publicar só pelo Release |

### 9.2 Kaizen — fundamentos e dicas

| Ordem | Ação | Arquivo exato | Mudança e verificação |
|---|---|---|---|
| K-1 | Edit/Generate | `package.json`, `pnpm-lock.yaml` | Pin exato da nova versão publicada; exports reais antes dos imports |
| K-2 | Edit | `src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx` | PencilSimple/Plus públicos, preservar ref/guards |
| K-2 | Edit | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx` | Trash público, preservar confirmação e rodapé textual |
| K-2 | Edit | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx` | X público; shell reaproveitado no registro, sem enfraquecer foco/busy |
| K-2 | Edit | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx` | ArrowLeft/Right, ChatCircle e X; preservar séries/comentário |
| K-2 | Edit | `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.tsx` | Imports individuais Barbell/ForkKnife e weight regular |
| K-2 | Edit/Create | `eslint.config.mjs`, `scripts/validate-ui-icons.mjs`, `scripts/validate-ui-icons.test.mjs` | Bloquear origens concorrentes e ícones improvisados em ações via AST; preservar texto de dose e marca |
| K-3 | Edit | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.styles.ts` | Superfície elevada; retirar padding da raiz do disclosure |
| K-3 | Create | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.module.css` | Somente seletores contextuais de hover/foco do disclosure com tokens públicos |
| K-3 | Edit | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx` | Conectar classes ao details/summary/corpo, sem trocar semântica nativa |

Estilos utilitários ficam em styles.ts. O CSS Module novo só se justifica pelos
seletores contextuais do disclosure; não repetir os mesmos estilos nos dois arquivos.
Se a mesma composição puder ser expressa de forma legível apenas por variantes
Tailwind, manter um único arquivo de estilos em vez de criar o módulo.

### 9.3 Kaizen — player e registro

Todos os caminhos desta tabela partem de `src/features/training/ui/`.

| Ordem | Ação | Caminho relativo | Responsabilidade |
|---|---|---|---|
| K-4 | Edit | `hooks/use-training-activity-draft/use-training-activity-draft.ts` | Pausa/snapshot explícito, persistência e retorno de erro sem estado antigo |
| K-4 | Edit | `hooks/use-training-activity-draft/use-training-activity-draft.types.ts` | Tipo de resultado do preparo e API usada pelo controlador |
| K-4 | Edit | `hooks/use-training-activity-draft/use-training-activity-draft.utils.ts` | Função pura para fechar só o intervalo ativo e manter histórico |
| K-4 | Create | `hooks/use-training-activity-completion/use-training-activity-completion.ts` e `.types.ts` | Intenção de stop, snapshot, modo do modal, locks e conclusão; sem acesso ao banco |
| K-4 | Create | `lib/training-activity-completion-draft/training-activity-completion-draft.types.ts`, `.schema.ts`, `.utils.ts` | Cache validado da avaliação, contexto/revisão/validade, separado dos outros rascunhos |
| K-4 | Create | `hooks/use-training-activity-completion-draft/use-training-activity-completion-draft.ts` e `.types.ts` | Carregar, guardar, detectar conflitos, flush/finish sem refatorar o editor existente sem necessidade |
| K-5 | Create | `components/training-day-page/components/training-activity-transport/training-activity-transport.tsx`, `.types.ts`, `.styles.ts` | Renderizar Play/Pausa/Stop conforme estado e callbacks, sem duplicar cronômetro |
| K-5 | Create | `components/training-day-page/components/training-activity-completion-dialog/training-activity-completion-dialog.tsx`, `.types.ts`, `.styles.ts` | Usar TrainingActivityModal e coordenar formulário, footer, confirmação e erro |
| K-5 | Create | `components/training-day-page/components/training-activity-completion-form/training-activity-completion-form.tsx`, `.types.ts`, `.styles.ts` | Três campos condicionados à decisão de Mobilidade, valores e integração da action externa |
| K-6 | Edit | `components/training-day-page/components/training-activity-card/training-activity-card.tsx` e `.styles.ts` | Um controlador por card; transporte no header; layout responsivo; tirar os dois controles inline |
| K-6 | Remove após substituição | `components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`, `.types.ts`, `.styles.ts` | Evitar fluxo antigo concorrente; remover só após todas as chamadas migradas |
| K-6 | Move/Rename | `components/training-day-page/components/training-activity-controls/training-activity-controls.utils.ts` | Manter hasUnfinishedTrainingExercises junto do diálogo de conclusão com nome correspondente; atualizar imports |

Não criar componente de domínio no Design System para reduzir essa lista. Não extrair
um framework genérico de rascunhos durante a troca; a política é compartilhada, mas
os schemas e efeitos de execução, edição e avaliação têm responsabilidades distintas.

### 9.4 Servidor e testes

| Ordem | Ação | Caminho exato | Limite |
|---|---|---|---|
| K-4 | Edit | `src/features/training/application/training-mutation.types.ts` | Campo aditivo de instante de stop e modos existentes; nunca workspace do cliente |
| K-4 | Edit | `src/app/treino/training-actions.ts` | Parser/validação do novo dado, origem e payload preservados |
| K-4 | Edit | `src/features/training/data/prisma-training-repository.ts` | Hora de fim da execução guiada, registro externo sem cronômetro, regra de Mobilidade e atomicidade; sem migration nesta proposta |
| K-7 | Edit | `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.test.tsx` | Pausa/retomada/stop, intervalos, erro de storage e rascunho restaurado |
| K-7 | Edit | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.test.tsx` | Player/labels, inexistência do botão largo, um modal por card e estados |
| K-7 | Edit | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.test.tsx` | Semântica das dicas e conteúdo preservados; estilos computados ficam no navegador |
| K-7 | Create | Testes .test.ts/.test.tsx colocados junto dos novos hooks, cache e componentes acima | Comportamento/falhas relevantes, sem espelhar strings de classes |
| K-7 | Edit | `tests/integration/training-mutations.test.ts`, `tests/integration/training-activity-scheduling.test.ts` | Tempo ativo/fim real, revisão/ownership, registro direto e avaliação; fixtures descartáveis |

## 10. Sequência, dependências e riscos

| Etapa | Resultado/gate | Dependência | Risco principal |
|---|---|---|---|
| 0 | Revisar a distinção entre player guiado e registro externo direto; responder Mobilidade | Nenhuma | Um ícone sugerir cronômetro e executar finalização ou mostrar campos descartados |
| 1 | Concluir catálogo e Button no DS; pacote e tipos aprovados | Plano aprovado para execução | Quebrar API/SSR, importar catálogo inteiro no cliente ou usar toolchain incorreto |
| 2 | Release oficial e upgrade exato; ícones e hover públicos resolvidos | Etapa 1 publicada | App usar API existente só em tarball local |
| 3 | Corrigir disclosure no Kaizen, confirmar hover/foco/superfície | Etapa 2 | Esconder foco ou corrigir apenas a moldura interna |
| 4 | Contratos e snapshot de stop testados; cache da avaliação isolado | Decisões da etapa 0 | Payload antigo, perda de séries, cronômetro contando durante modal |
| 5 | Modal e player integrados, fluxo antigo removido | Etapas 2 e 4 | Duplo controlador/envio ou cleanup antes de confirmar saved |
| 6 | Regressão completa e evidências visuais | Etapas anteriores | Confundir screenshot com prova de persistência/teclado |
| 7 | PR do Kaizen e integração conforme governança | Gates da etapa 6 | Misturar com PR #71 ou declarar checks não executados |

Os helpers puros e contratos são implementados antes de ligar o novo stop no card.
Player/modal só substituem a UI anterior quando todos os modos de finalização funcionarem.
Não encerrar uma etapa apenas porque o código compila.

## 11. Aceite verificável e roteiro de validação futura

### Aparência e acessibilidade

- [ ] Dicas fechadas/abertas têm borda arredondada completa em hover e foco.
- [ ] Tab tem foco visível; mouse/clique não deixam um quadrado interno; :has fallback legível.
- [ ] A superfície das dicas usa token elevado, com texto e separador legíveis.
- [ ] Button habilitado tem cursor pointer; disabled/pending não oferece ação indevida.
- [ ] Hover amarelo altera só o fundo sutilmente; opacity do texto/ícone continua 1.
- [ ] Variantes e tamanhos continuam independentes, sem animações no Kaizen.
- [ ] Ícones Phosphor 16/20/24px corretos e alvos de toque 44px.
- [ ] 320/390/768/1440px e zoom 200% sem corte/overflow; footer visível com teclado.
- [ ] X/Escape/backdrop/foco inicial/Tab/retorno funcionam no modal e na confirmação.

### Execução e persistência

- [ ] Play inicia uma vez; pausa fecha só um intervalo; retomar abre exatamente um novo.
- [ ] Stop em andamento e pausado abre o modal; ler/preencher não soma tempo ativo.
- [ ] Fechar/cancelar deixa pausado; não marca concluído nem limpa exercícios.
- [ ] Reabrir restaura avaliação compatível; retomar e parar novamente usa snapshot novo.
- [ ] Falha de storage/rede/revisão mantém dados e informa a situação real.
- [ ] Salvar só conclui após resposta saved; duplicidade, refresh e desmontagem não perdem cleanup.
- [ ] Instante do stop e instante de salvar têm as semânticas documentadas, inclusive virada de dia/fuso.
- [ ] Exercícios incompletos exigem a confirmação atual; cancelar não marca nada como feito.
- [ ] Registro retrospectivo continua sem horários fabricados; correção não altera tempo ativo.
- [ ] Prática esportiva/Treino específico abrem registro direto, sem iniciar timer, criar intervalos ou inventar horários reais.
- [ ] Treino do plano continua com Play/Pausa/Stop e finalização pelo snapshot correto.
- [ ] O desenho/label da finalização direta comunicam sua ação; CheckCircle permanece a recomendação.
- [ ] A decisão de Mobilidade tem cenários de servidor e UI correspondentes.
- [ ] Editar/excluir/adicionar, aquecimento, remarcação e janelas de edição não regridem.

### Comandos e evidências

No DS, usar Node 24.20.0 e o npm 11.19.0 declarado (por exemplo corepack npm).
O npm global 12 observado na máquina muda o formato do JSON de pack; não tomar esse
erro de toolchain por falha do catálogo nem modificar integridades manualmente.
Executar icons:check, formato, lint, tipos, testes unitários, Storybook build/test,
pack:check, fixtures npm/pnpm/Next e auditoria conforme o gate ci do pacote.

No Kaizen, executar formato, lint, structure:check (incluindo guard de ícones), tipos,
testes focados, cobertura, testes dos scripts, data:check e build. A alteração de
finalização exige integrações PostgreSQL descartáveis. Não usar dados pessoais para
exercitar as ações; leituras de treino atual/futuro podem materializar a agenda.

Navegador: mouse hover sem foco, clique, Tab/Shift+Tab/Enter/Espaço, touch sem hover,
reload de rascunho, outra aba, offline, retry com resultado incerto, modal com erro,
exercício/série/comentário e confirmação. Usar datas/relógio controlados nos testes.

### O que já foi executado antes desta revisão de planejamento

- Kaizen: checks estáticos da migração visual passaram anteriormente; não certificam
  o novo player, que ainda não existe.
- DS: catálogo gerado/check, tipos, lint e 47 testes unitários passaram na etapa anterior.
- Tarball de desenvolvimento: 3.078 arquivos e 1.512 subpaths validados; publint e
  declarações ESM/NodeNext dos exports antigo/novo aprovados.
- Fixtures npm/pnpm do artefato passaram com React único.
- A fixture Next concluiu SSR/Client, hidratação, HMR com estado preservado e build com
  2 e 20 ícones. Os mapas mostraram respectivamente 2 e 20 wrappers no cliente, sem
  trazer o catálogo inteiro ou o caminho CSR da Phosphor. São medições locais, não SLA.
- Storybook completo e gates do Button ainda não têm aprovação final registrada.
- Nenhuma nova versão foi publicada; os requisitos novos de hover/dicas/player não
  foram implementados nem testados nesta revisão.

## 12. Rollback e entrega

Dois conjuntos de mudanças revisáveis: DS (catálogo/estados genéricos) e Kaizen
(pin/integração/dicas/player). A PR de versão é criada pela automação do DS.
Resolver primeiro a integração/base da PR #71, sem reescrever história compartilhada.

Rollback do Kaizen reverte conjuntamente código de consumidor, pin e lockfile para
o estado anterior conhecido. Novo release é imutável; corrigir o DS com outro release,
sem sobrescrever 0.5.1 nem manter dist copiado. Manter leitura de rascunhos anteriores;
rejeitar cache novo incompatível de forma explícita e preservar o treino no servidor.
Nenhum rollback de dados/migrations faz parte desta proposta.
