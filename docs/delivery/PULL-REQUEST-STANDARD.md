# Pull request standard

- **Type:** Guide.
- **Area:** Governance.
- **Related tasks:** [KZ-E00-T17](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E00-repository-governance/T17-point-repository-to-playbook.md).

Kaizen follows the playbook [pull request standard](https://github.com/fradelli/playbook/blob/main/standards/general/pull-requests.md) for titles, branches, commits, body sections, and merge methods. This page lists only what Kaizen adds. The executable contract is `scripts/validate-governance.mjs`, which runs in the `Governance` CI job.

## Task IDs

- Titles and branches use `KZ-` IDs: `[KZ-E00-T17] docs(governance): point the repository to the playbook` on `claude/KZ-E00-T17-point-repository-to-playbook`.
- The ID must exist in the public [Kaizen index](https://github.com/fradelli/playbook/blob/main/projects/kaizen/README.md) and must not be `CANCELLED`. CI reads the index from GitHub; locally, set `PLAYBOOK_INDEX_PATH` to the clone.
- The body declares the same ID under `Notes` as ``- Main task: `KZ-E00-T17` ``.
- Legacy formats (`[E00-T01]`, `codex/` branches) are rejected; they stay only in history.

## Direction and merge

| Base | Accepted head | Method |
| --- | --- | --- |
| `developer` | valid task branch, or a `dependabot/` branch with a `build(deps)` title | squash |
| `staging` | `developer` | merge commit |
| `master` | `staging` | merge commit |

Protected branches never flow back to `developer`.

## Promotions

- Use `.github/PULL_REQUEST_TEMPLATE/release-promotion.md`.
- Title: `[KZ-E00-T00] chore(release): promote developer to staging` or `promote staging to master`.
- The body declares ``- Source commit: `<full SHA>` `` and `- Merge method: merge commit; never squash in a promotion`, plus the environment, preview evidence, and rollback.

## Validation commands

- Documentation: `pnpm docs:check` and `git diff --check`.
- Application: `pnpm run ci`.
- Data or database: `pnpm run ci`, plus `pnpm data:check`, idempotent import, and migration checks.
- Release: the full CI of the promoted SHA plus a smoke test of the environment.
