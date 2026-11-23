# Padronização da documentação existente

- **Tipo:** Evidência.
- **Área:** Documentação.
- **Tarefas relacionadas:** [E00-T09](../../../roadmap/epics/E00-repository-governance/T09-standardize-documentation.md).

## Base e procedimento

Base: `66326d6` (E00-T08), em 22/11/2026. A padronização só acrescentou conteúdo: nenhuma seção foi renomeada, nenhum arquivo foi movido e nenhum corpo foi reescrito.

1. **Tarefas.** Cada seção do [modelo](../../../roadmap/templates/TASK-TEMPLATE.md) ausente foi inserida logo depois da seção do modelo que a antecede, com o texto “Não registrado na versão original desta tarefa.”. Quando a tarefa já tinha uma seção própria com o mesmo papel, o texto cita essa seção (por exemplo, «Aceite e resultado»). Seções próprias continuam onde estavam.
2. **Dependências.**
   - As condições que não são tarefas passaram para o campo `external` do frontmatter: “dieta fornecida” (E02-T02) e “decisões aprovadas” (E02-T04).
   - As tabelas de ordem dos épicos receberam os IDs que faltavam em relação ao `depends_on`:
     - E04-T01 recebeu E00-T07;
     - E06-T02 e E07-T02 receberam E04-T04.
   - E09-T09 e E10-T08 ganharam linha na tabela do seu épico.
3. **Documentos.** Os 43 documentos de conteúdo que não tinham o cabeçalho comum receberam Tipo, Área e Tarefas relacionadas logo abaixo do H1. As tarefas relacionadas são os IDs que o próprio documento já citava. Sem citação, o campo usa a frase já adotada nas evidências: “Vínculo formal não identificado; não inferir status de tarefa.”.
4. **Verificação.** `pnpm docs:preservation --base 66326d6 --replacements docs/evidence/documentation/E00-T09-replaced-lines.json` compara cada Markdown de `docs/`, `roadmap/` e da raiz com a base.

## Resultados

| Verificação | Resultado observado | Referência |
| --- | --- | --- |
| Preservação | 244 arquivos e 15.445 linhas da base presentes; 8 linhas substituídas, todas declaradas. Três linhas de tabela ganharam IDs, e cinco linhas de regra do padrão e de `roadmap/AGENTS.md` foram ampliadas mantendo o texto original | [substituições](E00-T09-replaced-lines.json) |
| Seções das tarefas | 111 seções acrescentadas em 32 tarefas (32 Subtarefas, 32 Validações, 25 Entregáveis, 10 Objetivo, 9 Critérios de aceite, 2 Resultado, 1 Entradas); 23 apontam para uma seção equivalente | `roadmap/epics/` |
| Dependências | Frontmatter, índice do roadmap e tabelas dos épicos iguais para as 105 tarefas | `pnpm docs:check` |
| Cabeçalhos | 43 documentos completados; todos os documentos de conteúdo têm Tipo, Área e Tarefas relacionadas | `pnpm docs:check` |
| Catálogo e links | Todos os documentos no catálogo; nenhum link local quebrado | `pnpm docs:check` |
| Estados | Nenhum estado alterado; E10-T09 continua a única `IN_PROGRESS` e a tarefa selecionada | [roadmap](../../../roadmap/README.md) |

## Limitações e pendências

- **Placeholders.** “Não registrado na versão original” marca uma lacuna da tarefa antiga e não diz que o trabalho deixou de ser feito. Isso vale principalmente para as tarefas concluídas da E06 e da E10, cujo conteúdo está em seções próprias.
- **Ordem das seções.** Oito tarefas mantêm as seções do modelo fora da ordem original. A ordem não foi alterada, para preservar âncoras e histórico.
- **Vínculos pela citação.** Um ID citado num documento pode ser só uma menção histórica, não uma dependência. O vínculo registrado não muda estado nem prioridade.
- **Tipos fora do vocabulário.** Duas reconciliações mantêm o tipo original: “Planejamento e inventário de evidências” e “Plano de organização e acompanhamento”. Uniformizar exige decisão do proprietário.
- **Fora do cabeçalho.** O diário (`docs/worklog/`) é gerado por outro processo e ficou de fora.
- **Lacunas de backlog.** As lacunas listadas na [reconciliação dos planos](../../plans/RECONCILIATION.md) continuam sem tarefas próprias:
  - autoria de planos;
  - revisão editorial do catálogo;
  - descanso;
  - versionamento de planos.
