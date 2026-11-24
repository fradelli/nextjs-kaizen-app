import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, test } from "node:test";

import {
  loadPlaybookIndex,
  parsePlaybookIndex,
  validateGovernance,
} from "./validate-governance.mjs";

const playbookIndex = `## Tasks

| ID | Status | Task | Depends on |
| --- | --- | --- | --- |
| KZ-E04-T05 | IN_PROGRESS | [Configure minimal CI](epics/E04/T05.md) | — |
| KZ-E05-T06 | CANCELLED | [Implement personal access](epics/E05/T06.md) | KZ-E05-T05 |
`;
const tasks = parsePlaybookIndex(playbookIndex);

const validBody = `## Summary

Delivers the check.

## Problem

The gate does not exist.

## Root cause

The automation was never created.

## Changes

- add the gate

## Files added or updated

- \`scripts/validate-governance.mjs\`

## Impact

### Fixed

- validates pull requests

### Not changed

- no deploy

## Validation

- [x] governance

## Notes

- Main task: \`KZ-E04-T05\`
`;

function taskPullRequest(overrides = {}) {
  return {
    pull_request: {
      base: { ref: "developer" },
      body: validBody,
      head: { ref: "claude/KZ-E04-T05-configure-minimal-ci" },
      title: "[KZ-E04-T05] ci(workflow): configure minimal CI",
      user: { login: "maintainer" },
      ...overrides,
    },
  };
}

function validate(event) {
  return validateGovernance({ event, tasks });
}

describe("parsePlaybookIndex", () => {
  test("reads KZ- task IDs and statuses from the tasks table", () => {
    assert.deepEqual(
      [...tasks],
      [
        ["KZ-E04-T05", "IN_PROGRESS"],
        ["KZ-E05-T06", "CANCELLED"],
      ],
    );
  });
});

describe("loadPlaybookIndex", () => {
  test("reads a local index from PLAYBOOK_INDEX_PATH", async () => {
    const directory = mkdtempSync(join(tmpdir(), "kaizen-governance-"));
    const path = join(directory, "README.md");

    try {
      writeFileSync(path, playbookIndex);
      const loaded = await loadPlaybookIndex({ PLAYBOOK_INDEX_PATH: path });

      assert.equal(loaded.get("KZ-E04-T05"), "IN_PROGRESS");
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  });
});

describe("validateGovernance", () => {
  test("accepts a valid task pull request", () => {
    assert.deepEqual(validate(taskPullRequest()), []);
  });

  test("rejects branches without the claude/KZ- prefix", () => {
    for (const ref of [
      "codex/KZ-E04-T05-configure-minimal-ci",
      "claude/E04-T05-configure-minimal-ci",
      "feature/KZ-E04-T05-configure-minimal-ci",
    ]) {
      const errors = validate(taskPullRequest({ head: { ref } }));

      assert.ok(errors.some((error) => error.includes("claude/KZ-E00-T00-short-description")));
    }
  });

  test("rejects the legacy title format without the KZ- prefix", () => {
    const errors = validate(
      taskPullRequest({ title: "[E04-T05] ci(workflow): configure minimal CI" }),
    );

    assert.ok(errors.some((error) => error.includes("[KZ-E00-T00] type(scope): summary")));
  });

  test("rejects a mismatch between branch and title and an unknown task", () => {
    const errors = validate(
      taskPullRequest({ title: "[KZ-E04-T06] ci(workflow): configure minimal CI" }),
    );

    assert.ok(errors.some((error) => error.includes("Task ID differs")));
    assert.ok(errors.some((error) => error.includes("KZ-E04-T06 is not in the playbook index")));
  });

  test("rejects a cancelled task", () => {
    const errors = validate(
      taskPullRequest({
        body: validBody.replace("KZ-E04-T05", "KZ-E05-T06"),
        head: { ref: "claude/KZ-E05-T06-personal-access" },
        title: "[KZ-E05-T06] feat(auth): add personal access",
      }),
    );

    assert.ok(errors.some((error) => error.includes("KZ-E05-T06 is CANCELLED")));
  });

  test("rejects a missing required section", () => {
    const errors = validate(taskPullRequest({ body: validBody.replace("## Problem", "Problem") }));

    assert.ok(errors.some((error) => error.includes("## Problem")));
  });

  test("rejects template placeholders", () => {
    const errors = validate(
      taskPullRequest({
        body: validBody.replace("- add the gate", "- replace with the real changes"),
      }),
    );

    assert.ok(errors.some((error) => error.includes("placeholder")));
  });

  test("accepts a valid promotion with a merge commit", () => {
    const body = validBody
      .replace("- add the gate", "- Source commit: `0123456789abcdef0123456789abcdef01234567`")
      .replace(
        "- Main task: `KZ-E04-T05`",
        "- Main task: `KZ-E04-T05`\n- Merge method: merge commit; never squash in a promotion",
      );
    const event = taskPullRequest({
      base: { ref: "staging" },
      body,
      head: { ref: "developer" },
      title: "[KZ-E04-T05] chore(release): promote developer to staging",
    });

    assert.deepEqual(validate(event), []);
  });

  test("rejects a jump from developer to master", () => {
    const errors = validate(
      taskPullRequest({
        base: { ref: "master" },
        head: { ref: "developer" },
        title: "[KZ-E04-T05] chore(release): promote developer to master",
      }),
    );

    assert.ok(errors.some((error) => error.includes("Invalid promotion direction")));
  });

  test("accepts Dependabot only against developer", () => {
    const dependabot = {
      body: "",
      head: { ref: "dependabot/npm_and_yarn/react-20" },
      title: "build(deps): bump react from 19 to 20",
      user: { login: "dependabot[bot]" },
    };

    assert.deepEqual(validate(taskPullRequest(dependabot)), []);

    const errors = validate(taskPullRequest({ ...dependabot, base: { ref: "staging" } }));

    assert.ok(errors.some((error) => error.includes("only against developer")));
  });
});
