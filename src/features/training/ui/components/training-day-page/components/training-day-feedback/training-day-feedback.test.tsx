import { render, screen } from "../../../../../../../../tests/support/render-localized";
import { describe, expect, it } from "vitest";
import Link from "next/link";

import { TrainingDayFeedback } from "./training-day-feedback";

describe("TrainingDayFeedback", () => {
  it("provides the day message and a named action without duplicating either", () => {
    render(
      <TrainingDayFeedback
        title="Nenhuma atividade programada"
        description="Use o botão + para adicionar um treino ou outra atividade."
        action={<Link href="/workout?date=2026-10-27">Conferir agenda</Link>}
      />,
    );

    expect(screen.getAllByText("Nenhuma atividade programada")).toHaveLength(1);
    expect(
      screen.getByText("Use o botão + para adicionar um treino ou outra atividade."),
    ).toBeVisible();
    expect(screen.getByRole("link", { name: "Conferir agenda" })).toHaveAttribute(
      "href",
      "/workout?date=2026-10-27",
    );
  });
});
