import { readFileSync, readdirSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const taskBranchPattern = /^claude\/(E\d{2}-T\d{2})-[a-z0-9]+(?:-[a-z0-9]+)*$/;
const taskTitlePattern =
  /^\[(E\d{2}-T\d{2})\] (?:build|chore|ci|docs|feat|fix|perf|refactor|style|test)\([a-z0-9-]+\): .+$/;
const dependabotTitlePattern = /^build\(deps(?:-dev)?\): .+$/;
const allowedStatuses = new Set([
  "PLANNED",
  "READY",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "CANCELLED",
]);
const requiredLevelTwoHeadings = [
  "Resumo",
  "Problema",
  "Causa raiz",
  "Alterações",
  "Arquivos adicionados ou atualizados",
  "Impacto",
  "Validação",
  "Observações",
];
const placeholderPatterns = [
  /SUBSTITUIR_ANTES_DA_PR/i,
  /substitua pelos itens reais/i,
  /substitua\/pelo\/caminho-real/i,
  /substitua pelo resultado real/i,
  /substitua pelo que permaneceu fora do escopo/i,
  /Descreva o que esta PR entrega/i,
  /Explique a necessidade ou lacuna/i,
  /Explique por que o repositório precisava/i,
];

function walkMarkdownFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return walkMarkdownFiles(path);
    }

    return entry.isFile() && entry.name.endsWith(".md") ? [path] : [];
  });
}

function collectTasks(repositoryRoot) {
  const taskDirectory = resolve(repositoryRoot, "roadmap", "epics");
  const tasks = new Map();
  const errors = [];

  for (const file of walkMarkdownFiles(taskDirectory)) {
    const content = readFileSync(file, "utf8");
    const id = content.match(/^id:\s*(E\d{2}-T\d{2})\s*$/m)?.[1];

    if (!id) {
      continue;
    }

    if (tasks.has(id)) {
      errors.push(`ID de tarefa duplicado: ${id}.`);
      continue;
    }

    const dependencySource = content.match(/^depends_on:\s*\[([^\]]*)\]\s*$/m)?.[1];
    const dependencies = dependencySource
      ? dependencySource
          .split(",")
          .map((dependency) => dependency.trim())
          .filter(Boolean)
      : [];

    tasks.set(id, { dependencies, file });
  }

  for (const [id, task] of tasks) {
    for (const dependency of task.dependencies) {
      if (!tasks.has(dependency)) {
        errors.push(`Dependência inexistente: ${id} -> ${dependency}.`);
      }
    }
  }

  const visited = new Set();
  const visiting = new Set();

  function visit(id, trail = []) {
    if (visiting.has(id)) {
      errors.push(`Ciclo de tarefas: ${[...trail, id].join(" -> ")}.`);
      return;
    }

    if (visited.has(id)) {
      return;
    }

    visiting.add(id);

    for (const dependency of tasks.get(id)?.dependencies ?? []) {
      if (tasks.has(dependency)) {
        visit(dependency, [...trail, id]);
      }
    }

    visiting.delete(id);
    visited.add(id);
  }

  for (const id of tasks.keys()) {
    visit(id);
  }

  return { errors, tasks };
}

function validateRoadmapState(repositoryRoot, tasks) {
  const errors = [];
  const readme = readFileSync(resolve(repositoryRoot, "roadmap", "README.md"), "utf8");
  const active = readFileSync(resolve(repositoryRoot, "roadmap", "ACTIVE.md"), "utf8");
  const statuses = new Map();

  for (const match of readme.matchAll(/^\|\s*(E\d{2}-T\d{2})\s*\|\s*([A-Z_]+)\s*\|/gm)) {
    const [, id, status] = match;

    if (!tasks.has(id)) {
      errors.push(`Roadmap referencia tarefa inexistente: ${id}.`);
    }

    if (!allowedStatuses.has(status)) {
      errors.push(`Status inválido no roadmap para ${id}: ${status}.`);
    }

    statuses.set(id, status);
  }

  const inProgress = [...statuses].filter(([, status]) => status === "IN_PROGRESS");

  if (inProgress.length > 1) {
    errors.push("Mais de uma tarefa está IN_PROGRESS.");
  }

  const activeId = active.match(/\*\*Tarefa:\*\*\s*(E\d{2}-T\d{2})/)?.[1];
  const activeStatus = active.match(/\*\*Status:\*\*\s*([A-Z_]+)/)?.[1];

  if (!activeId || !activeStatus) {
    errors.push("roadmap/ACTIVE.md não declara tarefa e status válidos.");
  } else if (statuses.get(activeId) !== activeStatus) {
    errors.push(
      `Ponteiro ativo divergente: ${activeId} está ${statuses.get(activeId) ?? "ausente"} no roadmap e ${activeStatus} em ACTIVE.md.`,
    );
  }

  return errors;
}

function validateBody(body, taskId, { promotion = false } = {}) {
  const errors = [];
  let previousIndex = -1;

  if (!body.trim()) {
    return ["Descrição da PR está vazia."];
  }

  for (const heading of requiredLevelTwoHeadings) {
    const marker = `## ${heading}`;
    const index = body.indexOf(marker);

    if (index === -1) {
      errors.push(`Seção obrigatória ausente: ${marker}.`);
    } else if (index < previousIndex) {
      errors.push(`Seção fora de ordem: ${marker}.`);
    } else {
      previousIndex = index;
    }
  }

  for (const heading of ["### Corrigido", "### Não alterado"]) {
    if (!body.includes(heading)) {
      errors.push(`Subseção obrigatória ausente: ${heading}.`);
    }
  }

  for (const pattern of placeholderPatterns) {
    if (pattern.test(body)) {
      errors.push(`Descrição contém placeholder não substituído: ${pattern.source}.`);
    }
  }

  const declaredTask = body.match(/- Tarefa principal:\s*`(E\d{2}-T\d{2})`/)?.[1];

  if (declaredTask !== taskId) {
    errors.push(
      `Tarefa principal divergente: esperado ${taskId}, recebido ${declaredTask ?? "ausente"}.`,
    );
  }

  if (promotion) {
    if (!/- Commit de origem:\s*`[0-9a-f]{40}`/.test(body)) {
      errors.push("Promoção deve declarar o SHA completo do commit de origem.");
    }

    if (!/- Método de merge:\s*merge commit; nunca squash em promoção/.test(body)) {
      errors.push("Promoção deve declarar merge commit como método de merge.");
    }
  }

  return errors;
}

function validateDependabotPullRequest(pullRequest) {
  const errors = [];

  if (pullRequest.base?.ref !== "developer") {
    errors.push("Dependabot só pode abrir PR para developer.");
  }

  if (!pullRequest.head?.ref?.startsWith("dependabot/")) {
    errors.push("Branch do Dependabot deve iniciar com dependabot/.");
  }

  if (!dependabotTitlePattern.test(pullRequest.title ?? "")) {
    errors.push("Título do Dependabot deve usar build(deps) ou build(deps-dev).");
  }

  return errors;
}

export function validateGovernance({ event, repositoryRoot = process.cwd() }) {
  const { errors: taskErrors, tasks } = collectTasks(repositoryRoot);
  const errors = [...taskErrors, ...validateRoadmapState(repositoryRoot, tasks)];
  const pullRequest = event?.pull_request;

  if (!pullRequest) {
    return [...errors, "Evento não contém pull_request."];
  }

  if (pullRequest.user?.login === "dependabot[bot]") {
    return [...errors, ...validateDependabotPullRequest(pullRequest)].sort();
  }

  const base = pullRequest.base?.ref;
  const head = pullRequest.head?.ref;
  const title = pullRequest.title ?? "";
  const body = pullRequest.body ?? "";
  const promotionPair = `${head}->${base}`;
  const isPromotion = base === "staging" || base === "master";

  if (isPromotion) {
    if (!new Set(["developer->staging", "staging->master"]).has(promotionPair)) {
      errors.push(`Direção de promoção inválida: ${promotionPair}.`);
    }

    const titleMatch = title.match(
      /^\[(E\d{2}-T\d{2})\] chore\(release\): promover (developer|staging) para (staging|master)$/,
    );

    if (!titleMatch) {
      errors.push("Título de promoção inválido.");
    } else {
      const [, taskId, titleHead, titleBase] = titleMatch;

      if (!tasks.has(taskId)) {
        errors.push(`Tarefa inexistente no título: ${taskId}.`);
      }

      if (`${titleHead}->${titleBase}` !== promotionPair) {
        errors.push("Título não corresponde à direção real da promoção.");
      }

      errors.push(...validateBody(body, taskId, { promotion: true }));
    }

    return [...new Set(errors)].sort();
  }

  if (base !== "developer") {
    errors.push(`Destino de PR inválido: ${base ?? "ausente"}.`);
  }

  const branchMatch = head?.match(taskBranchPattern);
  const titleMatch = title.match(taskTitlePattern);

  if (!branchMatch) {
    errors.push("Branch de tarefa deve seguir claude/E00-T01-descricao-curta.");
  }

  if (!titleMatch) {
    errors.push("Título de tarefa não segue [E00-T01] tipo(escopo): resumo.");
  }

  const branchTaskId = branchMatch?.[1];
  const titleTaskId = titleMatch?.[1];

  if (branchTaskId && titleTaskId && branchTaskId !== titleTaskId) {
    errors.push(`ID divergente entre branch (${branchTaskId}) e título (${titleTaskId}).`);
  }

  if (titleTaskId) {
    if (!tasks.has(titleTaskId)) {
      errors.push(`Tarefa inexistente no título: ${titleTaskId}.`);
    }

    errors.push(...validateBody(body, titleTaskId));
  }

  return [...new Set(errors)].sort();
}

function run() {
  const eventPath = process.argv[2] ?? process.env.GITHUB_EVENT_PATH;

  if (!eventPath) {
    throw new Error("Informe o arquivo do evento como argumento ou defina GITHUB_EVENT_PATH.");
  }

  const event = JSON.parse(readFileSync(resolve(eventPath), "utf8"));
  const errors = validateGovernance({ event });

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Governance] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Governance validation passed.");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
