# Padrão da documentação

## Fontes e identidade

- Status de tarefa pertence somente a `roadmap/README.md`. ID, dependências, escopo e aceite permanecem na tarefa. Não renumerar IDs existentes.
- Regras de produto pertencem a `product/`; justificativas e substituições explícitas, a `decisions/`. Planos fazem referência a essas fontes.
- O nome de uma pasta não comprova aprovação, implementação ou conclusão. Um plano pode conter etapas entregues e pendentes; identifique cada uma.
- Registros de sessões em `worklog/` não são tarefas duplicadas. Seu índice continua pertencendo ao processo que o gera.
- Modelo proposto não substitui schema e migrations. Relatório de teste antigo não comprova a execução atual de testes.

## Tipos e destino

| Tipo | Destino | Conteúdo mínimo |
| --- | --- | --- |
| Regra de produto | `product/` | Jornada, comportamento, exceções e pontos ainda propostos |
| Arquitetura | `architecture/` | Responsabilidades, contratos, limites e vigência |
| Decisão | `decisions/` | Data, contexto, decisão, consequências e substituição quando existir |
| Plano | `plans/<assunto>/` | Estado atual, resultado esperado, etapas, dependências, aceite e decisões pendentes |
| Tarefa | `roadmap/epics/<epico>/` | Template existente, ID estável e entradas exatas |
| Evidência | `evidence/<assunto>/` | Base/data, procedimento, resultado, artefatos e limitações |
| Histórico | `history/` | Base original, motivo da classificação e referência posterior |
| Pesquisa | `research/` | Pergunta, fontes e resultado esperado; não declarar suas hipóteses aprovadas |
| Guia/operação | `guides/` ou `operations/` | Pré-condições, procedimento e verificação; rollback quando aplicável |

## Cabeçalho comum

Depois do título H1, documentos de plano, evidência e histórico usam uma lista curta:

- **Tipo:** Plano, Evidência ou Histórico.
- **Área:** assunto do documento.
- **Tarefas relacionadas:** links para IDs existentes, ou “Vínculo formal pendente”.

Esse cabeçalho classifica o documento, não duplica status. Não inventar responsáveis, prazos, estimativas, aprovações nem vínculos. Documentos históricos preservam seus corpos e títulos de seção para não romper referências.

## Estado atual e histórico

Planos novos seguem o [modelo de plano](templates/PLAN.md). Ao retomar um plano antigo, acrescentar um resumo de estado comprovado e distinguir passos entregues, validação pendente e propostas. Não transformar um relatório parcial em conclusão da tarefa.

Evidências novas seguem o [modelo de evidência](templates/EVIDENCE.md). Decisões novas seguem o [modelo de decisão](templates/DECISION.md). Tarefas continuam usando o [template do roadmap](../roadmap/templates/TASK-TEMPLATE.md).

Não exigir um formato novo para o corpo de todo documento histórico: preservar regras e resultados é prioritário. A padronização do cabeçalho, localização e navegação torna esses documentos identificáveis sem reescrever suas decisões.

## Pastas, arquivos e links

- Usar pastas em inglês, minúsculas e com hífen, seguindo a estrutura existente. Manter nomes legados dos arquivos movidos para facilitar rastreamento no Git.
- Criar subpasta de assunto somente quando houver documentos que a utilizem.
- Usar links relativos para arquivos locais e referências de seção quando a leitura puder ser limitada.
- Ao mover um documento, corrigir links de entrada, links internos e caminhos escritos em texto. Atualizar o catálogo e o índice de assunto no mesmo trabalho.
- Links para código histórico removido devem indicar sua natureza; não apresentar o caminho ausente como código atual.
- Preservar fontes e hashes de proveniência. Não reescrever um manifesto de migração apenas para acomodar organização visual.
- Não versionar caminhos pessoais, logs extensos ou conteúdo privado em índices.

## Manutenção e verificação

O catálogo e os índices organizam navegação, sem copiar contagens de status ou percentuais. Novos documentos precisam aparecer no catálogo e no índice de assunto apropriado. Verificar destinos locais, IDs/dependências, preservação de conteúdo e `git diff --check`.

Esta mudança não introduz sincronização automática, CLI de status nem painel. A futura central pode consumir essas fontes sem manter uma segunda versão do planejamento.
