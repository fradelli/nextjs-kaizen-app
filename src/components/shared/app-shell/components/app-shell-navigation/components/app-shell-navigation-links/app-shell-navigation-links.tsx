import { useTranslations } from "next-intl";
import { CalendarIcon } from "@fradelli/ui/icons/Calendar";
import { ForkKnifeIcon } from "@fradelli/ui/icons/ForkKnife";
import { NavigationItem } from "@fradelli/ui/navigation-item";
import Link from "next/link";
import styles from "./app-shell-navigation-links.module.css";
import type { AppShellNavigationLinksProps } from "./app-shell-navigation-links.types";
export function AppShellNavigationLinks({ items }: AppShellNavigationLinksProps) {
  const t = useTranslations("shell");
  return (
    <nav className={styles.navigation} aria-label={t("navigation")}>
      <ul className={styles.navigationList}>
        {items.map((item) => (
          <li key={item.href}>
            <NavigationItem asChild className={styles.navigationLink}>
              <Link
                title={t(item.href === "/workout" ? "training" : "nutrition")}
                href={item.destination}
                aria-label={t(item.href === "/workout" ? "training" : "nutrition")}
                aria-current={item.isActive ? "page" : undefined}
              >
                <span className={styles.icon} aria-hidden="true">
                  {item.href === "/workout" ? (
                    <CalendarIcon size={20} aria-hidden="true" focusable="false" />
                  ) : (
                    <ForkKnifeIcon size={20} aria-hidden="true" focusable="false" />
                  )}
                </span>
              </Link>
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
