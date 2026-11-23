# Regras de domínio do treino

- **Tipo:** Guia.
- **Área:** Treino.
- **Tarefas relacionadas:** Vínculo formal não identificado; não inferir status de tarefa.

Este documento resume as regras de treino herdadas do snapshot privado. A governança do repositório continua definida em [`AGENTS.md`](../../AGENTS.md); este guia trata somente do domínio.

## Fontes de verdade

Em caso de divergência, corrija primeiro os dados canônicos e depois sincronize a documentação humana:

1. [`data/profile.json`](../../data/profile.json): objetivos e contexto público aprovado.
2. [`data/schedule.json`](../../data/schedule.json): regras públicas de distribuição, sem agenda exata.
3. [`data/active.json`](../../data/active.json): ponteiro para o plano vigente.
4. Plano indicado pelo ponteiro: prescrição atual.
5. [`data/exercises.json`](../../data/exercises.json): biblioteca com IDs estáveis.
6. `data/plans/`, `data/reviews/` e `docs/historico/`: versões e derivados autorizados.
7. `docs/guides/`: projeção humana dos dados acima.

Originais recebidos do coach permanecem em fonte privada. O [manifesto](../migration/MIGRATION-MANIFEST.md) registra sua proveniência e exposição sem publicar o conteúdo.

## Convenções

- Datas usam ISO 8601 (`YYYY-MM-DD`) e horários, quando armazenados em ambiente protegido, usam 24 horas (`HH:MM`).
- O fuso de referência é `America/Sao_Paulo`.
- IDs de exercícios usam `snake_case` e exigem migração explícita para serem renomeados.
- Histórico mensal e versões anteriores nunca são sobrescritos.
- Toda mudança material atualiza `CHANGELOG.md` e os campos de atualização aplicáveis.
- Hipóteses não viram fatos; ausências permanecem `null` ou em `unknowns`.

## Novo treino mensal

1. Preservar a entrada exatamente como recebida em fonte privada e protegida.
2. Registrar commit, caminho, hash e exposição no manifesto antes de qualquer derivação pública.
3. Avaliar exercícios, dosagem, redundâncias, contribuição e substituições sem alterar o original.
4. Considerar treinos de areia e jogos como carga física, especialmente contatos de salto.
5. Criar revisão e resumo histórico somente com exposição aprovada.
6. Criar uma nova versão do plano; nunca editar retroativamente uma versão histórica.
7. Atualizar o ponteiro ativo, guias derivados e changelog.

## Mudança de agenda

- Tratar a agenda completa como dado privado até existir armazenamento protegido.
- Publicar somente regras e fatos agregados autorizados em `data/schedule.json`.
- Recalcular a distribuição considerando jogo, recuperação e sessões consecutivas.
- Priorizar desempenho no jogo, força e potência quando fresco, controle pliométrico e, depois, estética.
- Criar nova versão do plano quando a distribuição mudar materialmente.

## Princípios de prescrição

- Performance no futevôlei prevalece sobre estética quando houver conflito.
- Saltos máximos usam baixo volume, alta qualidade e descanso amplo.
- Potência não deve virar resistência por excesso de repetições.
- Pernas não são treinadas rotineiramente até a falha.
- Mobilidade pré-treino é dinâmica e específica; amplitude prolongada fica depois ou em sessão separada.
- Nenhum exercício isolado garante prevenção de lesão; importam progressão, aterrissagem, propriocepção e gestão de carga.

## Limites de segurança

Não diagnosticar nem usar este repositório como reabilitação individual. Dor persistente, trauma, sintomas neurológicos ou retorno pós-cirúrgico exigem avaliação profissional presencial. Consulte também [Evidências e limites](../evidence/TRAINING-EVIDENCE-AND-LIMITS.md).

## Validação mínima

- Todos os JSONs fazem parse.
- O plano apontado existe e seu `plan_id` coincide com `active_plan_id`.
- Todos os `exercise_id` usados existem e são únicos na biblioteca.
- Links relativos resolvem.
- Dados privados, caminhos antigos e originais não autorizados permanecem ausentes.
