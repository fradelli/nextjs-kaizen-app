import { useSyncExternalStore } from "react";

// Rotas por hash, para funcionar abrindo o arquivo do disco:
// #/ · #/epic/E06 · #/matrix · #/kanban · #/task/E06-T26 · #/docs · #/doc/<caminho> · ?a=<âncora>

export type Route = { path: string[]; anchor: string | null; raw: string };

function subscribe(callback: () => void) {
  window.addEventListener("hashchange", callback);
  return () => window.removeEventListener("hashchange", callback);
}

function snapshot() {
  return window.location.hash || "#/";
}

export function parseRoute(hash: string): Route {
  const [path, query] = hash.replace(/^#/, "").split("?");
  return {
    anchor: new URLSearchParams(query ?? "").get("a"),
    path: path.split("/").filter(Boolean).map(decodeURIComponent),
    raw: path || "/",
  };
}

export function useRoute(): Route {
  return parseRoute(useSyncExternalStore(subscribe, snapshot, () => "#/"));
}

export function anchorHref(route: Route, anchor: string) {
  return `#${route.raw}?a=${encodeURIComponent(anchor)}`;
}
