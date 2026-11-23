import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

// Valida o padrão documental (docs/DOCUMENTATION-STANDARD.md) e a estrutura das
// tarefas do roadmap, que alimentam a navegação e a futura central visual.

export const taskSections = [
  "Objetivo",
  "Entradas",
  "Entregáveis",
  "Subtarefas",
  "Validações",
  "Critérios de aceite",
  "Resultado",
];
const taskFrontmatterKeys = new Set(["id", "epic", "depends_on", "external"]);
const headerFields = ["Tipo", "Área", "Tarefas relacionadas"];
// Índices, instruções, modelos e o próprio padrão não levam o cabeçalho comum.
const headerExemptNames = new Set([
  "README.md",
  "CLAUDE.md",
  "CATALOG.md",
  "DOCUMENTATION-STANDARD.md",
]);
const headerExemptDirectories = ["templates", "worklog"];
const taskIdPattern = /\bE\d{2}-T\d{2}\b/g;

function toPosix(path) {
  return path.split(sep).join("/");
}

function walk(directory, predicate) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return walk(path, predicate);
    }

    return entry.isFile() && predicate(entry.name) ? [path] : [];
  });
}

function withoutCodeFences(text) {
  return text.replace(/^```[\s\S]*?^```/gm, "");
}

function parseList(source) {
  return (source ?? "")
    .split(",")
    .map((item) => item.trim().replace(/^["']|["']$/g, ""))
    .filter(Boolean);
}

function tableCells(line) {
  return line
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function sameSet(left, right) {
  const a = [...new Set(left)].sort().join(",");
  const b = [...new Set(right)].sort().join(",");
  return a === b;
}

function readTasks(repositoryRoot, errors) {
  const tasks = new Map();
  const epicsDirectory = resolve(repositoryRoot, "roadmap", "epics");
  const files = walk(epicsDirectory, (name) => /^T\d{2}-.+\.md$/.test(name));

  for (const file of files) {
    const path = toPosix(relative(repositoryRoot, file));
    const content = readFileSync(file, "utf8");
    const frontmatter = content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1];

    if (!frontmatter) {
      errors.push(`${path}: frontmatter ausente.`);
      continue;
    }

    const fields = new Map(
      frontmatter
        .split(/\r?\n/)
        .map((line) => line.match(/^([a-z_]+):\s*(.*)$/))
        .filter(Boolean)
        .map(([, key, value]) => [key, value.trim()]),
    );

    for (const key of fields.keys()) {
      if (!taskFrontmatterKeys.has(key)) {
        errors.push(`${path}: campo de frontmatter não previsto: ${key}.`);
      }
    }

    for (const key of ["depends_on", "external"]) {
      if (fields.has(key) && !/^\[.*\]$/.test(fields.get(key))) {
        errors.push(`${path}: ${key} deve ser uma lista entre colchetes.`);
      }
    }

    const id = fields.get("id");

    if (!id || !/^E\d{2}-T\d{2}$/.test(id)) {
      errors.push(`${path}: id ausente ou inválido.`);
      continue;
    }

    const headings = withoutCodeFences(content)
      .split(/\r?\n/)
      .map((line) => line.match(/^## (.+?)\s*$/)?.[1])
      .filter(Boolean);

    for (const section of taskSections) {
      if (!headings.includes(section)) {
        errors.push(`${path}: seção obrigatória ausente: ## ${section}.`);
      }
    }

    tasks.set(id, {
      dependencies: parseList(fields.get("depends_on")?.slice(1, -1)),
      epic: fields.get("epic"),
      external: parseList(fields.get("external")?.slice(1, -1)),
      file,
      path,
    });
  }

  return tasks;
}

function validateRoadmapIndex(repositoryRoot, tasks, errors) {
  const readmePath = resolve(repositoryRoot, "roadmap", "README.md");

  if (!existsSync(readmePath)) {
    errors.push("roadmap/README.md ausente.");
    return;
  }

  const listed = new Set();

  for (const line of readFileSync(readmePath, "utf8").split(/\r?\n/)) {
    const cells = tableCells(line);

    if (cells.length < 4 || !/^E\d{2}-T\d{2}$/.test(cells[0])) {
      continue;
    }

    const [id, status, , dependencyCell] = cells;
    const task = tasks.get(id);
    listed.add(id);

    if (!task) {
      errors.push(`roadmap/README.md: tarefa sem arquivo: ${id}.`);
      continue;
    }

    const ids = dependencyCell.match(taskIdPattern) ?? [];
    const text = parseList(dependencyCell.replace(taskIdPattern, "")).filter(
      (item) => item !== "—",
    );

    if (!sameSet(ids, task.dependencies)) {
      errors.push(
        `roadmap/README.md: dependências de ${id} divergem do depends_on (${task.dependencies.join(", ") || "—"}).`,
      );
    }

    if (status !== "CANCELLED" && !sameSet(text, task.external)) {
      errors.push(
        `roadmap/README.md: condição externa de ${id} diverge do campo external (${task.external.join(", ") || "—"}).`,
      );
    }
  }

  for (const id of tasks.keys()) {
    if (!listed.has(id)) {
      errors.push(`roadmap/README.md: tarefa ausente do índice: ${id}.`);
    }
  }
}

function validateEpicTables(repositoryRoot, tasks, errors) {
  const epicsDirectory = resolve(repositoryRoot, "roadmap", "epics");

  if (!existsSync(epicsDirectory)) {
    return;
  }

  for (const entry of readdirSync(epicsDirectory, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const epic = entry.name.slice(0, 3);
    const readmePath = resolve(epicsDirectory, entry.name, "README.md");
    const path = toPosix(relative(repositoryRoot, readmePath));

    if (!existsSync(readmePath)) {
      errors.push(`${path}: README do épico ausente.`);
      continue;
    }

    const rows = new Map();

    for (const line of readFileSync(readmePath, "utf8").split(/\r?\n/)) {
      const cells = tableCells(line);
      const id = cells[0]?.match(/^\[?(E\d{2}-T\d{2})\]?(?:\(.*\))?$/)?.[1];

      if (id && cells.length >= 2) {
        rows.set(id, cells[1].match(taskIdPattern) ?? []);
      }
    }

    for (const [id, task] of tasks) {
      if (task.epic !== epic) {
        continue;
      }

      if (!rows.has(id)) {
        errors.push(`${path}: tarefa ausente da tabela de ordem: ${id}.`);
      } else if (!sameSet(rows.get(id), task.dependencies)) {
        errors.push(`${path}: dependências de ${id} divergem do depends_on.`);
      }
    }
  }
}

function validateDocuments(repositoryRoot, errors) {
  const docsDirectory = resolve(repositoryRoot, "docs");
  const catalogPath = resolve(docsDirectory, "CATALOG.md");
  const catalog = existsSync(catalogPath) ? readFileSync(catalogPath, "utf8") : "";

  for (const file of walk(docsDirectory, (name) => name.endsWith(".md"))) {
    const path = toPosix(relative(docsDirectory, file));
    const parts = path.split("/");
    const name = parts.at(-1);

    if (headerExemptDirectories.includes(parts[0])) {
      continue;
    }

    if (catalog && name !== "CATALOG.md" && !catalog.includes(path)) {
      errors.push(`docs/${path}: ausente do catálogo (docs/CATALOG.md).`);
    }

    if (headerExemptNames.has(name)) {
      continue;
    }

    const content = readFileSync(file, "utf8");

    for (const field of headerFields) {
      if (!new RegExp(`^- \\*\\*${field}:\\*\\* \\S`, "m").test(content)) {
        errors.push(`docs/${path}: cabeçalho sem o campo ${field}.`);
      }
    }
  }
}

function validateLinks(repositoryRoot, errors) {
  const files = [
    ...walk(resolve(repositoryRoot, "docs"), (name) => name.endsWith(".md")),
    ...walk(resolve(repositoryRoot, "roadmap"), (name) => name.endsWith(".md")),
    ...["CLAUDE.md", "README.md", "CHANGELOG.md"]
      .map((name) => resolve(repositoryRoot, name))
      .filter((path) => existsSync(path)),
  ];

  for (const file of files) {
    const content = withoutCodeFences(readFileSync(file, "utf8"));

    for (const [, target] of content.matchAll(/\]\(([^)\s#]+)(?:#[^)]*)?\)/g)) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(target)) {
        continue;
      }

      let decoded = target;

      try {
        decoded = decodeURI(target);
      } catch {
        // Mantém o alvo original quando a codificação é inválida.
      }

      if (!existsSync(resolve(dirname(file), decoded))) {
        errors.push(`${toPosix(relative(repositoryRoot, file))}: link quebrado: ${target}.`);
      }
    }
  }
}

export function validateDocumentation({ repositoryRoot = process.cwd() } = {}) {
  const errors = [];
  const tasks = readTasks(repositoryRoot, errors);

  validateRoadmapIndex(repositoryRoot, tasks, errors);
  validateEpicTables(repositoryRoot, tasks, errors);
  validateDocuments(repositoryRoot, errors);
  validateLinks(repositoryRoot, errors);

  return [...new Set(errors)].sort();
}

function run() {
  const errors = validateDocumentation();

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Documentation] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Documentation validation passed.");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
