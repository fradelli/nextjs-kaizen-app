import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

// Gera roadmap/view/public/data.js para a visualização local do roadmap (roadmap/view/, feita com @fradelli/ui).
// Fontes: tarefas de roadmap/epics, estados de roadmap/README.md, ponteiro de roadmap/ACTIVE.md
// e documentos de docs/. Todo cálculo fica aqui; a página só desenha. O arquivo gerado é local
// (ignorado pelo Git) e é refeito a cada execução.

export const statusOrder = ["PLANNED", "READY", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED"];
const finalStatuses = new Set(["DONE", "CANCELLED"]);
const documentRoots = ["docs", "roadmap/OVERVIEW.md", "roadmap/ACTIVE.md"];

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(directory, predicate) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = resolve(directory, entry.name);

      if (entry.isDirectory()) {
        return walk(path, predicate);
      }

      return entry.isFile() && predicate(entry.name) ? [path] : [];
    });
}

function parseList(source) {
  return (source ?? "")
    .replace(/^\[|\]$/g, "")
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function splitFrontmatter(text) {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);

  if (!match) {
    return { body: text, fields: new Map() };
  }

  const fields = new Map(
    match[1]
      .split(/\r?\n/)
      .map((line) => line.match(/^([a-z_]+):\s*(.*)$/))
      .filter(Boolean)
      .map(([, key, value]) => [key, value.trim()]),
  );

  return { body: text.slice(match[0].length), fields };
}

function firstHeading(markdown) {
  return markdown.match(/^# (.+?)\s*$/m)?.[1] ?? "";
}

function headerField(markdown, field) {
  return markdown.match(new RegExp(`^- \\*\\*${field}:\\*\\*\\s*(.+?)\\.?\\s*$`, "m"))?.[1] ?? null;
}

function tableCells(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function linkText(cell) {
  return cell.match(/^\[(.+?)\]\(.*\)$/)?.[1] ?? cell;
}

export function parseStatusIndex(markdown) {
  const tasks = new Map();
  const epics = new Map();

  for (const line of markdown.split(/\r?\n/)) {
    const cells = tableCells(line);

    if (cells.length < 4 || !statusOrder.includes(cells[1])) {
      continue;
    }

    if (/^E\d{2}-T\d{2}$/.test(cells[0])) {
      tasks.set(cells[0], {
        status: cells[1],
        title: linkText(cells[2]),
        dependencyText: cells[3],
      });
    } else if (/^E\d{2}$/.test(cells[0])) {
      epics.set(cells[0], { status: cells[1], title: linkText(cells[2]), result: cells[3] });
    }
  }

  return { epics, tasks };
}

export function parseActive(markdown) {
  return {
    status: markdown.match(/\*\*Status:\*\*\s*([A-Z_]+)/)?.[1] ?? null,
    task: markdown.match(/\*\*Tarefa:\*\*\s*(E\d{2}-T\d{2})/)?.[1] ?? null,
    nextAction: markdown.match(/\*\*Próxima ação[^*]*:\*\*\s*(.+)$/m)?.[1]?.trim() ?? null,
  };
}

// Onda: tarefa final fica em "done"; as demais ficam uma onda depois da maior onda entre
// as dependências ainda não finais. Dependência satisfeita = DONE ou CANCELLED.
export function computeTaskState(tasks) {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  const waves = new Map();

  function waveOf(id, trail = new Set()) {
    if (waves.has(id)) {
      return waves.get(id);
    }

    const task = byId.get(id);

    if (!task || finalStatuses.has(task.status)) {
      return 0;
    }

    if (trail.has(id)) {
      return 1;
    }

    trail.add(id);
    const wave = 1 + Math.max(0, ...task.dependsOn.map((dependency) => waveOf(dependency, trail)));
    trail.delete(id);
    waves.set(id, wave);
    return wave;
  }

  return tasks.map((task) => {
    const pending = task.dependsOn.filter((id) => !finalStatuses.has(byId.get(id)?.status));
    const unblocks = tasks
      .filter((other) => other.dependsOn.includes(task.id))
      .map((other) => other.id);
    const final = finalStatuses.has(task.status);

    return {
      ...task,
      canStart: task.status === "READY" && pending.length === 0,
      pending,
      unblocks,
      waiting: !final && task.status !== "IN_PROGRESS" && pending.length > 0,
      wave: final ? "done" : String(waveOf(task.id)),
    };
  });
}

function countByStatus(tasks) {
  return Object.fromEntries(
    statusOrder.map((status) => [status, tasks.filter((task) => task.status === status).length]),
  );
}

export function buildRoadmapData(repositoryRoot = process.cwd()) {
  const read = (path) => readFileSync(resolve(repositoryRoot, path), "utf8");
  const index = parseStatusIndex(read("roadmap/README.md"));
  const epicDirectory = resolve(repositoryRoot, "roadmap", "epics");
  const rawTasks = [];
  const epics = [];

  for (const entry of readdirSync(epicDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const id = entry.name.slice(0, 3);
    const readmePath = `roadmap/epics/${entry.name}/README.md`;
    const readme = existsSync(resolve(repositoryRoot, readmePath)) ? read(readmePath) : "";
    epics.push({
      id,
      markdown: readme,
      path: readmePath,
      result: index.epics.get(id)?.result ?? "",
      status: index.epics.get(id)?.status ?? "PLANNED",
      title: index.epics.get(id)?.title ?? firstHeading(readme).replace(/^E\d{2}\s*[—-]\s*/, ""),
    });

    for (const file of walk(resolve(epicDirectory, entry.name), (name) =>
      /^T\d{2}-.+\.md$/.test(name),
    )) {
      const path = toPosix(relative(repositoryRoot, file));
      const { body, fields } = splitFrontmatter(readFileSync(file, "utf8"));
      const taskId = fields.get("id");

      if (!taskId) {
        continue;
      }

      rawTasks.push({
        dependsOn: parseList(fields.get("depends_on")),
        epic: fields.get("epic") ?? id,
        external: parseList(fields.get("external")),
        id: taskId,
        markdown: body,
        path,
        status: index.tasks.get(taskId)?.status ?? "PLANNED",
        title: firstHeading(body) || index.tasks.get(taskId)?.title || taskId,
      });
    }
  }

  rawTasks.sort((a, b) => a.id.localeCompare(b.id));
  epics.sort((a, b) => a.id.localeCompare(b.id));
  const tasks = computeTaskState(rawTasks);

  for (const epic of epics) {
    const own = tasks.filter((task) => task.epic === epic.id);
    const counted = own.filter((task) => task.status !== "CANCELLED");
    epic.counts = countByStatus(own);
    epic.total = own.length;
    epic.progress = counted.length
      ? counted.filter((task) => task.status === "DONE").length / counted.length
      : 0;
  }

  const documents = documentRoots.flatMap((root) => {
    const absolute = resolve(repositoryRoot, root);

    if (!existsSync(absolute)) {
      return [];
    }

    const files = root.endsWith(".md")
      ? [absolute]
      : walk(absolute, (name) => name.endsWith(".md"));
    return files
      .map((file) => toPosix(relative(repositoryRoot, file)))
      .filter((path) => !path.startsWith("docs/worklog/tasks/"))
      .map((path) => {
        const markdown = read(path);
        return {
          area: headerField(markdown, "Área"),
          folder: path.split("/").slice(0, -1).join("/"),
          markdown,
          path,
          tipo: headerField(markdown, "Tipo"),
          title: firstHeading(markdown) || path,
        };
      });
  });

  let commit = null;

  try {
    commit = execFileSync("git", ["rev-parse", "--short", "HEAD"], {
      cwd: repositoryRoot,
      encoding: "utf8",
    }).trim();
  } catch {
    // Fora de um repositório Git, a página omite o commit.
  }

  return {
    active: { ...parseActive(read("roadmap/ACTIVE.md")), markdown: read("roadmap/ACTIVE.md") },
    commit,
    counts: countByStatus(tasks),
    documents,
    epics,
    generatedAt: new Date().toISOString(),
    repositoryUrl: pathToFileURL(resolve(repositoryRoot)).href,
    statusOrder,
    tasks,
  };
}

function run() {
  const repositoryRoot = process.cwd();
  const data = buildRoadmapData(repositoryRoot);
  const output = resolve(repositoryRoot, "roadmap", "view", "public", "data.js");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(
    output,
    `// Gerado por scripts/build-roadmap-view.mjs; não editar nem versionar.\nwindow.ROADMAP_DATA = ${JSON.stringify(data).replace(/</g, "\\u003c")};\n`,
  );
  console.log(
    `Roadmap gerado: ${data.tasks.length} tarefas, ${data.epics.length} épicos e ${data.documents.length} documentos.`,
  );
  console.log(
    `Depois do build, abra ${pathToFileURL(resolve(repositoryRoot, "roadmap", "view", "dist", "index.html")).href}`,
  );
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
