---
id: E04-T05
epic: E04
depends_on: [E04-T02, E04-T03, E04-T06]
---

# Configurar CI mínimo

## Objetivo

Implementar os gates estáveis aprovados na governança de CI para pull requests e promoções.

## Contexto

O CI deve proteger a validação de prontidão e a integração do Design System antes do shell. E04-T08 complementará o workflow com acesso mínimo ao package privado já publicado.

## Entradas

- `.github/dependabot.yml`
- `.github/workflows/ci.yml`
- `docs/decisions/CI-CD-GOVERNANCE.md`
- `docs/guides/NUTRITION.md`
- `docs/guides/TRAINING-GUIDE.md`
- `.github/pull_request_template.md`
- `.github/PULL_REQUEST_TEMPLATE/release-promotion.md`
- `AGENTS.md`
- `CHANGELOG.md`
- `data/AGENTS.md`
- `data/active.json`
- `data/exercises.json`
- `data/nutrition/active.json`
- `data/nutrition/plans/2026-09-personal-v1.json`
- `data/nutrition/reviews/e02-t03-review-metadata.json`
- `data/plans/2026-08-performance-v1.json`
- `data/plans/2026-08-performance-v2.json`
- `data/profile.json`
- `data/reviews/2026-08-review.json`
- `data/schedule.json`
- `package.json`
- `pnpm-lock.yaml`
- `roadmap/ACTIVE.md`
- `roadmap/README.md`
- `roadmap/epics/E04-nextjs-foundation/T07-validate-design-system-readiness.md`
- `schemas/exercise-library.schema.json`
- `schemas/nutrition-plan.schema.json`
- `schemas/training-plan.schema.json`
- `scripts/validate-data.mjs`
- `scripts/validate-data.test.mjs`
- `scripts/validate-governance.mjs`
- `scripts/validate-governance.test.mjs`
- `vitest.config.ts`

## Entregáveis

- Workflow reutilizável de PR.
- Validação mecânica de branches, títulos, descrições e direção.
- Rulesets das branches protegidas.

## Fora do escopo

- Configurar credencial ou acesso ao GitHub Packages antes de E04-T08.
- Instalar `@fradelli/ui`, Tailwind ou fontes.

## Subtarefas

- [x] Executar instalação reproduzível.
- [x] Criar jobs estáveis `Governance`, `Quality`, `Test`, `Data integrity`, `Build` e `Dependency audit`.
- [x] Executar lint, tipos, formato, testes, validações documentais, build e audit `moderate`.
- [x] Validar ID da tarefa, template e matriz `developer -> staging -> master`.
- [x] Configurar rulesets sem permitir push direto.
- [x] Configurar cache somente se trouxer benefício medido.

## Validações

- Workflow passa e falha deliberadamente em regressão controlada.
- Implementação local aprovada por `pnpm run ci`; execução remota e rulesets dependem da publicação da PR.

## Critérios de aceite

- [x] As três branches protegidas recebem apenas mudanças que passam nos gates aplicáveis.

## Riscos

- Workflow local e remoto executarem matrizes diferentes.
- Antecipar autenticação de package sem consumidor real.

## Rollback

Reverter o workflow defeituoso sem remover ou relaxar os gates locais.

## Resultado

Concluída em 2026-09-10. A PR #27 executou com sucesso os seis gates remotos. Os rulesets `developer-pr-gates` e `promotion-pr-gates` exigem PR e os checks estáveis em `developer`, `staging` e `master`, sem bypass, exclusão ou force push. Tarefas usam squash, promoções usam merge commit e rebase merge está desabilitado.

## Consolidação documental de 12/11/2026

SHAs iniciais das Actions permanecem na origem. Regras correntes em CI-CD-GOVERNANCE/PULL-REQUEST-STANDARD e no validador.

[Pacote original integral](https://github.com/fradelli/nextjs-kaizen-app/blob/fd2269d2eaa7d55cfea724631f12fa6505d37b32/docs/implementation/tasks/E04-T05.md), SHA-256 `ba71abd93960777e303ae6b3e5c3a07083e7f7b3bd7a056231a72e08ec563b7d`. Comandos, critérios, riscos e rollback registram aquela base e não são receita para reinstalar a aplicação atual. Pendências não viraram aprovações nesta consolidação.
