import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const actionTags = new Set([
  "button",
  "Button",
  "PendingButton",
  "NavigationItem",
  "a",
  "Link",
  "summary",
]);
const improvisedSymbols = new Set(["+", "🗑", "💬", "←", "→", "×", "▴", "▾", "▶", "⏸"]);

function isActionContent(node, source) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isJsxElement(parent) && actionTags.has(parent.openingElement.tagName.getText(source)))
      return true;
  }
  return false;
}

function isChildExpression(node) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (ts.isJsxExpression(parent)) return !ts.isJsxAttribute(parent.parent);
  }
  return false;
}

function isImprovisedSymbol(value) {
  const text = value.replaceAll("\uFE0F", "").trim();
  return improvisedSymbols.has(text) || /[🗑💬]/u.test(text);
}

export function validateUiIconSource(file, text) {
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const errors = [];
  function report(node, message) {
    const { line } = source.getLineAndCharacterOfPosition(node.getStart(source));
    errors.push(`${file}:${line + 1}: ${message}`);
  }
  function visit(node) {
    if (
      (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) &&
      node.tagName.getText(source) === "svg"
    ) {
      report(node, "Use um ícone público de @fradelli/ui/icons/<Nome> em vez de SVG artesanal.");
    }
    const literal = ts.isJsxText(node) || (ts.isStringLiteralLike(node) && isChildExpression(node));
    if (literal && isActionContent(node, source) && isImprovisedSymbol(node.text)) {
      report(node, "Substitua o símbolo de ação por um ícone do Design System.");
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  return errors;
}

export function validateUiIcons({ repositoryRoot = process.cwd() } = {}) {
  const sourceRoot = resolve(repositoryRoot, "src");
  if (!existsSync(sourceRoot)) return [];
  function files(directory) {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory() ? files(path) : [path];
    });
  }
  return files(sourceRoot)
    .filter((file) => {
      const path = relative(repositoryRoot, file).replaceAll("\\", "/");
      return (
        file.endsWith(".tsx") &&
        !file.endsWith(".test.tsx") &&
        (/^src\/(?:app|components)\//u.test(path) || /^src\/features\/[^/]+\/ui\//u.test(path))
      );
    })
    .flatMap((file) =>
      validateUiIconSource(
        relative(repositoryRoot, file).replaceAll("\\", "/"),
        readFileSync(file, "utf8"),
      ),
    )
    .sort();
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const errors = validateUiIcons();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else console.log("UI icon validation passed.");
}
