import type { ReactNode } from "react";
import { Badge } from "@fradelli/ui/badge";
import { Card, CardContent } from "@fradelli/ui/card";
import { StatusIndicator } from "@fradelli/ui/status-indicator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@fradelli/ui/tooltip";
import solarIconAsset from "../../../public/brand/kaizen-solar.png";
import logoStyles from "../../../src/components/shared/app-shell/components/kaizen-logo/kaizen-logo.module.css";
import { FINAL_STATUSES, STATUS_LABEL, type Status, type Task } from "./data";
import type { Route } from "./router";
import { anchorHref } from "./router";

// Peças compartilhadas da visualização. Tudo que existe em @fradelli/ui vem do pacote;
// aqui ficam só composições e o logo, que reproduz o KaizenLogo do app sem next/image.

// No Vite o import de imagem é a URL do asset; o tipo global do Next (StaticImageData) não se aplica aqui.
const solarIcon = solarIconAsset as unknown as string;

export function KaizenLogo() {
  return (
    <span aria-hidden="true" className="relative block size-12 shrink-0 md:size-14">
      {/* Página fora do Next: next/image não se aplica a este bundle local. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={solarIcon} alt="" className="absolute inset-0 size-full" />
      <span data-kaizen-solar-layer="" className={logoStyles.glow}>
        <span data-kaizen-solar-layer="" className={logoStyles.halo} />
        <span data-kaizen-solar-layer="" className={logoStyles.disc}>
          <span data-kaizen-solar-layer="" className={logoStyles.light} />
        </span>
      </span>
    </span>
  );
}

const BADGE_VARIANT = {
  PLANNED: "secondary",
  READY: "info",
  IN_PROGRESS: "warning",
  BLOCKED: "destructive",
  DONE: "success",
  CANCELLED: "outline",
} as const;

const INDICATOR_TONE = {
  PLANNED: "neutral",
  READY: "neutral",
  IN_PROGRESS: "warning",
  BLOCKED: "destructive",
  DONE: "success",
  CANCELLED: "neutral",
} as const;

export function StatusBadge({ status }: Readonly<{ status: Status }>) {
  return (
    <Badge variant={BADGE_VARIANT[status]} title={status}>
      {STATUS_LABEL[status]}
    </Badge>
  );
}

export function StatusDot({ status }: Readonly<{ status: Status }>) {
  return <StatusIndicator tone={INDICATOR_TONE[status]} pulse={status === "IN_PROGRESS"} />;
}

export function TaskChip({ task, active }: Readonly<{ task: Task; active?: boolean }>) {
  const details = [
    `${task.id} · ${STATUS_LABEL[task.status]}`,
    task.title,
    task.pending.length ? `aguardando: ${task.pending.join(", ")}` : null,
    task.external.length ? `condição externa: ${task.external.join(", ")}` : null,
  ].filter(Boolean);

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            asChild
            variant={BADGE_VARIANT[task.status]}
            className={[
              "font-mono whitespace-nowrap",
              task.waiting ? "opacity-50" : "",
              task.status === "CANCELLED" ? "line-through" : "",
              active ? "ring-2 ring-[var(--color-category-yellow)]" : "",
            ].join(" ")}
          >
            <a href={`#/task/${task.id}`} aria-label={details.join(". ")}>
              {task.id}
            </a>
          </Badge>
        }
      />
      <TooltipContent>
        {details.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </TooltipContent>
    </Tooltip>
  );
}

export function StackedBar({
  counts,
  order,
}: Readonly<{ counts: Record<Status, number>; order: Status[] }>) {
  const total = order.reduce((sum, status) => sum + counts[status], 0);
  const label = order
    .filter((status) => counts[status])
    .map((status) => `${counts[status]} ${STATUS_LABEL[status].toLowerCase()}`)
    .join(", ");

  return (
    <div
      className="flex h-2 overflow-hidden rounded-full bg-[var(--color-surface-interactive)]"
      role="img"
      aria-label={label || "sem tarefas"}
    >
      {order
        .filter((status) => counts[status])
        .map((status) => (
          <span
            key={status}
            className={`status-fill-${status} h-full`}
            style={{ width: `${(counts[status] / total) * 100}%` }}
          />
        ))}
    </div>
  );
}

export function StatusLegend({ order }: Readonly<{ order: Status[] }>) {
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
      {order.map((status) => (
        <li key={status} className="inline-flex items-center gap-2">
          <span className={`status-fill-${status} inline-block size-2.5 rounded-sm`} />
          {STATUS_LABEL[status]}
        </li>
      ))}
    </ul>
  );
}

export function PageHeader({
  eyebrow,
  title,
  children,
}: Readonly<{ eyebrow?: ReactNode; title: ReactNode; children?: ReactNode }>) {
  return (
    <header className="mb-5 flex flex-col gap-2">
      {eyebrow ? <div className="text-sm text-muted-foreground">{eyebrow}</div> : null}
      <h1 className="font-[family-name:var(--font-figtree)] text-2xl leading-8 font-semibold">{title}</h1>
      {children}
    </header>
  );
}

export function SectionTitle({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <h2 className="mt-8 mb-3 font-[family-name:var(--font-figtree)] text-xl leading-7 font-semibold">
      {children}
    </h2>
  );
}

export function MarkdownArticle({
  html,
  headings,
  route,
}: Readonly<{ html: string; headings: { id: string; level: number; text: string }[]; route: Route }>) {
  const items = headings.filter((heading) => heading.level <= 3);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_15rem]">
      <Card>
        <CardContent>
          {/* HTML produzido por markdown-renderer.js: todo texto do documento é escapado. */}
          <div className="roadmap-md" dangerouslySetInnerHTML={{ __html: html }} />
        </CardContent>
      </Card>
      {items.length > 1 ? (
        <Card size="sm" className="lg:sticky lg:top-20">
          <CardContent>
            <nav aria-label="Nesta página" className="flex flex-col gap-1 text-sm">
              <span className="mb-1 text-xs font-semibold text-muted-foreground">Nesta página</span>
              {items.map((heading) => (
                <a
                  key={heading.id}
                  href={anchorHref(route, heading.id)}
                  className={`text-muted-foreground hover:text-foreground ${heading.level === 3 ? "pl-3 text-xs" : ""}`}
                >
                  {heading.text}
                </a>
              ))}
            </nav>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}

export function isFinal(status: Status) {
  return FINAL_STATUSES.has(status);
}
