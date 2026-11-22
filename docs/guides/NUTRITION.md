# Guia do plano alimentar

- **Tipo:** Guia.
- **Área:** Alimentação.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Este guia explica como localizar e interpretar o plano alimentar vigente. A fonte canônica é o JSON apontado por [`data/nutrition/active.json`](../../data/nutrition/active.json); se este texto divergir dos dados, prevalece o JSON.

## Situação atual

- Plano ativo: `nutrition_2026_09_personal_v1`
- Vigência inicial: 2026-09-02
- Uso: pessoal, aprovado pelo proprietário
- Validação profissional: não realizada
- Fuso horário: `America/Sao_Paulo`

As faixas energéticas vieram do plano legado e foram aprovadas para organização pessoal. Elas não foram calibradas por profissional e não devem ser tratadas como prescrição clínica.

## Como interpretar o dia

1. Escolha o tipo que corresponde à carga real do dia.
2. Use a faixa energética e a quantidade de módulos de carboidrato indicadas nesse tipo.
3. Percorra as cinco refeições na ordem do dia e escolha uma opção familiar em cada refeição aplicável.
4. Quando existir regra de horário, prefira a janela e as opções nela indicadas.
5. Não complete valores `null` por estimativa. Registre a informação confirmada em uma nova versão do plano.

| Tipo de dia | Faixa do plano | Módulos de carboidrato |
| --- | --- | --- |
| Recuperação ou sem treino | 2500–2800 kcal | 0 |
| Treino de força | 2700–3000 kcal | 1 |
| Pliometria ou microdose | 2700–3000 kcal | 0–1 |
| Somente futevôlei | 2700–3000 kcal | 1 |
| Força ou pliometria mais futevôlei | 2900–3300 kcal | 2 |
| Jogo no fim de semana | 2900–3300 kcal | 2 |

O plano contém café da manhã, almoço, lanche da tarde, jantar e ceia. A ceia é opcional e depende de fome. Cada refeição possui alternativas próprias; algumas opções reutilizam outra opção por `reference_option` para evitar duas definições editáveis.

## Regras de horário confirmadas

- Treino ao meio-dia com café completo tolerado: café entre 08:30 e 09:30.
- Treino ao meio-dia com desconforto após café completo: opção reduzida às 10:30 e almoço maior depois.
- Retorno do treino ao meio-dia: almoço entre 13:00 e 13:30.
- Lanche da tarde: entre 17:00 e 18:00.
- Jantar habitual quando houver fome: 19:00.

As condições e os IDs exatos das opções estão em `timing_rules` no plano canônico.

## Limites de uso

- O plano organiza escolhas já aprovadas; ele não recomenda alimentos automaticamente.
- Não existe contagem contínua de calorias nesta fundação.
- Metas pessoais de macronutrientes, hidratação e horário do jogo permanecem desconhecidas.
- Protocolos de suplementos, doses de cafeína, diagnósticos e equivalências não verificadas estão fora da fundação.
- Sintomas persistentes, perda de peso não intencional ou necessidades clínicas exigem avaliação profissional presencial.

## Contrato e atualização

O arquivo [`schemas/nutrition-plan.schema.json`](../../schemas/nutrition-plan.schema.json) valida a estrutura mínima. Referências entre tipos de dia, refeições, horários e opções precisam de validação complementar.

Para alterar o plano:

1. preserve a versão vigente;
2. crie um novo arquivo em `data/nutrition/plans/` com novo `plan_id` ou versão;
3. mantenha fatos ausentes como `null`;
4. valide o novo arquivo contra o schema e as referências cruzadas;
5. atualize `data/nutrition/active.json` somente após aprovação;
6. sincronize este guia como uma visão derivada e registre a mudança no changelog.

## Proveniência

A transformação aprovada está registrada em [`NUTRITION-PLAN-PUBLICATION.md`](../decisions/NUTRITION-PLAN-PUBLICATION.md). O plano mantém os commits de origem e os IDs dos artefatos privados sem publicar seus conteúdos.
