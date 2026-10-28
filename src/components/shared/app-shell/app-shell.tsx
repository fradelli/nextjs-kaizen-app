import styles from "./app-shell.module.css";
import type { AppShellProps } from "./app-shell.types";
import { AppShellNavigation } from "./components/app-shell-navigation/app-shell-navigation";

export function AppShell({ children }: AppShellProps) {
  return (
    <div className={styles.shell}>
      <a className={styles.skipLink} href="#conteudo-principal">
        Pular para o conteúdo
      </a>

      <header className={`${styles.header} fd-surface-glass`}>
        <div className={styles.headerInner}>
          <p className={styles.brand} aria-label="Kaizen">
            <span lang="ja">改善</span>
          </p>
        </div>
      </header>

      <AppShellNavigation />

      <main id="conteudo-principal" className={styles.content} tabIndex={-1}>
        {children}
      </main>
    </div>
  );
}
