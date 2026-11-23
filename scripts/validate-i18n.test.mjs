import assert from "node:assert/strict";
import test from "node:test";
import {
  findUnusedMessageKeys,
  findUntranslatedText,
  isProductSurface,
  validateCatalogs,
} from "./validate-i18n.mjs";

const scheduleFile = "src/features/schedule/ui/components/example/example.tsx";

test("rejects hardcoded text and translatable attributes", () => {
  const errors = findUntranslatedText(scheduleFile, '<button aria-label="Fechar">Salvar</button>');
  assert.equal(errors.length, 2);
});

test("accepts HTML entities, brand names and expressions", () => {
  assert.deepEqual(
    findUntranslatedText(
      scheduleFile,
      '<><span aria-hidden="true">&rarr;</span>&plusmn;&minus;<b>kaizen</b><i>改善</i>{t("save")}</>',
    ),
    [],
  );
});

test("inspects every product surface and skips the design-system showcase", () => {
  assert.equal(isProductSurface(scheduleFile), true);
  assert.equal(isProductSurface("src/app/workout/page.tsx"), true);
  assert.equal(isProductSurface("src/components/shared/app-shell/app-shell.tsx"), true);
  assert.equal(isProductSurface("src/app/foundations/page.tsx"), false);
  assert.equal(
    isProductSurface("src/features/foundations/components/foundations-page/foundations-page.tsx"),
    false,
  );
  assert.equal(isProductSurface("src/features/training/ui/example.test.tsx"), false);
  assert.equal(isProductSurface("src/features/training/domain/rules.ts"), false);
});

test("reports keys that no source references by leaf or full path", () => {
  assert.deepEqual(
    findUnusedMessageKeys(
      ["training.save", "training.legacyHint", "feedback.unknown"],
      ['t("save")', 'const keys = { failed: "feedback.unknown" };'],
    ),
    ["training.legacyHint"],
  );
});

test("reports missing translations and parameter mismatches", () => {
  const errors = validateCatalogs({
    en: { training: { greeting: "Hi {name}", onlyEnglish: "Only" } },
    "pt-BR": { training: { greeting: "Oi {nome}" } },
  });
  assert.ok(errors.includes("Missing translation: training.onlyEnglish"));
  assert.ok(errors.includes("Parameter mismatch: training.greeting"));
});
