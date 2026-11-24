import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { toPosix, walkMarkdown } from "./markdown-files.mjs";

// Checks that every document under docs/ is listed in docs/CATALOG.md and has the
// common header defined in docs/DOCUMENTATION-STANDARD.md. Roadmap task rules live
// in the playbook (`npm run roadmap:check`).

// Each header field is accepted in Portuguese or English while KZ-E00-T18
// translates the documentation.
const headerFields = [
  ["Tipo", "Type"],
  ["Área", "Area"],
  ["Tarefas relacionadas", "Related tasks"],
];
// Indexes, instructions, and the standard itself carry no header.
const headerExemptNames = new Set([
  "README.md",
  "CLAUDE.md",
  "CATALOG.md",
  "DOCUMENTATION-STANDARD.md",
]);
const headerExemptDirectories = ["templates", "worklog"];

export function validateDocCatalog({ repositoryRoot = process.cwd() } = {}) {
  const errors = [];
  const docsDirectory = resolve(repositoryRoot, "docs");
  const catalogPath = resolve(docsDirectory, "CATALOG.md");
  const catalog = existsSync(catalogPath) ? readFileSync(catalogPath, "utf8") : "";

  for (const file of walkMarkdown(docsDirectory)) {
    const path = toPosix(relative(docsDirectory, file));
    const parts = path.split("/");
    const name = parts.at(-1);

    if (headerExemptDirectories.includes(parts[0])) {
      continue;
    }

    if (catalog && name !== "CATALOG.md" && !catalog.includes(path)) {
      errors.push(`docs/${path}: missing from the catalog (docs/CATALOG.md).`);
    }

    if (headerExemptNames.has(name)) {
      continue;
    }

    const content = readFileSync(file, "utf8");

    for (const labels of headerFields) {
      const pattern = new RegExp(`^- \\*\\*(?:${labels.join("|")}):\\*\\* \\S`, "m");

      if (!pattern.test(content)) {
        errors.push(`docs/${path}: header without the ${labels.at(-1)} field.`);
      }
    }
  }

  return errors.sort();
}

function run() {
  const errors = validateDocCatalog();

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Documentation catalog] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Documentation catalog validation passed.");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
