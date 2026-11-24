import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { validateDocLinks } from "./validate-doc-links.mjs";

let repositoryRoot;

function write(path, content) {
  const file = join(repositoryRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

beforeEach(() => {
  repositoryRoot = mkdtempSync(join(tmpdir(), "kaizen-doc-links-"));
  write("docs/guides/GUIDE.md", "# Guide\n\n[Other](OTHER.md#section)\n");
  write("docs/guides/OTHER.md", "# Other\n");
  write(
    "CLAUDE.md",
    "# Rules\n\n[Guide](docs/guides/GUIDE.md) and [task](https://github.com/fradelli/playbook/blob/main/projects/kaizen/ACTIVE.md)\n",
  );
});

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("validateDocLinks", () => {
  test("accepts relative links to existing files and skips external links", () => {
    assert.deepEqual(validateDocLinks({ repositoryRoot }), []);
  });

  test("reports broken relative links in docs and root documents", () => {
    write("docs/guides/OTHER.md", "# Other\n\n[missing](missing.md)\n");
    write("AGENTS.md", "# Agents\n\n[roadmap](roadmap/ACTIVE.md)\n");

    assert.deepEqual(validateDocLinks({ repositoryRoot }), [
      "AGENTS.md: broken link: roadmap/ACTIVE.md.",
      "docs/guides/OTHER.md: broken link: missing.md.",
    ]);
  });

  test("ignores links inside code fences", () => {
    write("docs/guides/OTHER.md", "# Other\n\n```md\n[example](nowhere.md)\n```\n");

    assert.deepEqual(validateDocLinks({ repositoryRoot }), []);
  });
});
