import "./markdown-renderer.js";
import type { RoadmapIndex } from "./data";

// Ponte tipada para o renderizador de markdown-renderer.js (sem dependências, HTML sempre escapado).
// Links do repositório viram rotas da página; caminhos de código abrem no editor.

type ResolvedLink = { href: string; className?: string; external?: boolean };
type Heading = { id: string; level: number; text: string };
type Renderer = {
  render: (
    markdown: string,
    options?: { resolveLink?: (href: string) => ResolvedLink },
  ) => { html: string; headings: Heading[] };
  escapeHtml: (text: string) => string;
};

const renderer = (globalThis as unknown as { KaizenMarkdown: Renderer }).KaizenMarkdown;
const codePath = /^(?:docs|roadmap|src|scripts|prisma|data|tests|schemas|messages)\//;

function normalize(path: string) {
  const parts: string[] = [];

  for (const part of path.split("/")) {
    if (!part || part === ".") continue;
    if (part === "..") parts.pop();
    else parts.push(part);
  }

  return parts.join("/");
}

export function createLinker(index: RoadmapIndex, repositoryUrl: string, currentRaw: string) {
  const editorRoot = decodeURI(repositoryUrl.replace(/^file:\/\/\/?/, "")).replace(/\/$/, "");
  const editorHref = (path: string) => `vscode://file/${editorRoot}/${path}`;

  function routeFor(path: string, anchor?: string | null) {
    const suffix = anchor ? `?a=${encodeURIComponent(anchor)}` : "";
    const task = index.tasksByPath.get(path);
    if (task) return `#/task/${task.id}${suffix}`;
    const epic = index.epicsByPath.get(path);
    if (epic) return `#/epic/${epic.id}${suffix}`;
    if (path === "roadmap/README.md") return "#/matrix";
    if (index.documentsByPath.has(path)) return `#/doc/${path}${suffix}`;
    return null;
  }

  function render(markdown: string, fromPath: string) {
    const base = fromPath.split("/").slice(0, -1).join("/");
    const result = renderer.render(markdown.replace(/^\s*#\s.*\n?/, ""), {
      resolveLink(href) {
        if (/^[a-z][a-z0-9+.-]*:/i.test(href)) return { external: true, href };
        const [rawPath, anchor] = href.split("#");
        if (!rawPath) return { href: `#${currentRaw}?a=${encodeURIComponent(anchor ?? "")}` };
        let decoded = rawPath;
        try {
          decoded = decodeURI(rawPath);
        } catch {
          // mantém o caminho original
        }
        const path = normalize(`${base ? `${base}/` : ""}${decoded}`);
        const route = routeFor(path, anchor);
        return route ? { href: route } : { className: "file-link", href: editorHref(path) };
      },
    });

    const html = result.html
      .replace(
        /<p>(Não registrado na versão original desta tarefa[^<]*?)<\/p>/g,
        '<p class="placeholder">$1</p>',
      )
      .replace(/(<a [^>]*>[\s\S]*?<\/a>)|<code>([^<\s]+?)<\/code>/g, (all, anchor, path) => {
        if (anchor || !codePath.test(path)) return all;
        const clean = path.replace(/[.,;:]$/, "");
        const route = routeFor(clean);
        return `<a href="${renderer.escapeHtml(route ?? editorHref(clean))}"${route ? "" : ' class="file-link"'}><code>${path}</code></a>`;
      });

    return { headings: result.headings, html };
  }

  return { editorHref, render };
}
