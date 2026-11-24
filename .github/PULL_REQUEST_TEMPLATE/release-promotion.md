<!--
Required titles:
- [KZ-E00-T00] chore(release): promote developer to staging
- [KZ-E00-T00] chore(release): promote staging to master
Replace every REPLACE_BEFORE_PR value.
-->

## Summary

Promotes the approved version from `REPLACE_BEFORE_PR_SOURCE` to `REPLACE_BEFORE_PR_TARGET`.

## Problem

The next environment must receive an immutable range of commits only after the source is fully validated.

## Root cause

The source branch holds the approved version that does not exist in the target environment yet.

## Changes

- Release type: `REPLACE_BEFORE_PR`
- Promotion path: `REPLACE_BEFORE_PR`
- Source commit: `REPLACE_BEFORE_PR_FULL_SHA`
- Target environment: `REPLACE_BEFORE_PR`
- Included tasks: `REPLACE_BEFORE_PR`

## Files added or updated

- Compared range: `REPLACE_BEFORE_PR`
- No file changes only because of the promotion; the exact source state is promoted.

## Impact

### Fixed

- Delivers the approved commit to the next environment.
- Keeps the order `developer -> staging -> master`.

### Not changed

- No direct commit on the target branch.
- Deployment starts only after the merge and the post-merge CI.

## Validation

- [ ] governance (`Governance`)
- [ ] quality (`Quality`)
- [ ] tests (`Test`)
- [ ] data integrity (`Data integrity`)
- [ ] build (`Build`)
- [ ] dependency audit (`Dependency audit`)
- [ ] manual validation done

## Notes

- Main task: `KZ-E00-T00`
- Related tasks: `REPLACE_BEFORE_PR_OR_NONE`
- Rollback: `REPLACE_BEFORE_PR`
- Preview deployment: `REPLACE_BEFORE_PR_OR_NOT_APPLICABLE`
- Preview evidence: `REPLACE_BEFORE_PR_OR_NOT_APPLICABLE`
- Merge method: merge commit; never squash in a promotion
- Limitations or checks not applicable: `REPLACE_BEFORE_PR_OR_NONE`
- Branch cleanup after merge: not applicable to protected branches
