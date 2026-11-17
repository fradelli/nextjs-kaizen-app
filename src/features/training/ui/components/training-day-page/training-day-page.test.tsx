import { cleanup, render, screen } from "../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it, vi } from "vitest";

import { resolveTrainingDayDate } from "../../../application/resolve-training-day-date";
import { TrainingDayPage } from "./training-day-page";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));

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

    expect(screen.getByRole("heading", { level: 1, name: "Agenda" })).toBeInTheDocument();
    expect(screen.getByText("setembro de 2026")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "Navegação entre datas" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Anterior" })).toHaveAttribute(
      "href",
      "/workout?date=2026-09-15&view=week",
    );
    expect(screen.getByRole("button", { name: "Hoje" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Hoje" })).toHaveAttribute("aria-current", "date");
    expect(screen.getAllByText("Hoje")).toHaveLength(1);
    expect(screen.getAllByRole("link", { name: "Seguinte" })[0]).toHaveAttribute(
      "href",
      "/workout?date=2026-09-17&view=week",
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
      "/workout?date=2026-09-16",
    );
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Seguinte" })).toBeDisabled();
  });
});
