# Reconciliação dos planos da agenda

- **Tipo:** Planejamento e inventário de evidências.
- **Área:** Agenda.
- **Referência:** revisão documental em 21/11/2026; base integrada `27536ef` (PR #86), reorganização documental `b0fe6e9`.
- **Tarefas relacionadas:** [E11 — Evolução da agenda](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E11-schedule-evolution/README.md).

Este mapa liga planos, código existente e trabalho restante. O [roadmap](https://github.com/fradelli/playbook/blob/main/projects/kaizen/README.md) é a fonte dos estados. A leitura de código não equivale a teste executado; nenhuma funcionalidade foi implementada nesta reconciliação.

## O que existe e o que falta

| Frente | Evidência e limite | Próximo trabalho |
| --- | --- | --- |
| Fundação da agenda | Listas, tarefas, atividades, reservas e controle de revisão constam no [escritor](../../../src/features/schedule/data/schedule-writer.ts). Integração registrada na PR #86; não significa validação completa de jornadas. | E11-T01: validar persistência, identidade, histórico e regressões. |
| Interface e cache | Painéis e seleção por coluna já integrados; [cache de dias](../../../src/features/schedule/ui/components/calendar-range/hooks/use-calendar-days.ts) e atualizações direcionadas descritos no [relatório técnico](../../evidence/agenda/AGENDA-PERFORMANCE-E-ORGANIZACAO.md). Esse relatório registra limites de testes e navegador; não contém benchmark conclusivo. | E11-T01: conferir jornadas, recarga, datas afetadas e limites de dispositivos. |
| Gestos iniciais | [Plano de DnD](AGENDA-DRAG-AND-DROP.md) define a biblioteca e o recorte. Seleção atual por coluna não implementa arraste de cards nem seleção multidia. | E11-T02: POC sem escrita; E11-T03: integrar apenas os gestos aprovados. |
| Reserva individual | Criar e remover reserva existem; o [contrato de comandos](../../../src/features/schedule/application/schedule-command.ts) não oferece movimento/resize individual de reserva. | E11-T04: comando próprio, mantendo identidade e conclusão compartilhada. |
| Vínculos entre atividades | Há estrutura de parentesco, mas isso não entrega o fluxo público completo de vincular/desvincular por gesto. Não presumir suporte a árvores profundas. | E11-T05: comandos, zonas e comportamento coerentes com as regras de produto. |
| Extensões dos gestos | Faixa sem horário e edição de treino existentes não resolvem duração ao ganhar horário, mobile multidia, resize superior ou representação de treino concluído. | E11-T06: decidir regras e critérios antes de ampliar implementação. |
| Recorrência e tempo | Projeção de treino não comprova recorrência genérica de atividades nem registro de tempo completo. | E11-T07: detalhar séries, exceções, janelas e registro de tempo; implementação terá recorte próprio. |
| Sobreposições | Distribuição atual de cards não equivale ao agrupador +N proposto. | E11-T08: definir prioridade, interseções parciais e acesso às atividades agrupadas. |

## Sequência e decisões

1. Validar a base integrada (E11-T01).
2. Executar a POC isolada (E11-T02), incluindo alternativas sem arraste, teclado e toque.
3. Após avaliação dos resultados, integrar persistência (E11-T03).
4. Evoluir reservas e vínculos (E11-T04 e E11-T05).

E11-T06 a E11-T08 são refinamentos documentais independentes. Não autorizam desenvolvimento das extensões. A biblioteca escolhida permanece a do plano; esta revisão não reabre sua escolha. Regras de produto permanecem em [Agenda — regras aprovadas](../../product/telas/agenda-regras-de-produto.md).

## Fronteiras com o backlog existente

- A seleção de trabalho em [ACTIVE](https://github.com/fradelli/playbook/blob/main/projects/kaizen/ACTIVE.md) permanece E10-T09. Registrar E11 não inicia outra tarefa.
- E06-T23 tem implementação registrada e jornada manual pendente; E06-T14 ainda depende de verificação física de teclado/área segura. Não encerrar por inferência a partir de código integrado.
- E06-T22, E06-T24 e E06-T26 documentam evolução de treino. Consultar seus resultados antes de repetir entregas. O escopo antigo de timer de E06-T10 exige comparação própria com essas entregas; não foi encerrado nesta revisão.
- O plano de Meu Dia reúne também navegação, treino e revisão visual. Seus vínculos com E11 cobrem somente o recorte de agenda. Autoria de planos de treino, catálogo, dieta e migração Mira conservam seus planos e tarefas.
- A central visual multiprojeto continua uma proposta separada. Esta etapa prepara documentos navegáveis e tarefas identificáveis; não cria outro aplicativo.

## Como manter

Atualizar esta matriz quando uma evidência mudar a interpretação do escopo. Registrar execução e resultados na tarefa; atualizar estados apenas no roadmap. Os planos detalhados continuam como fonte dos critérios, e documentos históricos não devem ser convertidos silenciosamente em descrição da aplicação atual.
