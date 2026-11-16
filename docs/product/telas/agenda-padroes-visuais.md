# Agenda, botões e foco — revisão para o design system

> Vigência: aparência no [guia](guia-de-estilo.md), comportamento em [Meu Dia](meu-dia.md). Este documento preserva diagnóstico e experimentos da migração em andamento. Em conflito de cores, fontes, ícones ou receitas, siga o guia. Arraste, painel lateral e tooltip temporizado continuam propostas onde identificados. Conteúdo preservado durante a edição visual paralela.

**Estado:** primeira aplicação visual e da navegação semanal em andamento. A seleção por arraste e o painel lateral descritos adiante continuam planejados.

**Aplicado nesta etapa:** carregamento fixo de domingo a sábado; celular mostra a data selecionada; setas avançam um dia no celular e uma semana no desktop; cabeçalho mostra mês e ano; número de hoje recebe círculo vermelho; início de semana, cores de fim de semana, borda e sombra dos eventos foram ajustados. O preset fornece IBM Plex Sans, Figtree e Lucide.

## Referência de preset shadcn

Preset escolhido pelo usuário: `b1HwjY1BI0`. Configuração obtida pelo comando oficial `shadcn preset decode b1HwjY1BI0 --json`.

| Configuração | Valor confirmado |
|---|---|
| Estilo | mira |
| Fonte do corpo | IBM Plex Sans |
| Fonte de títulos | Figtree |
| Família de ícones do preset | Lucide |
| Arredondamento | default |
| Base, tema e gráficos | neutral |
| Destaque de menu | subtle |
| Cor de menu | default |

Referências oficiais: [preset escolhido](https://ui.shadcn.com/create?preset=b1HwjY1BI0) e [comando de inspeção](https://ui.shadcn.com/docs/cli#preset-decode).

**Direção aprovada:** usar o preset como referência para tipografia, proporções, espaçamento, bordas, raios e tamanho dos controles. As intenções de cor seguem a tabela semântica deste documento. Setas, Hoje e seletor usam control.neutral; ações gerais usam action.general; início usa action.start; navegação principal ativa usa navigation.selected. Preservar as famílias de cor de aquecimento, treino e ações destrutivas. Superfícies neutras servem de base aos destaques coloridos.

O preset identifica o raio apenas como default. Medidas exatas de raios, botões e campos precisam ser extraídas dos componentes mira antes da adaptação. O valor de 28 px definido anteriormente continua sendo a referência compacta local até essa comparação. A família de ícones aprovada para o Kaizen é Lucide, a mesma do preset.

### Experimento local e entrega posterior

1. Preparar um comparativo no Kaizen com IBM Plex Sans no corpo e Figtree nos títulos, controles compactos, bordas discretas e todas as intenções da tabela.
2. Usar os componentes do @fradelli/ui já consumidos pelo app. Extrair medidas do estilo mira e mapeá-las aos tokens locais, incluindo fontes de controles, PendingButton, diálogos, campos e tabelas.
3. Apresentar a agenda e o executor em desktop e celular, com repouso, hover, foco, seleção, indisponibilidade e carregamento. Conferir números de carga e repetições, acentos em português, quebra de nomes longos e foco das superfícies coloridas.
4. Após aprovação visual, levar os tokens, variantes e exemplos ao repositório do design system. Publicar pelo fluxo da biblioteca e substituir as adaptações locais por sua versão aprovada.

## Diagnóstico

| Superfície | Evidência no código | Efeito |
|---|---|---|
| Grade semanal | `get-training-week.ts` carrega da data selecionada até sábado. `training-week-grid.module.css` divide a largura pelo número de dias retornados. | Avançar de terça a quinta troca cinco colunas por três e alarga cada dia. |
| Adicionar atividade | O gatilho usa Button com intenção de adicionar. O envio em `training-activity-editor-content.tsx` usa PendingButton com altura mínima de 44 px. Existe outro envio em `training-activity-form.tsx`. | O rodapé usa a aparência primária amarela. A biblioteca atribui a PendingButton um identificador próprio, fora dos seletores compactos de Button em `globals.css`. |
| Evento em foco | Na grade, o card usa borda neutra e faixa lateral na cor do evento. O título interativo recebe contorno amarelo de 2 px quando em foco. | No treino lilás aparece um retângulo amarelo interno. |
| Consistência geral | Existem valores de cor literais em globals.css, na grade e na barra de retomada. Nove arquivos de interface usam classes explícitas de altura de 44 px. | Revisar cada uso por função. Campos e áreas de toque têm necessidades diferentes da altura visual dos botões. |

## Regras para compartilhar

- O significado da ação governa sua aparência em botões, links com aparência de botão e envios com estado de carregamento. Texto, ícone e indicador de carregamento respeitam a mesma altura visual. Referência compacta atual de 36 px, ícones de 14 px. Preservar espaço para toque, zoom e rótulos longos.
- Adicionar e voltar usam lilás. Iniciar usa menta. Remover ou descartar usa a variante destrutiva. Ações secundárias usam superfície neutra. Aquecimento e Treino ativos usam pêssego e azul, respectivamente. Representar seleção também de forma acessível.
- Card colorido usa fundo, borda e indicador de foco da mesma família de cor. A borda normal pode ser discreta. O foco precisa ser distinguível por espessura e contraste. Se o menu interno recebe foco, marcar o menu para distinguir a ação do link principal.
- **Proposta:** card grafite recebe borda neutra e foco claro. Reservar amarelo para a seção principal selecionada. A data de hoje usa o marcador vermelho definido abaixo. Hoje é um atalho de navegação local junto das setas. Proposta de botão neutro nas três posições e estado indisponível ao exibir hoje.
- No pacote compartilhado, expor intenção, tamanho, seleção e foco como propriedades das variantes. Manter cores em tokens do tema. O Kaizen associa suas atividades às variantes; nomes de esportes e períodos da agenda pertencem ao aplicativo.

### Escala semântica de cores e controles compactos

**Regra de produto:** derivar borda e foco da mesma família do preenchimento. A borda em repouso é mais escura. O foco de teclado usa um anel externo mais claro, inclusive em ações secundárias. A cor de texto/ícone é um token separado. O hover clareia o fundo; a seleção persiste ao retirar o ponteiro.

**Paleta aprovada para o tema escuro.** Conferir contraste no protótipo. Cada linha fornece os tokens `surface`, `border`, `hover` e `focus` da família indicada. Consumidores escolhem a intenção e o estado; os valores hexadecimais ficam no tema.

| Família semântica | Uso | Base | Borda escura | Hover | Foco claro |
|---|---|---|---|---|---|
| control.neutral | Hoje, setas, seletor e controles secundários | #29292C | #202023 | #343438 | #A7A7AE |
| navigation.selected | Seção principal ativa | #F2CF63 | #B59949 | #F5D97F | #FBE9A9 |
| action.general | Adicionar e voltar | #BCA7E8 | #8D7DAE | #C8B7ED | #E6DAFF |
| action.start | Iniciar treino | #A8D5BA | #7EA08C | #B6DDC6 | #DCF4E5 |
| phase.warmup | Referência de cor do aquecimento | #E5BA9C | #AC8C75 | #EAC6AD | #FBE3D2 |
| phase.training | Referência de cor do treino principal | #A9C5E8 | #7F94AE | #B8CFED | #DEEBFF |
| action.destructive | Confirmar descarte ou exclusão | #E8A0A6 | #AE787D | #EDB1B6 | #FFDBDE |

Nos controles neutros, propor texto claro #EEEDEF; nos preenchidos em pastel, texto grafite #191919. Nos cards, definir papéis equivalentes por tipo de evento, partindo da superfície escura real do card. Preservar o acento lateral. Conferir o anel de foco contra a superfície ao redor, com 2 px e afastamento proposto de 2 px. Em alto contraste, respeitar as cores do sistema.

**Medidas aprovadas como referência para o protótipo:** botão com texto de uma linha com 4 px em cima e embaixo, 12 px nas laterais, linha de texto de 18 px e borda de 1 px (28 px visuais). Ícone isolado em controle quadrado de 28 px. Ícones de controle Lucide de 14 px, com chevrons auxiliares de 12 px. A densidade compacta substitui a referência visual anterior de 36 px nos controles compactos. Em telas de toque, reservar área acionável de pelo menos 44 × 44 px, com espaço próprio para cada controle. Validar legibilidade dos traços finos em dispositivo real antes de fechar as medidas.

**Entrega ao design system:** Button, PendingButton e links apresentados como botões devem consumir os mesmos tokens de intenção, cor e dimensão. Padronizar a família Lucide nos ícones da interface, incluindo setas, adicionar, iniciar e navegação. O estado ativo é comunicado pela superfície e pelo estado acessível. Incluir exemplos de repouso, hover, foco, ativo e indisponível no catálogo visual da biblioteca.

### Cursor, hover e dicas de atalho

**Regra definida para todas as aplicações consumidoras:** botões de texto, de ícone, de navegação, de envio e links apresentados como botões usam o cursor padrão de seta, nunca a mão (`pointer`). Esta é uma escolha visual do Kaizen e do design system, não uma afirmação de que o cursor de mão deixou de ser usado na web. Ao passar o mouse sobre um botão disponível, clarear discretamente sua própria superfície, preservando cor semântica, borda, dimensões e estado de seleção. O hover e o foco visível continuam indicando interação; no celular, a área de toque e o retorno ao acionamento permanecem claros. Aplicar hover apenas em dispositivos que suportam esse gesto.

**Dicas de atalho:** após o ponteiro permanecer sobre um controle com atalho implementado, mostrar a ação no idioma da interface e a tecla em destaque. Proposta para Hoje: “Vá para hoje” e tecla T. D e W alternam a visão, como descrito abaixo. Aplicar as mesmas restrições de foco e digitação aos três atalhos. O tooltip complementa o nome acessível do controle. Não anunciar atalhos ainda indisponíveis.

**Proposta de interação:** aguardar 700 ms de hover contínuo, cancelar se o ponteiro sair antes e fechar ao ativar ou pressionar Escape. Permitir mover o ponteiro sobre a dica. No teclado, exibir ao receber foco visível. No toque, um toque executa a ação; os atalhos disponíveis também podem ser consultados no seletor de visão. O tooltip com atalho não substitui a explicação por toque já prevista para o início de treino fora do período permitido.

## Grade e decisões pendentes

A largura de um dia deve depender da largura disponível. O celular exibe uma data. A régua continua horária e o agendamento continua em múltiplos de 15 minutos.

**Decisão de layout:** na visão Semana do desktop, exibir as sete colunas da semana que contém a data selecionada, de domingo a sábado. Cada coluna ocupa um sétimo do espaço disponível após a régua de horas. Exibir também os dias sem atividades. No celular, mostrar o dia selecionado, inicialmente hoje.

Cada coluna identifica o dia da semana e o número do dia do mês (por exemplo, “Qua 11”), no idioma da interface. Somente o número da data de hoje recebe um círculo vermelho, com texto de alto contraste e indicação acessível de data atual. Consultar outra data não desloca o marcador. Semanas que não contêm hoje ficam sem círculo.

No topo, mostrar o mês e o ano da data selecionada, por exemplo “novembro de 2026”. Em semanas que atravessam dois meses, cada coluna mantém seu dia correto. No desktop, oferecer Dia e Semana. A visão mensal fica para uma etapa futura. Manter a data de referência ao alternar a visão.

### Cabeçalho e atalhos propostos

Implementado no Kaizen: seletor Dia/Semana no desktop, preferência na URL por `view=day|week` e atalhos D, W e T. As setas respeitam a visão escolhida. No celular, a grade permanece diária. Atalhos são ignorados durante edição de campos, menus e diálogos. A dica temporizada de atalho permanece pendente.

Mês e ano à esquerda. À direita, seletor Dia/Semana, Hoje e setas. Em Semana, cada seta desloca sete dias; em Dia, um dia. Hoje traz a data atual na visão escolhida. O menu indica a opção ativa e mostra D (Dia) e W (Semana), inclusive em português, para manter os atalhos entre idiomas. Só tratar essas teclas com a agenda em foco, fora de campos editáveis, menus e diálogos, sem modificadores. O seletor também funciona por toque e teclado. Proposta de URL: guardar a data e a visão em parâmetros para preservar o contexto ao voltar do treino.

### Fim de semana

Proposta para revisão visual: fundo grafite #191919 nos dias úteis e grafite levemente frio #1C1C20 no domingo e sábado, com o mesmo tom nos dois cabeçalhos. Usar uma cor de superfície compartilhada para fim de semana. A camada de tempo decorrido continua atenuando o passado. Se hoje cair no fim de semana, manter o círculo vermelho no número e o traço mais vivo na coluna atual. Domingo e sábado continuam identificáveis pelo texto mesmo sem perceber a diferença de cor.

### Seleção de período e editor

No desktop, iniciar o arraste em uma área livre de um dia. Durante o gesto, destacar a faixa e mostrar início, fim e duração. Encaixar os limites em quartos de hora, com mínimo de 15 minutos. Aceitar arraste para cima ou para baixo dentro da mesma data. Ao soltar, abrir o editor à direita com data e horários preenchidos. Abertura da agenda, seleção, troca de visão e abertura do editor não gravam no banco.

O painel é uma região irmã da grade, com título, fechamento, tipo da atividade, nome ou seleção de treino existente do plano e período ajustável. Rodapé com Cancelar e Adicionar. Somente salvar com sucesso transforma a faixa em atividade. Usar as regras de datas editáveis e a validação dos horários já existentes. Se falhar, manter os valores para nova tentativa. Para treino estruturado, vincular um treino já existente em plano. Uma atividade avulsa continua vinculada à data. Abrir um card existente preserva o comportamento da atividade.

Proposta para manter as sete colunas estáveis: reservar o espaço lateral em telas largas; se o espaço útil ficar curto, abrir o editor sobre a lateral. No celular, usar a visão diária e abrir o formulário em uma folha inferior ao tocar em um horário. Rolagem vertical livre. Para criar onde já existe evento, oferecer “Adicionar atividade” no menu do dia com período editável. No teclado, permitir escolher o horário com as setas e abrir com Enter. Escape fecha a seleção ou o editor, devolvendo o foco à grade. Se houver campos alterados, pedir confirmação de descarte. Retirar o + do calendário após validar essas entradas por mouse, toque e teclado.

## Eventos simultâneos

**Regra definida:** permitir atividades com início igual ou com intervalos parcialmente coincidentes. Na coluna de cada dia, os cards aparecem com recuo horizontal progressivo. O primeiro começa junto à margem, o segundo mais à direita e o terceiro mais à direita que o segundo. Todos preservam a posição vertical do início e a altura proporcional à duração. O recuo é visual; cada atividade mantém identidade, horário e ações próprios.

**Proposta de apresentação:** alinhar a borda direita dos cards e deixar visível uma faixa do card anterior, como na referência. Reutilizar o primeiro recuo livre quando um evento terminar. Se um termina exatamente quando outro começa, os dois podem ocupar o mesmo recuo. Para inícios iguais, ordenar primeiro o evento mais longo e, em empate, usar uma chave estável.

**Aceite:** conferir dois eventos com o mesmo início, três com sobreposição parcial e dois consecutivos. No desktop e no celular, manter título e horário legíveis e garantir acesso a cada atividade por toque e teclado. Quando a largura for insuficiente, propor um limite de recuo e usar a lista do dia para abrir individualmente os eventos.

### Elevação dos eventos

**Regra aprovada:** cada card de evento projeta uma sombra suave sobre a grade. Quando há sobreposição, o card de trás conserva sua sombra sobre a grade e recebe na sua superfície a sombra projetada pelo card da frente. A ordem visual segue a ordem dos recuos. A sombra acompanha a área e o formato do card.

| Token semântico proposto | Uso | Valor inicial para revisão visual |
|---|---|---|
| `elevation.card` | Card acima da grade | `0 2px 5px rgb(0 0 0 / 24%)` |
| `elevation.stacked` | Card acima de outro card | `0 3px 8px rgb(0 0 0 / 32%)` |

Usar a mesma sombra neutra em todas as cores de evento. Com três ou mais cards, reutilizar o nível de sobreposição, preservando título, faixa lateral e foco. Validar no protótipo um evento isolado, dois simultâneos e três parcialmente sobrepostos, no desktop e no celular. Conferir se a sombra aparece sobre a faixa exposta do card de trás e se a rolagem e as áreas de toque continuam funcionando.

## Ordem da implementação e aceite

1. Validar o cabeçalho, os tons do fim de semana, a largura do painel e o editor por toque em protótipo desktop e mobile.
2. Aplicar a mesma variante aos dois envios de atividade, ao gatilho e aos estados de carregamento. Conferir edição, exclusão e indisponibilidade no desktop e no celular.
3. Aplicar tokens de superfície, borda e foco à grade, lista do dia e barra de retomada. Percorrer por teclado e conferir foco sobre os diferentes tons, inclusive com alto contraste.
4. Ajustar consulta e grade juntas. Na mesma largura, navegar por terça, quinta, sábado e domingo e medir as colunas. Conferir alinhamento de cabeçalho, horários e eventos, data selecionada no celular e rolagem ao voltar do treino.
5. Integrar o editor à seleção e validar arraste nos dois sentidos, clique simples, teclado, dia ocupado, sobreposição, cancelamento, erro de gravação e salvamento único. Testar Dia/Semana na virada do sábado para domingo e entre meses. Verificar que digitar D ou W no formulário preserva o texto.
6. Após aprovação visual, incorporar variantes e exemplos ao design system, publicar uma versão pelo fluxo próprio e migrar o Kaizen. Conferir os consumidores antes de remover os estilos locais.
