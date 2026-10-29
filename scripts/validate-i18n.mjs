import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { createTranslator } from "next-intl";

function flattenMessages(value, prefix = "") {
  return Object.entries(value).flatMap(([key, message]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    return typeof message === "string" ? [[fullKey, message]] : flattenMessages(message, fullKey);
  });
}

function parameters(message) {
  return [...new Set([...message.matchAll(/\{(\w+)(?:,|\})/g)].map((match) => match[1]))].sort();
}

const catalogs = Object.fromEntries(
  ["en", "pt-BR"].map((locale) => [
    locale,
    JSON.parse(fs.readFileSync(`messages/${locale}.json`, "utf8")),
  ]),
);
const english = new Map(flattenMessages(catalogs.en));
const portuguese = new Map(flattenMessages(catalogs["pt-BR"]));
const errors = [];
for (const key of new Set([...english.keys(), ...portuguese.keys()])) {
  if (!english.get(key)?.trim() || !portuguese.get(key)?.trim()) {
    errors.push(`Missing translation: ${key}`);
    continue;
  }
  if (
    JSON.stringify(parameters(english.get(key))) !== JSON.stringify(parameters(portuguese.get(key)))
  )
    errors.push(`Parameter mismatch: ${key}`);
}
for (const [locale, messages] of Object.entries(catalogs)) {
  const translate = createTranslator({
    locale,
    messages,
    onError(error) {
      errors.push(`${locale}: ${error.message}`);
    },
  });
  for (const [key, message] of flattenMessages(messages))
    translate(key, Object.fromEntries(parameters(message).map((parameter) => [parameter, 2])));
}

// Product surfaces only: the foundations route is a technical design-system showcase.
const roots = [
  "src/features/training/ui/components",
  "src/components/shared/app-shell",
  "src/components/shared/feature-placeholder",
  "src/app/dieta",
];
for (const root of roots) {
  for (const relative of fs.readdirSync(root, { recursive: true })) {
    if (!relative.endsWith(".tsx") || relative.endsWith(".test.tsx")) continue;
    const file = path.join(root, relative);
    const source = ts.createSourceFile(
      file,
      fs.readFileSync(file, "utf8"),
      ts.ScriptTarget.Latest,
      true,
    );
    function inspect(node) {
      const literalText = ts.isJsxText(node)
        ? node.text.trim()
        : ts.isJsxAttribute(node) &&
            [
              "aria-label",
              "title",
              "placeholder",
              "pendingLabel",
              "closeLabel",
              "description",
            ].includes(node.name.getText(source)) &&
            node.initializer &&
            ts.isStringLiteral(node.initializer)
          ? node.initializer.text
          : "";
      if (literalText !== "改善" && /\p{L}/u.test(literalText))
        errors.push(`Untranslated product text: ${file}: ${literalText}`);
      ts.forEachChild(node, inspect);
    }
    inspect(source);
  }
}
if (errors.length) {
  for (const error of errors) console.error(error);
  process.exitCode = 1;
} else
  console.log(
    `i18n: ${english.size} messages validated in English and Portuguese; product JSX has no hardcoded labels.`,
  );
