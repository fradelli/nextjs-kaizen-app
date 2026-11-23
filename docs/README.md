# Documentação do Kaizen

Este é o ponto de entrada da documentação. Escolha o assunto antes de abrir documentos extensos. O [catálogo](CATALOG.md) lista os documentos por finalidade; o [padrão](DOCUMENTATION-STANDARD.md) orienta novas entradas e manutenção.

## Onde procurar

| Pergunta | Fonte |
| --- | --- |
| Como navegar pelo planejamento por área? | [Visão geral do Kaizen](../roadmap/OVERVIEW.md) e [reconciliação dos planos](plans/RECONCILIATION.md) |
| O que falta e o que foi concluído? | [Roadmap](../roadmap/README.md): único status canônico das tarefas |
| Qual trabalho foi selecionado? | [Retomada](../roadmap/ACTIVE.md): tarefa selecionada e contexto, não uma fila automática |
| Como o produto deve funcionar? | [P0](product/P0.md) e [telas](product/telas/README.md) |
| Qual é o plano de uma mudança? | [Planos por assunto](plans/README.md) |
| Como organizar o código? | [Arquitetura](architecture/TARGET-ARCHITECTURE.md) |
| Qual regra visual seguir? | [Guia de estilo](product/telas/guia-de-estilo.md) |
| Por que uma decisão foi tomada? | [Decisões](CATALOG.md#decisões) |
| O que foi validado? | [Evidências](evidence/README.md), resultado da tarefa e [diário](worklog/index.md) |
| O que descreve uma base anterior? | [Histórico](history/README.md) |
| Como operar e atualizar dados? | [Guias e operação](CATALOG.md#guias-e-operação) |
| O que ainda é pesquisa? | [Pesquisa](research/README.md) |

## Como ler sem carregar todo o projeto

Leia o contrato raiz, a tarefa escolhida e somente suas entradas relevantes. Um plano deve apontar regras e decisões por link; não copiar toda a arquitetura ou o histórico. Evidência de entrega local não comprova publicação, e uma proposta não autoriza execução.

## Organização

```text
docs/
  product/          regras e experiência do produto
  architecture/    arquitetura vigente e propostas identificadas
  decisions/       decisões e suas justificativas
  plans/           planos agrupados por assunto
  evidence/        relatórios e artefatos de validação
  history/         diagnósticos e planos de bases anteriores
  research/        perguntas e prompts de investigação
  guides/          consulta e atualização de dados
  operations/      procedimentos operacionais
  delivery/        convenções de entrega e PR
  migration/       proveniência, manifesto e validação da migração
  worklog/         sessões de trabalho, não tarefas de produto
  templates/       modelos documentais
  implementation/  índice de entrada mantido por compatibilidade
roadmap/
  epics/           tarefas e critérios de aceite com IDs estáveis
  templates/       modelos de tarefa e épico
```

O [registro da reorganização](REORGANIZATION-2026-11.md) contém o mapa de caminhos e os limites desta mudança. A [revisão anterior](documentation-review.md) permanece como evidência histórica.
