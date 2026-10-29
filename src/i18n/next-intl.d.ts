import type messages from "../../messages/en.json";
import type { AppLocale } from "./locale";

declare module "next-intl" {
  interface AppConfig {
    Locale: AppLocale;
    Messages: typeof messages;
  }
}
