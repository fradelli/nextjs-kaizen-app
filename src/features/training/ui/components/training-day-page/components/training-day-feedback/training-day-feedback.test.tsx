import { render, screen } from "../../../../../../../../tests/support/render-localized";
import { describe, expect, it } from "vitest";

import { TrainingDayFeedback } from "./training-day-feedback";

describe("TrainingDayFeedback", () => {
  it("provides the day message and a named action without duplicating either", () => {
    render(
      <TrainingDayFeedback
        title="Nenhuma atividade programada"
        description="Use o botão + para adicionar um treino ou outra atividade."
        action={<a href="/treino?date=2026-10-27">Conferir agenda</a>}
      />,
    );

    expect(screen.getAllByText("Nenhuma atividade programada")).toHaveLength(1);
    expect(
      screen.getByText("Use o botão + para adicionar um treino ou outra atividade."),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Conferir agenda" })).toHaveAttribute(
      "href",
      "/treino?date=2026-10-27",
    );
  });
});
