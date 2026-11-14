# Guia de estilo para o @fradelli/ui

> Fonte local de integração visual atual: Mira/Lucide/IBM Plex Sans/Figtree. Componentes e tokens pertencem ao design system; comportamento pertence às telas. A aparência histórica de vidro/Phosphor não prevalece. O worktree consome prévia por tarball local: isso não comprova release publicado. Antes da entrega, consumir versão exata publicada, atualizar lockfile no trabalho de código e validar instalação limpa, teclado/toque e desktop/mobile. Esta revisão não altera dependências nem publica o pacote.

Diretriz aprovada para a reconstrução do pacote. O Kaizen é o aplicativo de referência para esta etapa. O guia descreve o resultado desejado e serve para adoção posterior nos demais aplicativos.

## Origem e distribuição

Refazer **todos os componentes já exportados** pelo pacote usando as receitas oficiais do shadcn/ui geradas com o preset `b1HwjY1BI0`. Incluir também o catálogo oficial da base escolhida. Quando faltar equivalente direto, compor as primitivas do preset. Registrar a versão do gerador, a base e a origem de cada receita. Base UI continua como proposta.

**Regra permanente.** O aplicativo consulta primeiro o catálogo público de `@fradelli/ui`. Se faltar um componente, procurar a receita oficial, incorporá-la no repositório do design system, aplicar o tema, documentar, exportar e publicar. Quando precisar de uma composição reutilizável, construí-la no pacote sobre essas primitivas. O aplicativo consome a versão publicada e define as regras de negócio, como iniciar o descanso ao confirmar uma série.

## Tipografia, ícones e densidade

Usar IBM Plex Sans em textos, campos e controles, Figtree nos títulos e Lucide nos ícones. Usar algarismos de largura fixa em cronômetros. A escala de referência em pixels CSS é 24/32 para título de página, 20/28 para seção, 16/24 para leitura, 14/20 para controles e 12/16 para legendas. A barra no par indica a entrelinha.

Usar `Button`, `PendingButton` e `NavigationItem` do pacote. A variante padrão do Mira mede 28 px de altura e a variante `icon` mede 28 × 28 px. O aplicativo escolhe a variante e posiciona o controle no layout. Altura, padding, fonte, raio e tamanho dos ícones vêm da receita. Controles só com ícone precisam de nome acessível e espaço suficiente para acionar cada alvo por toque.

Na prévia local, a propriedade `tone` de Button e PendingButton usa os tons `neutral`, `general`, `navigation`, `start`, `warm`, `cool` e `danger`. A folha de estilos de `@fradelli/ui` exporta fundo, borda, hover e foco de cada tom. NavigationItem aplica o tom de navegação quando o link tem `aria-current="page"`. Hoje e o seletor de visão usam `neutral`, as setas combinam `neutral` com `ghost` e o botão de adicionar usa `general`.

## Tema escuro e cores semânticas

Usar grafite próximo de `#191919` no fundo e superfícies discretas para agrupar conteúdo. Cards agrupam itens relacionados. O conteúdo principal ocupa a página diretamente. Quando houver transparência, manter a superfície próxima à cor de fundo.

| Intenção | Uso no Kaizen | Fundo | Borda | Hover | Foco |
| --- | --- | --- | --- | --- | --- |
| control.neutral | Hoje e seletor | #29292C | #202023 | #343438 | #A7A7AE |
| navigation.selected | Seção principal ativa | #F2CF63 | #B59949 | #F5D97F | #FBE9A9 |
| action.general | Adicionar e voltar | #BCA7E8 | #8D7DAE | #C8B7ED | #E6DAFF |
| action.start | Iniciar treino | #A8D5BA | #7EA08C | #B6DDC6 | #DCF4E5 |
| phase.warmup | Aquecimento | #E5BA9C | #AC8C75 | #EAC6AD | #FBE3D2 |
| phase.training | Treino principal | #A9C5E8 | #7F94AE | #B8CFED | #DEEBFF |
| action.destructive | Confirmar exclusão ou descarte | #E8A0A6 | #AE787D | #EDB1B6 | #FFDBDE |

Texto claro sobre superfícies escuras e grafite sobre pastéis. Conferir o contraste de cada par. Controles preenchidos e cards coloridos usam borda mais escura da própria família e foco mais claro. Cards sobre a grade podem usar sombra discreta para indicar elevação, inclusive quando um evento ocupa parte da área de outro.

## Estados e composição

Na agenda, todos os tipos de atividade usam Card, CardHeader, CardTitle e CardDescription de `@fradelli/ui`. O título mantém a tipografia do preset Mira também quando aciona um diálogo ou navega para o treino. Horário e estado compartilham o estilo de descrição. A grade controla posição, duração e espaço disponível para as ações.

- Aplicar raio, sombra, borda, espaçamento e tratamento de hover da receita efetivamente gerada para cada componente. A tabela define as cores por intenção. Qualquer gradiente precisa ter origem na receita. Capturas servem para comparação visual.
- Setas anterior e seguinte usam Button ghost, transparente em repouso. Botões e links apresentados como botões usam cursor de seta, hover em dispositivos compatíveis e foco visível por teclado. Seleção e indisponibilidade também precisam de estado acessível.
- Dropdown Menu exibe a seleção com marca e os atalhos implementados alinhados à direita. Tooltip complementa o nome acessível. No toque, as ações devem ser compreensíveis e acionáveis diretamente.
- Dialog usa a composição do preset para fundo, superfície, título, fechar e rodapé de ações. Alert Dialog explicita a consequência de uma ação destrutiva. Ao fechar, devolver o foco ao acionador.
- Field agrupa rótulo, controle, ajuda e erro. Usar Input, Select, Textarea, Checkbox ou Switch conforme a interação. Identificar claramente foco, erro, seleção e indisponibilidade.
- Collapsible mostra o acionador apenas quando o conteúdo puder ser recolhido. No Kaizen, aquecimento isolado fica aberto. A regra de apresentação de cada tela pertence ao produto.

## Barra persistente de execução — decisão de 13/11/2026

A retomada de treino usa Item Mira e StatusIndicator do pacote. O estado ativo
tem indicador verde com pulsação suave; pausado tem indicador estático e texto.
Essa pulsação é uma exceção explícita à apresentação estática e é desativada
quando o usuário prefere movimento reduzido. Não anunciar o timer a cada segundo.
O Kaizen fornece nome, tempo e ações, fixa a barra acima da navegação/área segura
e não reserva espaço que empurre ou encolha a página. O descarte continua sendo
ação independente, com confirmação, sem elementos interativos aninhados.

## Ajustes aprovados do executor — 13/11/2026

- Unilateral: E/input e D/input lado a lado em português; L/input e R/input em
  inglês. O cabeçalho de repetições abrange duas colunas, com largura equivalente
  à coluna de carga em cada subcoluna. Bilaterais mantêm um campo de repetições.
- Área externa, conteúdo central e cards de exercício usam a mesma superfície
  mais escura exportada pelo DS, com bordas e espaços distinguindo os grupos.
- Carga indisponível usa Input desabilitado: sem foco, edição, cursor de texto ou
  abertura de teclado. O contrato de envio é preservado pelo domínio consumidor.

A implementação destes ajustes segue o [plano do executor](../../implementation/AJUSTES-DO-EXECUTOR-MIRA.md). A nova
regra de contagem por medidas e ✓ exclusivo para descanso está registrada no
[plano de execução de séries](../../implementation/TRAINING-SET-EXECUTION-AND-HISTORY-PLAN.md#contagem-por-medidas--13112026).

## Revisão antes de publicar

Comparar os componentes com o preset gerado e com as adaptações registradas neste guia. Conferir no Kaizen o tema, os estados, a navegação por teclado, o retorno do foco, nomes longos, zoom e toque em desktop e celular. Publicar componentes, tipos e tema na mesma versão. [Plano de adoção no Kaizen](componentes-shadcn.md)
