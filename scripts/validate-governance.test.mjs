import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, test } from "node:test";

import { validateGovernance } from "./validate-governance.mjs";

let repositoryRoot;

const validBody = `## Resumo

Entrega a validação.

## Problema

O gate ainda não existe.

## Causa raiz

A automação ainda não foi criada.

## Alterações

- adiciona o gate

## Arquivos adicionados ou atualizados

- \`scripts/validate-governance.mjs\`

## Impacto

### Corrigido

- valida PRs

### Não alterado

- não faz deploy

## Validação

- [x] governança

## Observações

- Tarefa principal: \`E04-T05\`
`;

function createRepositoryFixture() {
  repositoryRoot = join(
    tmpdir(),
    `kaizen-governance-${process.pid}-${Date.now()}-${Math.random()}`,
  );
  mkdirSync(join(repositoryRoot, "roadmap", "epics", "E04"), {
    recursive: true,
  });
  writeFileSync(
    join(repositoryRoot, "roadmap", "epics", "E04", "T05.md"),
    "---\nid: E04-T05\nepic: E04\ndepends_on: []\n---\n",
  );
  writeFileSync(
    join(repositoryRoot, "roadmap", "README.md"),
    "| ID | Status | Tarefa | Dependências |\n| --- | --- | --- | --- |\n| E04-T05 | IN_PROGRESS | CI | nenhuma |\n",
  );
  writeFileSync(
    join(repositoryRoot, "roadmap", "ACTIVE.md"),
    "- **Tarefa:** E04-T05 — Configurar CI mínimo\n- **Status:** IN_PROGRESS\n",
  );
}

function taskPullRequest(overrides = {}) {
  return {
    pull_request: {
      base: { ref: "developer" },
      body: validBody,
      head: { ref: "claude/E04-T05-configure-minimal-ci" },
      title: "[E04-T05] ci(workflow): configurar CI mínimo",
      user: { login: "maintainer" },
      ...overrides,
    },
  };
}

beforeEach(createRepositoryFixture);

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("validateGovernance", () => {
  test("aceita PR de tarefa válida", () => {
    assert.deepEqual(validateGovernance({ event: taskPullRequest(), repositoryRoot }), []);
  });

  test("rejeita branch de tarefa com prefixo diferente de claude", () => {
    for (const ref of [
      "codex/E04-T05-configure-minimal-ci",
      "feature/E04-T05-configure-minimal-ci",
    ]) {
      const errors = validateGovernance({
        event: taskPullRequest({ head: { ref } }),
        repositoryRoot,
      });

      assert.ok(errors.some((error) => error.includes("claude/E00-T01-descricao-curta")));
    }
  });

  test("rejeita divergência entre branch e título", () => {
    const errors = validateGovernance({
      event: taskPullRequest({
        title: "[E04-T06] ci(workflow): configurar CI mínimo",
      }),
      repositoryRoot,
    });

    assert.ok(errors.some((error) => error.includes("ID divergente")));
    assert.ok(errors.some((error) => error.includes("Tarefa inexistente")));
  });

  test("rejeita seção obrigatória ausente", () => {
    const errors = validateGovernance({
      event: taskPullRequest({ body: validBody.replace("## Problema", "Problema") }),
      repositoryRoot,
    });

    assert.ok(errors.some((error) => error.includes("## Problema")));
  });

  test("aceita promoção válida com merge commit", () => {
    const body = validBody
      .replace(
        "- adiciona o gate",
        "- Commit de origem: `0123456789abcdef0123456789abcdef01234567`",
      )
      .replace(
        "- Tarefa principal: `E04-T05`",
        "- Tarefa principal: `E04-T05`\n- Método de merge: merge commit; nunca squash em promoção",
      );
    const event = taskPullRequest({
      base: { ref: "staging" },
      body,
      head: { ref: "developer" },
      title: "[E04-T05] chore(release): promover developer para staging",
    });

    assert.deepEqual(validateGovernance({ event, repositoryRoot }), []);
  });

  test("rejeita salto de developer para master", () => {
    const event = taskPullRequest({
      base: { ref: "master" },
      head: { ref: "developer" },
      title: "[E04-T05] chore(release): promover developer para master",
    });
    const errors = validateGovernance({ event, repositoryRoot });

    assert.ok(errors.some((error) => error.includes("Direção de promoção inválida")));
  });

  test("aceita Dependabot somente na developer", () => {
    const event = taskPullRequest({
      body: "",
      head: { ref: "dependabot/npm_and_yarn/react-20" },
      title: "build(deps): bump react from 19 to 20",
      user: { login: "dependabot[bot]" },
    });

    assert.deepEqual(validateGovernance({ event, repositoryRoot }), []);
  });

  test("rejeita Dependabot em branch de promoção", () => {
    const event = taskPullRequest({
      base: { ref: "staging" },
      body: "",
      head: { ref: "dependabot/npm_and_yarn/react-20" },
      title: "build(deps): bump react from 19 to 20",
      user: { login: "dependabot[bot]" },
    });
    const errors = validateGovernance({ event, repositoryRoot });

    assert.ok(errors.some((error) => error.includes("só pode abrir PR para developer")));
  });

  test("rejeita dependência inexistente no roadmap", () => {
    writeFileSync(
      join(repositoryRoot, "roadmap", "epics", "E04", "T05.md"),
      "---\nid: E04-T05\nepic: E04\ndepends_on: [E04-T99]\n---\n",
    );
    const errors = validateGovernance({
      event: taskPullRequest(),
      repositoryRoot,
    });

    assert.ok(errors.some((error) => error.includes("E04-T05 -> E04-T99")));
  });
});
