import { cleanup, render, screen } from "../../../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it, vi } from "vitest";

import { TrainingDayContent } from "./training-day-content";

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  const { default: messages } = await import("../../../../../../../../messages/pt-BR.json");
  return {
    getTranslations: async (namespace: "training") =>
      createTranslator({ locale: "pt-BR", messages, namespace }),
  };
});

afterEach(cleanup);

describe("TrainingDayContent", () => {
  it("renders a safe failure instead of a partial projection", async () => {
    render(
      await TrainingDayContent({
        reason: "reference_invalid",
      }),
    );

    expect(screen.getByText("Não foi possível resolver o treino")).toBeInTheDocument();
    expect(screen.getByText(/Nenhum dado parcial foi exibido/)).toBeInTheDocument();
  });
});
