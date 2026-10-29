import { cleanup, render, screen } from "../../../../tests/support/render-localized";
import { afterEach, describe, expect, it } from "vitest";

import { FEATURE_PLACEHOLDER_BADGE_LABEL } from "./feature-placeholder.constants";
import { FeaturePlaceholder } from "./feature-placeholder";

afterEach(cleanup);

describe("FeaturePlaceholder", () => {
  it("associa a região ao título e apresenta o estado sem simular dados", () => {
    render(
      <FeaturePlaceholder
        description="Conteúdo futuro da área."
        headingId="feature-title"
        title="Área"
      />,
    );

    expect(screen.getByRole("region", { name: "Área" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "Área" })).toHaveAttribute(
      "id",
      "feature-title",
    );
    expect(screen.getByText(FEATURE_PLACEHOLDER_BADGE_LABEL)).toBeInTheDocument();
    expect(screen.getByText("Conteúdo futuro da área.")).toBeInTheDocument();
  });
});
