import assert from "node:assert/strict";
const baseUrl = process.argv[2] ?? "http://127.0.0.1:3100";
const cases = [
  ["en-US", "/dieta", "en", "Nutrition"],
  ["pt-BR", "/dieta", "pt-BR", "Dieta"],
  ["en-US", "/treino?date=invalid", "en", "Invalid date"],
  ["pt-PT", "/treino?date=invalid", "pt-BR", "Data inválida"],
  ["fr-FR", "/dieta", "en", "Nutrition"],
  ["en-US", "/dieta", "pt-BR", "Dieta", "kaizen_locale=pt-BR"],
];
for (const [language, route, locale, label, cookie] of cases) {
  const response = await fetch(baseUrl + route, {
    headers: { "Accept-Language": language, ...(cookie ? { cookie } : {}) },
  });
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.ok(html.includes(`<html lang="${locale}"`), `Wrong locale for ${language} ${route}`);
  assert.ok(html.includes(label), `Missing ${label}`);
  if (route === "/dieta")
    assert.ok(html.includes(locale === "en" ? "Initial structure" : "Estrutura inicial"));
  assert.ok(
    html.includes(locale === "en" ? "Personal nutrition and training." : "Dieta e treino pessoal."),
  );
  console.log(`${route}: ${language} -> ${locale}, metadata and content OK`);
}
