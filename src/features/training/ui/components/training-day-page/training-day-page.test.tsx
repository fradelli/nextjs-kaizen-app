import { cleanup, render, screen } from "../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it } from "vitest";

import { resolveTrainingDayDate } from "../../../application/resolve-training-day-date";
import { TrainingDayPage } from "./training-day-page";

afterEach(cleanup);

describe("TrainingDayPage", () => {
  it("renders the selected civil date and accessible navigation", () => {
    const dateResolution = resolveTrainingDayDate({
      rawDate: "2026-09-16",
      now: new Date("2026-09-16T12:00:00.000Z"),
    });

    render(
      <TrainingDayPage dateResolution={dateResolution}>
        <p>Conteúdo</p>
      </TrainingDayPage>,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Treino" })).toBeInTheDocument();
    expect(screen.getByText("quarta-feira, 16 de setembro de 2026")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegação entre datas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Abrir dia anterior" })).toHaveAttribute(
      "href",
      "/treino?date=2026-09-15",
    );
    expect(screen.getByRole("button", { name: "Hoje" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hoje" })).toHaveAttribute("aria-current", "date");
    expect(screen.getAllByText("Hoje")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Abrir dia seguinte" })).toHaveAttribute(
      "href",
      "/treino?date=2026-09-17",
    );
  });

  it("keeps the Today action available for an invalid URL", () => {
    const dateResolution = resolveTrainingDayDate({
      rawDate: "2026-02-29",
      now: new Date("2026-09-16T12:00:00.000Z"),
    });

    render(
      <TrainingDayPage dateResolution={dateResolution}>
        <p>Data inválida</p>
      </TrainingDayPage>,
    );

    expect(screen.getByText("A data informada não é válida.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Hoje" })).toHaveAttribute(
      "href",
      "/treino?date=2026-09-16",
    );
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Seguinte" })).toBeDisabled();
  });
});
