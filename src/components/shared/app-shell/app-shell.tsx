import { useTranslations } from "next-intl";
import Link from "next/link";
import { Figtree } from "next/font/google";
import styles from "./app-shell.module.css";
import type { AppShellProps } from "./app-shell.types";
import { AppShellNavigation } from "./components/app-shell-navigation/app-shell-navigation";
import { KaizenLogo } from "./components/kaizen-logo/kaizen-logo";

const brandFont = Figtree({ subsets: ["latin"], display: "swap" });

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("shell");
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#conteudo-principal">
        {t("skip")}
      </a>

      <header className={`${styles.header} fd-surface-glass`}>
        <div className={styles.headerInner}>
          <Link
            href="/"
            className="inline-flex active:translate-y-px min-h-11 items-center gap-2 rounded-md text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            aria-label={t("home")}
            prefetch={false}
          >
            <KaizenLogo />
            <span className={`${brandFont.className} text-2xl font-semibold leading-tight md:text-[26px]`}>
              kaizen
            </span>
          </Link>
        </div>
      </header>

      <AppShellNavigation />

      <main id="conteudo-principal" className={styles.content} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
