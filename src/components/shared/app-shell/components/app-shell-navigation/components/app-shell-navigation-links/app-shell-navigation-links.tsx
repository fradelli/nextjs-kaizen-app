import { useTranslations } from "next-intl";
import { BarbellIcon } from "@fradelli/ui/icons/Barbell";
import { ForkKnifeIcon } from "@fradelli/ui/icons/ForkKnife";
import { NavigationItem } from "@fradelli/ui/navigation-item";
import Link from "next/link";
import styles from "./app-shell-navigation-links.module.css";
import type { AppShellNavigationLinksProps } from "./app-shell-navigation-links.types";
export function AppShellNavigationLinks({ items }: AppShellNavigationLinksProps) {
  const t = useTranslations("shell");
  return (
    <nav className={`${styles.navigation} fd-surface-glass-elevated`} aria-label={t("navigation")}>
      <ul className={styles.navigationList}>
        {items.map((item) => (
          <li key={item.href}>
            <NavigationItem asChild className={styles.navigationLink}>
              <Link
                href={item.destination}
                aria-label={t(item.href === "/treino" ? "training" : "nutrition")}
                aria-current={item.isActive ? "page" : undefined}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.href === "/treino" ? (
                    <BarbellIcon size={24} weight="fill" aria-hidden="true" focusable="false" />
                  ) : (
                    <ForkKnifeIcon size={24} weight="fill" aria-hidden="true" focusable="false" />
                  )}
                </span>
                <span className={styles.label}>
                  {t(item.href === "/treino" ? "training" : "nutrition")}
                </span>
              </Link>
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
