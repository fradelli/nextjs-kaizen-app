import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { TrainingDayUnexpectedError } from "./training-day-unexpected-error";

describe("TrainingDayUnexpectedError", () => {
  it("explains the preserved date and lets the user retry", () => {
    const retry = vi.fn();
    render(<TrainingDayUnexpectedError error={new Error("Falha sintética")} reset={retry} />);
    expect(
      screen.getByRole("region", { name: "Não foi possível carregar o treino" }),
    ).toBeVisible();
    expect(
      screen.getByText("Ocorreu uma falha inesperada. A data selecionada foi preservada."),
    ).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(retry).toHaveBeenCalledOnce();
  });
});
