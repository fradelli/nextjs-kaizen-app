import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Checks that a documentation reorganization lost no text: every non-empty line of
// each Markdown file in the base still exists in the same file of the current tree.
// Intentional replacements are declared in a JSON file with { file, old, new }.
// The roadmap moved to fradelli/playbook in KZ-E00-T17 and is no longer in scope.

const scopes = ["docs", "CLAUDE.md", "README.md", "CHANGELOG.md"];

function git(repositoryRoot, args) {
  return execFileSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
  });
}

function meaningfulLines(text) {
  return text
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim() !== "");
}

function countLines(lines) {
  const counts = new Map();

  for (const line of lines) {
    counts.set(line, (counts.get(line) ?? 0) + 1);
  }

  return counts;
}

export function verifyDocPreservation({ base, repositoryRoot = process.cwd(), replacements = [] }) {
  const errors = [];
  const files = git(repositoryRoot, ["ls-tree", "-r", "--name-only", base, "--", ...scopes])
    .split("\n")
    .filter((file) => file.endsWith(".md"));
  let checkedLines = 0;

  for (const file of files) {
    const current = resolve(repositoryRoot, file);

    if (!existsSync(current)) {
      errors.push(`File removed or moved: ${file}.`);
      continue;
    }

    const before = countLines(meaningfulLines(git(repositoryRoot, ["show", `${base}:${file}`])));
    const after = countLines(meaningfulLines(readFileSync(current, "utf8")));
    const allowed = replacements.filter((replacement) => replacement.file === file);

    for (const [line, count] of before) {
      checkedLines += count;
      const missing = count - (after.get(line) ?? 0);

      if (missing <= 0) {
        continue;
      }

      const replacement = allowed.find((entry) => entry.old === line);

      if (replacement && (after.get(replacement.new) ?? 0) >= missing) {
        continue;
      }

      errors.push(`${file}: missing line (${missing}x): ${line}`);
    }
  }

  return { errors, files: files.length, lines: checkedLines };
}

function run() {
  const baseIndex = process.argv.indexOf("--base");
  const allowIndex = process.argv.indexOf("--replacements");
  const base = baseIndex > -1 ? process.argv[baseIndex + 1] : undefined;

  if (!base) {
    throw new Error("Pass the base: --base <ref> [--replacements <file.json>].");
  }

  const replacements =
    allowIndex > -1 ? JSON.parse(readFileSync(resolve(process.argv[allowIndex + 1]), "utf8")) : [];
  const { errors, files, lines } = verifyDocPreservation({ base, replacements });

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Preservation] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log(
    `Preservation confirmed: ${files} files and ${lines} lines from ${base} present; ${replacements.length} declared replacements.`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
