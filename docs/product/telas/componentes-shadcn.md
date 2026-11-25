# Componentes compartilhados do Kaizen

- **Tipo:** Produto.
- **Área:** Design system.
- **Tarefas relacionadas:** [E10-T09](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md).

The package in use is recorded in the manifest and the lockfile as
`vendor/fradelli-ui-mira-table-progress.tgz`. Os nomes de outras prévias
abaixo identificam etapas históricas da migração.


> Plano de adoção, não segunda fonte de regras visuais. O [guia](guia-de-estilo.md) define a direção local. Inventários de exports e “uso atual” são checkpoints: reconfirme-os na versão instalada. Propostas de base ou expansão não viram decisões globais aprovadas por este inventário.

O preset `b1HwjY1BI0` orienta a aparência. O código dos componentes escolhidos entra no repositório do design system. O pacote `@fradelli/ui` distribui os componentes, as fontes e os tokens semânticos para os aplicativos. A atualização de uma receita do shadcn passa por revisão no pacote antes da publicação. [Modelo de distribuição](https://ui.shadcn.com/docs)

## Inventário e adoção proposta

O [plano de conclusão da migração Mira](../../plans/design-system/MIRA-DESIGN-SYSTEM-MIGRATION-PLAN.md)
organiza a retomada após o diagnóstico de permissões de 13/11/2026, com fases,
responsabilidades, validações e critérios de entrega. Os checkpoints abaixo
preservam as evidências históricas e não descrevem necessariamente o ambiente atual.

### Executor e diálogos — 14/11/2026

O [plano do executor](../../plans/design-system/AJUSTES-DO-EXECUTOR-MIRA.md#verificação-local--14112026) registra a entrega e o hash do candidato atual. Switch foi substituído pela receita oficial Base Mira no DS. Item elevado e icon-touch foram retirados. Botões usam variantes oficiais e os diálogos do produto recebem apresentação responsiva pelo pacote. O checkpoint seguinte descreve a prévia anterior.

### Barra persistente por Item Mira — 13/11/2026

Pesquisa oficial: Item organiza conteúdo e ações persistentes; Toast descreve
mensagem temporária. A receita oficial `base-mira/item.json` entrou no DS, com
variante elevada e mapeamento aos tokens compartilhados. StatusIndicator é uma
primitiva genérica adicional do DS, com pulsação opcional e movimento reduzido.
O descarte usa Button `icon-touch` e Trash2 pelo export `lucide-icons` do pacote.

Kaizen consome `file:vendor/fradelli-ui-mira-activity.tgz`, versão interna 0.6.0
de prévia, SHA-256
`81a1e9f7bec582ad4c8c8dfd7f076abd988f7971a51f9d700f6acfe08fbf00ae`.
Manifesto/lockfile atualizados pelo fluxo normal e instalação congelada offline
aprovada. A distribuição pública e a migração integral continuam pendentes.

- DS: tipos, build, tokens/ícones determinísticos, seis testes direcionados,
  quatro histórias Chromium, build do Storybook, publint e resolução de tipos
  do tarball aprovados. Suíte unitária ampla interrompida sem resultado final.
  Consumidores limpos npm/pnpm passaram em tipos, CSS, imports SSR e verificação
  de instância única do React.
- Kaizen: 21 testes de barra/reconciliação aprovados, além de build, tipos, lint,
  estrutura, boundaries, ícones, 334 mensagens e formato. Uma tentativa com worker
  fork expirou; a repetição com um worker de threads passou sem erros.
- Chromium no app: 1440, 390 e 320 px aprovados. A geometria de `main` é idêntica
  antes/depois da barra; ela usa posição fixa e fica acima da navegação móvel.
  Sem overflow, alvo de descarte de 44×44 px, retomada e descarte independentes,
  cancelamento com retorno do foco, indicador pausado estático e pulsação
  desativada em `prefers-reduced-motion`. Nenhum erro de página nos cenários.
- O CSS local mantém somente posição/offsets e composição; a antiga reserva
  condicional de padding no shell foi removida. O tema estático abre exceção
  somente para o indicador aprovado, com preferência de movimento respeitada.
- Validação usa rascunhos sintéticos em contextos isolados de navegador, sem
  alterações de banco. Área segura e teclado físico de celular não foram
  testados em aparelho real.

### Preparação local e primeiro Select — checkpoint anterior de 13/11/2026

Retomada registrada em E10-T09. O checkpoint anterior abaixo é histórico.

- Migration `20261108010000_exercise_catalog` revisada e aplicada exclusivamente
  no banco local; 16 migrations em dia e `workspace:ensure` aprovado.
- Manifesto, lockfile e pacote instalado agora consomem
  `file:vendor/fradelli-ui-mira-select.tgz`, versão interna 0.6.0 não publicada.
  SHA-256 `6cf6b4ddf66170d55ef271a701e1bd2f1ab22e54b661a36efcfcc015c482a427`.
  Imports reais de Select, Dialog, Field, Checkbox, NativeSelect, DropdownMenu e
  Collapsible aprovados. Instalação congelada offline aprovada no consumidor
  existente; ainda não equivale a instalação limpa em diretório vazio.
- `TrainingPreparationSelect` usa Select/Trigger/Content/Item/Value públicos.
  Rótulo e ajuda continuam associados; sugestão, escolha manual, opção indisponível,
  estado bloqueado e `preparationSessionId` permanecem responsabilidades do Kaizen.
- 21 testes do formulário e 47 do editor/card aprovados. `user-event` 14.6.7 foi
  adicionado como dependência de desenvolvimento para testar a interação real.
  Lint, tipos, estrutura, boundaries, ícones, 334 traduções, formato, build e
  governança do roadmap passaram. Não foi executado o gate completo de release.
- Chromium desktop 1440×1000 e mobile emulado 390×844: formulário real de atividade
  específica, seleção de "Sem aquecimento", serialização, envio/persistência,
  fechar/reabrir com rascunho, Escape do Select sem fechar Dialog, retorno de foco
  ao seletor e ao acionador, e diálogo dentro da viewport aprovados. Checkbox foi
  conferido por ponteiro/toque e teclado em `/foundations`; a execução completa
  de séries no navegador continua pendente. Nenhum erro de página nos cenários.
- Registros sintéticos foram excluídos pela UI; soft delete preserva o histórico.
  **Achado real:** o popover nativo de `training-activity-menu.tsx` permanece no
  top layer e intercepta cliques na confirmação de exclusão sobre o detalhe.
  A limpeza funcionou por teclado. Migrar a composição de menu para o contrato
  compartilhado e validar ponteiro/toque antes de aceitar esse fluxo.

Próximo lote: reconciliar inventário do candidato com o DS, continuar executor
e corrigir a sobreposição de menus na revisão da agenda. Catálogo completo,
exports Lucide, versão publicada e aceite físico continuam pendentes.

### Checkpoint anterior de permissões — 13/11/2026

Checkpoint de ambiente, sem conclusão da migração ou aceite de navegador.
As alterações locais de código e documentação foram preservadas.

- Node 24.20.0 e pnpm 11.25.0 disponíveis; Prisma Client gerado com sucesso.
- Manifesto, lockfile e pacote instalado continuam no candidato `forms` descrito
  abaixo. Imports reais de NativeSelect, DropdownMenu, Collapsible e Dialog
  passaram; Select retorna `ERR_PACKAGE_PATH_NOT_EXPORTED`.
- O candidato `vendor/fradelli-ui-mira-select.tgz` declara versão 0.6.0 e os cinco
  exports. SHA-256: `6cf6b4ddf66170d55ef271a701e1bd2f1ab22e54b661a36efcfcc015c482a427`.
  Sua instalação não foi concluída: `pnpm add @fradelli/ui@file:vendor/fradelli-ui-mira-select.tgz --offline`
  falha com `EPERM` no symlink do store. Com o store original, falha com
  `ERR_SQLITE_ERROR`; com store temporário local, `ERR_PNPM_UNEXPECTED_STORE`.
  Não houve substituição manual de `node_modules`, manifesto ou lockfile.
- `workspace:ensure` continua retornando `WORKSPACE_BOOTSTRAP_UNAVAILABLE`.
  Diagnóstico separado, sem imprimir entrada ou credenciais, localizou a falha
  no upsert do workspace: Prisma retorna `EACCES` na etapa de conexão.
  O daemon Linux do Docker Desktop também está indisponível. Isso não comprova
  problema de schema nem autoriza reset ou alteração do bootstrap.
- `next dev` e `next build` encerram ao carregar a configuração, com
  `ERR_SWC_NATIVE_CACHE`. Definir `SWC_NATIVE_BINDING_CACHE` temporariamente no
  workspace também falhou na validação das permissões do cache. A mensagem
  inicial “Ready” não comprova que o servidor permaneceu disponível.
- O design system permanece fora das raízes graváveis da sessão; seu Git
  retornou erro de permissão. O inventário local foi lido e reconciliado:
  **65 entradas = 20 presentes + 44 ausentes + `form` sem receita**.
  As 64 receitas ainda não foram concluídas; revisão remota e aceite do catálogo
  não foram reconfirmados neste checkpoint.

O inventário de telas abaixo continua distinguindo código, testes e navegador.
Execução real desktop/mobile, interação do Storybook e consumidor isolado do novo
candidato continuam pendentes; os bloqueios acima afetam essas evidências.

**Validação deste checkpoint:** TypeScript sem emissão, lint, estrutura,
boundaries, ícones e 334 mensagens de tradução aprovados. A suíte
`training-activity-card.test.tsx` passou com **30 testes**, usando um worker e
sem paralelismo de arquivos. A tentativa ampla anterior foi interrompida sem
resultado e não conta como aprovação. `git diff --check` e links relativos
deste documento passaram. Os binários instalados foram executados diretamente
após a geração do Prisma, pois o store impediu o fluxo normal do pnpm.

### Auditoria local de adoção — 12/11/2026

Este registro descreve o estado observado no código. As propostas históricas abaixo
continuam como referência de origem e não comprovam implementação ou aceite visual.
Entradas desta revisão: [arquitetura](../../architecture/TARGET-ARCHITECTURE.md),
[estilo](guia-de-estilo.md) e [agenda](agenda-padroes-visuais.md).

**Artefato conferido:** `@fradelli/ui@0.6.0`, instalado por
`file:vendor/fradelli-ui-mira-forms.tgz`, com resolução correspondente no lockfile.
O manifesto e os módulos distribuídos oferecem Checkbox, Dialog, NativeSelect,
DropdownMenu e Collapsible. **Select não está exportado.** Os exports de ícones
legados ainda renderizam Phosphor; a aplicação usa Lucide diretamente nesta etapa,
com a regra de lint ajustada ao preset aprovado. Centralizar os exports Lucide no
pacote permanece pendente. Não houve alteração ou publicação do design system.

SHA-256 do tarball consumido:
`03f9b44361560c0970ff1ef6ff616a98b517f95d61045c0defa0a8b9853c94cd`.
Os nove subpaths usados nesta revisão (button, card, field, input, checkbox,
dialog, native-select, collapsible e dropdown-menu) também passaram por importação
real no Node, além do uso nos testes React.

| Tela → elemento | Código encontrado | Componente compartilhado / ajuste nesta revisão | Validação e pendência |
| --- | --- | --- | --- |
| `/workout/activity/[occurrenceKey]` e interceptação `@workout/(.)workout/activity/[occurrenceKey]` → prévia e execução | Input e Checkbox já migrados; título, prescrição, histórico e editor local existentes | Field/FieldLabel para medidas; prévia bloqueada com contador parado; execução mantém domínio e rascunho | Regressões de UI; navegador desktop/mobile pendente |
| Execução → aquecimento | Troca de fases escondia a rotina só de aquecimento no modo dedicado | Collapsible junto do treino principal; rotina só de aquecimento sempre aberta, sem editor de séries; link na grade e acesso direto/interceptado corrigidos | Regressões para os dois casos |
| Execução → descanso, barra ativa, dicas, comentário, histórico, correção e descarte | Button, Dialog, AlertDialog, Switch e Collapsible já consumidos; cores e scroll lock locais revisados | Preservados eventos, contratos, foco e rascunhos; ícones de ação migrados para Lucide | Testes de modal, overlay, descarte e rascunho; foco real e rolagem aninhada pendentes |
| `/workout` → agenda Dia/Semana e eventos curtos | Card/CardHeader/CardTitle/CardDescription já adotados; títulos interativos tinham CardTitle somente no span interno | CardTitle aplicado ao próprio Button/Link; resumo estruturado também usa Card; remoção de seletores locais obsoletos | Testes de grade; fonte calculada, foco, colunas, toque e rolagem no navegador pendentes |
| Agenda → setas, Hoje, visão e menus | Button neutro/ghost, DropdownMenu exclusivo com atalhos; menu de atividade usa Popover | Mantidos controles existentes; corrigidas dependência do efeito de rolagem e variável sem uso | Testes de navegação e grade; posição/foco visual pendentes |
| Agenda/execução → criação, horário, registro, confirmação e exclusão | Field, Input, NativeSelect, PendingButton, Dialog e AlertDialog; hidden inputs de persistência | Migração anterior preservada, inclusive nomes/valores e bloqueio de envio duplicado | Testes de formulários; trocar NativeSelect por Select depende de nova entrada no pacote |
| `/nutrition` → estado inicial | FeaturePlaceholder com Card, Badge e descrição; ainda sem editor de alimentação | Composição existente preservada; não há conteúdo alimentar novo | Inspeção de código; Empty ausente no pacote, adoção pendente |
| Shell desktop/mobile → navegação | NavigationItem ativo, nomes acessíveis e layout com área segura | Preservadas variantes; ícones Lucide | Testes do shell; legibilidade/toque reais pendentes |
| `/foundations` → demonstração | Exemplos anteriores não cobriam os novos controles distribuídos | Demonstrações de tons semânticos, Field, Checkbox, NativeSelect, Dialog, DropdownMenu e Collapsible pelo import público instalado | TypeScript; inspeção visual pendente; não apresenta Select inexistente |
| `/`, redirects legados, slots default/catch-all e erros | `/` redireciona a `/workout`; aliases preservados; slots sem UI; erro usa Alert/Button; carregamento usa Skeleton | Nenhuma URL ou contrato alterado; estados compartilhados preservados | Inspeção de rotas e testes de UI; erro/carregamento visual pendentes |

**CSS local ainda necessário:** geometria temporal e sobreposição dos eventos,
largura e rolagem das colunas, composição do shell/overlay, área segura mobile,
posicionamento/tamanho do contador de descanso e cores de categoria mapeadas a
tokens públicos. A grade usa um gradiente repetido somente para desenhar linhas
horárias. A superfície categórica dos eventos ainda é composta localmente porque
o Card distribuído não exporta essa variante; avaliar sua incorporação no pacote
antes de declarar a migração integral concluída.

**Observação no navegador:** tentativa de abrir o servidor local retornou conexão
recusada. `next dev` e `next build` falharam ao carregar o SWC nativo
(`ERR_SWC_NATIVE_CACHE`, acesso ao cache negado). Não houve comparação visual,
medição de tipografia calculada nem aceite desktop/mobile nesta revisão.
O Corepack também não conseguiu obter pnpm por indisponibilidade de DNS;
os checks possíveis foram executados diretamente pelos binários já instalados.
O diretório do design system está fora das raízes graváveis deste ambiente, e o
Git dele retornou acesso negado; seu estado de alterações locais não foi verificado.

**Validação automatizada final:** 475 testes em 69 arquivos aprovados, incluindo
30 testes do card de atividade. Cobertura: 87,30% de statements, 80,19% de branches,
87,02% de funções e 89,25% de linhas, acima dos limites configurados. Lint,
TypeScript, formatação, estrutura de componentes, fronteiras, ícones, 334 mensagens
de tradução e `git diff --check` aprovados. Oito testes do validador de ícones
também passaram. Links relativos deste documento sem destinos ausentes e nenhuma
assinatura de segredo encontrada no diff inspecionado. Integração PostgreSQL não
foi executada; não houve mudança de schema, domínio ou persistência.

**Aceite restante:** disponibilizar execução local com SWC funcional; percorrer os
cinco cenários desktop/mobile solicitados; admitir e distribuir Select e avaliar
Empty/variante categórica/exports Lucide no design system, com Storybook e teste do
artefato consumido. Publicação e funcionalidades futuras da agenda seguem adiadas.

| Área | Uso atual | Próxima adoção |
| --- | --- | --- |
| Navegação e Agenda | Button e ícones Lucide. O seletor Dia/Semana implementa o próprio menu. | Button ghost para setas, Dropdown Menu com seleção exclusiva e atalhos alinhados à direita, Tooltip para dicas de teclado. A grade de horas continua específica do Kaizen. |
| Criação e conclusão de atividade | O editor compõe campos, seletores e um modal próprio. O pacote já fornece Field e Input. | Dialog com título, descrição quando necessária, fechar no canto superior e rodapé separado para cancelar e salvar. Field agrupa rótulo, controle, ajuda e erro. Usar Input, Select e Textarea conforme o valor editado. |
| Exclusão e descarte | A agenda e a barra de retomada têm ações distintas de remoção. | Alert Dialog com a consequência no texto e no botão. Descartar execução e excluir atividade precisam de mensagens próprias. |
| Execução estruturada | O treino tem rota sobreposta, editor de séries e controles de descanso. O aquecimento recolhível está especificado. | Collapsible para aquecimento acompanhado de treino principal. Quando só há aquecimento, exibir o conteúdo aberto. Checkbox para valores booleanos. A confirmação de série exige preservar o registro explícito e o início do descanso, inclusive quando a execução já está confirmada. |
| Formulários de séries e correções | A interface usa prescrição, resultado anterior e campos reais. | Field e Input com nomes acessíveis por exercício e série. Validar carga zero, campos por lado e erros no celular. |
| Alimentação | A rota atual renderiza FeaturePlaceholder. | Empty para o estado inicial. Adotar os campos compartilhados quando o editor de alimentação existir. |
| Fundações e estados comuns | O app já importa Card, Badge, Separator, Switch, Alert, Sheet e Skeleton. | Usar a tela de fundações para conferir as variantes do pacote, foco de teclado, contraste, toque e formulários com erro. |
| Catálogo e planos futuros | Busca e seleção de exercícios fazem parte do planejamento. | Avaliar Combobox para escolher exercícios, Sheet para filtros no celular e Empty para busca sem resultados ao implementar essas telas. |

## Ordem de entrega

### Mapa das exportações atuais

Inventário conferido no manifesto de `@fradelli/ui@0.6.0`. A coluna central indica a receita ou a composição proposta para reconstrução.

| Entrada pública | Base proposta | Comportamento a conferir na migração |
| --- | --- | --- |
| button | Button | Tipo do botão no formulário, variantes, foco e estado desabilitado. |
| pending-button | Button + Spinner | Nome acessível durante o envio e prevenção de duplo envio. |
| navigation-item | Link da aplicação + variantes de Button | URL real, página atual e navegação por teclado. |
| field | Field | Associação entre rótulo, controle, descrição e erro. |
| input | Input | Encaminhamento de referência, valor controlado e propriedades nativas. |
| label | Label | Clique no rótulo alcança o controle correspondente. |
| radio-group | Radio Group | Seleção exclusiva, valor inicial e navegação por setas. |
| switch | Switch | Nome acessível, mudança de valor e estado desabilitado. |
| alert | Alert | Mensagem perceptível e anúncio adequado à urgência. |
| alert-dialog | Alert Dialog | Cancelamento seguro, confirmação explícita e retorno do foco. |
| popover | Popover | Posicionamento, Escape e foco no acionador ao fechar. |
| sheet | Sheet | Painel lateral, fechamento por teclado e rolagem no celular. |
| card | Card | Composição das partes e borda correspondente à superfície. |
| badge | Badge | Variantes e legibilidade sobre fundos escuros. |
| status-badge | Badge + texto de estado | Significado legível sem depender da cor. |
| separator | Separator | Orientação e distinção entre divisor decorativo e semântico. |
| skeleton | Skeleton | Dimensões estáveis durante o carregamento. |
| loading-region | Skeleton ou Spinner + região com aria-busy | Anúncio do carregamento e acesso ao conteúdo ao terminar. |

O manifesto também expõe `cn`, `icons`, `icons/*`, `styles.css`, `package.json` e uma raiz vazia. Essas entradas fazem parte do contrato de distribuição. Dialog e Checkbox precisam de novas entradas públicas. Alert Dialog continua atendendo confirmações destrutivas.

### Origem verificada do primeiro lote

A CLI oficial decodificou o preset como versão `b`, estilo `mira`, base de cor, tema e gráficos `neutral`, ícones Lucide, texto IBM Plex Sans, títulos Figtree, raio padrão e destaque de menu sutil. A escolha de Base UI é separada do código do preset. As cinco receitas consultadas pertencem ao registro `base-mira`. [Preset](https://ui.shadcn.com/create?preset=b1HwjY1BI0)

- [Button](https://ui.shadcn.com/r/styles/base-mira/button.json) usa preenchimento e mudanças de cor por variante. O botão padrão usa `hover:bg-primary/80`. Retirar a luz em degradê criada no aplicativo quando ele consumir a variante compartilhada.
- [Input](https://ui.shadcn.com/r/styles/base-mira/input.json) usa altura compacta `h-7`, borda e anel de foco. Conferir a área de toque no formulário móvel.
- [Field](https://ui.shadcn.com/r/styles/base-mira/field.json) compõe Label e Separator. Preservar o vínculo automático entre controle, ajuda e erro oferecido ao aplicativo.
- [Checkbox](https://ui.shadcn.com/r/styles/base-mira/checkbox.json) e [Dialog](https://ui.shadcn.com/r/styles/base-mira/dialog.json) usam primitivas Base UI. O JSON bruto contém marcadores de ícone e caminhos internos do registro. Gerar o código com a CLI configurada para Lucide antes de integrar ao pacote.

A decisão de fundação vigente no design system especifica Inter. A adoção de IBM Plex Sans e Figtree pede uma nova decisão no pacote e validação no Kaizen. O primeiro cenário de integração é abrir o editor de atividade, alterar um campo, fechar, reabrir e recuperar o rascunho. Conferir também envio, foco e erros com teclado e toque. Validar Checkbox em um controle booleano real.

1. Refazer todos os componentes já exportados pelo design system com as receitas do preset, começando por Button, Field, Input e Checkbox. Conferir borda dos preenchidos, hover discreto e foco visível com a paleta do Kaizen.
2. Exportar Dialog, Alert Dialog, Dropdown Menu, Tooltip e Collapsible com exemplos de teclado e toque. Comparar o Dialog com a referência aprovada, incluindo fundo escurecido e desfocado, superfície, raio e rodapé. [Dialog](https://ui.shadcn.com/docs/components/base/dialog)
3. Consumir uma versão do pacote no Kaizen. Migrar primeiro um formulário real de atividade e o menu da agenda. Conferir abertura, Escape, retorno do foco, erros, envio e preservação do rascunho.
4. Migrar o executor e conferir o descanso e a confirmação explícita de séries. A rota sobreposta precisa continuar acessível por URL direta.

## Plano de distribuição pelo design system

O catálogo-alvo é o conjunto completo de componentes oficiais de UI para a base escolhida. A instalação ocorre no repositório do design system. Os aplicativos importam componentes e tema da versão publicada de `@fradelli/ui`. A ordem de entrega acima prioriza as telas do Kaizen dentro desse catálogo.

1. Listar todas as exportações do pacote para acompanhar a reconstrução de cada componente, inclusive os que o Kaizen ainda não utiliza. Registrar a versão da CLI, o preset e a base de interação. Base UI é a proposta inicial porque corresponde aos exemplos escolhidos. Validar essa escolha no Kaizen. Os demais aplicativos serão refatorados posteriormente.
2. Gerar os componentes do preset em um diretório isolado do pacote e conferir o inventário contra o catálogo oficial. Revisar dependências, arquivos gerados e diferenças antes de integrar componentes com nomes já publicados. Guardar a configuração e a referência de origem para repetir a geração em atualizações. [CLI oficial](https://ui.shadcn.com/docs/cli)
3. Aplicar uma vez no tema IBM Plex Sans para texto, Figtree para títulos, Lucide para ícones e a paleta semântica aprovada. Usar as receitas geradas como fonte de verdade para bordas, raios, sombras e estados. Imagens servem para comparar a renderização. Qualquer diferença intencional, como o cursor padrão e a cor lilás de adicionar, deve estar descrita no tema ou na variante compartilhada. [Temas do shadcn/ui](https://ui.shadcn.com/docs/theming)
4. Exportar componentes individualmente e disponibilizar uma entrada de estilos. Preservar os contratos atuais quando possível e documentar mudanças incompatíveis na versão do pacote. Validar o pacote instalado no Kaizen com um botão neutro, um Select e um Dialog com Field e Checkbox. Conferir aparência, nome acessível, teclado, retorno do foco e toque.
5. Atualizar a versão consumida pelo Kaizen e migrar por tela. Remover cada regra visual local quando o componente publicado já oferecer a mesma intenção. Comparar, por exemplo, Today com a receita de botão correspondente e o seletor de formulário com a receita de Select.

## Regras compartilhadas

A fonte normativa para estilo, variantes e inclusão de componentes é o [guia de estilo do design system](guia-de-estilo.md).
