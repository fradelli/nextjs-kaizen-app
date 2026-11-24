import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { validateDocCatalog } from "./validate-doc-catalog.mjs";

let repositoryRoot;

function write(path, content) {
  const file = join(repositoryRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

beforeEach(() => {
  repositoryRoot = mkdtempSync(join(tmpdir(), "kaizen-doc-catalog-"));
  write("docs/CATALOG.md", "# Catalog\n\n`guides/GUIDE.md` `guides/ENGLISH.md`\n");
  write(
    "docs/guides/GUIDE.md",
    "# Guia\n\n- **Tipo:** Guia.\n- **Área:** Treino.\n- **Tarefas relacionadas:** KZ-E01-T01.\n",
  );
  write(
    "docs/guides/ENGLISH.md",
    "# Guide\n\n- **Type:** Guide.\n- **Area:** Training.\n- **Related tasks:** KZ-E01-T01.\n",
  );
  write("docs/worklog/index.md", "# Log\n");
});

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("validateDocCatalog", () => {
  test("accepts catalogued documents with Portuguese or English headers", () => {
    assert.deepEqual(validateDocCatalog({ repositoryRoot }), []);
  });

  test("requires the catalog entry and every header field", () => {
    write("docs/guides/OTHER.md", "# Other\n\n- **Type:** Guide.\n");

    assert.deepEqual(validateDocCatalog({ repositoryRoot }), [
      "docs/guides/OTHER.md: header without the Area field.",
      "docs/guides/OTHER.md: header without the Related tasks field.",
      "docs/guides/OTHER.md: missing from the catalog (docs/CATALOG.md).",
    ]);
  });

  test("ignores the generated log and indexes", () => {
    write("docs/worklog/tasks/WORK-1.md", "# Session\n");
    write("docs/guides/README.md", "# Index\n");
    write(
      "docs/CATALOG.md",
      "# Catalog\n\n`guides/GUIDE.md` `guides/ENGLISH.md` `guides/README.md`\n",
    );

    assert.deepEqual(validateDocCatalog({ repositoryRoot }), []);
  });
});
