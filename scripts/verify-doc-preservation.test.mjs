import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { verifyDocPreservation } from "./verify-doc-preservation.mjs";

let repositoryRoot;

function write(path, content) {
  const file = join(repositoryRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function git(...args) {
  return execFileSync("git", ["-c", "core.autocrlf=false", ...args], {
    cwd: repositoryRoot,
    encoding: "utf8",
  });
}

const guide = "# Guide\n\n- **Type:** Guide.\n- **Area:** Training.\n";

beforeEach(() => {
  repositoryRoot = mkdtempSync(join(tmpdir(), "kaizen-doc-preservation-"));
  write("docs/guides/GUIDE.md", guide);
  git("init", "--quiet");
  git("add", ".");
  git(
    "-c",
    "user.name=test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--quiet",
    "-m",
    "base",
  );
});

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("verifyDocPreservation", () => {
  test("accepts content that was only added", () => {
    write("docs/guides/GUIDE.md", `${guide}\nNew paragraph.\n`);

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, []);
  });

  test("reports a lost line and accepts a declared replacement", () => {
    write("docs/guides/GUIDE.md", guide.replace("Training", "Nutrition"));

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, [
      "docs/guides/GUIDE.md: missing line (1x): - **Area:** Training.",
    ]);
    assert.deepEqual(
      verifyDocPreservation({
        base: "HEAD",
        replacements: [
          {
            file: "docs/guides/GUIDE.md",
            new: "- **Area:** Nutrition.",
            old: "- **Area:** Training.",
          },
        ],
        repositoryRoot,
      }).errors,
      [],
    );
  });

  test("reports a removed file", () => {
    rmSync(join(repositoryRoot, "docs/guides/GUIDE.md"));

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, [
      "File removed or moved: docs/guides/GUIDE.md.",
    ]);
  });
});
