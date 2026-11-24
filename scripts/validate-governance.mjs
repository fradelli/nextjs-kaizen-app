import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Validates pull request governance against the playbook pull request standard:
// https://github.com/fradelli/playbook/blob/main/standards/general/pull-requests.md
// Task IDs are checked against the public Kaizen index in the playbook.

export const playbookIndexUrl =
  "https://raw.githubusercontent.com/fradelli/playbook/main/projects/kaizen/README.md";

const taskId = "KZ-E\\d{2}-T\\d{2}";
const taskBranchPattern = new RegExp(`^claude/(${taskId})-[a-z0-9]+(?:-[a-z0-9]+)*$`);
const taskTitlePattern = new RegExp(
  `^\\[(${taskId})\\] (?:build|chore|ci|docs|feat|fix|perf|refactor|style|test)\\([a-z0-9-]+\\): .+$`,
);
const promotionTitlePattern = new RegExp(
  `^\\[(${taskId})\\] chore\\(release\\): promote (developer|staging) to (staging|master)$`,
);
const dependabotTitlePattern = /^build\(deps(?:-dev)?\): .+$/;
const requiredLevelTwoHeadings = [
  "Summary",
  "Problem",
  "Root cause",
  "Changes",
  "Files added or updated",
  "Impact",
  "Validation",
  "Notes",
];
const requiredLevelThreeHeadings = ["### Fixed", "### Not changed"];
const placeholderPatterns = [
  /REPLACE_BEFORE_PR/,
  /replace with the real/i,
  /replace\/with\/real\/path/i,
  /Describe what this pull request delivers/i,
  /Explain the need or gap/i,
  /Explain why the repository needed/i,
];

/** Reads task IDs and statuses from the tasks table of the playbook Kaizen index. */
export function parsePlaybookIndex(markdown) {
  const tasks = new Map();
  const rowPattern = new RegExp(`^\\|\\s*(${taskId})\\s*\\|\\s*([A-Z_]+)\\s*\\|`, "gm");

  for (const [, id, status] of markdown.matchAll(rowPattern)) {
    tasks.set(id, status);
  }

  return tasks;
}

function validateBody(body, expectedTaskId, { promotion = false } = {}) {
  const errors = [];
  let previousIndex = -1;

  if (!body.trim()) {
    return ["Pull request body is empty."];
  }

  for (const heading of requiredLevelTwoHeadings) {
    const marker = `## ${heading}`;
    const index = body.search(new RegExp(`^${marker}\\s*$`, "m"));

    if (index === -1) {
      errors.push(`Missing required section: ${marker}.`);
    } else if (index < previousIndex) {
      errors.push(`Section out of order: ${marker}.`);
    } else {
      previousIndex = index;
    }
  }

  for (const heading of requiredLevelThreeHeadings) {
    if (!new RegExp(`^${heading}\\s*$`, "m").test(body)) {
      errors.push(`Missing required subsection: ${heading}.`);
    }
  }

  for (const pattern of placeholderPatterns) {
    if (pattern.test(body)) {
      errors.push(`Body contains an unreplaced placeholder: ${pattern.source}.`);
    }
  }

  const declaredTask = body.match(new RegExp(`- Main task:\\s*\`(${taskId})\``))?.[1];

  if (declaredTask !== expectedTaskId) {
    errors.push(`Main task mismatch: expected ${expectedTaskId}, found ${declaredTask ?? "none"}.`);
  }

  if (promotion) {
    if (!/- Source commit:\s*`[0-9a-f]{40}`/.test(body)) {
      errors.push("A promotion must declare the full SHA of the source commit.");
    }

    if (!/- Merge method:\s*merge commit; never squash in a promotion/.test(body)) {
      errors.push("A promotion must declare merge commit as the merge method.");
    }
  }

  return errors;
}

function validateTaskReference(id, tasks) {
  const status = tasks.get(id);

  if (!status) {
    return [`Task ${id} is not in the playbook index (${playbookIndexUrl}).`];
  }

  if (status === "CANCELLED") {
    return [`Task ${id} is CANCELLED in the playbook index.`];
  }

  return [];
}

function validateDependabotPullRequest(pullRequest) {
  const errors = [];

  if (pullRequest.base?.ref !== "developer") {
    errors.push("Dependabot may open pull requests only against developer.");
  }

  if (!pullRequest.head?.ref?.startsWith("dependabot/")) {
    errors.push("A Dependabot branch must start with dependabot/.");
  }

  if (!dependabotTitlePattern.test(pullRequest.title ?? "")) {
    errors.push("A Dependabot title must use build(deps) or build(deps-dev).");
  }

  return errors;
}

/**
 * @param {{ event: any, tasks: Map<string, string> }} input
 *   `tasks` maps each task ID of the playbook index to its status.
 */
export function validateGovernance({ event, tasks }) {
  const errors = [];
  const pullRequest = event?.pull_request;

  if (!pullRequest) {
    return ["Event has no pull_request."];
  }

  if (pullRequest.user?.login === "dependabot[bot]") {
    return validateDependabotPullRequest(pullRequest).sort();
  }

  const base = pullRequest.base?.ref;
  const head = pullRequest.head?.ref;
  const title = pullRequest.title ?? "";
  const body = pullRequest.body ?? "";
  const promotionPair = `${head}->${base}`;

  if (base === "staging" || base === "master") {
    if (!new Set(["developer->staging", "staging->master"]).has(promotionPair)) {
      errors.push(`Invalid promotion direction: ${promotionPair}.`);
    }

    const titleMatch = title.match(promotionTitlePattern);

    if (!titleMatch) {
      errors.push(
        "Invalid promotion title: use [KZ-E00-T00] chore(release): promote <head> to <base>.",
      );
    } else {
      const [, titleTaskId, titleHead, titleBase] = titleMatch;

      errors.push(...validateTaskReference(titleTaskId, tasks));

      if (`${titleHead}->${titleBase}` !== promotionPair) {
        errors.push("The title does not match the real promotion direction.");
      }

      errors.push(...validateBody(body, titleTaskId, { promotion: true }));
    }

    return [...new Set(errors)].sort();
  }

  if (base !== "developer") {
    errors.push(`Invalid pull request base: ${base ?? "none"}.`);
  }

  const branchMatch = head?.match(taskBranchPattern);
  const titleMatch = title.match(taskTitlePattern);

  if (!branchMatch) {
    errors.push("A task branch must follow claude/KZ-E00-T00-short-description.");
  }

  if (!titleMatch) {
    errors.push("A task title must follow [KZ-E00-T00] type(scope): summary.");
  }

  const branchTaskId = branchMatch?.[1];
  const titleTaskId = titleMatch?.[1];

  if (branchTaskId && titleTaskId && branchTaskId !== titleTaskId) {
    errors.push(`Task ID differs between branch (${branchTaskId}) and title (${titleTaskId}).`);
  }

  if (titleTaskId) {
    errors.push(...validateTaskReference(titleTaskId, tasks));
    errors.push(...validateBody(body, titleTaskId));
  }

  return [...new Set(errors)].sort();
}

/** Reads the index from PLAYBOOK_INDEX_PATH when set, otherwise from GitHub. */
export async function loadPlaybookIndex(environment = process.env) {
  if (environment.PLAYBOOK_INDEX_PATH) {
    return parsePlaybookIndex(readFileSync(resolve(environment.PLAYBOOK_INDEX_PATH), "utf8"));
  }

  const response = await fetch(playbookIndexUrl);

  if (!response.ok) {
    throw new Error(
      `Could not read the playbook index: HTTP ${response.status} from ${playbookIndexUrl}.`,
    );
  }

  return parsePlaybookIndex(await response.text());
}

async function run() {
  const eventPath = process.argv[2] ?? process.env.GITHUB_EVENT_PATH;

  if (!eventPath) {
    throw new Error("Pass the event file as an argument or set GITHUB_EVENT_PATH.");
  }

  const event = JSON.parse(readFileSync(resolve(eventPath), "utf8"));
  const tasks = await loadPlaybookIndex();

  if (tasks.size === 0) {
    throw new Error("The playbook index has no KZ- tasks.");
  }

  const errors = validateGovernance({ event, tasks });

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
  await run();
}
