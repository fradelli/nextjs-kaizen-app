# E12 — Saúde técnica do código

## Resultado esperado

Código da aplicação alinhado à arquitetura alvo, com fronteiras, validação, estado, segurança e testes corrigidos a partir da auditoria técnica de 2026-11-23 sobre `developer` (`364c71f`).

## Escopo

- Dependências, configuração e headers de segurança.
- Fronteiras entre app, aplicação, domínio e dados na agenda e no treino.
- Schemas Zod únicos entre cliente e servidor e erros tipados.
- Decisão e adoção de padrões de estado global e de formulários.
- TypeScript estrito, testes E2E e organização de pastas.

## Fora de escopo

- Funcionalidades novas de produto.
- Governança, documentação e CI, tratadas nas tarefas E00-T12 a E00-T16.
- Migração Mira, que segue em E10-T09.

## Ordem

| Tarefa | Depende de | Resultado |
| --- | --- | --- |
| [E12-T01](T01-sanitize-dependencies-and-overrides.md) | E00-T13 | Dependências com versão exata e overrides válidos |
| [E12-T02](T02-add-security-headers-and-route-states.md) | — | Headers de segurança e páginas de erro e carregamento |
| [E12-T03](T03-align-schedule-with-architecture-boundaries.md) | — | Agenda com caso de uso, action na ordem e sem REST interna |
| [E12-T04](T04-unify-zod-schemas.md) | E12-T03 | Um schema por contrato, compartilhado entre cliente e servidor |
| [E12-T05](T05-replace-text-errors-with-typed-codes.md) | E12-T04 | Erros por código, traduzidos só na UI |
| [E12-T06](T06-remove-duplicate-refresh-after-mutations.md) | — | Uma única atualização da rota após cada mutação |
| [E12-T07](T07-split-training-repository.md) | E12-T05 | Repositório de treino dividido e regras no domínio |
| [E12-T08](T08-decide-state-and-form-patterns.md) | — | Decisão sobre Zustand e React Hook Form registrada |
| [E12-T09](T09-migrate-client-caches-to-approved-store.md) | E12-T08 | Caches da agenda e rascunho de treino na store aprovada |
| [E12-T10](T10-migrate-activity-form-to-approved-pattern.md) | E12-T04, E12-T08 | Formulário de atividade no padrão aprovado |
| [E12-T11](T11-tighten-typescript-strictness.md) | E12-T07 | Opções estritas extras do TypeScript ativas |
| [E12-T12](T12-create-critical-e2e-tests.md) | E12-T02 | Jornadas críticas cobertas por Playwright |
| [E12-T13](T13-standardize-imports-and-feature-folders.md) | E12-T09 | Imports e estrutura de pastas uniformes |

Os status ficam exclusivamente em `roadmap/README.md`.

## Critérios de encerramento

- [ ] Todas as tarefas obrigatórias estão `DONE` ou `CANCELLED` por decisão registrada.
- [ ] `docs/architecture/TARGET-ARCHITECTURE.md` reflete as decisões tomadas no épico.
- [ ] `pnpm run ci` passa com os novos gates.
