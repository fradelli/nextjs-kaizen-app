import { useState, type ReactNode } from "react";
import { Button } from "@fradelli/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@fradelli/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@fradelli/ui/collapsible";
import { Input } from "@fradelli/ui/input";
import { Item, ItemActions, ItemContent, ItemDescription, ItemGroup, ItemTitle } from "@fradelli/ui/item";
import { Label } from "@fradelli/ui/label";
import { NativeSelect, NativeSelectOption } from "@fradelli/ui/native-select";
import { Progress, ProgressLabel, ProgressValue } from "@fradelli/ui/progress";
import { Switch } from "@fradelli/ui/switch";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@fradelli/ui/table";
import { ChevronDown, ExternalLink, Copy } from "lucide-react";
import {
  MarkdownArticle,
  PageHeader,
  SectionTitle,
  StackedBar,
  StatusBadge,
  StatusDot,
  StatusLegend,
  TaskChip,
  isFinal,
} from "./components";
import {
  STATUS_LABEL,
  countStatuses,
  matchesTask,
  percent,
  waveLabel,
  wavesOf,
  type RoadmapData,
  type RoadmapIndex,
  type Status,
  type Task,
} from "./data";
import type { createLinker } from "./markdown";
import type { Route } from "./router";

export type PageProps = Readonly<{
  data: RoadmapData;
  index: RoadmapIndex;
  linker: ReturnType<typeof createLinker>;
  route: Route;
}>;

const link = "text-foreground underline-offset-2 hover:underline";

function TaskRow({ task, data, aside }: Readonly<{ task: Task; data: RoadmapData; aside?: ReactNode }>) {
  return (
    <Item size="sm" variant="outline">
      <ItemContent>
        <ItemTitle>
          <TaskChip task={task} active={data.active.task === task.id} />
          <a className={link} href={`#/task/${task.id}`}>
            {task.title}
          </a>
        </ItemTitle>
        {aside ? <ItemDescription>{aside}</ItemDescription> : null}
      </ItemContent>
      <ItemActions>
        <StatusBadge status={task.status} />
      </ItemActions>
    </Item>
  );
}

function InlineMarkdown({ html }: Readonly<{ html: string }>) {
  return <span className="roadmap-md" dangerouslySetInnerHTML={{ __html: html.replace(/^<p>|<\/p>$/g, "") }} />;
}

export function OverviewPage({ data, index, linker }: PageProps) {
  const active = data.active.task ? index.tasksById.get(data.active.task) : undefined;
  const counted = data.tasks.length - data.counts.CANCELLED;
  const ready = data.tasks.filter((task) => task.canStart);
  const blocked = data.tasks.filter((task) => task.status === "BLOCKED");
  const readyWaiting = data.tasks.filter((task) => task.status === "READY" && task.waiting);
  const next = data.active.nextAction ? linker.render(data.active.nextAction, "roadmap/ACTIVE.md").html : "";
  const stats = [
    { value: data.counts.DONE, label: `de ${counted} tarefas concluídas (${percent(data.counts.DONE, counted)})` },
    { value: ready.length, label: "prontas para começar" },
    { value: data.counts.PLANNED + data.counts.READY + data.counts.BLOCKED, label: "abertas" },
    {
      value: `${data.epics.filter((epic) => epic.status === "IN_PROGRESS").length} / ${data.epics.length}`,
      label: "épicos em andamento",
    },
  ];

  return (
    <>
      <PageHeader eyebrow="Roadmap" title="Onde o Kaizen está" />

      <Card>
        <CardHeader>
          <CardDescription>Tarefa selecionada</CardDescription>
          {active ? (
            <CardTitle>
              <a className={link} href={`#/task/${active.id}`}>
                {active.id} · {active.title}
              </a>
            </CardTitle>
          ) : (
            <CardTitle>Nenhuma tarefa selecionada</CardTitle>
          )}
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {active ? (
            <div className="flex items-center gap-2">
              <StatusDot status={active.status} />
              <StatusBadge status={active.status} />
            </div>
          ) : null}
          {next ? (
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Próxima ação: </strong>
              <InlineMarkdown html={next} />
            </p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href="#/doc/roadmap/ACTIVE.md">Retomada completa</a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a href="#/doc/roadmap/OVERVIEW.md">Mapa por área</a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} size="sm">
            <CardContent>
              <div className="font-[family-name:var(--font-figtree)] text-2xl font-semibold">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionTitle>Andamento geral</SectionTitle>
      <Card size="sm">
        <CardContent>
          <StackedBar counts={data.counts} order={data.statusOrder} />
          <StatusLegend order={data.statusOrder} />
        </CardContent>
      </Card>

      <SectionTitle>Épicos</SectionTitle>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {data.epics.map((epic) => (
          <a key={epic.id} href={`#/epic/${epic.id}`} className="block rounded-xl focus-visible:outline-2">
            <Card size="sm" className="h-full transition-colors hover:border-[var(--color-muted-foreground)]">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{epic.id}</span>
                  <StatusBadge status={epic.status} />
                </div>
                <CardTitle>{epic.title}</CardTitle>
                <CardDescription>{epic.result}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={Math.round(epic.progress * 100)}>
                  <ProgressLabel className="text-muted-foreground">
                    {epic.counts.DONE} de {epic.total - epic.counts.CANCELLED} concluídas
                    {epic.counts.CANCELLED ? ` · ${epic.counts.CANCELLED} canceladas` : ""}
                  </ProgressLabel>
                  <ProgressValue />
                </Progress>
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      <SectionTitle>Para decidir o próximo passo</SectionTitle>
      <div className="grid gap-3 lg:grid-cols-3">
        {[
          { title: "Prontas para começar", list: ready, empty: "Nenhuma tarefa READY com dependências cumpridas.", aside: (task: Task) => waveLabel(task.wave) },
          { title: "Bloqueadas", list: blocked, empty: "Nenhuma tarefa BLOCKED.", aside: () => null },
          { title: "Prontas, mas aguardando dependência", list: readyWaiting, empty: "Nenhuma.", aside: (task: Task) => `aguarda ${task.pending.join(", ")}` },
        ].map((group) => (
          <Card key={group.title} size="sm">
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent>
              {group.list.length ? (
                <ItemGroup className="gap-2">
                  {group.list.map((task) => (
                    <TaskRow key={task.id} task={task} data={data} aside={group.aside(task)} />
                  ))}
                </ItemGroup>
              ) : (
                <p className="text-sm text-muted-foreground">{group.empty}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}

export function EpicPage({ data, index, linker, route }: PageProps) {
  const epic = index.epicsById.get(route.path[1] ?? "");
  if (!epic) return <NotFound what={`Épico ${route.path[1] ?? ""}`} />;
  const tasks = data.tasks.filter((task) => task.epic === epic.id);
  const markdown = linker.render(epic.markdown, epic.path);

  return (
    <>
      <PageHeader
        eyebrow={
          <a className={link} href="#/">
            Visão geral
          </a>
        }
        title={`${epic.id} · ${epic.title}`}
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <StatusBadge status={epic.status} />
          {epic.counts.DONE} de {epic.total - epic.counts.CANCELLED} concluídas
        </div>
      </PageHeader>
      <Card size="sm">
        <CardContent>
          <StackedBar counts={epic.counts} order={data.statusOrder} />
          <StatusLegend order={data.statusOrder} />
        </CardContent>
      </Card>

      <SectionTitle>Tarefas por onda</SectionTitle>
      <div className="flex flex-col gap-3">
        {wavesOf(tasks).map((wave) => {
          const list = tasks.filter((task) => task.wave === wave);
          return (
            <Card key={wave} size="sm">
              <Collapsible defaultOpen={wave !== "done"}>
                <CardHeader>
                  <CollapsibleTrigger
                    render={
                      <Button variant="ghost" size="sm" className="w-fit">
                        <ChevronDown aria-hidden="true" />
                        {waveLabel(wave)} · {list.length}
                      </Button>
                    }
                  />
                </CardHeader>
                <CollapsibleContent>
                  <CardContent>
                    <ItemGroup className="gap-2">
                      {list.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          data={data}
                          aside={task.pending.length ? `aguarda ${task.pending.join(", ")}` : null}
                        />
                      ))}
                    </ItemGroup>
                  </CardContent>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>

      <SectionTitle>Descrição do épico</SectionTitle>
      <MarkdownArticle html={markdown.html} headings={markdown.headings} route={route} />
    </>
  );
}

type Filters = { epic: string; query: string; onlyReady: boolean; showFinal: boolean; lane: "epic" | "wave" };

function FilterBar({
  data,
  filters,
  onChange,
  finalLabel,
  showLane,
}: Readonly<{
  data: RoadmapData;
  filters: Filters;
  onChange: (next: Filters) => void;
  finalLabel: string;
  showLane?: boolean;
}>) {
  return (
    <Card size="sm" className="mb-4">
      <CardContent className="flex flex-wrap items-end gap-4">
        <div className="flex min-w-48 flex-col gap-1.5">
          <Label htmlFor="filter-epic">Épico</Label>
          <NativeSelect
            id="filter-epic"
            value={filters.epic}
            onChange={(event) => onChange({ ...filters, epic: event.target.value })}
          >
            <NativeSelectOption value="todos">Todos ({data.tasks.length})</NativeSelectOption>
            {data.epics.map((epic) => (
              <NativeSelectOption key={epic.id} value={epic.id}>
                {epic.id} · {epic.title} ({epic.total})
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <div className="flex min-w-56 flex-1 flex-col gap-1.5">
          <Label htmlFor="filter-query">Buscar</Label>
          <Input
            id="filter-query"
            type="search"
            placeholder="ID ou título da tarefa"
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
          />
        </div>
        {showLane ? (
          <div className="flex min-w-40 flex-col gap-1.5">
            <Label htmlFor="filter-lane">Raias</Label>
            <NativeSelect
              id="filter-lane"
              value={filters.lane}
              onChange={(event) => onChange({ ...filters, lane: event.target.value as Filters["lane"] })}
            >
              <NativeSelectOption value="epic">Por épico</NativeSelectOption>
              <NativeSelectOption value="wave">Por onda</NativeSelectOption>
            </NativeSelect>
          </div>
        ) : null}
        <Label className="flex items-center gap-2">
          <Switch checked={filters.onlyReady} onCheckedChange={(checked) => onChange({ ...filters, onlyReady: checked })} />
          Só prontas para começar
        </Label>
        <Label className="flex items-center gap-2">
          <Switch checked={filters.showFinal} onCheckedChange={(checked) => onChange({ ...filters, showFinal: checked })} />
          {finalLabel}
        </Label>
      </CardContent>
    </Card>
  );
}

function useFilters(showFinal: boolean) {
  return useState<Filters>({ epic: "todos", query: "", onlyReady: false, showFinal, lane: "epic" });
}

function applyFilters(tasks: Task[], filters: Filters) {
  return tasks.filter(
    (task) =>
      (filters.epic === "todos" || task.epic === filters.epic) &&
      matchesTask(task, filters.query) &&
      (!filters.onlyReady || task.canStart) &&
      (filters.showFinal || !isFinal(task.status)),
  );
}

export function MatrixPage({ data }: PageProps) {
  const [filters, setFilters] = useFilters(true);
  const tasks = applyFilters(data.tasks, filters);
  const counts = countStatuses(tasks);

  return (
    <>
      <PageHeader eyebrow="Tarefas" title="Matriz onda × status">
        <p className="max-w-3xl text-sm text-muted-foreground">
          A onda é o nível de dependência: a tarefa entra na onda seguinte à maior onda das dependências ainda abertas.
          Tarefas da mesma onda podem andar em paralelo. Esmaecida: aguarda dependência. Contorno amarelo: tarefa
          selecionada.
        </p>
      </PageHeader>
      <FilterBar data={data} filters={filters} onChange={setFilters} finalLabel="Mostrar finalizadas" />
      <Card size="sm">
        <CardContent>
          <Table className="min-w-[56rem]">
            <TableCaption className="sr-only">Tarefas por onda e status</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead scope="col">Onda</TableHead>
                {data.statusOrder.map((status) => (
                  <TableHead key={status} scope="col">
                    <span className="inline-flex items-center gap-2">
                      <span className={`status-fill-${status} inline-block size-2.5 rounded-sm`} />
                      {STATUS_LABEL[status]}
                    </span>
                  </TableHead>
                ))}
                <TableHead scope="col" className="text-right">
                  Total · concluídas
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wavesOf(tasks).map((wave) => {
                const row = tasks.filter((task) => task.wave === wave);
                return (
                  <TableRow key={wave}>
                    <TableHead scope="row" className="align-top">
                      {waveLabel(wave)}
                    </TableHead>
                    {data.statusOrder.map((status) => (
                      <TableCell key={status} className="align-top whitespace-normal">
                        <div className="flex flex-wrap gap-1">
                          {row
                            .filter((task) => task.status === status)
                            .map((task) => (
                              <TaskChip key={task.id} task={task} active={data.active.task === task.id} />
                            ))}
                        </div>
                      </TableCell>
                    ))}
                    <TableCell className="text-right align-top">
                      {row.length} ·{" "}
                      {percent(
                        row.filter((task) => task.status === "DONE").length,
                        row.filter((task) => task.status !== "CANCELLED").length,
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
              {!tasks.length ? (
                <TableRow>
                  <TableCell colSpan={data.statusOrder.length + 2} className="text-muted-foreground">
                    Nenhuma tarefa com esses filtros.
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell>Total</TableCell>
                {data.statusOrder.map((status) => (
                  <TableCell key={status}>
                    {counts[status]}{" "}
                    <span className="font-normal text-muted-foreground">({percent(counts[status], tasks.length)})</span>
                  </TableCell>
                ))}
                <TableCell className="text-right">{tasks.length}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
      <p className="mt-3 text-xs text-muted-foreground">
        Dependência satisfeita: DONE ou CANCELLED. “Prontas para começar”: READY sem dependência aberta.
      </p>
    </>
  );
}

export function KanbanPage({ data, index }: PageProps) {
  const [filters, setFilters] = useFilters(false);
  const tasks = applyFilters(data.tasks, filters);
  const statuses = data.statusOrder.filter((status) => filters.showFinal || !isFinal(status));

  return (
    <>
      <PageHeader eyebrow="Tarefas" title="Kanban">
        <p className="text-sm text-muted-foreground">Colunas por status e raias por épico ou por onda.</p>
      </PageHeader>
      <FilterBar
        data={data}
        filters={filters}
        onChange={setFilters}
        finalLabel="Mostrar concluídas e canceladas"
        showLane
      />
      <div className="grid auto-cols-[minmax(15rem,1fr)] grid-flow-col gap-3 overflow-x-auto pb-2">
        {statuses.map((status: Status) => {
          const column = tasks.filter((task) => task.status === status);
          const lanes =
            filters.lane === "epic" ? [...new Set(column.map((task) => task.epic))].sort() : wavesOf(column);
          return (
            <Card key={status} size="sm" className="min-h-40">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className={`status-fill-${status} inline-block size-2.5 rounded-sm`} />
                  {STATUS_LABEL[status]}
                  <span className="ml-auto text-sm font-normal text-muted-foreground">{column.length}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {!column.length ? <p className="text-sm text-muted-foreground">—</p> : null}
                {lanes.map((lane) => (
                  <section key={lane} className="flex flex-col gap-2">
                    <h3 className="mt-1 text-xs font-semibold text-muted-foreground">
                      {filters.lane === "epic" ? `${lane} · ${index.epicsById.get(lane)?.title ?? ""}` : waveLabel(lane)}
                    </h3>
                    {column
                      .filter((task) => (filters.lane === "epic" ? task.epic === lane : task.wave === lane))
                      .map((task) => (
                        <Item
                          key={task.id}
                          size="sm"
                          variant="outline"
                          render={<a href={`#/task/${task.id}`} />}
                          className={[
                            task.waiting ? "opacity-60" : "",
                            data.active.task === task.id ? "ring-2 ring-[var(--color-category-yellow)]" : "",
                          ].join(" ")}
                        >
                          <ItemContent>
                            <ItemDescription className="font-mono text-xs">
                              {task.id} · {waveLabel(task.wave)}
                            </ItemDescription>
                            <ItemTitle>{task.title}</ItemTitle>
                            {task.pending.length ? (
                              <ItemDescription className="text-[var(--color-status-destructive-foreground)]">
                                aguarda {task.pending.join(", ")}
                              </ItemDescription>
                            ) : null}
                          </ItemContent>
                        </Item>
                      ))}
                  </section>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </>
  );
}

export function TaskPage({ data, index, linker, route }: PageProps) {
  const task = index.tasksById.get(route.path[1] ?? "");
  const [copied, setCopied] = useState(false);
  if (!task) return <NotFound what={`Tarefa ${route.path[1] ?? ""}`} />;
  const epic = index.epicsById.get(task.epic);
  const markdown = linker.render(task.markdown, task.path);
  const dependencies = task.dependsOn.map((id) => index.tasksById.get(id)).filter((item): item is Task => Boolean(item));
  const unblocks = task.unblocks.map((id) => index.tasksById.get(id)).filter((item): item is Task => Boolean(item));
  const siblings = data.tasks.filter((item) => item.epic === task.epic);
  const position = siblings.indexOf(task);
  const isActive = data.active.task === task.id;
  const next = isActive && data.active.nextAction ? linker.render(data.active.nextAction, "roadmap/ACTIVE.md").html : "";

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <a className={link} href="#/">
              Visão geral
            </a>{" "}
            ›{" "}
            <a className={link} href={`#/epic/${task.epic}`}>
              {task.epic} · {epic?.title}
            </a>
          </>
        }
        title={`${task.id} · ${task.title}`}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          <StatusDot status={task.status} />
          <StatusBadge status={task.status} />
          <span>{waveLabel(task.wave)}</span>
          {isActive ? <span>· tarefa selecionada</span> : null}
        </div>
      </PageHeader>

      {next ? (
        <Card size="sm" className="mb-3">
          <CardContent className="text-sm">
            <strong>Próxima ação: </strong>
            <InlineMarkdown html={next} />
          </CardContent>
        </Card>
      ) : null}
      {task.canStart ? (
        <p className="mb-3 rounded-lg border border-[var(--color-status-success-border)] bg-[var(--color-status-success-subtle)] px-3 py-2 text-sm">
          Pronta para começar: todas as dependências estão concluídas ou canceladas.
        </p>
      ) : null}
      {task.pending.length && !isFinal(task.status) ? (
        <p className="mb-3 flex flex-wrap items-center gap-2 rounded-lg border border-[var(--color-status-destructive-border)] bg-[var(--color-status-destructive-subtle)] px-3 py-2 text-sm">
          Aguardando
          {task.pending.map((id) => {
            const pending = index.tasksById.get(id);
            return pending ? <TaskChip key={id} task={pending} /> : <span key={id}>{id}</span>;
          })}
        </p>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <Card size="sm">
          <CardHeader>
            <CardDescription>Depende de</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {dependencies.length ? (
              dependencies.map((item) => <TaskRow key={item.id} task={item} data={data} />)
            ) : (
              <span className="text-sm text-muted-foreground">Nenhuma tarefa</span>
            )}
            {task.external.length ? (
              <span className="text-sm">
                <span className="text-muted-foreground">Condição externa: </span>
                {task.external.join(", ")}
              </span>
            ) : null}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Desbloqueia</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {unblocks.length ? (
              unblocks.map((item) => <TaskRow key={item.id} task={item} data={data} />)
            ) : (
              <span className="text-sm text-muted-foreground">Nenhuma tarefa depende desta</span>
            )}
          </CardContent>
        </Card>
        <Card size="sm">
          <CardHeader>
            <CardDescription>Arquivo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <code className="text-xs break-all">{task.path}</code>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={linker.editorHref(task.path)}>
                  <ExternalLink aria-hidden="true" />
                  Abrir no editor
                </a>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  void navigator.clipboard?.writeText(task.id).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1500);
                  });
                }}
              >
                <Copy aria-hidden="true" />
                {copied ? "Copiado" : "Copiar ID"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4">
        <MarkdownArticle html={markdown.html} headings={markdown.headings} route={route} />
      </div>

      <nav className="mt-6 flex justify-between gap-3 text-sm" aria-label="Tarefas do épico">
        {position > 0 ? (
          <a className={link} href={`#/task/${siblings[position - 1].id}`}>
            ← {siblings[position - 1].id} · {siblings[position - 1].title}
          </a>
        ) : (
          <span />
        )}
        {position < siblings.length - 1 ? (
          <a className={`${link} text-right`} href={`#/task/${siblings[position + 1].id}`}>
            {siblings[position + 1].id} · {siblings[position + 1].title} →
          </a>
        ) : null}
      </nav>
    </>
  );
}

export function DocumentsPage({ data }: PageProps) {
  const [tipo, setTipo] = useState("todos");
  const [query, setQuery] = useState("");
  const tipos = [...new Set(data.documents.map((document) => document.tipo ?? "Sem tipo"))].sort();
  const normalized = query.trim().toLowerCase();
  const documents = data.documents.filter(
    (document) =>
      (tipo === "todos" || (document.tipo ?? "Sem tipo") === tipo) &&
      (!normalized || `${document.title} ${document.path} ${document.area ?? ""}`.toLowerCase().includes(normalized)),
  );
  const folders = [...new Set(documents.map((document) => document.folder))];

  return (
    <>
      <PageHeader eyebrow="Documentação" title="Documentos">
        <p className="max-w-3xl text-sm text-muted-foreground">
          Planos, decisões, produto, arquitetura, evidências e guias, com o tipo e a área do cabeçalho comum.
        </p>
      </PageHeader>
      <Card size="sm" className="mb-4">
        <CardContent className="flex flex-wrap items-end gap-4">
          <div className="flex min-w-48 flex-col gap-1.5">
            <Label htmlFor="doc-tipo">Tipo</Label>
            <NativeSelect id="doc-tipo" value={tipo} onChange={(event) => setTipo(event.target.value)}>
              <NativeSelectOption value="todos">Todos ({data.documents.length})</NativeSelectOption>
              {tipos.map((item) => (
                <NativeSelectOption key={item} value={item}>
                  {item}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>
          <div className="flex min-w-56 flex-1 flex-col gap-1.5">
            <Label htmlFor="doc-query">Buscar</Label>
            <Input
              id="doc-query"
              type="search"
              placeholder="Título, área ou caminho"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
          <span className="text-sm text-muted-foreground">{documents.length} documentos</span>
        </CardContent>
      </Card>
      {folders.map((folder) => (
        <section key={folder} className="mb-6">
          <h2 className="mb-2 font-mono text-sm text-muted-foreground">{folder}</h2>
          <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {documents
              .filter((document) => document.folder === folder)
              .map((document) => (
                <Item key={document.path} variant="outline" render={<a href={`#/doc/${document.path}`} />}>
                  <ItemContent>
                    <ItemTitle>{document.title}</ItemTitle>
                    <ItemDescription>
                      {[document.tipo, document.area].filter(Boolean).join(" · ") || document.path}
                    </ItemDescription>
                  </ItemContent>
                </Item>
              ))}
          </div>
        </section>
      ))}
      {!documents.length ? <p className="text-sm text-muted-foreground">Nenhum documento com esses filtros.</p> : null}
    </>
  );
}

export function DocumentPage({ index, linker, route }: PageProps) {
  const path = route.path.slice(1).join("/");
  const document = index.documentsByPath.get(path);
  if (!document) return <NotFound what={`Documento ${path}`} />;
  const markdown = linker.render(document.markdown, document.path);

  return (
    <>
      <PageHeader
        eyebrow={
          <>
            <a className={link} href="#/docs">
              Documentos
            </a>{" "}
            › <code>{document.folder}</code>
          </>
        }
        title={document.title}
      >
        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {[document.tipo, document.area].filter(Boolean).join(" · ")}
          <Button asChild variant="outline" size="sm">
            <a href={linker.editorHref(document.path)}>
              <ExternalLink aria-hidden="true" />
              Abrir no editor
            </a>
          </Button>
        </div>
      </PageHeader>
      <MarkdownArticle html={markdown.html} headings={markdown.headings} route={route} />
    </>
  );
}

export function NotFound({ what }: Readonly<{ what: string }>) {
  return (
    <Card className="mx-auto mt-10 max-w-xl">
      <CardHeader>
        <CardTitle>Não encontrado</CardTitle>
        <CardDescription>
          {what} não existe nos dados gerados. Rode <code>pnpm roadmap:view</code> de novo se o arquivo for novo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <a className={link} href="#/">
          Voltar à visão geral
        </a>
      </CardContent>
    </Card>
  );
}
