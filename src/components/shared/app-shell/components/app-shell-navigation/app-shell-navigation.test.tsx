import { cleanup, render, screen, within } from "../../../../../../tests/support/render-localized";
import { usePathname, useSearchParams } from "next/navigation";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AppShellNavigation } from "./app-shell-navigation";
import {
  buildAppShellNavigationHref,
  isAppShellNavigationItemActive,
} from "./app-shell-navigation.utils";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn(),
  useSearchParams: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(usePathname).mockReturnValue("/dieta");
  vi.mocked(useSearchParams).mockReturnValue(
    new URLSearchParams() as ReturnType<typeof useSearchParams>,
  );
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

describe("AppShellNavigation", () => {
  it("preserva a data civil sem copiar parâmetros alheios", () => {
    vi.mocked(useSearchParams).mockReturnValue(
      new URLSearchParams("date=2026-09-28&extra=ignored") as ReturnType<typeof useSearchParams>,
    );
    render(<AppShellNavigation />);
    expect(screen.getByRole("link", { name: "Treino" })).toHaveAttribute(
      "href",
      "/treino?date=2026-09-28",
    );
    expect(screen.getByRole("link", { name: "Dieta" })).toHaveAttribute(
      "href",
      "/dieta?date=2026-09-28",
    );
    expect(screen.getAllByRole("navigation")).toHaveLength(1);
  });
  it("renderiza somente os destinos primários e marca a rota atual", () => {
    render(<AppShellNavigation />);

    const navigation = screen.getByRole("navigation", { name: "Navegação principal" });
    const links = within(navigation).getAllByRole("link");

    expect(links).toHaveLength(2);
    expect(within(navigation).getByRole("link", { name: "Dieta" })).toHaveAttribute(
      "href",
      "/dieta",
    );
    expect(within(navigation).getByRole("link", { name: "Dieta" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(within(navigation).getByRole("link", { name: "Treino" })).toHaveAttribute(
      "href",
      "/treino",
    );
  });

  it("marca a área atual inclusive em uma subrota", () => {
    vi.mocked(usePathname).mockReturnValue("/treino/sessao");

    render(<AppShellNavigation />);

    expect(screen.getByRole("link", { name: "Treino" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dieta" })).not.toHaveAttribute("aria-current");
  });
});

describe("buildAppShellNavigationHref", () => {
  it.each([null, "", "2026-02-30", "2026-13-01", "28/09/2026", "invalid"])(
    "descarta data inválida %s",
    (date) => {
      expect(buildAppShellNavigationHref("/treino", date)).toBe("/treino");
    },
  );
  it("preserva uma data real de ano bissexto", () => {
    expect(buildAppShellNavigationHref("/dieta", "2024-02-29")).toBe("/dieta?date=2024-02-29");
  });
});

describe("isAppShellNavigationItemActive", () => {
  it("aceita a rota exata e suas subrotas", () => {
    expect(isAppShellNavigationItemActive("/dieta", "/dieta")).toBe(true);
    expect(isAppShellNavigationItemActive("/dieta/refeicoes", "/dieta")).toBe(true);
  });

  it("não confunde rotas apenas com prefixo semelhante", () => {
    expect(isAppShellNavigationItemActive("/dietas", "/dieta")).toBe(false);
    expect(isAppShellNavigationItemActive("/treino", "/dieta")).toBe(false);
  });
});
