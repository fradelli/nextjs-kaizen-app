import { cleanup, render, screen } from "../../../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it } from "vitest";

import { TrainingActionFeedback } from "./training-action-feedback";

afterEach(cleanup);

describe("TrainingActionFeedback", () => {
  it("renders pending, success and error feedback and hides idle state", () => {
    const { container, rerender } = render(
      <TrainingActionFeedback state={{ status: "idle" }} pending={false} />,
    );
    expect(container).toBeEmptyDOMElement();

    rerender(<TrainingActionFeedback state={{ status: "idle" }} pending />);
    expect(screen.getByText("Salvando…")).toBeInTheDocument();

    rerender(<TrainingActionFeedback state={{ status: "saved", revision: 1 }} pending={false} />);
    expect(screen.getByText("Salvo.")).toBeInTheDocument();

    rerender(
      <TrainingActionFeedback
        state={{ status: "invalid", message: "Entrada inválida." }}
        pending={false}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Entrada inválida.");
  });
});
