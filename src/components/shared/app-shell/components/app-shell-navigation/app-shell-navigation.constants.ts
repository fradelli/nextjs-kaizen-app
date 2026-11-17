import type { AppShellNavigationItem } from "./app-shell-navigation.types";

export const APP_SHELL_NAVIGATION_ITEMS = [
  { href: "/nutrition", label: "Dieta" },
  { href: "/workout", label: "Treino" },
] as const satisfies readonly AppShellNavigationItem[];
