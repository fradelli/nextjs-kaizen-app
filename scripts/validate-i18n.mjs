import { existsSync, readdirSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { createTranslator } from "next-intl";

const locales = ["en", "pt-BR"];
// Product identity is rendered verbatim in every locale.
const brandTexts = new Set(["改善", "kaizen"]);
const translatableAttributes = new Set([
  "aria-label",
  "title",
  "placeholder",
  "pendingLabel",
  "closeLabel",
  "description",
]);
const htmlEntityPattern = /&(?:#\d+|#x[0-9a-f]+|[a-z][a-z0-9]*);/giu;

export function flattenMessages(value, prefix = "") {
  return Object.entries(value).flatMap(([key, message]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof message === "string" ? [[fullKey, message]] : flattenMessages(message, fullKey);
  });
}

function messageParameters(message) {
  return [...new Set([...message.matchAll(/\{(\w+)(?:,|\})/g)].map((match) => match[1]))].sort();
}

export function validateCatalogs(catalogs) {
  const errors = [];
  const [first, second] = locales.map((locale) => new Map(flattenMessages(catalogs[locale])));

  for (const key of new Set([...first.keys(), ...second.keys()])) {
    if (!first.get(key)?.trim() || !second.get(key)?.trim()) {
      errors.push(`Missing translation: ${key}`);
      continue;
    }
    if (
      JSON.stringify(messageParameters(first.get(key))) !==
      JSON.stringify(messageParameters(second.get(key)))
    )
      errors.push(`Parameter mismatch: ${key}`);
  }

  for (const locale of locales) {
    const translate = createTranslator({
      locale,
      messages: catalogs[locale],
      onError(error) {
        errors.push(`${locale}: ${error.message}`);
      },
    });
    for (const [key, message] of flattenMessages(catalogs[locale]))
      translate(
        key,
        Object.fromEntries(messageParameters(message).map((parameter) => [parameter, 2])),
      );
  }

  return errors;
}

function isTranslatableText(text) {
  const visible = text.replace(htmlEntityPattern, "").trim();
  return /\p{L}/u.test(visible) && !brandTexts.has(visible.toLowerCase());
}

export function findUntranslatedText(path, source) {
  const errors = [];
  const sourceFile = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);

  function inspect(node) {
    const text = ts.isJsxText(node)
      ? node.text.trim()
      : ts.isJsxAttribute(node) &&
          translatableAttributes.has(node.name.getText(sourceFile)) &&
          node.initializer &&
          ts.isStringLiteral(node.initializer)
        ? node.initializer.text
        : "";
    if (text && isTranslatableText(text))
      errors.push(`Untranslated product text: ${path}: ${text}`);
    ts.forEachChild(node, inspect);
  }

  inspect(sourceFile);
  return errors;
}

export function findUnusedMessageKeys(keys, sources) {
  const quotedTokens = new Set();
  for (const source of sources)
    for (const [, token] of source.matchAll(/["'`]([\w.-]+)["'`]/g)) quotedTokens.add(token);

  return keys.filter((key) => !quotedTokens.has(key) && !quotedTokens.has(key.split(".").at(-1)));
}

function walk(directory, accept) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && accept(resolve(entry.parentPath, entry.name)))
    .map((entry) => resolve(entry.parentPath, entry.name));
}

function toPosix(repositoryRoot, file) {
  return relative(repositoryRoot, file).replaceAll("\\", "/");
}

// Product surfaces only: the foundations route and feature are a technical design-system showcase.
export function isProductSurface(path) {
  if (!path.endsWith(".tsx") || path.endsWith(".test.tsx")) return false;
  if (path.startsWith("src/app/foundations/") || path.startsWith("src/features/foundations/"))
    return false;
  return (
    path.startsWith("src/app/") ||
    path.startsWith("src/components/") ||
    /^src\/features\/[^/]+\/ui\//u.test(path)
  );
}

export function validateI18n(repositoryRoot = process.cwd()) {
  const catalogs = Object.fromEntries(
    locales.map((locale) => [
      locale,
      JSON.parse(readFileSync(resolve(repositoryRoot, "messages", `${locale}.json`), "utf8")),
    ]),
  );
  const sourceFiles = walk(resolve(repositoryRoot, "src"), (file) => {
    const path = toPosix(repositoryRoot, file);
    return (
      /\.(?:ts|tsx)$/u.test(path) &&
      !/\.test\.(?:ts|tsx)$/u.test(path) &&
      !path.startsWith("src/generated/")
    );
  });

  const errors = validateCatalogs(catalogs);
  for (const file of sourceFiles) {
    const path = toPosix(repositoryRoot, file);
    if (isProductSurface(path))
      errors.push(...findUntranslatedText(path, readFileSync(file, "utf8")));
  }
  const keys = flattenMessages(catalogs.en).map(([key]) => key);
  for (const key of findUnusedMessageKeys(
    keys,
    sourceFiles.map((file) => readFileSync(file, "utf8")),
  ))
    errors.push(`Unused message key: ${key}`);

  return { errors, messageCount: keys.length };
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  const { errors, messageCount } = validateI18n();
  if (errors.length) {
    console.error(errors.join("\n"));
    process.exitCode = 1;
  } else
    console.log(
      `i18n: ${messageCount} messages validated in English and Portuguese; product JSX has no hardcoded labels and every key is used.`,
    );
}
