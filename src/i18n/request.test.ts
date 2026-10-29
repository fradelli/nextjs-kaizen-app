import { describe, expect, it, vi } from "vitest";

const request = vi.hoisted(() => ({
  language: null as string | null,
  preference: undefined as string | undefined,
}));
vi.mock("next/headers", () => ({
  headers: async () => new Headers(request.language ? { "accept-language": request.language } : {}),
  cookies: async () => ({
    get: () => (request.preference ? { value: request.preference } : undefined),
  }),
}));
vi.mock("next-intl/server", () => ({ getRequestConfig: (configure: unknown) => configure }));
import configureRequest from "./request";

describe("locale request configuration", () => {
  it.each([
    ["en-US,pt;q=0.5", undefined, "en", "Training"],
    ["pt-PT,en;q=0.8", undefined, "pt-BR", "Treino"],
    ["fr-FR,pt;q=0.7", undefined, "pt-BR", "Treino"],
    [null, undefined, "en", "Training"],
    ["en-US", "pt-BR", "pt-BR", "Treino"],
    ["pt-BR", "invalid", "pt-BR", "Treino"],
  ])("resolves %s with preference %s", async (language, preference, locale, heading) => {
    request.language = language;
    request.preference = preference;
    const config = await configureRequest({ requestLocale: Promise.resolve(undefined) });
    expect(config.locale).toBe(locale);
    expect(config.timeZone).toBe("America/Sao_Paulo");
    expect(config.messages?.training).toMatchObject({ training: heading });
  });
});
