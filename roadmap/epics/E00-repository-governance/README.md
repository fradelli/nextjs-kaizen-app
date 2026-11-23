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
- Migração do agente de desenvolvimento para Claude, higiene do repositório e gates de CI (auditoria de 2026-11-23).

## Fora de escopo

- Migração de dados pessoais.
- Código da aplicação, Vercel ou banco; correções de código da auditoria pertencem ao [E12](../E12-code-health/README.md).

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
| [E00-T10](T10-create-local-roadmap-view.md) | E00-T09 | Roadmap, tarefas e documentos navegáveis numa página local |
| [E00-T11](T11-apply-design-system-to-roadmap-view.md) | E00-T10 | Visualização do roadmap com o design system e o logo do Kaizen |
| [E00-T12](T12-migrate-agent-governance-to-claude.md) | — | Claude como único agente, sem regra exclusiva do Codex |
| [E00-T13](T13-remove-unused-repository-artifacts.md) | E00-T12 | Repositório sem artefatos e arquivos sem consumidor |
| [E00-T14](T14-analyze-documentation-for-claude.md) | E00-T12 | Plano aprovado de documentação otimizada para Claude |
| [E00-T15](T15-apply-approved-documentation-reorganization.md) | E00-T14 | Documentação reorganizada conforme o plano |
| [E00-T16](T16-strengthen-ci-gates.md) | — | CI remoto com os mesmos gates do `pnpm run ci` |

Os status ficam exclusivamente em `roadmap/README.md`.

## Critérios de encerramento

- [x] A exposição pública possui política explícita e padrão restritivo.
- [x] A proveniência aponta para um commit-base imutável do legado privado.
- [x] E01-T01 está elegível para escolher o snapshot definitivo.
- [ ] E00-T12 a E00-T16 estão `DONE` ou `CANCELLED` por decisão registrada (reaberto em 2026-11-23 pela auditoria técnica).
