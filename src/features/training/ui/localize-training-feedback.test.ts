import { describe, expect, it } from "vitest";
import { createTranslator } from "next-intl";
import en from "../../../../messages/en.json";
import pt from "../../../../messages/pt-BR.json";
import { localizeTrainingFeedback } from "./localize-training-feedback";

describe("localizeTrainingFeedback", () => {
  const english = createTranslator({ locale: "en", messages: en, namespace: "feedback" });
  const portuguese = createTranslator({ locale: "pt-BR", messages: pt, namespace: "feedback" });
  it("translates legacy mutation failures without changing the mutation contract", () => {
    expect(localizeTrainingFeedback("Informe uma carga válida.", "en", english, [])).toBe(
      "Enter a valid load.",
    );
    expect(localizeTrainingFeedback("Informe uma carga válida.", "pt-BR", portuguese, [])).toBe(
      "Informe uma carga válida.",
    );
    expect(
      localizeTrainingFeedback(
        "Só é possível alterar a programação até 2026-11-02.",
        "en",
        english,
        [],
      ),
    ).toContain("2026-11-02");
  });
  it("preserves current client translations and safely handles unknown messages", () => {
    expect(
      localizeTrainingFeedback("Unable to confirm the save.", "en", english, [
        "Unable to confirm the save.",
      ]),
    ).toBe("Unable to confirm the save.");
    expect(localizeTrainingFeedback("__proto__", "en", english, [])).toBe(en.feedback.unknown);
  });
});
