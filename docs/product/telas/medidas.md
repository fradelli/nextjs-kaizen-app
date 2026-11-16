# Geometria e áreas de toque do Kaizen

Tipografia, ícones, densidade visual, cores e variantes pertencem ao [guia de estilo](guia-de-estilo.md). `@fradelli/ui` fornece as receitas. Aqui ficam requisitos de interação específicos do produto.

## Toque e legibilidade

- Área acionável de pelo menos 44 × 44 px no celular, inclusive na confirmação de série. Desenho compacto de 28 px não autoriza sobreposição de alvos invisíveis.
- Confirmar série e editar carga são gestos independentes. Ícones têm nome acessível; cronômetros usam algarismos de largura fixa.
- Validar texto ampliado, títulos longos, teclado, foco visível, teclado virtual e áreas seguras. Emulação não comprova aparelho físico; pendência na E06-T14.

## Geometria da agenda

Posição e altura representam tempo. Na referência de 80 px/h, 15 min ocupam 20 px. Não inflar duração de sessões curtas para caber controles; detalhes continuam acessíveis por seleção/lista.

**Proposta a testar:** toque ambíguo entre eventos adjacentes abre escolha com títulos, horários e linhas de 44 px. Validar dois eventos consecutivos em 390 px antes de adotar; conferir também 1280 px.

Comportamento da [agenda](meu-dia.md) e da [execução](execucao.md) permanece em seus documentos. Pesos anteriores (700 página, 600 seção/status) são referência histórica; a receita Mira do pacote determina a implementação atual.
