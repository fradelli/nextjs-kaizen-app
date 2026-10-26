# Plano de adoção visual do Fradelli Design System no Kaizen

## Estado e limites

Nota de preservação em 26/10/2026: proposta registrada em commit por solicitação
do usuário durante a limpeza local. O registro não autoriza sua implementação;
os limites abaixo descrevem a investigação original de 22/10/2026.

- Data da investigação: 22/10/2026.
- Estado: **proposta para aprovação; implementação não autorizada**.
- Base consultada do Kaizen: `d56219f`, com alterações locais preexistentes. Revalidar o inventário contra a base integrada antes de implementar.
- Resultado desta etapa: planejamento documental. Nenhuma instalação, alteração da aplicação, commit, push, merge ou deploy.
- Não é um guia de código pronto para copiar. O contrato de movimento proposto ainda não existe no pacote e sua versão de entrega é `unknown`.
- A tarefa selecionada em [ACTIVE](../../roadmap/ACTIVE.md), E06-T22, está DONE e não corresponde a esta investigação. Não reabri-la, reutilizar seu ID ou alterar sua aprovação. O novo trabalho precisa de registro próprio antes das PRs futuras.
- Alterações preexistentes em `README.md`, `next-env.d.ts` e `kaizen-project-context.md` foram preservadas. Este documento fica como rascunho no checkout atual; não representa entrega na branch da tarefa anterior.

**Decisões do usuário:** mesma identidade visual do portfólio; fundo sólido, uniforme e opaco; nenhum movimento decorativo ou transição; vidro estático permitido; preservar funcionalidades; referências externas somente para leitura.

**Recomendações deste plano:** evolução compartilhada para movimento desativado; cards externos em vidro e conteúdo denso em superfícies sólidas; migração em seis etapas dependentes, com validação integral antes da promoção.

## Entradas e evidências

A solicitação amplia a rota mínima de contexto para auditar a aplicação inteira. Foram consultados os caminhos abaixo, sem leitura recursiva de dados ou documentos de outros épicos:

- [AGENTS.md](../../AGENTS.md), [instruções de documentação](../AGENTS.md), ACTIVE e a tarefa E06-T22 apontada por ele.
- [Arquitetura alvo](../architecture/TARGET-ARCHITECTURE.md), especialmente semântica, organização React, Server/Client, segurança e ownership visual.
- [Decisão de adoção compartilhada](../decisions/SHARED-DESIGN-SYSTEM-ADOPTION.md). Seu inventário de `0.1.0` é histórico; não descreve a instalação atual.
- [Manifesto](../../package.json), [lockfile](../../pnpm-lock.yaml), `.node-version`, `next.config.ts`, `.npmrc` somente quanto ao mapeamento de registry, [CI](../../.github/workflows/ci.yml), [template de PR](../../.github/pull_request_template.md) e `vitest.setup.ts`.
- Rotas em `src/app`, shell em `src/components/shared/app-shell`, placeholder em `src/components/shared/feature-placeholder`, componentes de `src/features/foundations/components/foundations-page`, UI de treino em `src/features/training/ui` e dependências diretas mencionadas neste plano. O inventário de alteração ao final explicita os caminhos.
- `src/features/training/domain/training-edit-window.ts`, `src/app/treino/training-actions.ts`, hooks de rascunho e cronômetro, testes de UI relacionados e `tests/integration/training-mutations.test.ts` e `training-projections.test.ts`.
- Artefato instalado `node_modules/@fradelli/ui/package.json` e `dist`: versão e contratos realmente disponíveis no Kaizen.
- Referência de leitura **dev-lucas-lima-web**: `AGENTS.md`, `package.json`, `node_modules/@fradelli/ui/package.json`, componentes e CSS públicos do pacote instalado, `src/app/layout.tsx`, `globals.css`, `portfolio-theme.css`, `src/components/shared/animated-card/*` e estilos/componentes de About, Products, Journey, Skills e navegação em `src/features/portfolio/ui/components`.
- Referência de leitura **design-system**: `AGENTS.md`, `package.json`, `CHANGELOG.md`, `src/styles/styles.css`, `tokens.generated.css`, componentes públicos pertinentes em `src/components/<família>/index.tsx`, ADRs 0001–0005 e `docs/governance/glass-migration.md`.

Referências normativas externas: [ADR 0001](https://github.com/fradelli/design-system/blob/main/docs/decisions/0001-shared-design-system-foundation.md), [ADR 0002: primitives nativas](https://github.com/fradelli/design-system/blob/main/docs/decisions/0002-native-accessible-primitives.md), [ADR 0003: vidro](https://github.com/fradelli/design-system/blob/main/docs/decisions/0003-shared-glass-visual-language.md), [ADR 0004: composição](https://github.com/fradelli/design-system/blob/main/docs/decisions/0004-consistent-component-composition.md), [ADR 0005: adoção por etapas](https://github.com/fradelli/design-system/blob/main/docs/decisions/0005-staged-glass-release.md) e [guia de migração](https://github.com/fradelli/design-system/blob/main/docs/governance/glass-migration.md). Links em `main` são mutáveis; a implementação deve registrar o release exato consumido.

### Comparação com a apresentação publicada

O [portfólio publicado](https://devlucaslima.com/) foi aberto no navegador e comparado com as fontes locais. Foram observados hero, About, Projects, cards de experiência, navegação, expansão de contribuições e foco por teclado. O [catálogo publicado, Card/Surfaces](https://fradelli.github.io/design-system/?path=/story/components-card--surfaces) foi aberto e observado com variantes glass e solid. A navegação do catálogo expõe também as famílias de formulários, overlays e estados. Isso não equivale a testar todos os seus estados.

Valores computados no portfólio, em uma amostra real de Card:

| Aspecto          | Evidência observada                                                                                      | Destino no Kaizen                                                            |
| ---------------- | -------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Fundo do body    | `rgb(11,11,12)`, correspondente a `#0B0B0C`                                                              | `--fd-color-background`, opaco, incluindo a área de overscroll               |
| Texto e primária | `#F4F4F5` e `#F2CF63`                                                                                    | Tokens foreground e primary, sem redefinição local                           |
| Fonte            | Inter e fallback de `next/font`                                                                          | Manter o carregamento único já existente                                     |
| Card             | superfície `#141416` a 80%, blur 12 px, borda derivada do neutro a 24%                                   | Card glass ou classe pública de superfície                                   |
| Geometria        | padding 24 px, gap 16 px, raio 16 px                                                                     | Contrato da raiz de Card default                                             |
| Sombra           | deslocamento 0/8 px, blur 32 px, background a 25%                                                        | Token compartilhado, sem copiar a fórmula                                    |
| Hierarquia       | seções 24/32, títulos de painel 20/28, corpo 16/24 nas fontes locais                                     | Papéis públicos correspondentes                                              |
| Estados          | primária na seleção, foco amarelo em disclosure, expansão funcional; wrapper AnimatedCard desloca/escala | Preservar aparência e significado dos estados; mudança instantânea no Kaizen |

Os números acima são evidências, **não uma nova especificação de tokens**. O pacote continua sendo a fonte normativa. No fundo sólido, o vidro terá profundidade mais sutil que sobre as estrelas do portfólio. Não aumentar transparência, adicionar gradientes ou decoração para simular a cena original.

Limites: o formulário público não foi enviado; hover e todos os estados de falha/carregamento não foram exercitados no site. Seus estilos foram inspecionados em código. Não foi possível consultar o estado Git dos dois repositórios de referência por restrição de acesso; seus commits e a correspondência exata do deploy são `unknown`. A versão local do portfólio foi confirmada no manifesto e no artefato instalado, sem atribuir essa versão ao deploy apenas pela aparência. As páginas públicas não estavam acessíveis pela ferramenta textual de web; a inspeção foi concluída pelo navegador.

## 1. Diagnóstico do Kaizen

### Stack, tema e distribuição

| Item                   | Fato encontrado                                                                                                       | Implicação                                                                                                       |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Aplicação              | Next.js 16.3.8 App Router, React/React DOM 19.3.0, TypeScript 6.0.3                                                   | Manter aplicação full-stack e Server Components por padrão                                                       |
| Runtime e pacotes      | Node pinado em 24.20.0; pnpm 11.25.0                                                                                  | Satisfaz engines declarados do pacote de referência                                                              |
| Design System          | `@fradelli/ui` **0.3.0**, pinado no manifesto, lockfile e node_modules                                                | Não é uma primeira adoção; é atualização de contrato e remoção de concorrência local                             |
| Referências            | Portfólio e fonte do DS em **0.5.0**; portfólio também tem o artefato 0.5.0 instalado                                 | Base visual conhecida; não presumir que 0.5.0 cumpre ausência de movimento                                       |
| CSS                    | Tailwind 4.3.3, PostCSS 8.5.28; `globals.css` importa Tailwind e CSS público uma vez, com `@source` para dist         | Preservar importação e detecção de classes; validar CSS gerado após atualizar                                    |
| Fonte e tema           | `Inter` em `next/font/google`, variável `--font-inter`; `html.dark`, `lang=pt-BR`                                     | Já alinhados; nenhum ThemeProvider adicional é necessário                                                        |
| Biblioteca concorrente | Nenhuma outra biblioteca de UI direta no manifesto do Kaizen                                                          | Há duplicação em código local; Radix é transitivo do DS 0.3.0                                                    |
| Segurança              | Server Actions validam entradas e origem e resolvem workspace no servidor                                             | Migração visual não muda fronteiras, ownership, revisão ou payloads                                              |
| Acesso ao pacote       | Scope público aponta a GitHub Packages; CI declara `packages: read`, setup de registry e referência a segredo efêmero | Não ler credenciais locais nem seus valores; instalação limpa futura ainda precisa provar autorização ao release |

Peers de 0.5.0: React e React DOM `>=19.2.7 <20`, Tailwind opcional `>=4.3.0 <5`; Node `>=24.20.0 <25`. As versões declaradas pelo Kaizen estão dentro desses intervalos. Isso comprova compatibilidade declarativa, não um build já validado com o upgrade.

A passagem por 0.4.0 importa: Radix foi substituído por primitives nativas; Sheet passa a usar `<dialog>.showModal()`, backdrop e top layer nativos. Mudar só a versão sem validar foco, fechamento, testes e composição é insuficiente.

### Rotas e funcionalidades realmente presentes

| Rota/área                 | Estado atual                                                                                                             | Proposta visual e preservação                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `/`                       | Redireciona para `/dieta`                                                                                                | Preservar destino; não criar dashboard                                                              |
| `/dieta`                  | `FeaturePlaceholder` com Card, título, descrição e Badge; promete implementação futura E07                               | Mesmo vidro e hierarquia do portfólio; não criar refeições, formulários ou registros                |
| `/treino?date=YYYY-MM-DD` | Rota servidor resolve data, consulta workspace e compõe ações, agenda e conteúdo                                         | Toolbar legível, resumo e navegação estáveis; preservar query, canonicalização e `prefetch={false}` |
| Treino/agenda             | Sheet para adicionar, editar e excluir; quatro tipos: treino do plano, prática esportiva, treino específico e mobilidade | Sheet sólido; itens compactos sólidos; controles comuns; sem animar abertura                        |
| Treino/atividade          | Expandir, preparar/treinar, iniciar, pausar, retomar, concluir, avaliar e corrigir                                       | Card glass externo; título sem tornar todo painel clicável; manter badges e ações explícitas        |
| Treino/exercícios         | Prescrição, dicas, prioridade, medidas, séries por lado/direção, carga aplicável, comentários e correções                | Cards sólidos compactos e campos legíveis; preservar unidades, sequência e condições de habilitação |
| Treino/retrospectivo      | Atividades elegíveis sem início podem ser registradas como realizadas sem cronômetro                                     | Identidade comum, sem exigir horários reais ou inventar timer nesse fluxo                           |
| Treino/feedback           | Descanso, sem atividade, plano indisponível, dado inválido, data inválida e erro inesperado com retry                    | Alertas semânticos e ações no slot adequado; nenhum estado fica oculto por remover movimento        |
| `/foundations`            | Página real de demonstração de tokens, tipografia, formulário, ações, alertas, Skeleton e Sheet                          | Transformar em prova do contrato estático usado no Kaizen; corrigir badge desatualizado `0.1.0`     |

Não foram encontradas telas operacionais de alimentação, hábitos, rotina, tarefas, tabelas, menus dropdown, popovers, toasts ou central de notificações. Não há rota de API no inventário atual de `src/app`. Não implementar essas famílias por inferência a partir da arquitetura alvo. Listas existentes são de atividades, exercícios, dicas e amostras de foundations.

Idioma da interface: **pt-BR**. A marca contém `改善` com `lang=ja`; há conteúdo importado e identificadores técnicos em inglês. `en-US`/`en-CA` usados para decompor datas não representam suporte a idioma inglês na UI. O portfólio é bilíngue; não copiar seu provider de i18n.

`TrainingDayLoading` existe, mas a busca de referências encontrou apenas sua definição; não há `src/app/treino/loading.tsx` nem consumidor atual identificado. Tratar como componente sem uso, não como fallback já funcionando. Não adicionar uma rota de loading apenas para justificar o componente.

## 2. Contrato público e mapeamento de componentes

Exports comuns aos manifestos 0.3.0 e 0.5.0: raiz, `alert`, `badge`, `button`, `card`, `cn`, `field`, `input`, `label`, `separator`, `sheet`, `skeleton`, `switch`, `navigation-item`, `icons`, `styles.css` e `package.json`.

Exports adicionais no manifesto 0.5.0 consultado: `alert-dialog`, `loading-region`, `status-badge`, `pending-button`, `popover` e `radio-group`. Usar subpaths públicos; nunca `dist/...` como import da aplicação. A leitura do artefato interno nesta investigação não autoriza dependência de sua estrutura privada.

| Elemento local                                                       | Recurso público proposto                                                                                         | O que continua no Kaizen                                                                                    |
| -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| AppShell e navegação                                                 | NavigationItem, icons; `fd-surface-glass-elevated` apenas se a leitura da navegação permanecer estável           | Logo, skip link, rotas ativas, query da data, posição desktop/mobile, safe area e largura                   |
| FeaturePlaceholder e RestTrainingDay                                 | Card e slots; títulos nos papéis públicos                                                                        | Copy, semântica do estado e composição                                                                      |
| TrainingActivityCard                                                 | Card glass e slots; manter `article` externo quando necessário, pois Card renderiza `div` e não possui `asChild` | Regras de expansão, status, etapas e composição de exercício/cronômetro                                     |
| TrainingExercise                                                     | Card `surface="solid" size="sm"`, dentro de `article`, ou superfície por tokens se composição não exigir Card    | Prescrição, `h3`, prioridades, detalhes e editores; sem blur interno                                        |
| TrainingActivityForm e campos de avaliação                           | Field, FieldLabel, FieldDescription, FieldError e Input                                                          | Nomes e valores FormData, condicionais de atividade, validação do produto e selects nativos sem equivalente |
| Função local `Field` dentro de TrainingActivityControls              | Field/FieldLabel públicos                                                                                        | Eliminar wrapper genérico concorrente; manter grid local                                                    |
| Confirmações de excluir e finalizar com pendências                   | AlertDialog com título, descrição, cancel e action públicos                                                      | Intenção, formulário, revisão, resultado e regra de confirmação                                             |
| `window.confirm` ao iniciar/retomar outra atividade e ao zerar série | AlertDialog na UI, com intenção pendente no hook/estado do consumidor                                            | Momento da pausa, timestamps, cancelamento e limpeza condicional; não mover storage para o DS               |
| TrainingAgendaDrawer e FoundationsSheetExample                       | Sheet público existente                                                                                          | Conteúdo, edição da agenda e labels em português                                                            |
| TrainingActionFeedback e feedbacks de página                         | Alert/AlertTitle/AlertDescription/AlertAction, ou texto com papel status para mensagens curtas                   | Mapeamento dos resultados e mensagens; evitar alertas assertivos repetidos                                  |
| Botões que enviam formulários                                        | PendingButton após contrato estático, com pendingLabel visível; Button para ações instantâneas                   | `pending`, `disabled`, submit, sucesso/erro e proteção contra envio duplicado                               |
| Badges de status                                                     | StatusBadge onde houver status e tone; Badge para categorias e metadados                                         | Dicionários de status e significado das cores no domínio                                                    |
| Skeletons de foundations                                             | Skeleton estático + LoadingRegion quando houver operação real                                                    | Explicação de demonstração, sem anunciar operação fictícia indefinida                                       |
| Temporizador e indicador de prioridade                               | Tokens de texto, `tabular-nums`; sem equivalente composto público                                                | Cálculos, intervalos e semântica de prioridade                                                              |
| `details`/`summary`, listas e `dl`                                   | HTML semântico e papéis/tokens públicos                                                                          | Conteúdo e comportamento nativo; não criar Accordion ou Table sem necessidade                               |

O Card tem padding **somente na raiz**: default 24 px/gap 16 px; sm 16 px/gap 12 px. Header/Content/Footer não adicionam insets horizontais. Glass e solid compartilham geometria. Não acrescentar `px-6` aos slots, compensações negativas ou `p-0` para restaurar a composição antiga. Não adicionar tabIndex ou role de botão ao Card informacional. Títulos continuam sendo headings reais; CardTitle isoladamente é `div`.

Os tamanhos de botões agora permitem quebra de texto e usam altura mínima para variantes de texto. Revisar `h-auto`, `p-0`, larguras de campos e alinhamentos; não restaurar altura fixa se cortar rótulos. AlertAction ocupa linha própria; remover `col-start-2` herdado onde a composição de Alert não o requer.

## 3. Inventário de estilos: remover, substituir e manter

| Evidência atual                                                                                                                              | Ação futura e justificativa                                                                                                                                                     |
| -------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `training-activity-card.styles.ts`: `rounded-xl`, `border-warning/50`, `bg-background`, `p-4`; conclusão `border-info/60`                    | Substituir material/geometria por Card. Status usa tokens `status-*` e texto; a borda de hover não pode apagar o único sinal de status                                          |
| `training-exercise.styles.ts`: painel manual com raio/borda/padding, `bg-background/60` em dicas                                             | Substituir superfície por solid compacto; manter borda de prioridade/status se necessária, definida por token público, além de rótulo                                           |
| Mesmo arquivo: `transition-colors` no summary                                                                                                | Remover transição; manter hover/foco instantâneos                                                                                                                               |
| `training-activity-controls.styles.ts` e `training-activity-delete-form.styles.ts`: mesma fórmula de dialog, sombra e `backdrop:bg-black/70` | Remover após migração a AlertDialog; não duplicar backdrop ou portal                                                                                                            |
| `training-activity-form.styles.ts`, controls e exercise-form: `control`, `label`, field e fundos manuais                                     | Substituir wrappers/labels por Field e controles públicos disponíveis. Select fica explícito como lacuna; eliminar entradas de estilo sem consumidor após confirmar referências |
| `training-action-feedback.styles.ts`: `text-success`, `text-destructive`                                                                     | Substituir por variantes semânticas públicas ou `text-status-*` válidos; preservar texto e anúncio acessível                                                                    |
| `training-agenda-drawer.styles.ts`: `bg-muted/20`, editor/add com bordas locais; `body` com `px-4 pb-6`                                      | Itens sólidos; revisar padding real de Sheet 0.5.0 (Content já usa `p-6`) e remover inset acumulado no corpo                                                                    |
| `training-local-exercise-editor.styles.ts`: painéis de campos/comentário manuais                                                             | Manter layout de medidas e sequência; substituir material pelo sólido compartilhado, sem aninhar blur                                                                           |
| `training-day-loading.styles.ts`: `bg-card`, `p-5` e Skeleton pulsante no componente sem consumidor                                          | Propor remoção do par de arquivos após confirmar ausência de imports. Não criar carregamento artificial                                                                         |
| `feature-placeholder.styles.ts`: título `text-2xl font-bold` dentro de CardTitle                                                             | Declarar papel section para título de página ou usar papel card quando for painel; evitar escala acidental herdada                                                              |
| Foundations typography/actions/colors/header                                                                                                 | Usar papéis públicos em títulos/corpo e demonstrar glass/solid com a mesma geometria; manter grid e amostras categóricas                                                        |
| Shell CSS Modules                                                                                                                            | Manter grid, breakpoint de 48rem, larguras 72rem/24rem, safe-area, posicionamento e foco do skip link; revisar brand usando papel compartilhado                                 |
| DateNavigation, AgendaBadges, ActivitySection, Timer                                                                                         | Manter composição, gaps, tabular-nums e quebra responsiva; não mover regras de data ou duração para estilos                                                                     |
| ExercisePriorityIndicator                                                                                                                    | Manter barras/contrato e nome acessível; tokens existentes, sem recriar uma primitive genérica                                                                                  |

A busca encontrou classes locais **sem alias no CSS público consultado**, já em 0.3.0: `border-warning/50`, `border-info/60`, `text-success`, `text-destructive`, `bg-muted/*` e `bg-card`. Confirmar a emissão no CSS compilado; a hipótese é de estilos ausentes, não uma regressão exclusivamente de 0.5.0. Corrigir os consumidores para recursos públicos; não criar aliases globais para perpetuar a nomenclatura antiga.

Não foram encontrados hexadecimais, fórmulas de vidro ou keyframes próprios no código visual do Kaizen. Há números de layout legítimos, como 72rem, 5rem para compensar navegação, larguras de medidas e breakpoints. Não transformar todo número em token novo. Substituir valores quando competem com papel visual compartilhado; manter dimensões específicas do consumidor quando necessárias e verificadas.

## 4. Política de fundo, transparência e movimento

### Fundo e superfícies

1. Garantir background de `html` e `body` por `--fd-color-background`, sem opacidade, gradiente, imagem, canvas ou camada decorativa. O body já recebe fundo pelo pacote; revisar a cobertura da raiz/overscroll sem redefinir a paleta.
2. Inter permanece uma única vez no root; tema dark estático, sem importar o provider do portfólio.
3. Card glass para agrupamento principal de atividade, descanso, placeholder e demonstrações. Uma camada de blur por painel. Sem vidro individual para cada série, campo, Badge ou linha.
4. Card solid para exercícios e editores dentro de atividade; Sheet e AlertDialog mantêm superfície opaca pública. Navegação fixa pode usar elevada por token/classe pública, com teste sobre conteúdo rolando; usar sólida se houver perda de leitura ou custo.
5. Preservar fallbacks do pacote: ausência de suporte a blur/color-mix, `prefers-reduced-transparency`, `forced-colors` e `html[data-fd-transparency="reduce"]`. O atributo de transparência existe; não equivale a desligar movimento.

### Inventário de movimento

| Origem                       | Movimento encontrado                                                                                                            | Plano                                                                                 |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Kaizen                       | `transition-colors` no summary de dicas                                                                                         | Remover                                                                               |
| Kaizen                       | Skeleton em foundations; Skeleton no loading sem consumidor                                                                     | Demonstração estática; remover loading morto se confirmado                            |
| DS 0.5.0 CSS                 | animações de dialog, quatro lados de Sheet, backdrop e Popover                                                                  | Contrato compartilhado de movimento desativado, abrangendo top layer e portal em body |
| DS 0.5.0 componentes         | transições em Button, Badge, Input, NavigationItem, RadioGroup, Switch e fechar Sheet; thumb do Switch com transition-transform | Mudança instantânea, preservando posição final e aparência dos estados                |
| DS 0.5.0 CSS                 | transição de borda e sombra de `.fd-card`                                                                                       | Hover instantâneo, sem remover a borda de estado/foco                                 |
| DS 0.5.0                     | Skeleton pulse e spinner de PendingButton                                                                                       | Indicador estático e texto; manter `aria-busy`, nome acessível e disabled             |
| Portfólio, apenas referência | AnimatedCard desloca/escala, estrelas e estrelas cadentes, revelação, digitação e física/gravidade                              | Não importar wrappers, keyframes, tw-animate-css ou bibliotecas de animação           |
| Funcional do Kaizen          | intervalo de 1 segundo no timer, timeout de hidratação de draft, efeitos de storage e eventos entre cards                       | Preservar; atualização de informação não é animação decorativa                        |
| Funcional do Kaizen          | transform estático para ocultar/exibir skip link; posição final do thumb                                                        | Preservar posição funcional instantânea; não proibir todo `transform`                 |

### Lacuna obrigatória do Design System

0.5.0 respeita `prefers-reduced-motion`, mas sem preferência do sistema continua animando. A regra genérica reduz durações para 0.01 ms e uma iteração; isso não equivale à política de zero movimento solicitada. Zerar só os tokens de duração tampouco cobre utilities de spin/pulse. Não há API pública por aplicação para desligar todos esses efeitos.

**Proposta de evolução separada, ainda inexistente:** contrato declarativo, por exemplo `html[data-fd-motion="none"]`, pertencente ao DS e independente da preferência de transparência. O nome final depende da revisão pública do pacote. Não documentá-lo como export disponível nem introduzir um provider global só para aplicar um atributo estático.

Requisitos do contrato compartilhado:

- Desativar animações/transições nos próprios componentes, descendants internos e pseudo-elementos/backdrops; overlays portados em body também herdam a política do documento.
- Preservar estados finais, visibilidade, abertura/fechamento, geometria, foco e semântica. Não remover o transform final do Switch nem manter overlay transparente por keyframe interrompido.
- PendingButton deve oferecer apresentação estática inequívoca; preferir texto visível como “Salvando…”. Rótulo acessível obrigatório em variantes só com ícone. Skeleton estático continua oculto para tecnologia assistiva; LoadingRegion comunica uma operação real.
- Testar a política com e sem preferência do sistema, em todos os estados e no CSS compilado; cobrir Card, Switch thumb, spinner, Skeleton, overlays e `::backdrop`.
- Manter o comportamento padrão dos demais consumidores; sem flag Kaizen, `!important` universal do consumidor ou CSS global que neutralize toda a página indiscriminadamente.
- Publicar release imutável, documentar impacto SemVer e migração. Versão exata futura: `unknown`; não presumir `0.5.1` ou `0.6.0`.

Consumidores concretos: agenda Sheet e demo, Switches de exercícios, Cards, todos os botões/campos e carregamento do Kaizen; futuros AlertDialogs e PendingButtons da migração. A mudança não será feita no repositório de referência nesta tarefa. **O aceite integral fica bloqueado até existir um release com esse contrato.** 0.5.0 é referência visual, não destino final automaticamente suficiente. Etapas podem ser revisadas antes, mas não liberar uma migração declarada completa com movimento residual.

### Lacuna de controles de seleção

Não há export Select nos manifestos consultados. Existem quatro selects nativos em dois componentes: tipo e sessão na agenda, intensidade e disposição na avaliação. Mantê-los nativos com Field e tokens públicos é a opção inicial de menor risco; não substituir um seletor potencialmente longo por lista de RadioGroup sem estudar densidade e teclado.

Propor separadamente ao DS um controle nativo Select ou contrato público de aparência de controle, com esses quatro consumidores e required/disabled/invalid/long labels como justificativa. Não copiar a fórmula visual do Input em cada arquivo. Enquanto não houver equivalente, uma composição local junto dos consumidores é exceção documentada, com tokens públicos e foco nativo; nenhum headless concorrente. A escolha de API é responsabilidade técnica do pacote, não dúvida obrigatória do usuário.

## 5. Legibilidade, contraste e custo de composição

Avaliação preliminar calculada em sRGB a partir dos tokens consultados, sem simular um viewport aprovado:

| Par                                                  | Contraste aproximado |
| ---------------------------------------------------- | -------------------: |
| foreground / background                              |              17,90:1 |
| muted-foreground / vidro 80% sobre background sólido |               6,77:1 |
| muted-foreground / surface-elevated                  |               6,16:1 |
| primary-foreground / primary                         |              12,29:1 |
| status-info sólido / surface                         |               7,61:1 |
| border / surface-elevated                            |               1,21:1 |

As combinações básicas de texto acima têm margem para leitura; isso não aprova textos com opacidade, campos desabilitados ou todas as cores semânticas. A borda fraca é um **risco para identificação de controles**, dependendo dos demais sinais disponíveis. Verificar limite de 3:1 onde o contorno for necessário para identificar o componente, e 4,5:1 para texto normal/3:1 para texto grande. Se a combinação pública falhar, corrigir no pacote, sem aumentar apenas a borda local. Bordas decorativas de Card não equivalem automaticamente a contorno essencial de Input.

Medir cor efetivamente composta nos estados padrão, hover, foco, inválido, selecionado e disabled, incluindo `text-foreground/80`, Input elevado a 60%, vidro sobre sólido, cores semânticas e fallback opaco. Não usar apenas a cor do token sem a composição. Informações de status, erro e prioridade precisam de texto/ícone além da cor.

Em treino denso, o custo maior esperado é blur de vários painéis sobre elementos rolando ou atualizando. É uma inferência, não uma medição de desempenho concluída. Manter uma camada por atividade, exercícios sólidos, editores sem blur e cronômetro com largura estável. Não adicionar `will-change`, GPU hints ou virtualização sem perfil e consumidor comprovados.

Comparar antes/depois no mesmo navegador, viewport e cenário sanitizado: dia com maior quantidade de atividades/exercícios disponível na fixture, todos os detalhes abertos, agenda aberta e timer ativo. Registrar quantidade de superfícies com backdrop-filter, tempo de rolagem/frames e atualização do timer por 30 segundos. Proposta de gate: investigar regressão reproduzível superior a 10% no p95 do tempo de frame em três repetições; não aprovar apenas por média ou por desktop potente. Dados de baseline e aprovação real de performance: `unknown`. Se houver regressão, tornar superfícies densas sólidas usando o contrato público e repetir a medição.

## 6. Arquivos e configurações envolvidos

Os caminhos abaixo são relativos à raiz do Kaizen. “Alterar” significa plano futuro, não mudança realizada. Os stems abreviados nesta seção são definidos com caminhos exatos no inventário complementar ao final.

| Ordem | Ação                       | Caminho exato                                                                                                                                                                                                                             | Mudança, motivo e verificação                                                                                                                                 |
| ----- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | Criar                      | `docs/implementation/FRADELLI-DESIGN-SYSTEM-ADOPTION-PLAN.md`                                                                                                                                                                             | Este plano, evidências e decisões; revisar links e consistência                                                                                               |
| 1     | Alterar após aprovação     | `docs/architecture/TARGET-ARCHITECTURE.md`                                                                                                                                                                                                | Registrar política estática por referência a nova decisão, sem reescrever ADR antigo; preservar regras estruturais                                            |
| 1     | Criar após aprovação       | `docs/decisions/STATIC-VISUAL-POLICY.md`                                                                                                                                                                                                  | Formalizar fundo opaco e zero movimento como decisão do Kaizen; depende de aprovação e contrato publicado                                                     |
| 1     | Planejar no roadmap        | `roadmap/ACTIVE.md`                                                                                                                                                                                                                       | Selecionar tarefa nova e entradas explícitas; ler `roadmap/AGENTS.md` e atribuir ID válido antes de criar arquivos de tarefa. Caminho/ID da tarefa: `unknown` |
| 2     | Alterar                    | `package.json`                                                                                                                                                                                                                            | Pin exato do release aprovado; manter peers atuais se compatíveis                                                                                             |
| 2     | Alterar por gerenciador    | `pnpm-lock.yaml`                                                                                                                                                                                                                          | Resolver release e transitivas, verificar React único e remoção de Radix só quando não houver consumidor; nunca editar lock manualmente                       |
| 2     | Alterar                    | `src/app/layout.tsx`                                                                                                                                                                                                                      | Declarar política estática SSR quando existir API; manter Inter, lang e limites de servidor                                                                   |
| 2     | Alterar se necessário      | `src/app/globals.css`                                                                                                                                                                                                                     | Garantir fundo de html/body por token; manter import único e @source, sem kill switch universal                                                               |
| 3     | Alterar                    | `src/components/shared/app-shell/app-shell.module.css`                                                                                                                                                                                    | Hierarquia e superfície de navegação/cabeçalho; preservar estrutura, skip link e safe area                                                                    |
| 3     | Alterar                    | `src/components/shared/app-shell/components/app-shell-navigation/components/app-shell-navigation-links/app-shell-navigation-links.module.css`                                                                                             | Composição da navegação sobre contratos comuns; avaliar elevada/sólida                                                                                        |
| 3–5   | Alterar                    | Arquivos visuais enumerados no inventário complementar                                                                                                                                                                                    | Trocar primitives e estilos, preservar props de negócio; validação por família abaixo                                                                         |
| 4     | Alterar                    | `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.ts`                                                                                                                                               | Substituir confirmação síncrona por intenção pendente exposta à UI; nenhuma pausa/escrita antes de aceitar                                                    |
| 4     | Alterar se contrato exigir | `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.types.ts`                                                                                                                                         | Tipar intenção/continuação e cancelamento; sem mudar versão/chave/estrutura persistida do draft                                                               |
| 4     | Criar                      | `src/features/training/ui/components/training-day-page/components/training-activity-card/components/training-activity-switch-confirmation/training-activity-switch-confirmation.tsx`                                                      | Folha privada de renderização do AlertDialog ao pausar outra atividade; não introduzir modal genérico global                                                  |
| 4     | Criar                      | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/components/training-set-reset-confirmation/training-set-reset-confirmation.tsx` | Confirmação privada da limpeza de séries; manter o cálculo em utilitário do consumidor e estado no hook quando extraído                                       |
| 5     | Remover condicionalmente   | `src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.tsx`                                                                                                                          | Apenas se a busca na base integrada reconfirmar nenhum consumidor; caso contrário, adaptar ao LoadingRegion estático                                          |
| 5     | Remover junto              | `src/features/training/ui/components/training-day-page/components/training-day-loading/training-day-loading.styles.ts`                                                                                                                    | Só com a remoção do componente, sem deixar import órfão                                                                                                       |
| 6     | Alterar/criar              | Testes exatos abaixo                                                                                                                                                                                                                      | Evidência funcional e acessível das trocas e confirmação assíncrona                                                                                           |

Não prever diretórios vazios. Tipos/estilos/hooks auxiliares novos só serão extraídos junto do componente que os consumir, conforme responsabilidade real. A implementação detalhará esses arquivos ao estabilizar o contrato; não há conteúdo final copiável nesta etapa.

Configurações sem mudança proposta: `.npmrc`, `.github/workflows/ci.yml`, `next.config.ts`, `postcss.config.mjs`, `.node-version`, Prisma, banco, schemas, dados e variáveis de ambiente. Se o release exigir nova configuração, revisar explicitamente antes de ampliar o plano. Não importar ThemeProvider, I18nClientProvider, StarField ou AnimatedCard do portfólio.

## 7. Etapas revisáveis e dependências

| Etapa/PR futura                    | Depende de                                   | Escopo e saída verificável                                                                                                                                     |
| ---------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Registrar decisão e baseline    | Aprovação deste plano e ID novo              | Tarefa(s) com arquitetura nas Entradas; capturas e cenários sintéticos antes da mudança; decisões de fundo/movimento formalizadas                              |
| 2. Resolver contrato compartilhado | Etapa 1 e trabalho separado autorizado no DS | API de zero movimento, testes de catálogo/artefato e publicação; versão exata documentada. Avaliar Select em entrega separada, sem bloquear por API imaginária |
| 3. Atualizar fundação e shell      | Release da etapa 2                           | Manifesto/lock, política SSR, fundo, typography, foundations, placeholder e navegação; provar CSS e overlay nativo no app                                      |
| 4. Migrar agenda e formulários     | Etapa 3                                      | Sheet, Field, Input, pending estático, itens sólidos e feedback; manter payloads, edição e permissões                                                          |
| 5. Migrar execução e confirmações  | Etapa 4                                      | Atividades glass, exercícios solid, todos os diálogos e confirms, sequência de séries, cronômetro e rascunhos preservados                                      |
| 6. Auditar conjunto e promover     | Etapas 3–5 completas e validações            | Remover estilos/arquivos sem uso, executar matriz integral, comparar com referência e obter aprovação visual. Nenhuma área é deixada sem sequência definida    |

Cada etapa pode ser revisada em PR própria; não usar releases parciais para declarar migração integral. Repetir baseline contra `developer` atualizado. Não carregar mudanças não relacionadas da branch atual. O período entre PRs deve ser curto e sem novos componentes que reproduzam o contrato anterior.

### Cuidados de implementação que condicionam a preservação funcional

- Substituir `window.confirm` por UI assíncrona altera a forma de orquestrar, não a decisão de negócio. A intenção guarda o mínimo necessário; cancelar não pausa outra atividade, não inicia relógio e não limpa séries. Ao confirmar, revalidar draft/revisão/data atual antes de aplicar; timestamps são obtidos na execução confirmada.
- Não permitir que callbacks obsoletos sobrescrevam edição mais recente; testar confirmação pendente durante troca de data, desmontagem e outra atualização de draft.
- AlertDialogAction fecha por padrão; ao excluir, manter confirmação e erro legíveis enquanto a resposta está pendente/falha. Controlar `open` e impedir fechamento automático quando necessário, sem disparar submit duas vezes. Cancel é a ação inicialmente segura.
- Ao finalizar com pendências, preservar `requestSubmit`, flag de confirmação e FormData. Não usar um botão sem `type` ou uma action visual que contorne a validação nativa.
- Card não pode adicionar remounts por nova key nem transformar expansão em seleção que perca estado. Preservar chave de exercício e revisão de correção.
- Migração de label/Field mantém `id`, `htmlFor`, `name`, `required`, limites, inputMode, step, valores controlled/defaultValue e campos hidden. Dados de unidade/direção não são reinterpretados visualmente.
- A atualização do cronômetro por segundo e o timeout de recuperação de draft continuam existindo. Evitar anunciar cada segundo em live region; anunciar início/pausa/retomada/conclusão quando apropriado.

## 8. Validação futura

### Gates disponíveis e ordem

Executar somente após autorização para implementar, na base da respectiva PR:

1. `git diff --check` e revisão de segredos nos arquivos alterados, incluindo documentação e lockfile.
2. `pnpm format:check`, `pnpm lint`, `pnpm structure:check`.
3. `pnpm typecheck` e testes focados pelo runner já instalado; depois `pnpm test:coverage`.
4. `pnpm test:integration` em PostgreSQL descartável configurado para testes; não usar os dados operacionais do usuário como fixture.
5. `pnpm test:ci-scripts`, `pnpm data:check`, `pnpm build` e `pnpm audit --audit-level=moderate` conforme o agregado existente.
6. `pnpm run ci` é o agregado local desses gates, incluindo `db:validate`. Se já executado com sucesso na mesma revisão, não repetir todos os subcomandos sem motivo.
7. `pnpm governance <arquivo-do-evento>` ou o evento real da PR valida ID, título, direção, corpo e estado do roadmap. Não fingir evento aprovado nesta investigação.
8. Na atualização autorizada, provar instalação congelada com acesso ao registry e `pnpm list react react-dom @fradelli/ui --depth 10`; conferir uma única versão compatível de React, exports e CSS compilado. Nenhuma instalação foi feita no planejamento.

`typecheck`, testes e build chamam Prisma generate. `pnpm dev` também executa `workspace:ensure`, que pode gravar no banco; não foi usado para uma simples inspeção visual. Não há script E2E ou diretório `tests/e2e` no checkout, apesar de Playwright constar na arquitetura alvo. A matriz de navegador deve ser manual ou usar infraestrutura já aprovada; não inventar `pnpm test:e2e` nem instalar uma ferramenta nesta etapa.

### Regressões funcionais a verificar

| Cenário                                                                     | Resultado esperado                                                                                         |
| --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Ontem, hoje, amanhã, hoje +4, hoje +5, datas inválidas e anteriores a ontem | Mesmos limites: agenda editável de ontem até +4; execução só ontem/hoje; bloqueio também no servidor       |
| Navegar Dieta/Treino e entre datas                                          | Query, rota ativa, canonicalização, back/forward e marcação acessível preservados                          |
| Agenda com cada tipo de atividade                                           | Adicionar/editar/excluir sem iniciar execução; horários, sessão e esporte corretos; concluídas preservadas |
| Dia materializado e atividade removida                                      | Consulta repetida não recria exclusão intencional; não duplica atividades                                  |
| Iniciar, pausar, retomar; outra atividade em curso                          | Mesmos intervalos ativos, sem contar pausa; cancelar troca não escreve nem altera outra atividade          |
| Atualização do timer e recarga                                              | Continua por segundo; cálculo pelo relógio e recuperação do draft preservados, sem texto saltando          |
| Série total, cada lado, por direção, segundos, contatos e carga decimal     | Mesmas unidades, sequência, precisão e habilitação da próxima série; carga só quando aplicável             |
| Zerar série anterior com posteriores realizadas                             | Cancelar preserva todas; confirmar limpa somente o que a regra atual limpa                                 |
| Aquecimento e treino                                                        | Alternância não reinicia cronômetro nem perde resultados/comentários; toggles mantêm semântica             |
| Concluir com pendências, corrigir exercício/avaliação                       | Confirmação e payload corretos; versão/revisão preservadas; draft limpo só após sucesso                    |
| Retrospectivo elegível e modalidade guiada não elegível                     | Salvar registro sem timer onde permitido; servidor rejeita o restante como antes                           |
| Erro de validação, conflito de revisão, falha de storage e falha inesperada | Mensagem legível, rascunho preservado, retry sem duplicação; sem sucesso otimista indevido                 |
| Ownership/origem                                                            | Chamadas diretas continuam rejeitando origem/identidade inválida; workspace não vem do cliente             |

Reaproveitar regressões existentes nos testes de mutação/projeção e UI. Acrescentar testes apenas para comportamentos novos com risco: confirmação assíncrona, submit/fechamento de overlay, foco e retenção de estado. Não criar testes que apenas espelham strings de classes.

### Matriz visual e acessível

- Rotas: `/dieta`, `/treino` nos cenários acima e `/foundations`; verificar também redirect de `/` e erro de rota do treino.
- Idioma existente pt-BR, nome japonês, textos técnicos/importados em inglês, nomes de atividade no limite 120, esporte 80 e comentários 1000 caracteres. Não introduzir inglês como idioma novo.
- Larguras 320, 375, 768, 1024 e 1440 px; retrato/paisagem; zoom real 200% e reflow equivalente a 320 CSS px em zoom alto. Sem rolagem horizontal de página, cortes de botão, títulos, campos ou Sheet. Testar teclado virtual, safe area e navegação inferior sem cobrir ação ou foco.
- Teclado: skip link, ordem Tab/Shift+Tab, Enter/Space, summary, Switch, selects, Escape, foco inicial seguro e retorno ao acionador em Sheet/AlertDialog; conferir quando o acionador foi removido por exclusão. Sem duplo ring de wrapper e controle.
- Leitor de tela: headings e landmarks, rótulos/campos de erro associados, sucesso e carregamento anunciados sem spam; ícones decorativos ocultos; estado expandido/selecionado exposto.
- Estados: padrão, hover, foco, ativo/selecionado, disabled, pending, sucesso, erro, vazio e indisponível. Nenhum estado distinguido só por cor.
- Movimento: política da aplicação ativa com `prefers-reduced-motion` tanto reduce como no-preference. Inspecionar computed animation/transition em componentes, filhos e `::backdrop` durante abertura e mudança de estado. Nenhuma animação executando; duração de transição zero. Inspecionar também portais no body. Não exigir ausência de todo keyframe no CSS do pacote, pois o contrato pode ser desativado por seletor.
- Transparência: padrão, atributo de redução, preferência do sistema quando suportada, forced colors e ausência de suporte a backdrop-filter/color-mix. Mesma composição e conteúdo em todos os modos.
- Comparação lado a lado com portfólio e Storybook: paleta, Inter, títulos, cards, borda/sombra/raio, foco, campos e espaçamentos. Comparar o material sem importar a cena espacial nem o tamanho de hero para uma tela operacional.
- Navegadores: Chromium, Firefox e Safari/WebKit disponíveis na validação; registrar versões. A mudança de Radix para dialog nativo exige teste de top layer, foco, backdrop e nested dialogs. Na ausência de navegador/plataforma, registrar `não validado`, sem generalizar aprovação.

## 9. Critérios objetivos de aceite

- [ ] Todo o inventário atual de rotas e famílias acima foi migrado, mantido com justificativa ou removido por ausência de consumidor confirmada; não há etapa indefinida.
- [ ] html/body e overscroll usam o mesmo background opaco do portfólio, derivado do token compartilhado; sem estrelas, partículas, imagens de fundo ou gradientes decorativos.
- [ ] Inter carregada uma vez, papéis públicos coerentes e sem cópia local de paleta, sombra ou fórmula de vidro.
- [ ] Card default/sm e glass/solid têm padding de raiz e slots sem duplicação; headings reais e sem Card informacional focável.
- [ ] Release exato publicado inclui contrato de movimento desativado; zero animação e transição nos cenários reais, independentemente da preferência do sistema, incluindo overlays/filhos/backdrop.
- [ ] Carregamento continua visível e acessível sem spinner girando ou Skeleton pulsando; não há operações fictícias ou estados ocultos.
- [ ] Temporizadores, intervalos, cálculos, atualizações, séries, rascunhos, retrospectivo, permissões, dados e integrações passam pelas regressões descritas.
- [ ] Todas as confirmações da UI usam a primitive pública ou possuem exceção aprovada; cancelar não aplica alteração e falha não perde dados.
- [ ] Contraste e navegação por teclado aprovados, sem overflow nos viewports/zoom; exceções de selects documentadas e verificadas.
- [ ] No máximo uma camada de blur por painel operacional; perfil comparativo sem regressão relevante não resolvida; fallback sólido aprovado.
- [ ] Gates aplicáveis passam na mesma revisão e a revisão semântica foi registrada conforme arquitetura; limites de validação permanecem explícitos.
- [ ] Diff sem segredos e sem alterações não relacionadas; fluxo de PR e rollback documentados; conjunto aprovado visualmente antes da promoção.

## 10. Reversão e entrega

Trabalho novo parte de `developer` em `codex/<ID>-descricao-curta` após definir ID real e entradas. PRs de tarefa apontam para `developer`, seguem [.github/pull_request_template.md](../../.github/pull_request_template.md) e título `[<ID>] tipo(escopo): resumo curto`; squash para tarefas. Promoções `developer -> staging -> master` usam merge commit. Não presumir que aprovação deste plano autoriza merge, promoção ou deploy.

Manter cada PR coesa. Reverter a PR visual restaura componentes/CSS, manifesto e lockfile juntos ao último conjunto validado; não fazer downgrade isolado preservando imports novos. Não reescrever histórico nem sobrescrever release publicado. Etapas dependentes são revertidas da mais recente para a mais antiga, ou em uma PR coordenada que mantenha o conjunto compilável.

Não há migração de banco/draft planejada: preservar schema, chaves de storage e dados. Portanto o rollback visual não apaga treino ou alimentação. Se surgir necessidade de mudar formato persistido, retirar da migração visual e exigir migração e rollback explícitos. Testar reversão com draft em andamento e registros existentes; não limpar storage para “corrigir” incompatibilidade.

## 11. Riscos, pendências e decisões do usuário

| Natureza                | Item                                                                                         | Encaminhamento                                                                                        |
| ----------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Bloqueio real           | DS 0.5.0 não oferece zero movimento por aplicação                                            | Evolução separada e release antes do aceite final; versão `unknown`                                   |
| Risco funcional         | Troca Radix/nativo e confirmações síncronas/assíncronas                                      | Testar foco, cancelamento, submit, pending e erro antes de migrar o restante                          |
| Risco visual            | Padding de raiz, altura flexível e AlertAction mudam composição                              | Rever todas as famílias, inclusive placeholder e foundations                                          |
| Risco existente         | Classes sem alias público e selects com estilo concorrente                                   | Corrigir consumidores; propor evolução de controle com justificativa real                             |
| Risco de legibilidade   | Borda de controle fraca e camadas transparentes                                              | Medir composição real; resolver no DS quando o problema for compartilhado                             |
| Limitação de evidência  | App não executado nesta investigação; performance e screenshots atuais do Kaizen não medidos | Baseline sanitizado como primeira etapa autorizada, sem usar dev que assegura workspace por acidente  |
| Limitação de acesso     | Sem instalação limpa/teste de credencial e sem estado Git dos repositórios de referência     | Reconferir artefato publicado e acesso na futura atualização; não solicitar segredos                  |
| Limitação de testes     | Não há E2E configurado; validação completa em navegador ainda pendente                       | Matriz manual explícita e testes do runner existente; ferramenta nova apenas com consumidor e decisão |
| Dependência de processo | ID e tarefa de implementação ainda não atribuídos                                            | Registrar conforme roadmap após aprovação; não reutilizar E06-T22                                     |

**A única decisão necessária do usuário agora é aprovar ou ajustar este plano**, incluindo a dependência de evolução compartilhada para movimento desativado e a proposta de vidro externo/sólido interno. Fundo, fonte e ausência de movimento já foram decididos e não precisam de nova escolha. Não há dúvida funcional que exija inventar telas ou regras. A aprovação de implementação no Kaizen não será presumida como autorização para alterar os repositórios de referência.

## 12. Validação executada nesta etapa

Investigação estática, comparação publicada no navegador, inspeção de manifestos/exports/guia e cálculos preliminares de contraste. Verificados links locais (nenhum quebrado), caminhos existentes versus criações propostas, coerência das etapas, ausência de padrões de segredo/caminhos pessoais e whitespace. `git diff --check` aprovado; o documento novo também foi verificado separadamente como arquivo não rastreado. Formatação verificada com o Prettier instalado, usando `.gitignore` como lista de exclusão porque `.prettierignore` exclui `docs/`. Nenhuma suite da aplicação, build, teste de banco, instalação ou CI foi executada: a aplicação não mudou. Resultados antigos não são apresentados como validação desta migração.

## Inventário complementar por arquivo visual

O inventário abaixo explicita os arquivos existentes que passam pela revisão de apresentação, distinguindo alteração de manutenção. Não inclui tipos/constantes/utilitários sem mudança necessária. Todos preservam suas responsabilidades; estilos continuam em `*.styles.ts`/CSS Modules, hooks mantêm estado/efeitos, utilitários cálculos puros e componentes renderização. As etapas referem-se à sequência da seção 7.

| Etapa | Ação                           | Caminho exato                                                                                                                                                                                                 | Finalidade e verificação                                                      |
| ----- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-actions-section/foundations-actions-section.styles.ts`                                                                           | Papéis e exemplos dos estados estáticos; conferir teclado e disabled.         |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-actions-section/foundations-actions-section.tsx`                                                                                 | Papéis e exemplos dos estados estáticos; conferir teclado e disabled.         |
| 3     | Revisar; alterar se necessário | `src/features/foundations/components/foundations-page/components/foundations-alerts-section/foundations-alerts-section.styles.ts`                                                                             | Composição de Alert na versão nova; sem colisão e sem deslocamento de coluna. |
| 3     | Revisar; alterar se necessário | `src/features/foundations/components/foundations-page/components/foundations-alerts-section/foundations-alerts-section.tsx`                                                                                   | Composição de Alert na versão nova; sem colisão e sem deslocamento de coluna. |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.styles.ts`                                                                             | Título por papel section; preservar amostras categóricas.                     |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-colors-section/foundations-colors-section.tsx`                                                                                   | Título por papel section; preservar amostras categóricas.                     |
| 3     | Revisar; alterar se necessário | `src/features/foundations/components/foundations-page/components/foundations-form-section/foundations-form-section.styles.ts`                                                                                 | Field e Input existentes; conferir invalid, descrição e foco único.           |
| 3     | Revisar; alterar se necessário | `src/features/foundations/components/foundations-page/components/foundations-form-section/foundations-form-section.tsx`                                                                                       | Field e Input existentes; conferir invalid, descrição e foco único.           |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-motion-section/foundations-motion-section.styles.ts`                                                                             | Copy e Skeleton estático; sem anunciar uma operação fictícia.                 |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-motion-section/foundations-motion-section.tsx`                                                                                   | Copy e Skeleton estático; sem anunciar uma operação fictícia.                 |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-page-header/foundations-page-header.styles.ts`                                                                                   | Badge da versão e papel display/section; conferir versão e quebra.            |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-page-header/foundations-page-header.tsx`                                                                                         | Badge da versão e papel display/section; conferir versão e quebra.            |
| 3     | Revisar; alterar se necessário | `src/features/foundations/components/foundations-page/components/foundations-sheet-example/foundations-sheet-example.tsx`                                                                                     | Contrato nativo e estático; foco inicial, Escape e retorno.                   |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-typography-section/foundations-typography-section.styles.ts`                                                                     | Demonstrar papéis e superfícies comuns; verificar tamanhos computados.        |
| 3     | Alterar                        | `src/features/foundations/components/foundations-page/components/foundations-typography-section/foundations-typography-section.tsx`                                                                           | Demonstrar papéis e superfícies comuns; verificar tamanhos computados.        |
| 3     | Manter                         | `src/features/foundations/components/foundations-page/foundations-page.styles.ts`                                                                                                                             | Composição das seções; sem nova lógica.                                       |
| 3     | Manter                         | `src/features/foundations/components/foundations-page/foundations-page.tsx`                                                                                                                                   | Composição das seções; sem nova lógica.                                       |
| 3     | Alterar                        | `src/components/shared/feature-placeholder/feature-placeholder.styles.ts`                                                                                                                                     | Hierarquia do título e Card sem duplicação de padding.                        |
| 3     | Alterar                        | `src/components/shared/feature-placeholder/feature-placeholder.tsx`                                                                                                                                           | Hierarquia do título e Card sem duplicação de padding.                        |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/invalid-training-date/invalid-training-date.tsx`                                                                                            | Navegação/feedback existente; verificar links e data limite.                  |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/components/rest-training-day/rest-training-day.styles.ts`                                                                                              | Card atualizado; preservar motivo, estado e ações.                            |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/components/rest-training-day/rest-training-day.tsx`                                                                                                    | Card atualizado; preservar motivo, estado e ações.                            |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.styles.ts`                                                                                | Feedback semântico público e anúncios; remover classes sem alias.             |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.tsx`                                                                                      | Feedback semântico público e anúncios; remover classes sem alias.             |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.styles.ts`                                                                                    | Card glass externo, status e diálogo de troca; preservar execução.            |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.tsx`                                                                                          | Card glass externo, status e diálogo de troca; preservar execução.            |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.styles.ts`                                                                            | Field, AlertDialog e pending; preservar confirmação e submit.                 |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.tsx`                                                                                  | Field, AlertDialog e pending; preservar confirmação e submit.                 |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.styles.ts`                                                                      | AlertDialog e pending; não fechar/limpar draft antes do resultado correto.    |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.tsx`                                                                            | AlertDialog e pending; não fechar/limpar draft antes do resultado correto.    |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.styles.ts`                                                                                    | Field, labels, pending estático e exceção Select; mesmo FormData.             |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-activity-form/training-activity-form.tsx`                                                                                          | Field, labels, pending estático e exceção Select; mesmo FormData.             |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.styles.ts`                                                                              | Lista e keys; sem remount de drafts.                                          |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-activity-section/training-activity-section.tsx`                                                                                    | Lista e keys; sem remount de drafts.                                          |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-activity-timer/training-activity-timer.styles.ts`                                                                                  | Tabular-nums, atualização de 1 segundo; sem anúncio a cada tick.              |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-activity-timer/training-activity-timer.tsx`                                                                                        | Tabular-nums, atualização de 1 segundo; sem anúncio a cada tick.              |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges.styles.ts`                                                                                    | StatusBadge só para estado; preservar Badge de categoria e totais.            |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-agenda-badges/training-agenda-badges.tsx`                                                                                          | StatusBadge só para estado; preservar Badge de categoria e totais.            |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.styles.ts`                                                                                    | Sheet opaco, itens sólidos e padding; sem overflow nem inset duplicado.       |
| 4     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-agenda-drawer/training-agenda-drawer.tsx`                                                                                          | Sheet opaco, itens sólidos e padding; sem overflow nem inset duplicado.       |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.styles.ts`                                                                                | Layout responsivo e asChild/Link; testar limites e textos longos.             |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-date-navigation/training-date-navigation.tsx`                                                                                      | Layout responsivo e asChild/Link; testar limites e textos longos.             |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.tsx`                                                                                              | Estados de consulta; verificar vazio, indisponível e inválido.                |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.styles.ts`                                                                                      | AlertTitle/AlertAction sem compensação de coluna; conferir todos os tons.     |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.tsx`                                                                                            | AlertTitle/AlertAction sem compensação de coluna; conferir todos os tons.     |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.styles.ts`                 | Indicador próprio do domínio, tokens e rótulo acessível.                      |
| 5     | Manter                         | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.tsx`                       | Indicador próprio do domínio, tokens e rótulo acessível.                      |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-completed-exercise-correction/training-completed-exercise-correction.tsx` | Pending e composição compartilhada; preservar revisão e valores.              |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.styles.ts`                           | Field/pending e fundo sólido; remover controles/classes sem consumidor.       |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-exercise-form/training-exercise-form.tsx`                                 | Field/pending e fundo sólido; remover controles/classes sem consumidor.       |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.styles.ts`           | Field, superfície sólida e confirmação de reset; manter sequência/unidades.   |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.tsx`                 | Field, superfície sólida e confirmação de reset; manter sequência/unidades.   |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.styles.ts`                                                                  | Solid compacto, papéis e Alert sem compensações; retirar transition-colors.   |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/training-exercise.tsx`                                                                        | Solid compacto, papéis e Alert sem compensações; retirar transition-colors.   |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/components/training-warmup-toggle/training-warmup-toggle.styles.ts`                                                                                    | Switch instantâneo e rótulo; preservar envio e estado.                        |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/components/training-warmup-toggle/training-warmup-toggle.tsx`                                                                                          | Switch instantâneo e rótulo; preservar envio e estado.                        |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/training-day-page.styles.ts`                                                                                                                           | Hierarquia de página e toolbar; preservar slots e query da data.              |
| 5     | Revisar; alterar se necessário | `src/features/training/ui/components/training-day-page/training-day-page.tsx`                                                                                                                                 | Hierarquia de página e toolbar; preservar slots e query da data.              |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.styles.ts`                                                                                                   | Retirar col-start-2 incompatível quando sem ícone; ação pública e retry.      |
| 5     | Alterar                        | `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.tsx`                                                                                                         | Retirar col-start-2 incompatível quando sem ícone; ação pública e retry.      |

### Testes existentes a revisar na etapa correspondente

Alterar somente quando a troca afeta comportamento ou o contrato público, sem atualizar expectativa cegamente para esconder regressão:

- `src/components/shared/app-shell/app-shell.test.tsx`.
- `src/components/shared/app-shell/components/app-shell-navigation/app-shell-navigation.test.tsx`.
- `src/components/shared/feature-placeholder/feature-placeholder.test.tsx`.
- `src/features/training/ui/components/training-day-page/training-day-page.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-day-content/training-day-content.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-day-feedback/training-day-feedback.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-action-feedback/training-action-feedback.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-activity-card/training-activity-card.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-activity-delete-form/training-activity-delete-form.test.tsx`.
- `src/features/training/ui/components/training-day-unexpected-error/training-day-unexpected-error.test.tsx`.
- `src/features/training/ui/hooks/use-training-activity-draft/use-training-activity-draft.test.tsx`.
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/exercise-priority-indicator/exercise-priority-indicator.test.tsx`.
- `tests/integration/training-mutations.test.ts`.
- `tests/integration/training-projections.test.ts`.

Criar na etapa 5, junto dos consumidores, para os riscos novos identificados:

- `src/features/training/ui/components/training-day-page/components/training-activity-controls/training-activity-controls.test.tsx`: finalizar com pendências, cancelar, submit único, retenção de erro e foco.
- `src/features/training/ui/components/training-day-page/components/training-session/components/training-exercise/components/training-local-exercise-editor/training-local-exercise-editor.test.tsx`: reset confirmado/cancelado e preservação das séries.
- `src/features/training/ui/hooks/use-training-activity-timer/use-training-activity-timer.test.tsx`: relógio controlado, pausa, retomada e desmontagem sem parar a funcionalidade por política de movimento.

`vitest.setup.ts` só deve mudar se o ambiente jsdom precisar de suporte mínimo às APIs nativas de dialog. Esse suporte verifica integração, não substitui foco e top layer no navegador real. Não reintroduzir Radix para manter mocks antigos.
