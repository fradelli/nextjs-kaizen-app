import { useTranslations } from "next-intl";
import { CalendarDays, Utensils } from "lucide-react";
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
            <NavigationItem asChild size="icon">
              <Link
                title={t(item.href === "/workout" ? "training" : "nutrition")}
                href={item.destination}
                aria-label={t(item.href === "/workout" ? "training" : "nutrition")}
                aria-current={item.isActive ? "page" : undefined}
              >
                {item.href === "/workout" ? (
                  <CalendarDays size={14} aria-hidden="true" focusable="false" />
                ) : (
                  <Utensils size={14} aria-hidden="true" focusable="false" />
                )}
              </Link>
            </NavigationItem>
          </li>
        ))}
      </ul>
    </nav>
  );
}
