# Diagnóstico e plano de integração visual do Kaizen com o portfólio

## 1. Resultado e limites desta etapa

**Diagnóstico na base auditada: integração parcial.** A implementação da E10-T01
integrou superfícies de vidro, geometria, tipografia, espaçamentos, foco, campos,
mensagens e navegação seguindo o portfólio. O fundo permanece uniforme, sem estrelas,
partículas ou animações. O conteúdo e as jornadas continuam próprios do Kaizen.

A versão publicada **@fradelli/ui@0.6.0** foi instalada por pin exato após as PRs
[19](https://github.com/fradelli/design-system/pull/19) e
[20](https://github.com/fradelli/design-system/pull/20) do DS. Os ícones individuais
vêm do catálogo oficial de 1.512 desenhos; cursor e hover dos botões vêm do pacote.
A exceção de idade mínima no pnpm autoriza especificamente esse release validado.

A PR anterior [71](https://github.com/fradelli/nextjs-kaizen-app/pull/71) foi integrada
em developer (193dd03). Esta entrega parte dessa base, na branch
`codex/E10-T02-player-portfolio-icons`. A etapa de implementação foi autorizada pelo
usuário; a restrição anterior de somente investigar e planejar foi substituída.

A fundação passou em lint, estrutura, tipos, 377 testes, build e verificação de dieta/
treino em 320, 390, 768 e 1440px com banco sintético. A E10-T02 acrescenta os controles
e o modal; sua validação e a migration de horários curtos são registradas na tarefa.
As demais seções preservam o diagnóstico de 27/10/2026 e suas referências de linha
na base auditada, não um inventário de defeitos ainda abertos.

## 2. Fontes, versões e verificação do contrato

### 2.1 Fontes consultadas

- [Instruções do Kaizen](../../AGENTS.md), [instruções de documentação](../AGENTS.md),
  [tarefa ativa](../../roadmap/ACTIVE.md) e [E06-T25](../../roadmap/epics/E06-training-execution/T25-activity-editor-modals-and-drafts.md).
- [Arquitetura e ownership](../architecture/TARGET-ARCHITECTURE.md),
  [adoção do DS](../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md), manifests, lockfiles,
  CSS público instalado e componentes efetivamente consumidos.
- Portfólio: [site publicado](https://devlucaslima.com/) e checkout de leitura
  `dev-lucas-lima-web`, commit `8f7768717e38cb4db5a47503ea95a87d36795f79`.
- DS: checkout de leitura `fradelli/design-system`, commit
  `dc724ba1e28e607405530b94e100ebd6e2be0323`, e [Storybook público](https://fradelli.github.io/design-system/).
- Documentação correspondente à referência: [guia de migração em v0.5.0](https://github.com/fradelli/design-system/blob/v0.5.0/docs/governance/glass-migration.md),
  tag resolvida para `13e69b2db98a81f600ca049c26b53e111a500a98`;
  changelog do **artefato 0.5.0 instalado no portfólio**, não só o README do checkout atual.
- Export maps, declarações e código emitido de Card, Input, Button, Field, Alert,
  StatusBadge e PendingButton. A inspeção de dist é evidência, não autorização de deep import.

Os caminhos antigos informados para portfólio e DS não existem nesta máquina. Foram
localizados os checkouts correspondentes nos grupos personal e fradelli da árvore de
projetos. Não houve escrita nesses checkouts. O estado Git dos dois estava limpo.
Não inferir o SHA de um deploy pela aparência ou pelo SHA local.

### 2.2 Versões na base auditada e na implementação

| Área | Declarada | Lockfile | Artefato/fonte local | Conclusão |
|---|---|---|---|---|
| Kaizen na base auditada | @fradelli/ui 0.3.0 exato | 0.3.0 | node_modules 0.3.0 | Integração anterior ao vidro |
| Kaizen implementado | @fradelli/ui 0.6.0 exato | 0.6.0 | node_modules 0.6.0 | Catálogo publicado e integrado |
| Portfólio | @fradelli/ui 0.5.0 exato | package-lock 0.5.0 | node_modules 0.5.0 | Referência executável disponível para leitura |
| Repositório DS | package 0.5.1 | Não usado como dependência do Kaizen | Fonte local 0.5.1 | Não confundir com versão instalada/publicada em cada consumidor |
| Deploy do portfólio/Storybook | Não identificado por metadata verificável | Não aplicável | Estilos computados compatíveis com material 0.5.x | Versão/SHA do deploy: **unknown** |

Na investigação, o Kaizen e o portfólio tinham versões distintas. A branch de implementação
atualizou primeiro de 0.3.0 para 0.5.0 e depois para 0.5.1 exato, conforme pedido de
usar a última versão publicada. O upgrade final para 0.6.0 ocorreu após a publicação oficial do catálogo. A patch
0.5.1 registra tradução de metadata/documentação. A comparação das tags em
src/tokens não mostrou alteração visual de componentes/tokens: as mudanças em src
foram traduções de testes. Ainda assim, a referência desta auditoria é **0.5.0**, com
seu artefato e guia; um upgrade posterior precisa de escolha explícita e changelog próprio.

Kaizen: Next 16.4.2, React/React DOM 19.3.0, Tailwind 4.3.3, Node 24.20.0 e pnpm 11.25.0.
Os peers declarados de 0.5.0 aceitam essas versões. Isso comprova compatibilidade
**declarativa**, não um build futuro do Kaizen com o pacote novo já aprovado.

### 2.3 Exports públicos e diferenças relevantes

Comuns a 0.3.0 e 0.5.0: raiz, alert, badge, button, card, cn, field, input, label,
separator, sheet, skeleton, switch, navigation-item, icons, styles.css e package.json.

Adicionados até 0.5.0: **alert-dialog, loading-region, status-badge, pending-button,
popover e radio-group**. Não existem Dialog genérico, Select ou Textarea públicos
nessa versão. O portfólio mantém seu Textarea local; isso não é um export do pacote.

0.4.0 trocou primitives Radix por implementações nativas e acrescentou contratos.
0.5.0 é uma mudança visual incompatível em 0.x: Card fica glass por padrão, padding
vai para a raiz e os slots deixam de acrescentar inset lateral. Instalar sem revisar
composição, overrides, eventos de fechamento e estilos computados não é migração completa.

## 3. Apresentação observada e o que já está adequado

### 3.1 Medidas atuais no navegador

Chrome headless: desktop 1440×900 e celular 390×844. Capturas/JSON estão em
[evidências desta auditoria](evidence/visual-audit-2026-10-27/browser-observations.json).
Os valores são **observações**, não novos tokens a copiar para o app.

| Propriedade | Portfólio publicado | Kaizen /dieta | Referência a conservar |
|---|---|---|---|
| Body | #0B0B0C | #0B0B0C | Background opaco comum |
| Texto | #F4F4F5 | #F4F4F5 | Foreground comum |
| Primária | #F2CF63 | #F2CF63 | Amarelo do mesmo token |
| Fonte | Inter e fallback de next/font | Inter e fallback de next/font | Carregamento único já adequado |
| Card | #141416 com alpha 80% | #141416 opaco | Material glass compartilhado |
| Blur/sombra | 12px; 0/8/32px, background a 25% | Sem blur e sem sombra | Tokens/classes públicos do DS |
| Raio | 16px | 16px | Já coincide |
| Padding/gap | 24px em toda a raiz; gap 16px | Raiz 24px vertical/0 lateral; gap 24px; slots têm inset próprio | Migrar geometria, não somar paddings |
| Títulos de painel | 20/28px, peso 700 | Papel depende de classe local/filho | Aplicar papéis explícitos |

No Storybook, glass e solid default têm padding 24/gap 16 e raio 16. Solid sm usa
padding 16/gap 12, mantendo seu material opaco. Os botões xs/sm/default/lg mantiveram
fundo amarelo e texto escuro; tamanho alterou apenas a geometria esperada.

### 3.2 Aspectos que não precisam ser reconstruídos

- [globals.css](../../src/app/globals.css#L1) já importa Tailwind e styles.css uma vez,
  com @source do dist. Não há motivo para duplicar CSS ou introduzir outra biblioteca.
- [layout.tsx](../../src/app/layout.tsx#L8) carrega Inter via next/font, expõe --font-inter,
  usa html.dark e lang pt-BR. O DS aplica a fonte ao body; não ter className no body
  não é, sozinho, um defeito. A fonte foi confirmada no CSS computado.
- O shell já usa tokens em espaçamentos, bordas e tipografia; possui skip link,
  main identificável e proteção de safe area na navegação inferior.
- NavigationItem mantém estado ativo, nome acessível e alvos de 44px. Os ícones de
  Treino/Dieta já vêm do pacote. Outros ícones são tratados no plano próprio adiante.
- Várias telas já usam Card, Badge, Alert, Input, Field e Skeleton. A integração
  **não está ausente**; o trabalho é atualizar contrato e tirar concorrência local.
- Não houve overflow horizontal nas páginas/capturas atuais inspecionadas em 390px.
  Isso não prova todos os textos longos, cards reais ou teclado físico.
- Prefers-reduced-motion já reduz as transições dos controles atuais do Kaizen.
- /dieta é um placeholder da E07 e / redireciona para /dieta. Não criar funcionalidades
  de alimentação, dashboard ou novas rotas para justificar a migração visual.

### 3.3 Portfólio como referência final; DS como base

A origem de um estilo não determina sua inclusão: uma composição própria do portfólio
pode ser necessária no Kaizen mesmo sem export no pacote. Primeiro reutilizar o contrato
público do DS; depois reproduzir localmente a composição estática que faltar, com tokens
oficiais e responsabilidades claras. Não considerar o trabalho concluído apenas porque
os componentes usam o pacote.

| Referência | Direção para o Kaizen |
|---|---|
| Paleta, Inter, glass, bordas, sombras e controles do DS | Reutilizar os exports e tokens públicos correspondentes |
| Composição estática do portfólio: alinhamentos, hierarquia, espaçamento entre blocos, largura de leitura e tratamento de links | Reproduzir a linguagem visual, ajustando a densidade às tarefas do Kaizen e às larguras de tela |
| Estilos locais do portfólio ausentes no pacote | Incorporar no Kaizen quando necessários à semelhança; documentar origem, função e motivo de não usar um recurso público existente |
| Hover com borda primária e demais cores de interação | Reproduzir a aparência imediatamente, sem animação, escala ou deslocamento |
| AnimatedCard, GSAP, ScrollReveal, estrelas e partículas | Excluir; o estado estático do card continua sendo referência |
| Hero editorial, logos, ilustrações, conteúdo e seções do portfólio | Preservar a identidade e o conteúdo do Kaizen; adaptar a hierarquia visual sem transformar telas operacionais em landing page |

O Kaizen não precisa instalar next-themes: já é dark fixo. Nem deve instalar Lucide,
React Icons ou bibliotecas de animação apenas para reproduzir a aparência. O plano de
Phosphor permanece válido. A exclusão dessas dependências não exclui estilos visuais
próprios do portfólio.

| Elemento | Referência concreta no portfólio | Recurso do DS | Aplicação no Kaizen |
|---|---|---|---|
| Container e ritmo | Products/Professional Summary: `max-w-5xl`, `px-6`, `py-16` | Tokens Tailwind de largura/espaço | Shell e Treino usam 64rem/5xl e 24px horizontais; espaçamento vertical mantém o conteúdo operacional |
| Card externo | Products usa Card default, raiz 24px/gap16, raio16 e hover de borda primária | `Card`, `fd-card`, `fd-surface-glass` | Placeholder usa Card; atividades preservam semântica `<article>` com mesma geometria/material e hover estático |
| Exercício interno | Cards do portfólio conservam superfície e espaçamento sem duplicar blur | `Card surface=solid size=sm` / `bg-surface` | Exercícios e formulários densos usam superfície opaca, 16px e 12px de gap |
| Títulos e corpo | Products: `fd-text-section`, `fd-text-card`, `fd-text-body` | Papéis tipográficos públicos e tokens Tailwind | Kaizen usa papéis por hierarquia, sem trazer o hero de landing page |
| Navegação | Portfolio Navigation: `max-w-5xl`, `px-6`; links do DS | `NavigationItem`, `fd-surface-glass` | Mesmas proporções de largura; dock móvel usa glass elevado com margem de 24px e safe area |
| Botões, campos e badges | Products/Contact: primitives e estados do DS | Button, Input, Field, Badge, PendingButton | Primitives públicos; selects nativos reproduzem o contrato visual do Input porque não há Select no pacote |
| Alertas e mensagens | Contact e estados do portfolio usando material/cores semânticas | Alert, AlertAction, StatusBadge | Erros e estados mantêm conteúdo do Kaizen e usam o layout público de ação |
| Modal de edição | Sem equivalente direto no fluxo editorial do portfólio | Superfície glass elevada e primitivas públicas de confirmação | Modal local mantém foco, Escape, busy, formulário e rodapé; AlertDialog não substitui o formulário |
| Movimento | AnimatedCard adiciona scale/translate, fora do pedido | `fd-card` fornece borda de hover | Hover altera borda imediatamente; sem transição, escala, deslocamento, estrelas ou partículas |

Para elementos sem equivalente no portfólio, como o editor de treino, a aplicação
estende os mesmos materiais, proporções e estados sem alterar as regras do produto.

## 4. Problemas e diferenças por impacto

A tabela descreve os achados na base auditada antes da implementação. Os ajustes
indicados estão em andamento nesta branch; o estado de implementação e os checks atuais
constam na seção 9. Legenda: **C** = confirmado em código/artefato; **V** = medido no
navegador na investigação; **H** = captura histórica da E06-T25, sem reexecutar a operação.
Hipótese de risco não é falha visual confirmada. P0 é bloqueador de uso/legibilidade;
P1 organiza o núcleo da integração; P2 compõe a migração e seus gates.

| ID | Prioridade | Evidência | Arquivo e linha | Problema concreto | Correção recomendada | Responsabilidade |
|---|---|---|---|---|---|---|
| F01 | P0 | C + H | [src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx:89](../../src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx#L89) | Excluir usa text-status-destructive-foreground sobre fundo quase preto. O token resolve para #19080B; contraste calculado com #0B0B0C é 1,01:1. A captura anterior do modal mostra o rótulo quase invisível. | Usar texto destrutivo apropriado para fundo escuro (text-status-destructive) no botão ghost, ou variante pública com seu par correto. Não mudar o token foreground global: ele serve a fundos coloridos. | Kaizen |
| F02 | P1 | C | [src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts:2](../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts#L2) | border-warning/50 e border-info/60 não têm aliases no tema instalado. text-destructive/text-success, bg-card e bg-muted também aparecem na UI sem os aliases correspondentes. Estado visual pode depender da herança em vez da semântica desejada. | Migrar para famílias status/category/surface oficiais e manter o significado de cada estado. Não criar aliases globais antigos para esconder todos os usos. | Kaizen |
| F03 | P1 | V + C | [package.json:37](../../package.json#L37) | Kaizen usa 0.3.0; no Card real da dieta não há blur/sombra e o inset pertence aos slots. Portfólio e Storybook já usam o contrato glass 0.5.0. | Upgrade controlado de artefato e revisão completa da composição; não basta trocar o pin. | Kaizen |
| F04 | P1 | C + H | [src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts:2](../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts#L2) | Atividades e exercícios constroem superfícies próprias com bg-background, bordas, padding e títulos. O painel operacional principal não herda o Card/material compartilhado. | Painel externo em Card glass ou composição com classe pública; exercícios/editores internos solid para evitar blur aninhado. Preservar article, headings e status. | Kaizen |
| F05 | P1 | V + C | [src/components/shared/feature-placeholder/feature-placeholder.styles.ts:4](../../src/components/shared/feature-placeholder/feature-placeholder.styles.ts#L4) | Tipografia resulta de classes locais/filhos: títulos de painel do treino são 16px/600, exercícios 18px/600, enquanto o papel card compartilhado é 20/28px/700. Há também títulos de página com papel não explicitado. | Adotar fd-text-card/section/interface/label/body por função. Manter h1/h2/h3 sem copiar o hero gigante; não reduzir informação crítica para caber. | Kaizen |
| F06 | P1 | C + H | [src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.styles.ts:2](../../src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.styles.ts#L2) | Editor e confirmações usam bg-background, shadow-xl e backdrop preto definidos localmente; material, elevação e títulos não seguem a referência glass. | Reusar superfície pública elevada com geometria/tokens; preservar cabeçalho, corpo rolável, rodapé fixo e guards do editor. Confirmar AlertDialog só onde a semântica de confirmação se aplica. | Kaizen; ausência de Dialog genérico é limite da API, não justificativa para usar drawer |
| F07 | P1 | C | [src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.styles.ts:11](../../src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.styles.ts#L11) | Selects de avaliação usam appearance-none com espaço reservado à seta, sem pictograma substituto. Há estilos repetidos de campos e função Field local, embora Field público já exista. | Manter selects nativos com affordance visível; alinhar fundo/erro/labels/ajuda por tokens e Field/FieldLabel/FieldError públicos. Não trocar select por RadioGroup só para ocupar um export. | Kaizen |
| F08 | P2 | V | [src/app/globals.css:2](../../src/app/globals.css#L2) | No foco por teclado em /foundations coexistem outline branco de 2px e ring amarelo. O controle já fica focado, mas a aparência duplica tratamentos. | Adotar contrato 0.5.0 com fd-focus-managed nos controles públicos; conservar fallback para nativos. Não remover foco global indiscriminadamente. | Upgrade do DS corrige o contrato; Kaizen revisa wrappers locais |
| F09 | P2 | C: risco de upgrade | [src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.tsx:14](../../src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.tsx#L14) | Feedbacks impõem col-start-2 e aninham ação na descrição com mt-4. Em 0.5.0, Alert e AlertAction reorganizam conteúdo/ação. Não foi observado desalinhamento atual na tela de data inválida. | Retirar compensações só após verificar o novo contrato e usar AlertAction para a ação. Manter título/descrição/ação em fluxo, com e sem ícone e textos longos. | Kaizen |
| F10 | P2 | C + referência V | [src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx:135](../../src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx#L135) | Botão alterna rótulos sem reserva de largura. A mensagem Salvando existe, mas o formulário não usa a primitive PendingButton disponível no alvo. | Migrar apresentação pendente para PendingButton quando disponível, preservando formId externo e o controlador de busy. Não alterar o ponto de conclusão/refresh. | Kaizen |
| F11 | P2 | C | [src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.styles.ts:3](../../src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.styles.ts#L3) | Skeleton externo usa bg-card, sem alias válido. TrainingDayLoading não tem consumidor encontrado; não há loading.tsx em treino. Não foi comprovada falha visual de loading no fluxo real. | Auditar a necessidade de boundary real antes de ligá-lo. Quando usado, LoadingRegion + superfície consistente. Não criar atraso artificial ou spinner só para demonstrar primitive. | Kaizen |
| F12 | P2 | C | [src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts:6](../../src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts#L6) | Cabeçalho flex com ferramentas shrink-0 e sem min-w-0 explícito no bloco do título. Nomes muito longos e cronômetro + ações podem disputar largura. Não reproduzido com dados operacionais nesta etapa. | Validar fixtures longas em 320px; corrigir min-width/wrapping somente se o cenário demonstrar problema. Preservar alvos e a ordem das ações. | Kaizen |
| F13 | P2 | C + H | [src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx:42](../../src/features/training/ui/components/training-day-page/components/training-activity-editor/training-activity-editor.tsx#L42) | Há SVG próprio, emojis e caracteres de ação misturados à Phosphor. Não é necessário adotar os outros pacotes de ícone do portfólio. | Executar o plano de iconografia já separado; sua ampliação de catálogo depende de API/release próprios. Não presumir que 0.5.0 expõe ícones que não existem. | Kaizen + evolução planejada do DS |
| F14 | P2 | C | [src/components/shared/app-shell/app-shell.module.css:25](../../src/components/shared/app-shell/app-shell.module.css#L25) | Cabeçalho e navegação têm materiais sólidos locais. A navegação já funciona e respeita safe area, mas a elevação visual difere do ecossistema glass. | Avaliar material elevado na navegação/cabeçalho sem mudar rotas, skip link, posição ou safe area. Não transformar o app numa landing page. | Kaizen |

### 4.1 Tokens: corrigir o nome sem alterar o significado do produto

Referências adicionais: [feedback](../../src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.styles.ts#L3),
[loading](../../src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.styles.ts#L3),
[form de exercício](../../src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.styles.ts#L2).

| Uso atual | Direção de migração |
|---|---|
| text-destructive / text-success | text-status-destructive / text-status-success em texto sobre fundo escuro |
| text-status-destructive-foreground em ghost | Texto destrutivo solid/variante apropriada; foreground escuro é para fundo colorido |
| border-warning/50 | Família status-warning-border conforme estado existente |
| border-info/60 | Família status-info-border conforme estado existente |
| bg-card | Card/surface explícito; não introduzir alias legado |
| bg-muted/40 ou /60 | Surface-interactive/elevated ou fundo de campo, conforme função |
| border-input | **Já existe e é válido**; não substituir indiscriminadamente |
| text-muted-foreground / bg-muted-foreground | **Válidos**; não confundir com bg-muted inexistente |

Cor de conclusão, pausa, prioridade e erro carrega semântica do Kaizen. Migrar para
a família oficial equivalente preservando a regra aprovada. Não trocar azul por
verde, ou uma categoria por outra, apenas porque o nome parece mais conveniente.
A condição deve continuar explicada por texto/ícone, não só por borda/color.

Contraste calculado de F01: #19080B sobre #0B0B0C = **1,01:1**; #FF6673 no mesmo fundo
= **6,93:1**. Foreground normal #F4F4F5 no background = 17,90:1; muted #9B9BA3 em
surface #141416 = 6,67:1. Esses pares não comprovam todos os estados de vidro, blur,
backdrop, disabled ou imagens: a migração precisa medir o resultado composto.

### 4.2 O que não constitui defeito por si só

- rem, calc de viewport, max-width e safe-area são composição responsiva local legítima.
  Não converter todos os números em abstrações novas. Padronizar onde há contrato real.
- O shell de 72rem e conteúdo do treino de 64rem não obrigam copiar todas as seções
  editoriais do portfólio. Conservar uma largura de leitura coerente por função.
- A borda informativa de prioridade e o layout das séries são domínio; não pertencem ao DS.
- Card informativo não deve ganhar onClick, tabIndex ou role=button apenas por ter hover.
- Native date/time e setas de select pertencem ao navegador. Substituí-los por pickers
  customizados só por estética amplia escopo e risco sem benefício demonstrado.
- /foundations tem função de demonstração; precisa refletir o contrato instalado,
  sem virar uma segunda fonte de verdade para tokens e regras do Storybook.

## 5. Comportamento: observado, previsto e não exercitado

[Registro dos estados medidos](evidence/visual-audit-2026-10-27/interaction-observations.json).

| Área | Resultado desta etapa | Consequência para o plano |
|---|---|---|
| Hover de card do portfólio | Borda muda para primária; wrapper aumenta a largura em 2%. Superfície/padding permanecem | Reusar o hover compartilhado; não confundir o wrapper AnimatedCard com Card padrão |
| Expansão no portfólio | Disclosure passou de fechado para aberto com clique, sem envio | Manter disclosure sem mudar semântica para simular uma captura |
| Redução de movimento | Transições caíram de 0,15s para aproximadamente 0,00001s no portfólio e no Kaizen | Conservar preferência; duração quase zero não prova ausência de todo deslocamento estático |
| Botões do Storybook | xs/sm/default/lg amarelos, texto escuro e geometria distinta esperada | Não há bug de material por size confirmado; testar combinações com variant, pending e overrides no consumidor |
| PendingButton | Largura ficou em 154,27px em idle e pending; pending desabilita e expõe aria-busy | Recurso já existe no alvo, sem necessidade de wrapper genérico concorrente |
| Transparência | data-fd-transparency=reduce e media prefers-reduced-transparency trocaram blur 12px por none e fundo opaco | Fallback de preferência confirmado no Storybook; conferir nas telas do app após upgrade |
| Foco do Kaizen | Outline branco + ring amarelo no controle focado por Tab | Remover duplicação pela integração do contrato correto, não por esconder todos os indicadores |
| Data inválida | Feedback e link de retorno legíveis em 390px, sem overflow | Preservar estado e navegação; não seguir o link para hoje durante esta auditoria |
| Treino histórico | Tela sem atividades operacionais exibidas, sem overflow | Não generalizar para cards reais, execução e edição |

### Política de movimento confirmada

A orientação atual do usuário mantém animações e fundo de estrelas fora da referência
a reproduzir. A semelhança deve vir de cores, materiais, geometria, tipografia,
espaçamentos e aparência dos estados, sem animações, partículas, scroll reveal,
scale/translate de hover ou transições animadas nos componentes abrangidos pela migração.
Hover, foco, abertura e feedback continuam funcionando, com mudanças visuais imediatas.

A implementação deve verificar transições e keyframes dos componentes públicos realmente
usados e definir sua desativação no escopo apropriado, preservando visibilidade, eventos,
fechamento e estados pendentes. A versão 0.5.0 não expõe data-fd-motion=off: não consumir
atributo fictício nem ocultar estado funcional para retirar movimento. Registrar qualquer
limitação concreta do pacote e validar também prefers-reduced-motion.

## 6. Etapas de implementação e gates pendentes

A implementação foi autorizada e está sendo executada na E10-T01, em branch separada.
As etapas descrevem o escopo completo; gates não executados permanecem pendentes. A base
contém a E06-T25 já integrada pela PR #71.

### Etapa 0 — Fechar referência e criar baseline reproduzível

- Confirmar se a referência de instalação será 0.5.0 exata, ou uma patch posterior
  explicitamente escolhida após comparar changelog e API. Não usar latest/range.
- Aplicar a política confirmada: sem animações ou fundo de estrelas. Montar a matriz
  de correspondência da seção 3.3, incluindo os estilos locais do portfólio necessários.
- Revisar [arquitetura](../architecture/TARGET-ARCHITECTURE.md), guia de migração do
  release escolhido, export map, peers e estado atual dos três projetos.
- Preparar fixtures e banco descartável **na etapa autorizada de implementação** para
  cards, execução, modais e falhas, sem usar registros pessoais.
- Capturar baseline 320/390/768/1440px de dieta, treino e todos os estados reais.

**Arquivos:** package.json/pnpm-lock.yaml apenas para comparação; documento de evidência
futuro no Kaizen. **Gate:** referência/versionamento e matriz de correspondência definidos; nenhum dado
pessoal necessário. **Risco:** tomar código local mais recente por deploy exato.

### Etapa 1 — Corrigir contraste e aliases com a versão atual

| Arquivo | Alteração recomendada | Aceite |
|---|---|---|
| training-activity-delete-form.tsx, linha 89 | Corrigir a cor de Excluir no modo textual sem mudar action/confirmação | Texto legível em ghost, hover, foco e disabled; teste de contraste |
| training-activity-card.styles.ts | Trocar aliases inexistentes pelas famílias oficiais, preservando mapeamento do produto | Bordas dos estados existem no CSS gerado e mantêm significado |
| training-action-feedback.styles.ts e testes | Corrigir texto de erro/sucesso sem usar foreground de sólido em fundo escuro | Resultado identificado por texto e semântica, não só pela cor |
| training-exercise-form.styles.ts | Substituir bg-muted inválido por superfície/estilo apropriado | Campos não dependem de classe sem CSS |

Os nomes curtos nesta tabela correspondem aos caminhos completos da seção 4 e do
inventário da seção 7. **Dependência:** Etapa 0. **Risco:** trocar semântica operacional
junto com a aparência. **Gate:** testes existentes e contraste passam antes de ampliar o escopo.

### Etapa 2 — Atualizar o pacote e provar a fundação

**Arquivos:** package.json, pnpm-lock.yaml, src/app/globals.css e src/app/layout.tsx;
`src/features/foundations/components/foundations-page` e seus componentes/testes.

- Atualizado o pin pelo pnpm sem editar lock manualmente, copiar dist ou consumir tarball local.
- Preservar importação única, @source e Inter. Não adicionar ThemeProvider desnecessário.
- Validar exports/declarações instalados. Executar fixtures de Card, Button, Input,
  Field, Alert e preferência de movimento/transparência em /foundations.
- Não adicionar fallback com tokens copiados se a instalação falhar. Registrar o bloqueio.
- Provar Button variant × size: default/secondary/outline/ghost/destructive/link e os
  tamanhos usados, com disabled/pending/erro e texto longo. Material deve depender de
  variant; size altera geometria, não pode apagar cor/semântica da variante.

**Dependência:** Etapa 1. **Gate:** fonte/paleta idênticas, contrato público resolvido,
CSS gerado correto, tipo/build/testes passam. **Risco:** 0.3→0.5 atravessa mudanças visuais
incompatíveis e a troca de primitives em 0.4; não tratar como bump trivial.

### Etapa 3 — Material, geometria e tipografia nas telas reais

**Arquivos:** FeaturePlaceholder; AppShell/CSS; AppShellNavigationLinks/CSS;
TrainingActivityCard e styles; TrainingExercise e styles; RestTrainingDay;
TrainingDayPage/styles; editores locais de exercício.

- Painéis principais em Card glass. Preservar article/heading sem usar Card asChild
  inexistente: composição externa ou classe de superfície pública quando fizer sentido.
- Formulários densos, séries e cards internos: solid, geralmente size=sm. Não empilhar
  blur em cada campo, exercício e painel. Material deve degradar para opaco sem perder hierarquia.
- Card default: raiz controla 24px/gap16; compact: 16px/gap12. Remover compensações nos
  slots para não somar padding. Não usar size=sm para mudar glass em solid silenciosamente.
- Adotar papéis: card 20/28, seção 24/32, corpo editorial 16/24, interface 14/20 e label
  14/20. Preservar heading semântico e densidade de metadados; não copiar o hero do site.
- Cabeçalho e navegação podem usar material elevado, com fallback opaco, sem mudar
  posição, rotas, rótulos acessíveis ou safe area.
- Conferir título longo, cronômetro e ações em 320px antes de mudar wrapping/min-width.
  Nenhum layout novo de dashboard nem página de dieta funcional entra nesta migração.

**Dependência:** Etapa 2. **Gate:** comparação visual em reais e estados mostra mesma
família de superfícies/controles, sem inset duplicado ou overflow. **Risco:** perda de
leitura/fluidez com blur aninhado; não compensar falta de estrelas aumentando transparência.

### Etapa 4 — Campos, feedback e estados de espera

**Arquivos:** TrainingActivityForm/styles/PreparationSelect; TrainingActivityControls;
TrainingExerciseForm; TrainingActionFeedback; TrainingDayFeedback;
TrainingDayUnexpectedError; TrainingActivityEditorContent; TrainingActivityEditorNotice.

- Reusar Field, FieldLabel, FieldDescription e FieldError. Remover a função Field
  genérica local de TrainingActivityControls em vez de criar outro wrapper concorrente.
- Selects nativos continuam nativos, com seta/affordance visível e estilo por tokens.
  O pacote não tem Select nem Textarea público em 0.5.0; não inventar imports.
- Usar AlertAction e retirar offsets legados depois de verificar o contrato 0.5.0.
  Testar mensagens longas, com/sem ícone e ação em linha própria.
- Usar PendingButton nos fluxos adequados, preservando type, formId externo, busy,
  guards e labels. Manter texto de erro/rascunho no corpo onde ele já é compreendido.
- LoadingRegion só quando houver operação e boundary real. O TrainingDayLoading
  encontrado está sem consumidor; decidir integração pelo fluxo, não por disponibilidade
  de componente. Não adicionar atraso artificial ou skeleton isolado sem efeito no app.

**Dependência:** Etapa 3. **Gate:** nomes/valores de FormData, revisão, mensagens, foco e
estados conservados; ausência de layout shift relevante em pending. **Risco:** mexer no
momento de conclusão/refresh da E06-T25 ou perder dados ao substituir um botão/form.

### Etapa 5 — Overlays e confirmações com comportamento preservado

**Arquivos:** TrainingActivityModal/types/styles; TrainingActivityDeleteForm;
TrainingActivityControls; hooks de rascunho e editor de séries apenas onde existir confirm.

- Editor de inclusão/edição continua modal, não drawer. Não trocar por Sheet para usar
  um componente disponível. Não usar AlertDialog como formulário genérico de edição.
- Aplicar superfície elevada/título/elevação públicos ao modal local, preservando
  cabeçalho/corpo/rodapé, Tab/Escape, retorno de foco e fechamento guardado por busy/cache.
- Confirmações de excluir/finalizar podem usar AlertDialog público, com testes de
  controlled open/onOpenChange e de cancelamento pendente. Não trocar primitivas às cegas.
- window.confirm ao trocar atividade ativa/zerar série é diferença visual e de UX.
  Migrá-lo só com uma intenção pendente explícita e confirmação antes de alterar
  timestamps/rascunho. Não substituir função síncrona por Promise sem redesenhar o fluxo.
- A decisão de quando pausar, excluir ou limpar séries permanece no Kaizen, nunca no DS.

**Dependência:** Etapa 4. **Gate:** reabrir/fechar/erro/confirmar/descartar não muda dados
indevidamente; modais não somem nem enviam duas vezes. **Risco:** regressão operacional
maior que a diferença estética; essa etapa deve ter PR/revisão própria se necessário.

### Etapa 6 — Regressão e adoção

- Executar a matriz de aceite da seção 8, check de CSS computado e comparação com
  portfólio/Storybook da mesma referência, sem aprovar por screenshot isolada.
- Testar aparelhos reais, preferências de movimento/transparência, foco/zoom e textos longos.
- Benchmark com lista realista de atividades e relógio ativo; observar custo de blur,
  scroll e layout sem alterar tempo ativo, persistência ou regras de negócio.
- Atualizar evidências e registrar limites. PRs, merge e deploy somente com autorização
  correspondente em uma etapa futura; esta auditoria não os executa.

**Dependência:** etapas anteriores. **Gate:** requisitos observáveis aprovados e sem
regressões de negócio. **Rollback futuro:** reverter conjuntamente código/CSS/pin/lockfile
do consumidor. Não alterar dados pessoais, migrations ou versão publicada do pacote.

## 7. Inventário de arquivos e limites de ownership

O inventário lista os arquivos principais da migração; alguns já foram atualizados nesta
branch e os demais ainda precisam de revisão. Review indica preservar quando já atende ao
contrato. Conditional Edit depende de cenário/gate comprovado. Alterar testes somente quando
o comportamento observado exigir; não comparar strings de classes.

| Etapa | Arquivo exato no Kaizen | Ação | Motivo/verificação |
|---|---|---|---|
| 2 | `package.json` | Edit | Pin exato e peers do artefato escolhido |
| 2 | `pnpm-lock.yaml` | Generate | Gerado pelo pnpm quando instalação for autorizada |
| 2 | `src/app/globals.css` | Review/Edit | Import único, @source e regras públicas; sem copiar estrelas |
| 2 | `src/app/layout.tsx` | Review | Preservar Inter, dark fixo, viewport e metadata |
| 3 | `src/components/shared/feature-placeholder/feature-placeholder.tsx` | Edit | Card/slots sem dupla compensação e heading semântico |
| 3 | `src/components/shared/feature-placeholder/feature-placeholder.styles.ts` | Edit | Papel tipográfico explícito |
| 3 | `src/components/shared/app-shell/app-shell.module.css` | Edit | Material do cabeçalho e ritmo por tokens, sem mudar estrutura |
| 3 | `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.module.css` | Edit | Material elevado, contraste/safe area |
| 3 | `src/features/training/ui/components/training-day-page/training-day-page.styles.ts` | Edit | Ritmo de página preservando cabeçalho/data |
| 1/3 | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx` | Edit | Compor Card mantendo article, ações e expansão |
| 1/3 | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts` | Edit | Aliases, material e título |
| 3 | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx` | Edit | Composição sem blur aninhado |
| 3 | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.styles.ts` | Edit | Surface solid, tipografia e detalhes |
| 3 | `src/features/training/ui/components/training-day-page/components/rest-training-day/rest-training-day.tsx` | Edit | Revisar inset e papel do título |
| 4 | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx` | Edit | Field/labels/ajuda preservando valores e integração do editor |
| 4 | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.styles.ts` | Edit | Estilo de campos nativos alinhado |
| 4 | `src/features/training/ui/components/training-day-page/components/training-activity-form/components/training-preparation-select/training-preparation-select.tsx` | Edit | Select/label/ajuda sem alterar escolha |
| 4/5 | `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx` | Edit | Eliminar Field genérico local e revisar confirmação |
| 4/5 | `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.styles.ts` | Edit | Campos, superfície e confirmação |
| 1/4 | `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.styles.ts` | Edit | Cores válidas de texto |
| 4 | `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.tsx` | Review/Edit | Mensagens, pending e papel acessível |
| 4 | `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.tsx` | Edit | Compor AlertAction |
| 4 | `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.styles.ts` | Edit | Remover offsets legados conforme alvo |
| 4 | `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.tsx` | Edit | Erro com ação e título/descrição coerentes |
| 4 | `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.styles.ts` | Edit | Alinhamento sem compensações antigas |
| 5 | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.styles.ts` | Edit | Superfície elevada, sombra e título com footer preservado |
| 5 | `src/features/training/ui/components/training-day-page/components/training-activity-modal/training-activity-modal.tsx` | Review/Edit | Preservar guards, foco e Tab; alteração só por contrato real |
| 1/5 | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx` | Edit | Contraste e composição de confirmação |
| 5 | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.styles.ts` | Edit | Superfície da confirmação |
| 4 | `src/features/training/ui/components/training-day-page/components/training-activity-editor-content/training-activity-editor-content.tsx` | Edit | PendingButton no footer externo, sem alterar controlador |
| 4 | `src/features/training/ui/components/training-day-page/components/training-activity-editor-notice/training-activity-editor-notice.tsx` | Review/Edit | Mensagem transitória consistente mantendo evento e role |
| 1/4 | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.styles.ts` | Edit | Campos e aliases válidos |
| 3/5 | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.styles.ts` | Edit | Legibilidade das séries sem trocar domínio |
| 5 | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx` | Conditional Edit | Confirmar intenção de zerar antes de mudar rascunho |
| 5 | `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts` | Conditional Edit | Alterar somente se migrar confirm síncrono para intenção pendente |
| 4 | `src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.tsx` | Conditional Edit | Somente quando existir boundary real |
| 4 | `src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.styles.ts` | Conditional Edit | Surface/token do loading se integrado |

A pasta `src/features/foundations/components/foundations-page` permanece em componentes
por família. Revisar actions/form/alerts/typography/motion existentes para demonstrar
os contratos do alvo. Não criar catálogo paralelo de todos os componentes do pacote.

Não criar arquivos em data/domain/application/Prisma para esta migração visual. Caso
um teste mostre que isso parece necessário, separar o problema e justificar antes.
Não mover copy, status, datas, DTOs, rascunhos ou regras para o Design System.

### 7.1 Limites do Design System versus ajustes do Kaizen

| Situação | Classificação | Encaminhamento |
|---|---|---|
| Glass/Card/papéis tipográficos já entregues em 0.5.0 | Capacidade existente, não falta de componente | Migrar consumidor, sem duplicar materiais |
| Texto Excluir com token foreground errado | Bug no consumo | Corrigir no Kaizen, não escurecer/clarear globalmente o token |
| Aliases antigos em classes locais | Bug no consumo | Migrar para nomes públicos corretos |
| Select/Textarea/Modal de edição genérico ausentes | Limite da API | Compor localmente com tokens e primitives existentes; avaliar nova admissão só com necessidade real |
| Confirmações nativas do navegador | Decisão/fluxo local | Migrar intenção na UI mantendo o domínio, não criar serviço de treino no pacote |
| PendingButton e AlertAction disponíveis | Recurso não adotado onde é útil | Usar com integração de estado já existente |
| Card size variar fundo sem pedir surface | Não observado no contrato testado | Não abrir correção no DS baseada em suposição |
| Desligamento absoluto de movimento por atributo | API não presente em 0.5.0 | Desativar movimento no escopo dos componentes usados, com regressão de funcionamento; não consumir atributo fictício |
| Catálogo Phosphor completo | Evolução separada já planejada | Seguir [plano de iconografia](ICONOGRAPHY-STANDARDIZATION-PLAN.md); não presumir export por atualizar para 0.5.0 |

## 8. Critérios de aceite verificáveis

### Aparência e composição

- [ ] Comparação lado a lado confirma o Kaizen como extensão visual do portfólio,
  inclusive nas composições estáticas próprias da aplicação de referência; usar o DS
  sozinho não basta para aceitar a entrega. Divergências necessárias à usabilidade
  operacional têm justificativa registrada na matriz da seção 3.3.
- [ ] Fundo opaco e uniforme, cores base/primária/semânticas dos tokens oficiais.
- [ ] Inter carregada uma vez; h1/h2/h3 e papéis tipográficos coerentes, sem copiar o hero.
- [ ] Painéis usam o material do portfólio; 12px blur, borda e sombra vêm do contrato
  público escolhido. As medidas observadas da seção 3 não viram tokens locais duplicados.
- [ ] Card default e sm mantêm inset/gap do release; slots não somam padding antigo.
- [ ] Size modifica a geometria esperada, sem apagar o material/variant. Validar
  glass/solid × default/sm e Button variant × size.
- [ ] Cards densos e aninhados continuam legíveis no modo sólido e no fallback opaco.
- [ ] Não há estrelas, partículas ou animações; hover/foco/abertura/pending mantêm
  estados visíveis imediatos, sem scale, translate ou transição animada.

### Comportamento e negócio

- [ ] Hover/foco/disabled/erro/pending coerentes em todos os controles reais.
- [ ] Pending não causa salto de largura que mova ações; nome acessível reflete o estado.
- [ ] + abre só inclusão; lápis só edição; footer e formulários externos permanecem.
- [ ] Fechar, descartar, recuperar e salvar rascunho conservam valores e bloqueios.
- [ ] Remarcar só após saved, com mesmo ID, horários/aquecimento e regras da janela.
- [ ] Excluir/finalizar têm confirmação adequada e não aceitam envio duplicado.
- [ ] Timer, pausa, retomada, séries, medição e avaliação não mudam pela migração.
- [ ] Dieta continua placeholder até a tarefa funcional correspondente.

### Acessibilidade e responsividade

- [ ] Tab/Shift+Tab/Esc, retorno de foco, foco único visível, labels e descrições testados.
- [ ] Contraste AA dos pares efetivamente compostos: 4,5:1 texto normal, 3:1 texto
  grande e indicadores aplicáveis. Verificar sem depender de blur ou apenas da cor.
- [ ] Aviso, vazio, erro e loading real mantêm região/role apropriados, sem anunciar
  repetidamente relógio/rascunho a cada render.
- [ ] 320/390/768/1440px, zoom 200%, texto longo e landscape sem overflow/corte de ação.
- [ ] Teclado virtual, safe area e scroll de modais em aparelho real; emulação não basta.
- [ ] Prefers-reduced-motion, prefers-reduced-transparency, opt-out documentado e forced
  colors têm resultado legível; validar ausência de animações e preservação dos estados funcionais.
- [ ] Sem suporte a blur/color-mix, fallback é opaco e continua utilizável.

### Qualidade e evidência da implementação futura

- [ ] Manifesto/lock/artefato concordam na versão escolhida; imports só de subpaths públicos.
- [ ] Lint, estrutura, tipos, testes, dados, build e integrações relevantes passam.
- [ ] Comparação visual apresenta mesmos cenários antes/depois, incluindo falhas.
- [ ] Nenhum resultado antigo foi atribuído ao pacote novo sem executar a validação.
- [ ] Sem regressão de desempenho perceptível em lista longa, scroll e relógio ativo;
  medir cenário e ambiente, não impor um orçamento de FPS inventado.

## 9. Verificações da implementação nesta branch

Implementado até o momento: pin exato `@fradelli/ui@0.5.1`; superfícies glass no shell,
atividades, modais e cartões; materiais sólidos nos cartões internos; papéis tipográficos;
Field, FieldLabel e FieldDescription públicos; AlertAction; PendingButton; aliases semânticos;
foco dos selects nativos; layout estático sem transições/animações; alinhamento responsivo
do modal, container 5xl/px6 e navegação existente. As regras, nomes/valores de formulário e ações de negócio
foram preservadas no código editado.

Os checks abaixo pertencem à etapa visual anterior ao último pin 0.5.1; não certificam
o catálogo novo nem o player planejado.

| Verificação após as mudanças visuais iniciais | Resultado |
|---|---|
| `pnpm format:check` | Passou |
| `pnpm lint` | Passou |
| `pnpm structure:check` | Passou |
| `pnpm exec tsc --noEmit --incremental false` | Passou |
| Testes unitários/integração, build e comparação visual pós-migração | Ainda não executados |
| `git diff --check` | Passou |

A tabela seguinte registra as verificações da investigação de referência **antes da
implementação**; suas capturas não demonstram a aparência do código atualizado.


| Verificação | Resultado | Escrita evitada |
|---|---|---|
| pnpm format:check | Passou | Sem --write |
| pnpm lint | Passou | Sem --fix/cache explícito |
| pnpm structure:check | Passou | Validadores de estrutura/camadas |
| pnpm exec tsc --noEmit --incremental false | Passou, exit code 0 | Sem db:generate, emissão ou atualização incremental |
| pnpm data:check | Passou | Validação estática dos dados versionados |
| pnpm exec vitest run --coverage.enabled=false | **52 arquivos, 377 testes passaram** | Sem generate, cobertura em disco ou integração operacional |
| git diff --check | Passou antes e será repetido após o documento | Sem alterar conteúdo |
| Estado Git dos projetos de referência | Limpo nas leituras antes/depois | Referências não foram editadas |
| HTTP das referências públicas | 200 para portfólio e Storybook via navegador/HTTP | Ferramenta textual de web falhou; não foi presumida indisponibilidade do site |

Não executados: instalação, upgrade, prisma generate, build, test:integration,
importação de plano, migrations, publicação ou operações de treino. O build não foi
usado como check nesta etapa porque pode regenerar artefatos/configuração do Next.
Esses testes pertenciam à base da investigação, antes de atualizar o consumidor para 0.5.0.

### Navegador: referência visual acessada antes da implementação

- Portfólio publicado em 1440×900 e 390×844, com material, tipografia, hover,
  disclosure e redução de movimento inspecionados.
- Storybook público: Card/Surfaces, Button/Sizes, Input/States e PendingButton/Interactive.
  Transparência reduzida por atributo e media foi testada na própria página pública.
- Kaizen local em /dieta (desktop/mobile), /foundations (mobile), /treino com data
  inválida e /treino com data histórica fora da janela operacional (mobile).
- Navegador isolado bloqueou requisições POST/PUT/PATCH/DELETE. Nenhum formulário foi
  enviado, nenhuma ação de treino foi disparada e nenhum conteúdo de usuário foi editado.
- A data histórica foi escolhida porque ensureScheduledTrainingDay retorna antes da
  materialização fora da janela passada editável. **Não foi aberto o treino atual/futuro:**
  seu GET pode materializar a agenda. A restrição de escrita prevaleceu sobre essa inspeção.
- O primeiro seletor da captura inválida esperava role=alert e expirou; a página foi
  inspecionada novamente pelo main e capturada corretamente. Isso é erro de seletor
  do teste, não defeito confirmado da aplicação; consta no JSON bruto para rastreabilidade.

## 11. Limitações e pontos que ainda precisam de validação

1. SHA/versão exatos dos deploys públicos não são expostos de forma verificável na
   evidência coletada. Código local + CSS computado não bastam para atribuí-los ao deploy.
2. Os caminhos antigos do portfólio/DS precisaram de localização. Nenhum checkout foi
   modificado; não se presume que o diretório informado e o deploy sejam o mesmo estado.
3. O treino operacional principal, inclusão/edição/exclusão, erro inesperado e finalização
   foram auditados em código. A captura histórica E06-T25 foi apenas consultada para
   contraste; não foi reproduzida nesta etapa nem promovida a evidência atual de fluxo.
4. Não foram feitos testes em aparelho físico, Safari, Firefox, leitores de tela reais,
   baixa GPU, modo sem suporte a backdrop-filter, forced colors ou zoom 200% nesta etapa.
5. O fallback por redução de transparência foi confirmado no Storybook, não num Kaizen
   já atualizado. Ausência de suporte a blur foi verificada em CSS, não em outro navegador.
6. Não houve envio do formulário de contato, requisição operacional ou simulação de
   falha real de banco. Estados de servidor e persistência exigem fixtures na implementação.
7. Contraste foi calculado em pares conhecidos e medido indiretamente por estilos;
   isso não é auditoria WCAG completa nem cobre todos os fundos/transparências.
8. O artefato 0.5.1 foi instalado nesta branch; uma instalação congelada limpa em CI
   e o build do consumidor ainda não foram executados nesta etapa.
9. A exclusão de animações e estrelas foi implementada por uma regra global no escopo
   do Kaizen; estados hover/foco/pending foram conferidos no código, mas ainda precisam
   de validação visual e manual após a migração.
10. Catálogo completo de ícones e evolução do Design System têm plano próprio; não
    misturar silenciosamente essa API futura com o contrato 0.5.0 analisado.

### Evidências documentais

- [Métricas computadas e capturas](evidence/visual-audit-2026-10-27/browser-observations.json).
- [Interações e preferências](evidence/visual-audit-2026-10-27/interaction-observations.json).
- [Portfólio desktop](evidence/visual-audit-2026-10-27/portfolio-desktop.png) e
  [mobile](evidence/visual-audit-2026-10-27/portfolio-mobile.png).
- [Kaizen dieta desktop](evidence/visual-audit-2026-10-27/kaizen-dieta-desktop.png) e
  [mobile](evidence/visual-audit-2026-10-27/kaizen-dieta-mobile.png).
- [Foundations mobile](evidence/visual-audit-2026-10-27/kaizen-foundations-mobile.png),
  [data inválida](evidence/visual-audit-2026-10-27/kaizen-treino-invalid-mobile.png) e
  [treino histórico](evidence/visual-audit-2026-10-27/kaizen-treino-historical-mobile.png).
- [Storybook superfícies](evidence/visual-audit-2026-10-27/storybook-cards.png),
  [tamanhos de botão](evidence/visual-audit-2026-10-27/storybook-button-sizes.png) e
  [campos](evidence/visual-audit-2026-10-27/storybook-inputs.png).

Todo material novo desta etapa permanece na documentação do Kaizen. A auditoria não
altera a arquitetura aprovada, não agenda trabalho externo e não constitui aprovação
para implementar, publicar ou promover a aplicação.

## 12. Ampliação solicitada: ícones, hover, dicas e player

O usuário solicitou a última versão publicada, o catálogo completo Phosphor e, em
seguida, pediu planejar também o player e o modal de registro. A ordem passa a ser
**DS → release oficial → upgrade exato → ícones/hover/dicas → player/modal → regressão**.
Não restringir a implementação à referência histórica 0.5.0. Essa referência continua
válida como evidência da auditoria e da linguagem visual, não como teto de versão.

O [plano de player e registro](TRAINING-ACTIVITY-PLAYER-AND-FEEDBACK-PLAN.md) é a fonte
para estados, cronômetro, cache de avaliação, decisão de Mobilidade pendente,
inventário por arquivo e aceite dos novos ajustes. O [plano de ícones](ICONOGRAPHY-STANDARDIZATION-PLAN.md)
continua sendo a fonte do catálogo e da proteção de imports. Não implementar a nova
regra de Mobilidade antes de responder a decisão indicada nesse plano. A orientação mais recente reserva o
player à execução guiada e mantém futevôlei/atividades externas em registro direto, sem
cronômetro; ela substitui a resposta anterior que ampliava o player a todos os tipos.
