import { cookies, headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import { resolveLocale } from "./locale";

export default getRequestConfig(async () => {
  const [requestHeaders, requestCookies] = await Promise.all([headers(), cookies()]);
  const locale = resolveLocale(
    requestHeaders.get("accept-language"),
    requestCookies.get("kaizen_locale")?.value,
  );
  const messages =
    locale === "en"
      ? (await import("../../messages/en.json")).default
      : (await import("../../messages/pt-BR.json")).default;
  return { locale, messages, timeZone: "America/Sao_Paulo" };
});
