import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { afterEach, beforeEach, describe, test } from "node:test";

import {
  buildRoadmapData,
  computeTaskState,
  parseActive,
  parseStatusIndex,
} from "./build-roadmap-view.mjs";

const repositoryRootOfScripts = resolve(dirname(fileURLToPath(import.meta.url)), "..");
let repositoryRoot;

function write(path, content) {
  const file = join(repositoryRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function task(id, dependsOn = "[]", extra = "") {
  return `---\nid: ${id}\nepic: E01\ndepends_on: ${dependsOn}\n${extra}---\n\n# Tarefa ${id}\n\n## Objetivo\n\nTexto.\n`;
}

describe("parseStatusIndex e parseActive", () => {
  test("lê estados de tarefas e épicos do índice", () => {
    const { epics, tasks } = parseStatusIndex(
      "| E01 | IN_PROGRESS | [Épico](epics/E01/README.md) | Resultado |\n| E01-T01 | DONE | [Um](x.md) | — |\n| E01-T02 | READY | Dois | E01-T01 |\n| ID | Status | Tarefa | Depende |\n",
    );

    assert.equal(epics.get("E01").status, "IN_PROGRESS");
    assert.equal(epics.get("E01").title, "Épico");
    assert.equal(tasks.get("E01-T01").status, "DONE");
    assert.equal(tasks.get("E01-T02").title, "Dois");
    assert.equal(tasks.size, 2);
  });

  test("lê o ponteiro da tarefa selecionada", () => {
    assert.deepEqual(
      parseActive(
        "- **Tarefa:** E01-T02 — Dois\n- **Status:** IN_PROGRESS\n- **Próxima ação da tarefa selecionada:** revisar o plano.\n",
      ),
      { nextAction: "revisar o plano.", status: "IN_PROGRESS", task: "E01-T02" },
    );
  });
});

describe("computeTaskState", () => {
  const base = (id, status, dependsOn = []) => ({ dependsOn, external: [], id, status });

  test("calcula ondas, pendências, desbloqueios e prontidão", () => {
    const state = computeTaskState([
      base("A", "DONE"),
      base("B", "READY", ["A"]),
      base("C", "PLANNED", ["B"]),
      base("D", "READY", ["C", "A"]),
      base("E", "CANCELLED", ["D"]),
      base("F", "IN_PROGRESS", ["C"]),
    ]);
    const byId = Object.fromEntries(state.map((task) => [task.id, task]));

    assert.deepEqual(
      state.map((task) => [task.id, task.wave]),
      [
        ["A", "done"],
        ["B", "1"],
        ["C", "2"],
        ["D", "3"],
        ["E", "done"],
        ["F", "3"],
      ],
    );
    assert.equal(byId.B.canStart, true);
    assert.equal(byId.D.canStart, false);
    assert.deepEqual(byId.D.pending, ["C"]);
    assert.equal(byId.D.waiting, true);
    assert.equal(byId.F.waiting, false, "tarefa em andamento não aparece como aguardando");
    assert.deepEqual(byId.B.unblocks, ["C"]);
  });

  test("dependência cancelada conta como satisfeita", () => {
    const [, second] = computeTaskState([base("A", "CANCELLED"), base("B", "READY", ["A"])]);

    assert.equal(second.canStart, true);
    assert.equal(second.wave, "1");
  });
});

describe("buildRoadmapData", () => {
  beforeEach(() => {
    repositoryRoot = join(
      tmpdir(),
      `kaizen-roadmap-view-${process.pid}-${Date.now()}-${Math.random()}`,
    );
    write("roadmap/epics/E01-sample/README.md", "# E01 — Amostra\n");
    write("roadmap/epics/E01-sample/T01-first.md", task("E01-T01"));
    write(
      "roadmap/epics/E01-sample/T02-second.md",
      task("E01-T02", "[E01-T01]", 'external: ["dieta fornecida"]\n'),
    );
    write(
      "roadmap/README.md",
      "| E01 | IN_PROGRESS | [Amostra](epics/E01-sample/README.md) | Resultado |\n| E01-T01 | DONE | [Um](x) | — |\n| E01-T02 | READY | [Dois](x) | E01-T01, dieta fornecida |\n",
    );
    write("roadmap/ACTIVE.md", "- **Tarefa:** E01-T02 — Dois\n- **Status:** READY\n");
    write("docs/guides/GUIDE.md", "# Guia\n\n- **Tipo:** Guia.\n- **Área:** Treino.\n");
    write("docs/worklog/tasks/WORK-1.md", "# Sessão\n");
  });

  afterEach(() => {
    rmSync(repositoryRoot, { force: true, recursive: true });
  });

  test("reúne épicos, tarefas, ponteiro e documentos", () => {
    const data = buildRoadmapData(repositoryRoot);

    assert.equal(data.active.task, "E01-T02");
    assert.deepEqual(
      data.tasks.map((item) => [item.id, item.status, item.wave, item.canStart, item.external]),
      [
        ["E01-T01", "DONE", "done", false, []],
        ["E01-T02", "READY", "1", true, ["dieta fornecida"]],
      ],
    );
    assert.equal(data.tasks[1].title, "Tarefa E01-T02");
    assert.equal(data.epics[0].title, "Amostra");
    assert.equal(data.epics[0].progress, 0.5);
    assert.deepEqual(
      data.documents.map((document) => [document.path, document.tipo, document.area]),
      [
        ["docs/guides/GUIDE.md", "Guia", "Treino"],
        ["roadmap/ACTIVE.md", null, null],
      ],
    );
  });
});

describe("KaizenMarkdown", () => {
  const context = {};
  runInNewContext(
    readFileSync(
      resolve(repositoryRootOfScripts, "roadmap", "view", "src", "markdown-renderer.js"),
      "utf8",
    ),
    context,
  );
  const { render } = context.KaizenMarkdown;

  test("escapa HTML e omite comentários", () => {
    const { html } = render("Texto <script>alert(1)</script> <!-- oculto -->");

    assert.ok(html.includes("&lt;script&gt;"));
    assert.ok(!html.includes("<script>"));
    assert.ok(!html.includes("oculto"));
  });

  test("renderiza títulos com âncoras, checklist, tabela e links resolvidos", () => {
    const { headings, html } = render(
      "## Critérios de aceite\n\n- [x] Feito\n- [ ] Pendente\n\n| A | B |\n| --- | --- |\n| 1 | [link](T01.md) |\n",
      { resolveLink: (href) => ({ href: `#/x/${href}` }) },
    );

    assert.equal(headings.map((heading) => heading.id).join(","), "critérios-de-aceite");
    assert.ok(html.includes('class="md-task done"'));
    assert.ok(html.includes("<table>"));
    assert.ok(html.includes('href="#/x/T01.md"'));
  });

  test("preserva o conteúdo de blocos de código", () => {
    const { html } = render("```js\nconst a = '<b>';\n```\n");

    assert.ok(html.includes('<pre class="md-code" data-lang="js"><code>const a = '));
    assert.ok(html.includes("&lt;b&gt;"));
  });
});
