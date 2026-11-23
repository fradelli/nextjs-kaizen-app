# Execução do treino estruturado

- **Tipo:** Produto.
- **Área:** Execução de treino.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

[Mapa de telas](README.md) · [Wireframe de execução](execucao.svg) · [Referência visual do Meu Dia](meu-dia.md)

## Escopo visual

No detalhe dedicado, as ações de edição e exclusão da ocorrência ficam na agenda. A retomada global oferece retorno ao detalhe a partir das outras páginas. O descarte do card global apaga o rascunho local da sessão e permite iniciar novamente uma atividade ainda não concluída.

Ao navegar pelo aplicativo, o detalhe abre sobre a página de origem com URL própria. Voltar ou Escape devolve à página anterior. No celular, a sobreposição ocupa a tela. Um link direto ou uma recarga abre a visualização dedicada. O descanso e a avaliação permanecem acessíveis dentro dessa navegação.

Se a resposta de uma finalização falhar, manter o rascunho e permitir uma nova tentativa com o mesmo encerramento. Uma repetição que corresponda ao resultado já gravado recebe confirmação de sucesso. Divergências exigem revisão do resultado existente.

Após recarregar o detalhe ou a agenda, remover uma cópia de execução apenas quando seus dados e a avaliação da mesma aba corresponderem ao resultado confirmado pelo servidor. Essa conferência não grava no banco. Quando a correspondência não puder ser comprovada, manter a cópia e avisar no detalhe; o usuário pode conferir o resultado e descartar a cópia pela barra de retomada ao voltar para a agenda.

Manter a hierarquia do componente de atividade, da sessão e do editor de séries. Aplicar o fundo #191919 de ponta a ponta no celular e no desktop. Retirar a borda, o arredondamento, a sombra e a superfície do contêiner externo. Cada exercício pode agrupar prescrição, ações e séries com uma borda de 1 px. O descanso flutuante continua com superfície própria.

O desenho mostra um recorte do primeiro exercício de uma sessão em andamento, com valores ilustrativos. A coluna esquerda representa o celular. A direita representa o desktop. O componente existente determina quais controles aparecem em cada estado e quais colunas se aplicam ao exercício. As telas auxiliares e os controles condicionais não ilustrados seguem a organização atual.

## Composição aprovada para a próxima implementação

Ao criar um treino no plano, o usuário pode prescrever aquecimento, exercícios principais ou ambos. Uma rotina de alongamentos pré-futevôlei pode ocupar um horário próprio antes da atividade esportiva.

O detalhe apresenta um título único e um subtítulo com horário, duração total prevista e estado. Quando houver duas seções, o subtítulo informa quanto do total corresponde ao aquecimento. As seções aparecem na mesma página, sem abas ou badges de fase.

| Conteúdo prescrito | Apresentação ao abrir |
| --- | --- |
| Aquecimento e exercícios principais | Aquecimento recolhido acima dos exercícios principais. Seu cabeçalho permite expandir e recolher. Os exercícios principais ficam sempre visíveis. |
| Apenas exercícios principais | A lista começa após o cabeçalho do treino. O bloco de aquecimento é omitido. |
| Apenas aquecimento | Aquecimento expandido e sempre visível, sem controle de recolher ou seção principal vazia. |

O aquecimento apresenta a prescrição para consulta. O registro de progressão e a confirmação de série que inicia o descanso pertencem aos exercícios principais. Para acompanhar um movimento dessa forma, o usuário o inclui na parte principal ao montar o treino. Abrir ou recolher uma seção apenas muda sua apresentação.

## Tratamento dos controles

Usar a [escala comum de tipografia, ícones e áreas de toque](medidas.md) no detalhe e nos seus diálogos.

Título de página de 24 px, títulos de seção de 20 px, metadados de 12–14 px. Usar algarismos de largura fixa no cronômetro. Ícones de ação de 20 px, marcas de confirmação de 16 px e alvo de toque de pelo menos 44 px no celular. Usar lilás como acento de treino, verde suave para série confirmada e contorno de foco visível. Manter o símbolo de confirmação. A linha do horário atual e o esmaecimento de eventos passados pertencem à grade da agenda.

## Validação na etapa de CSS

Comparar com a execução atual em prévia, andamento, pausa, descanso e conclusão. Conferir posição das ações, ordem das colunas, leitura do valor anterior, foco e teclado móvel. Testar campos por lado e títulos longos. Verificar que editar carga, confirmar série, ajustar descanso, pausar, retomar e finalizar têm o mesmo comportamento antes e depois da revisão visual.
