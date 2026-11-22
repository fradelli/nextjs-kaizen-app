import { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import { Input } from "@fradelli/ui/input";
import { Item, ItemContent, ItemDescription, ItemTitle } from "@fradelli/ui/item";
import { Kbd } from "@fradelli/ui/kbd";
import { NavigationItem } from "@fradelli/ui/navigation-item";
import { TooltipProvider } from "@fradelli/ui/tooltip";
import { KaizenLogo } from "./components";
import { STATUS_LABEL, createIndex, matchesTask, type RoadmapData } from "./data";
import { createLinker } from "./markdown";
import {
  DocumentPage,
  DocumentsPage,
  EpicPage,
  KanbanPage,
  MatrixPage,
  NotFound,
  OverviewPage,
  TaskPage,
  type PageProps,
} from "./pages";
import { useRoute } from "./router";

const tabs = [
  { href: "#/", label: "Visão geral", match: [undefined, "epic", "task"] },
  { href: "#/matrix", label: "Matriz", match: ["matrix"] },
  { href: "#/kanban", label: "Kanban", match: ["kanban"] },
  { href: "#/docs", label: "Documentos", match: ["docs", "doc"] },
];

function GlobalSearch({ data }: Readonly<{ data: RoadmapData }>) {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const normalized = query.trim().toLowerCase();
  const hits = normalized
    ? [
        ...data.tasks
          .filter((task) => matchesTask(task, normalized))
          .map((task) => ({ href: `#/task/${task.id}`, title: `${task.id} · ${task.title}`, kind: STATUS_LABEL[task.status] })),
        ...data.epics
          .filter((epic) => `${epic.id} ${epic.title}`.toLowerCase().includes(normalized))
          .map((epic) => ({ href: `#/epic/${epic.id}`, title: `${epic.id} · ${epic.title}`, kind: "Épico" })),
        ...data.documents
          .filter((document) => `${document.title} ${document.path}`.toLowerCase().includes(normalized))
          .map((document) => ({ href: `#/doc/${document.path}`, title: document.title, kind: document.tipo ?? "Documento" })),
      ].slice(0, 12)
    : [];

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "/" && document.activeElement?.tagName !== "INPUT") {
        event.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(href: string) {
    window.location.hash = href;
    setQuery("");
  }

  return (
    <div className="relative w-full md:max-w-sm" role="search">
      <label className="sr-only" htmlFor="global-search">
        Buscar tarefa, épico ou documento
      </label>
      <Input
        ref={input}
        id="global-search"
        type="search"
        placeholder="Buscar tarefa, épico ou documento"
        value={query}
        autoComplete="off"
        onChange={(event) => {
          setQuery(event.target.value);
          setSelected(0);
        }}
        onKeyDown={(event) => {
          if (!hits.length) return;
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setSelected((current) => (current + (event.key === "ArrowDown" ? 1 : -1) + hits.length) % hits.length);
          } else if (event.key === "Enter") {
            go(hits[selected].href);
          } else if (event.key === "Escape") {
            setQuery("");
          }
        }}
      />
      <Kbd className="pointer-events-none absolute top-1/2 right-2 hidden -translate-y-1/2 md:inline-flex">/</Kbd>
      {normalized ? (
        <Card size="sm" className="absolute top-full right-0 left-0 z-30 mt-2 max-h-[60vh] overflow-auto shadow-lg">
          <CardContent className="flex flex-col gap-1">
            {hits.length ? (
              hits.map((hit, position) => (
                <Item
                  key={hit.href}
                  size="xs"
                  variant={position === selected ? "muted" : "default"}
                  render={<a href={hit.href} onClick={() => setQuery("")} />}
                >
                  <ItemContent>
                    <ItemTitle>{hit.title}</ItemTitle>
                    <ItemDescription>{hit.kind}</ItemDescription>
                  </ItemContent>
                </Item>
              ))
            ) : (
              <p className="p-2 text-sm text-muted-foreground">Nada encontrado.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function App({ data }: Readonly<{ data: RoadmapData | undefined }>) {
  const route = useRoute();
  const index = useMemo(() => (data ? createIndex(data) : null), [data]);
  const linker = useMemo(
    () => (data && index ? createLinker(index, data.repositoryUrl, route.raw) : null),
    [data, index, route.raw],
  );

  useEffect(() => {
    if (route.anchor) {
      document.getElementById(route.anchor)?.scrollIntoView({ block: "start" });
    } else {
      window.scrollTo(0, 0);
    }
    // Leva o foco ao conteúdo novo, como numa troca de página.
    if (document.activeElement?.closest("header nav")) {
      document.querySelector<HTMLElement>("main")?.focus({ preventScroll: true });
    }
    const heading = document.querySelector("main h1")?.textContent;
    document.title = heading ? `${heading} · Kaizen` : "Roadmap · Kaizen";
  }, [route.raw, route.anchor]);

  if (!data || !index || !linker) {
    return (
      <main className="p-6">
        <Card className="mx-auto mt-10 max-w-xl">
          <CardHeader>
            <CardTitle>Dados não gerados</CardTitle>
            <CardDescription>
              Rode <code>pnpm roadmap:view</code> na raiz do repositório e abra o arquivo indicado.
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    );
  }

  const props: PageProps = { data, index, linker, route };
  const [kind] = route.path;
  const page = (() => {
    switch (kind) {
      case undefined:
        return <OverviewPage {...props} />;
      case "epic":
        return <EpicPage {...props} />;
      case "matrix":
        return <MatrixPage {...props} />;
      case "kanban":
        return <KanbanPage {...props} />;
      case "task":
        return <TaskPage {...props} />;
      case "docs":
        return <DocumentsPage {...props} />;
      case "doc":
        return <DocumentPage {...props} />;
      default:
        return <NotFound what={`A página ${route.raw}`} />;
    }
  })();
  const generated = new Date(data.generatedAt).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });

  return (
    <TooltipProvider>
      <div className="min-h-svh">
        <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex max-w-[90rem] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-1.5 md:px-6">
            <a href="#/" className="inline-flex min-h-11 items-center gap-2 rounded-md text-foreground" aria-label="Roadmap do Kaizen">
              <KaizenLogo />
              <span className="font-[family-name:var(--font-figtree)] text-2xl leading-tight font-semibold">kaizen</span>
              <span className="text-sm text-muted-foreground">roadmap</span>
            </a>
            <nav aria-label="Seções do roadmap" className="order-3 w-full overflow-x-auto md:order-none md:w-auto">
              <ul className="flex gap-1">
                {tabs.map((tab) => (
                  <li key={tab.href}>
                    <NavigationItem asChild size="sm">
                      <a href={tab.href} aria-current={tab.match.includes(kind) ? "page" : undefined}>
                        {tab.label}
                      </a>
                    </NavigationItem>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="ml-auto flex flex-1 items-center justify-end gap-3 md:flex-none">
              <GlobalSearch data={data} />
              <span className="hidden text-xs whitespace-nowrap text-muted-foreground xl:inline">
                dados de {generated}
                {data.commit ? ` · ${data.commit}` : ""}
              </span>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-[90rem] p-4 md:p-6" tabIndex={-1}>
          {page}
        </main>
      </div>
    </TooltipProvider>
  );
}
