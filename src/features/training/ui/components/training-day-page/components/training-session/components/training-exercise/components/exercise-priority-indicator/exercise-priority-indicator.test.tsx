import {
  cleanup,
  render,
  screen,
} from "../../../../../../../../../../../../tests/support/render-localized";
import { afterEach, describe, expect, it } from "vitest";

import { ExercisePriorityIndicator } from "./exercise-priority-indicator";

afterEach(cleanup);

describe("ExercisePriorityIndicator", () => {
  it.each([
    [1, "Prioridade baixa"],
    [2, "Prioridade média"],
    [3, "Prioridade alta"],
  ] as const)("describes priority level %s without relying on color", (level, label) => {
    render(<ExercisePriorityIndicator level={level} />);

    const indicator = screen.getByRole("img", { name: label });
    expect(indicator).toHaveAttribute("title", label);
    expect(indicator).toHaveTextContent("Prioridade:");
    expect(indicator.querySelectorAll(".bg-muted-foreground")).toHaveLength(level);
    expect(indicator.className).not.toContain("red");
  });
});
