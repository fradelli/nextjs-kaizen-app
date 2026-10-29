import { describe, expect, it } from "vitest";
import { resolveLocale } from "./locale";

describe("resolveLocale", () => {
  it("respects language priorities and regional variants", () => {
    expect(resolveLocale("fr-FR,pt-PT;q=0.8,en;q=0.5")).toBe("pt-BR");
    expect(resolveLocale("en-US,pt-BR;q=0.8")).toBe("en");
  });
  it("ignores disabled and invalid preferences", () => {
    expect(resolveLocale("pt;q=0,en;q=0.5")).toBe("en");
    expect(resolveLocale("pt;q=invalid")).toBe("en");
    expect(resolveLocale(null)).toBe("en");
    expect(resolveLocale("pt;q=1e0,en;q=0.5")).toBe("en");
    expect(resolveLocale("pt;q=1.1,en")).toBe("en");
    expect(resolveLocale("pt;q=,en")).toBe("en");
  });
  it("honors only supported explicit preferences", () => {
    expect(resolveLocale("en", "pt-BR")).toBe("pt-BR");
    expect(resolveLocale("pt", "invalid")).toBe("pt-BR");
  });
});
