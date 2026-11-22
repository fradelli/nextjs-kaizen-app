# E00 — Governança do repositório

## Resultado esperado

Repositório público com branches, documentação, publicação de conteúdo e entregas governadas, além da origem privada do legado rastreável, com contratos documentais mantidos durante a evolução da aplicação.

## Escopo

- Visibilidade e clone local.
- Branches de integração, homologação e produção.
- Contrato raiz e sistema de tarefas.
- Padrão de PR e governança progressiva de CI/CD.
- Proveniência do repositório legado.
- Contexto mínimo e roadmap executável antes do MVP.

## Fora de escopo

- Migração de dados pessoais.
- Aplicação, dependências, Vercel ou banco.

## Ordem

| Tarefa | Depende de | Resultado |
| --- | --- | --- |
| E00-T01 | — | Repositório e branches inicializados |
| E00-T02 | — | Cancelada: repositório público por decisão |
| E00-T03 | E00-T01 | Contrato raiz criado |
| E00-T04 | E00-T03 | Roadmap operacional criado |
| E00-T06 | E00-T04 | Governança de entrega adaptada |
| E00-T05 | E00-T04, E00-T06 | Origem do legado registrada |
| E00-T07 | E03-T05 | Contexto otimizado e dependências saneadas |
| E00-T08 | E00-T07 | Documentação consolidada e contexto dirigido do Codex |
| [E00-T09](T09-standardize-documentation.md) | E00-T08 | Documentação existente padronizada e verificável por script |

Os status ficam exclusivamente em `roadmap/README.md`.

## Critérios de encerramento

- [x] Todas as tarefas estão `DONE` ou `CANCELLED` por decisão registrada.
- [x] A exposição pública possui política explícita e padrão restritivo.
- [x] A proveniência aponta para um commit-base imutável do legado privado.
- [x] E01-T01 está elegível para escolher o snapshot definitivo.
