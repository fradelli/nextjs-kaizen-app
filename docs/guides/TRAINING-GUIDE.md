# Guia de consulta do treino

Este guia orienta a consulta. Prescrição, sessões, doses e agenda da versão corrente pertencem ao plano indicado por [data/active.json](../../data/active.json), não a uma lista fixa neste documento.

## Como consultar

1. Leia `active_plan_path` e confira `active_plan_id` com o `plan_id` do JSON.
2. Abra `human_guide_path` para particularidades dessa versão.
3. Consulte a programação em [data/schedule.json](../../data/schedule.json). Agenda operacional e realizado pertencem ao banco; programação não comprova realização.
4. Resolva descrições e riscos pelos IDs em [data/exercises.json](../../data/exercises.json). Divergências são lacunas para revisão, não autorização para inventar doses.

## Execução e atualização

- Siga somente alternativas previstas no plano ativo. Não aplique versões curtas, microdoses ou sessões de outro plano por semelhança de nome.
- Contabilize a carga esportiva, preserve recuperação e descanso; aquecimento prepara sem buscar exaustão.
- Registre o ocorrido mesmo quando diferente do prescrito. Mudança material cria nova versão; siga o [procedimento](UPDATING-TRAINING-DATA.md) e as [regras](TRAINING-RULES.md).
- Dor aguda, piora progressiva ou perda de controle exigem interromper/adaptar; persistência, trauma ou sintomas neurológicos exigem avaliação profissional. Veja [evidências e limites](../evidence/TRAINING-EVIDENCE-AND-LIMITS.md).

## Origem histórica

Listas `lower_a`/`upper_a` e alternativas de agosto não definem a versão atual. O resumo diário foi consolidado aqui; sua [fonte preservada](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/guides/DAILY-TRAINING-SUMMARY.md) mantém o contexto original. O manifesto conserva hashes da migração original, sem reescrita para representar esta revisão.
