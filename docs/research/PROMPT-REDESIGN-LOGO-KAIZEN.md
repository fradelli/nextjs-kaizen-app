# Prompt de exploração do novo logo do Kaizen

- **Tipo:** Pesquisa.
- **Área:** Identidade visual.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Use este prompt para iniciar a exploração visual. A lista combina os tokens da prévia local atual de `@fradelli/ui` com as cores semânticas aprovadas para o Kaizen. A prévia ainda não representa uma versão publicada do pacote.

## Prompt

Quero explorar uma nova identidade visual para o logo do Kaizen, um aplicativo pessoal de treino, nutrição e hábitos inspirado pela ideia japonesa de melhoria contínua. Antes de propor formas, considere a paleta abaixo e diferencie as cores de identidade das cores funcionais da interface.

**Cores principais da interface:**

- Base neutra escura: fundo `#0B0B0C`, superfície `#141416`, superfície elevada `#1C1C1F`, superfície interativa/borda `#242428` / `#2B2B30`.
- Texto principal `#F4F4F5`; texto secundário `#9B9BA3`; tintas neutras escuras `#151515`, `#15130B` e `#1C0D0D` (usadas como foregrounds sobre cores preenchidas).
- Acento primário e navegação selecionada: amarelo dourado `#F2CF63`. Variações de navegação: borda `#B59949`, hover `#F5D97F`, foco `#FBE9A9`.

**Cores de ação e fase usadas pelo Kaizen:**

- Geral/adicionar: lilás `#BCA7E8`, com borda `#8D7DAE`, hover `#C8B7ED`, foco `#E6DAFF`.
- Iniciar/sucesso: verde sálvia `#A8D5BA`, com borda `#7EA08C`, hover `#B6DDC6`, foco `#DCF4E5`.
- Aquecimento: pêssego `#E5BA9C`, com borda `#AC8C75`, hover `#EAC6AD`, foco `#FBE3D2`.
- Treino principal: azul `#A9C5E8`, com borda `#7F94AE`, hover `#B8CFED`, foco `#DEEBFF`.
- Ação destrutiva: rosa `#E8A0A6`, com borda `#AE787D`, hover `#EDB1B6`, foco `#FFDBDE`.
- Controle neutro: `#29292C`, borda `#202023`, hover `#343438`, foco `#A7A7AE`.

Variações semânticas completas dessas famílias: dourado `#F2CF63` / `#B59949` / `#F5D97F` / `#FBE9A9`; lilás `#BCA7E8` / `#8D7DAE` / `#C8B7ED` / `#E6DAFF`; sálvia `#A8D5BA` / `#7EA08C` / `#B6DDC6` / `#DCF4E5`; pêssego `#E5BA9C` / `#AC8C75` / `#EAC6AD` / `#FBE3D2`; azul claro `#A9C5E8` / `#7F94AE` / `#B8CFED` / `#DEEBFF`; rosa `#E8A0A6` / `#AE787D` / `#EDB1B6` / `#FFDBDE` (preenchimento / borda / hover / foco).

**Cores categóricas do design system** (cor sólida / superfície sutil / borda):

- Amarelo: `#F2CF63` / `#312C20` / `#968140`.
- Laranja: `#F0A866` / `#312720` / `#946942`.
- Vermelho: `#F07878` / `#312123` / `#944C4D`.
- Rosa: `#E58AB7` / `#2F232B` / `#8E5773`.
- Roxo: `#B79AF2` / `#292533` / `#726196`.
- Azul: `#7DA7F2` / `#222733` / `#4F6996`.
- Ciano: `#65C8D0` / `#1F2B2E` / `#417C82`.
- Verde: `#7BC8A4` / `#212B28` / `#4E7C67`.

**Cores semânticas de status do design system:** sucesso usa o verde categórico; aviso usa o amarelo; informação usa o azul. Estado destrutivo: sólido `#FF6673`, superfície sutil `#35191E`, borda `#A3424A` e texto sobre a cor sólida `#19080B`.

Para o logo, trate o dourado `#F2CF63` como principal acento reconhecível da interface e os grafites/preto como base. Lilás `#BCA7E8` é o segundo acento recorrente de ações. As demais cores comunicam fases, categorias e estados; não precisam aparecer juntas no logo. O token genérico `brand` da prévia do design system é vermelho `#F07878`, mas isso não equivale a uma decisão de cor oficial da marca Kaizen.

Apresente direções distintas de logo, começando por versões monocromáticas e uma versão com um único acento. Pense em legibilidade em tamanhos pequenos, contraste sobre fundo claro e escuro, uso como favicon/app icon e reprodução em uma cor. Evite depender de gradientes ou de várias cores funcionais. Explique quais cores escolheu e por quê; não assuma que a paleta de interface precisa ser copiada integralmente para a identidade.

## Hierarquia cromática para discussão

1. **Base:** grafite escuro `#0B0B0C` / `#141416` e texto claro `#F4F4F5`.
2. **Acento principal:** dourado `#F2CF63` (primário do sistema e navegação ativa no Kaizen).
3. **Acento secundário opcional:** lilás `#BCA7E8` (ações gerais).
4. **Cores funcionais:** sálvia, pêssego, azul, rosa destrutivo e demais categorias; usar como referência, não como paleta obrigatória do logo.

## Fonte da referência

- Tokens: `node_modules/@fradelli/ui/dist/styles.css` na prévia local atualmente integrada.
- Intenções de cor específicas do Kaizen: `docs/product/telas/guia-de-estilo.md`.
