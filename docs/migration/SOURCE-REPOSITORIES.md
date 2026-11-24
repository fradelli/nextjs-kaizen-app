# Repositórios de origem

- **Tipo:** Migração.
- **Área:** Migração.
- **Tarefas relacionadas:** [E01-T01](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E01-training-data-migration/T01-freeze-source-snapshot.md), [E02-T02](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T02-preserve-original-diet.md), [E02-T03](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T03-review-nutrition-plan.md), [E02-T04](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E02-nutrition-data-migration/T04-structure-nutrition-plan.md), [E00-T05](https://github.com/fradelli/playbook/blob/main/projects/kaizen/epics/E00-repository-governance/T05-register-legacy-provenance.md).

## Snapshot de treino

| Campo | Valor |
| --- | --- |
| `repository_id` | `personal-performance` |
| `canonical_remote` | `https://github.com/developerlucaslima/personal-performance.git` |
| `visibility` | `PRIVATE` |
| `default_branch` | `main` |
| `baseline_commit` | `37c54fa3fb94b12afa4ae76504b5535a7da82ce9` |
| `baseline_remote_ref` | `refs/heads/main` |
| `snapshot_commit` | `d1acad309e2b81b714d1aa375e9371a310ad6ed0` |
| `snapshot_branch` | `codex/E01-T01-freeze-source-snapshot` |
| `snapshot_tag` | `kaizen-training-source-v1` |
| `snapshot_owner_task` | `E01-T01` |
| `snapshot_validation` | `PASSED` |
| `worktree_state_observed` | `SNAPSHOT_PINNED_WITH_LOCAL_EXCLUSIONS` |
| `observed_at` | `2026-08-31` |
| `preserve_legacy` | `true` |

## Snapshot de alimentação

| Campo | Valor |
| --- | --- |
| `repository_id` | `personal-performance` |
| `visibility` | `PRIVATE` |
| `nutrition_snapshot_commit` | `0d6456a68329f51fb9f83e1230cb285fe82f5996` |
| `nutrition_snapshot_branch` | `codex/E02-T02-freeze-nutrition-source` |
| `nutrition_snapshot_tag` | `kaizen-nutrition-source-v1` |
| `nutrition_snapshot_owner_task` | `E02-T02` |
| `nutrition_snapshot_validation` | `PASSED` |
| `observed_at` | `2026-09-01` |
| `content_exposure` | `DO_NOT_PUBLISH` |

## Revisão alimentar privada

| Campo | Valor |
| --- | --- |
| `repository_id` | `personal-performance` |
| `nutrition_review_commit` | `35decd378d29e880ffcc1a0361af31e1b2083173` |
| `nutrition_review_branch` | `codex/E02-T03-review-nutrition-plan` |
| `nutrition_review_owner_task` | `E02-T03` |
| `nutrition_review_validation` | `PASSED` |
| `observed_at` | `2026-09-02` |
| `content_exposure` | `DO_NOT_PUBLISH` |

## Derivado alimentar público aprovado

| Campo | Valor |
| --- | --- |
| `owner_task` | `E02-T04` |
| `approval_date` | `2026-09-02` |
| `approval_actor` | proprietário |
| `source_snapshot_commit` | `0d6456a68329f51fb9f83e1230cb285fe82f5996` |
| `source_review_commit` | `35decd378d29e880ffcc1a0361af31e1b2083173` |
| `destination_path` | `data/nutrition/plans/2026-09-personal-v1.json` |
| `content_exposure` | `PUBLIC` |
| `professional_status` | `not_validated` |

## Interpretação

O `baseline_commit` é o commit remoto observado durante E00-T05. O `snapshot_commit` de treino é a única origem aprovada para E01. O `nutrition_snapshot_commit` preserva as entradas da E02, e o `nutrition_review_commit` registra a revisão derivada sem alterar o snapshot. A aprovação de E02-T04 autoriza somente o novo derivado sanitizado; não muda a exposição dos oito artefatos privados. Todas as referências Git estão publicadas nas branches ou tags privadas registradas acima.

Os hashes do manifesto foram calculados diretamente dos blobs da referência imutável correspondente. Nenhum arquivo pode usar o estado atual do worktree como origem, mesmo quando o caminho local tiver o mesmo nome.

O caminho local do clone não faz parte da proveniência versionada. Ferramentas devem localizar a fonte por configuração local e confirmar o remote antes de ler qualquer artefato.

## Exclusões locais fora do snapshot

| Padrão observado | Motivo |
| --- | --- |
| `docs/arquitetura/**` | Arquitetura de aplicação fora da fundação de treino |
| `docs/prompts/**` | Prompts e auditorias não canônicos |
| `output/**` | Saídas geradas |
| `scripts/generate_training_quick_pdf.py` | Código local fora da migração documental |
| `tmp/**` | Arquivos temporários |

Esses caminhos não pertencem ao commit fixado e não podem receber linhas de artefato com esse `snapshot_commit`.
