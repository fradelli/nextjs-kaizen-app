import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { taskSections, validateDocumentation } from "./validate-documentation.mjs";
import { verifyDocPreservation } from "./verify-doc-preservation.mjs";

let repositoryRoot;

function write(path, content) {
  const file = join(repositoryRoot, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, content);
}

function task({ id = "E01-T02", dependsOn = "[E01-T01]", external, sections = taskSections } = {}) {
  const frontmatter = [`id: ${id}`, "epic: E01", `depends_on: ${dependsOn}`];

  if (external) {
    frontmatter.push(`external: ${external}`);
  }

  return `---\n${frontmatter.join("\n")}\n---\n\n# Tarefa\n\n${sections
    .map((section) => `## ${section}\n\nTexto.\n`)
    .join("\n")}`;
}

function createFixture() {
  repositoryRoot = join(tmpdir(), `kaizen-docs-${process.pid}-${Date.now()}-${Math.random()}`);
  write("roadmap/epics/E01-sample/T01-first.md", task({ id: "E01-T01", dependsOn: "[]" }));
  write("roadmap/epics/E01-sample/T02-second.md", task({ external: '["dieta fornecida"]' }));
  write(
    "roadmap/epics/E01-sample/README.md",
    "# E01\n\n| Tarefa | Depende de | Resultado |\n| --- | --- | --- |\n| [E01-T01](T01-first.md) | — | Um |\n| E01-T02 | E01-T01, dieta fornecida | Dois |\n",
  );
  write(
    "roadmap/README.md",
    "| ID | Status | Tarefa | Depende de |\n| --- | --- | --- | --- |\n| E01-T01 | DONE | [Um](epics/E01-sample/T01-first.md) | — |\n| E01-T02 | READY | [Dois](epics/E01-sample/T02-second.md) | E01-T01, dieta fornecida |\n",
  );
  write("docs/CATALOG.md", "# Catálogo\n\n- [Guia](guides/GUIDE.md) `guides/GUIDE.md`\n");
  write(
    "docs/guides/GUIDE.md",
    "# Guia\n\n- **Tipo:** Guia.\n- **Área:** Treino.\n- **Tarefas relacionadas:** [E01-T01](../../roadmap/epics/E01-sample/T01-first.md).\n",
  );
  write("docs/worklog/index.md", "# Diário\n");
}

beforeEach(createFixture);

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("validateDocumentation", () => {
  test("aceita repositório no padrão", () => {
    assert.deepEqual(validateDocumentation({ repositoryRoot }), []);
  });

  test("exige as seções do modelo da tarefa", () => {
    write(
      "roadmap/epics/E01-sample/T01-first.md",
      task({ id: "E01-T01", dependsOn: "[]", sections: taskSections.slice(0, -1) }),
    );

    assert.deepEqual(validateDocumentation({ repositoryRoot }), [
      "roadmap/epics/E01-sample/T01-first.md: seção obrigatória ausente: ## Resultado.",
    ]);
  });

  test("compara dependências do índice e da tabela do épico com o frontmatter", () => {
    write(
      "roadmap/epics/E01-sample/T02-second.md",
      task({ dependsOn: "[]", external: '["dieta fornecida"]' }),
    );

    assert.deepEqual(validateDocumentation({ repositoryRoot }), [
      "roadmap/README.md: dependências de E01-T02 divergem do depends_on (—).",
      "roadmap/epics/E01-sample/README.md: dependências de E01-T02 divergem do depends_on.",
    ]);
  });

  test("exige condição externa declarada no frontmatter", () => {
    write("roadmap/epics/E01-sample/T02-second.md", task());

    assert.deepEqual(validateDocumentation({ repositoryRoot }), [
      "roadmap/README.md: condição externa de E01-T02 diverge do campo external (—).",
    ]);
  });

  test("aceita motivo em texto livre em tarefa cancelada", () => {
    write(
      "roadmap/README.md",
      "| ID | Status | Tarefa | Depende de |\n| --- | --- | --- | --- |\n| E01-T01 | CANCELLED | [Um](epics/E01-sample/T01-first.md) | Cancelada por decisão |\n| E01-T02 | READY | [Dois](epics/E01-sample/T02-second.md) | E01-T01, dieta fornecida |\n",
    );

    assert.deepEqual(validateDocumentation({ repositoryRoot }), []);
  });

  test("exige cabeçalho, catálogo e links válidos nos documentos", () => {
    write("docs/guides/OTHER.md", "# Outro\n\n- **Tipo:** Guia.\n\n[quebrado](missing.md)\n");

    assert.deepEqual(validateDocumentation({ repositoryRoot }), [
      "docs/guides/OTHER.md: ausente do catálogo (docs/CATALOG.md).",
      "docs/guides/OTHER.md: cabeçalho sem o campo Tarefas relacionadas.",
      "docs/guides/OTHER.md: cabeçalho sem o campo Área.",
      "docs/guides/OTHER.md: link quebrado: missing.md.",
    ]);
  });

  test("ignora o diário gerado e os índices", () => {
    write("docs/worklog/tasks/WORK-1.md", "# Sessão\n");
    write("docs/guides/README.md", "# Índice\n");
    write("docs/CATALOG.md", "# Catálogo\n\n`guides/GUIDE.md` `guides/README.md`\n");

    assert.deepEqual(validateDocumentation({ repositoryRoot }), []);
  });
});

describe("verifyDocPreservation", () => {
  function git(...args) {
    return execFileSync("git", ["-c", "core.autocrlf=false", ...args], {
      cwd: repositoryRoot,
      encoding: "utf8",
    });
  }

  beforeEach(() => {
    git("init", "--quiet");
    git("add", ".");
    git(
      "-c",
      "user.name=test",
      "-c",
      "user.email=test@example.com",
      "commit",
      "--quiet",
      "-m",
      "base",
    );
  });

  test("aceita conteúdo apenas acrescentado", () => {
    write(
      "docs/guides/GUIDE.md",
      "# Guia\n\nNovo parágrafo.\n\n- **Tipo:** Guia.\n- **Área:** Treino.\n- **Tarefas relacionadas:** [E01-T01](../../roadmap/epics/E01-sample/T01-first.md).\n",
    );

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, []);
  });

  test("acusa linha perdida e aceita substituição declarada", () => {
    write(
      "docs/guides/GUIDE.md",
      "# Guia\n\n- **Tipo:** Guia.\n- **Área:** Alimentação.\n- **Tarefas relacionadas:** [E01-T01](../../roadmap/epics/E01-sample/T01-first.md).\n",
    );

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, [
      "docs/guides/GUIDE.md: linha ausente (1x): - **Área:** Treino.",
    ]);
    assert.deepEqual(
      verifyDocPreservation({
        base: "HEAD",
        replacements: [
          {
            file: "docs/guides/GUIDE.md",
            new: "- **Área:** Alimentação.",
            old: "- **Área:** Treino.",
          },
        ],
        repositoryRoot,
      }).errors,
      [],
    );
  });

  test("acusa arquivo removido", () => {
    rmSync(join(repositoryRoot, "docs/guides/GUIDE.md"));

    assert.deepEqual(verifyDocPreservation({ base: "HEAD", repositoryRoot }).errors, [
      "Arquivo removido ou movido: docs/guides/GUIDE.md.",
    ]);
  });
});
