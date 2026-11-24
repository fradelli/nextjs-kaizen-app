import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { toPosix, walkMarkdown, withoutCodeFences } from "./markdown-files.mjs";

// Checks that relative Markdown links in docs/ and in the root documents point to
// existing files. External links, including links to the playbook, are not fetched.

const rootDocuments = ["AGENTS.md", "CLAUDE.md", "README.md", "CHANGELOG.md"];

export function validateDocLinks({ repositoryRoot = process.cwd() } = {}) {
  const errors = [];
  const files = [
    ...walkMarkdown(resolve(repositoryRoot, "docs")),
    ...rootDocuments
      .map((name) => resolve(repositoryRoot, name))
      .filter((path) => existsSync(path)),
  ];

  for (const file of files) {
    const content = withoutCodeFences(readFileSync(file, "utf8"));

    for (const [, target] of content.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
        continue;
      }

      let decoded = target;

      try {
        decoded = decodeURI(target);
      } catch {
        // Keep the original target when its encoding is invalid.
      }

      if (!existsSync(resolve(dirname(file), decoded))) {
        errors.push(`${toPosix(relative(repositoryRoot, file))}: broken link: ${target}.`);
      }
    }
  }

  return errors.sort();
}

function run() {
  const errors = validateDocLinks();

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Documentation links] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Documentation link validation passed.");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
