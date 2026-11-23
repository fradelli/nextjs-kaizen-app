# Tarefa selecionada

- **Tarefa:** E10-T09 — Concluir adoção do design system Mira
- **Status:** IN_PROGRESS
- **Entrada principal:** `roadmap/epics/E10-portfolio-visual-alignment/T09-complete-mira-adoption.md`.
- **Autorização:** pacote de ajustes do executor e diálogos autorizado em 13/11/2026. Aquecimentos excluídos do resumo e carga unilateral por lado.
- **Próxima ação da tarefa selecionada:** revisar o pacote registrado em `docs/plans/design-system/AJUSTES-DO-EXECUTOR-MIRA.md` e continuar as pendências globais da migração Mira. Build, 64 testes direcionados, 18 integrações e conferência de navegador em 1440/390/320 px são evidências da entrega original, não verificações refeitas nesta reorganização. E00-T08 permanece concluída.

## Retomada e trabalhos paralelos

- Base da reorganização: `27536ef`, integração da agenda pela PR #86; histórico local também registra a integração Mira em `b37c215` pela PR #84. Isso não encerra automaticamente a E10-T09 nem comprova release do design system ou produção.
- E00-T08 a E00-T11 integradas em `developer` pelas PRs #87 a #90 (até `e0834f3`): organização e padronização documental e a [visualização local do roadmap](epics/E00-repository-governance/T11-apply-design-system-to-roadmap-view.md), aberta com `pnpm roadmap:view`. A reorganização documental não inicia a implementação do drag and drop.
- `@fradelli/ui` vem do pacote local `vendor/fradelli-ui-mira-table-progress.tgz`, gerado de um commit do design system (`698b828`) sem versão publicada. Trocar pela versão publicada quando existir.
- App próprio de roadmap e central multiprojeto: proposta sem tarefa nem plano registrados. Não iniciar sem tarefa aprovada.
- E06-T26 conserva os commits e resultados originais na própria tarefa. Não repetir implementação a partir dos checkpoints antigos.
- O plano de [drag and drop](../docs/plans/agenda/AGENDA-DRAG-AND-DROP.md) está vinculado ao [E11](epics/E11-schedule-evolution/README.md), sem iniciar sua execução. A [organização documental](../docs/REORGANIZATION-2026-11.md) preserva status e dependências existentes.
- E06-T23: implementação entregue, jornada manual completa pendente. E06-T14: teclado virtual/área segura em aparelho físico pendentes.
- E06-T22 e E06-T25 permanecem concluídas; detalhes nas respectivas tarefas.
- Auditoria técnica de 2026-11-23 sobre `developer` (`364c71f`) registrada como E00-T12 a E00-T16 e no [E12](epics/E12-code-health/README.md). E00-T12 vem antes das demais porque o validador de governança só aceita branches `codex/`. Nenhuma delas substitui a tarefa selecionada sem decisão do responsável.

O [diário operacional](../docs/worklog/index.md) registra sessões; seus estados não substituem o status canônico do roadmap.

As [próximas tarefas da agenda antes do drag and drop](../docs/plans/agenda/AJUSTES-DA-AGENDA.md#próximas-tarefas-antes-do-drag-and-drop) estão registradas com critérios de aceite.
