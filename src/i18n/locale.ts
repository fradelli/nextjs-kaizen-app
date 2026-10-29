export type AppLocale = "en" | "pt-BR";

export function resolveLocale(acceptLanguage: string | null, preference?: string): AppLocale {
  if (preference === "en" || preference === "pt-BR") return preference;
  const candidates = (acceptLanguage ?? "")
    .split(",")
    .map((entry, index) => {
      const [language, ...parameters] = entry.trim().split(";");
      const quality = parameters.find((parameter) => parameter.trim().startsWith("q="));
      const qualityValue = quality?.trim().slice(2);
      const weight =
        qualityValue === undefined
          ? 1
          : /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/.test(qualityValue)
            ? Number(qualityValue)
            : 0;
      return { language: language.toLowerCase(), weight, index };
    })
    .filter(({ weight }) => Number.isFinite(weight) && weight > 0 && weight <= 1)
    .sort((left, right) => right.weight - left.weight || left.index - right.index);
  for (const { language } of candidates) {
    if (/^en(?:-[a-z0-9]+)*$/.test(language)) return "en";
    if (/^pt(?:-[a-z0-9]+)*$/.test(language)) return "pt-BR";
  }
  return "en";
}
