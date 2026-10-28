import { BarbellIcon } from "@fradelli/ui/icons/Barbell";
import { ForkKnifeIcon } from "@fradelli/ui/icons/ForkKnife";
import { NavigationItem } from "@fradelli/ui/navigation-item";
import Link from "next/link";
import styles from "./app-shell-navigation-links.module.css";
import type { AppShellNavigationLinksProps } from "./app-shell-navigation-links.types";
export function AppShellNavigationLinks({ items }: AppShellNavigationLinksProps) {
  return (
    <nav
      className={`${styles.navigation} fd-surface-glass-elevated`}
      aria-label="Navegação principal"
    >
      <ul className={styles.navigationList}>
        {items.map((item) => (
          <li key={item.href}>
            <NavigationItem asChild className={styles.navigationLink}>
              <Link
                href={item.destination}
                aria-label={item.label}
                aria-current={item.isActive ? "page" : undefined}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.href === "/treino" ? (
                    <BarbellIcon size={24} weight="regular" aria-hidden="true" focusable="false" />
                  ) : (
                    <ForkKnifeIcon
                      size={24}
                      weight="regular"
                      aria-hidden="true"
                      focusable="false"
                    />
                  )}
                </span>
                <span className={styles.label}>{item.label}</span>
              </Link>
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
