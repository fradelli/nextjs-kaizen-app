import { useTranslations } from "next-intl";
import Link from "next/link";
import styles from "./app-shell.module.css";
import type { AppShellProps } from "./app-shell.types";
import { AppShellNavigation } from "./components/app-shell-navigation/app-shell-navigation";

export function AppShell({ children }: AppShellProps) {
  const t = useTranslations("shell");
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#conteudo-principal">
        {t("skip")}
      </a>

      <header className={`${styles.header} fd-surface-glass`}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.brand} aria-label={t("home")} prefetch={false}>
            <span lang="ja">改善</span>
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
