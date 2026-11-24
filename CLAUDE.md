# Kaizen rules

Rules for working in `fradelli/nextjs-kaizen-app`. Kaizen combines public versioned plans with operational training and nutrition records. Shared rules live in the playbook; this file holds what is specific to Kaizen.

## Playbook

The roadmap and the shared standards live in [`fradelli/playbook`](https://github.com/fradelli/playbook), cloned locally at `../../playbook`. Tasks of this repository use the `KZ-` prefix.

- Before implementing, read the playbook [`CLAUDE.md`](https://github.com/fradelli/playbook/blob/main/CLAUDE.md), then [`projects/kaizen/ACTIVE.md`](https://github.com/fradelli/playbook/blob/main/projects/kaizen/ACTIVE.md), then only the selected task and its Inputs.
- Follow the standards the task cites, and always the [writing](https://github.com/fradelli/playbook/blob/main/standards/general/writing.md) and [pull request](https://github.com/fradelli/playbook/blob/main/standards/general/pull-requests.md) standards.
- Change roadmap tasks, status, and `ACTIVE.md` only in the playbook, following its [integration standard](https://github.com/fradelli/playbook/blob/main/standards/general/playbook-integration.md).
- Put a new rule where the integration standard's placement table says.

## Context route

1. Apply the nested instructions of the folders you read: `docs/CLAUDE.md`, `docs/migration/CLAUDE.md`, and `data/CLAUDE.md`. Claude Code loads them when it reads files in those folders.
2. Find documents through `docs/README.md` and plans by subject through `docs/plans/README.md`. Use `docs/CATALOG.md` only to locate a source, not to load every document.
3. Do not read trees recursively. Locate titles and paths with `rg`, or with targeted PowerShell searches when `rg` is missing.
4. Read `CHANGELOG.md` and finished tasks only for planning, a status change, or a historical investigation.

## General rules

- Write in English, following the playbook [Language](https://github.com/fradelli/playbook/blob/main/CLAUDE.md#language) section. End-user copy in `messages/` keeps its localization.
- Separate facts, decisions, proposals, and unknowns. Never invent missing data.
- Treat the repository as public: never commit credentials, unnecessary identity, medical context, or personal comments.
- Never diagnose injuries or present unvalidated nutrition content as a professional prescription.
- Check Git before editing and preserve local changes. Preserve IDs and history; a destructive change needs an explicit migration and rollback.
- Do not create an abstraction, dependency, endpoint, or service without a consumer in the current task.

## Product and architecture

- Next.js full-stack with PostgreSQL and Prisma. Definitions live in Git and JSON; operation lives in the database. No separate backend or internal HTTP client.
- P0 is public without authentication by explicit decision. The fixed workspace is resolved on the server. Authentication comes before multiple users or sensitive data.
- Civil dates use `America/Sao_Paulo`; timestamps use UTC.
- Server Actions validate origin, input, ownership, and concurrency on the server. Never accept `workspace_id` from the client.

## Reading by change type

Task Inputs list `docs/architecture/TARGET-ARCHITECTURE.md` with the sections that apply. The section names below are the current document headings:

| Change | Required sections |
| --- | --- |
| Code | Semântica e legibilidade do código; Boundaries |
| React | Organização dos componentes React; Server Components; Client Components |
| Mutation | Server Actions; Segurança; Transações e concorrência |
| Prisma or database | Organização do Prisma e configuração de banco; Migrations |

- Give each component its own folder; `components/` holds component folders. The full rules belong to the architecture document.
- Appearance: `docs/product/telas/guia-de-estilo.md`. Behavior: the screen document in `docs/product/telas/`.
- Read decisions and historical plans only when the task needs them.

## Git and validation

- Start new work from `developer` on `claude/KZ-<ID>-short-description`. Do not recreate a branch or undo work in progress.
- Follow the playbook [pull request standard](https://github.com/fradelli/playbook/blob/main/standards/general/pull-requests.md) for titles, bodies, and merge methods, with the Kaizen details in `docs/delivery/PULL-REQUEST-STANDARD.md`.
- Always run `git diff --check` and check for secrets. Documentation: links and IDs. Data: schema, pointers, and references. Code: the gates in `package.json`.
- `pnpm run ci` runs the local gates; `pnpm ci` is a frozen install.
- `pnpm governance <event.json>` validates a pull request event against the playbook index; set `PLAYBOOK_INDEX_PATH=../../playbook/projects/kaizen/README.md` to use the local clone.
- `pnpm data:check` validates data, `pnpm docs:check` validates the documentation catalog and links, and `pnpm test:ci-scripts` tests the scripts.
- When a task finishes, record it in `CHANGELOG.md`.

## Agent and local skills

- Claude Code is the only supported development agent.
- `.claude/skills/` holds local installations, such as the Prisma skills, ignored by Git. Use only the reference that matches the installed version and the task; a skill on disk is not proof that it was loaded.
- `.claude/settings.local.json` is personal and not versioned. Add the playbook clone there as described in the integration standard.
