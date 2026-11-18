import { existsSync, readFileSync, readdirSync } from "node:fs";
import { isAbsolute, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";

const schemaAssignments = [
  {
    matches: (path) => path === "data/schedule.json",
    schema: "https://example.local/schemas/schedule.schema.json",
  },
  {
    matches: (path) => path === "data/training-execution-metadata.json",
    schema: "https://example.local/schemas/training-execution-metadata.schema.json",
  },
  {
    matches: (path) => path === "data/exercises.json",
    schema: "https://example.local/schemas/exercise-library.schema.json",
  },
  {
    matches: (path) => /^data\/plans\/[^/]+\.json$/.test(path),
    schema: "https://example.local/schemas/training-plan.schema.json",
  },
  {
    matches: (path) => /^data\/nutrition\/plans\/[^/]+\.json$/.test(path),
    schema: "https://example.local/schemas/nutrition-plan.schema.json",
  },
];

function toRepositoryPath(repositoryRoot, path) {
  return relative(repositoryRoot, path).split(sep).join("/");
}

function walkJsonFiles(directory) {
  if (!existsSync(directory)) {
    return [];
  }

  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      return walkJsonFiles(path);
    }

    return entry.isFile() && entry.name.endsWith(".json") ? [path] : [];
  });
}

function parseJsonFiles(repositoryRoot, files) {
  const documents = new Map();
  const errors = [];

  for (const file of files.sort()) {
    const path = toRepositoryPath(repositoryRoot, file);

    try {
      documents.set(path, JSON.parse(readFileSync(file, "utf8")));
    } catch (error) {
      errors.push(`${path}: JSON inválido (${error.message}).`);
    }
  }

  return { documents, errors };
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates].sort();
}

function validateUniqueIds(errors, path, label, values) {
  for (const duplicate of findDuplicates(values)) {
    errors.push(`${path}: ${label} duplicado: ${duplicate}.`);
  }
}

function resolveRepositoryLink(repositoryRoot, sourcePath, value, errors, availablePaths) {
  if (typeof value !== "string" || value.length === 0) {
    errors.push(`${sourcePath}: caminho ausente ou inválido.`);
    return undefined;
  }

  if (isAbsolute(value) || value.split(/[\\/]/).includes("..")) {
    errors.push(`${sourcePath}: caminho deve permanecer dentro do repositório.`);
    return undefined;
  }

  const target = resolve(repositoryRoot, value);
  const rootPrefix = `${resolve(repositoryRoot)}${sep}`;

  if (target !== resolve(repositoryRoot) && !target.startsWith(rootPrefix)) {
    errors.push(`${sourcePath}: caminho escapa do repositório.`);
    return undefined;
  }

  if (availablePaths ? !availablePaths.has(value.split("\\").join("/")) : !existsSync(target)) {
    errors.push(`${sourcePath}: destino inexistente: ${value}.`);
    return undefined;
  }

  return value.split("\\").join("/");
}

function validateSchemas(documents) {
  const errors = [];
  const ajv = new Ajv2020({
    allErrors: true,
    strict: true,
    strictRequired: false,
  });
  addFormats(ajv);

  for (const [path, document] of documents) {
    if (!path.startsWith("schemas/") || !path.endsWith(".schema.json")) {
      continue;
    }

    try {
      ajv.addSchema(document);
      ajv.getSchema(document.$id);
    } catch (error) {
      errors.push(`${path}: schema inválido (${error.message}).`);
    }
  }

  for (const [path, document] of documents) {
    const assignment = schemaAssignments.find(({ matches }) => matches(path));

    if (!assignment) {
      continue;
    }

    let validate;

    try {
      validate = ajv.getSchema(assignment.schema);
    } catch (error) {
      errors.push(`${path}: schema não pôde ser compilado (${error.message}).`);
      continue;
    }

    if (!validate) {
      errors.push(`${path}: schema não carregado: ${assignment.schema}.`);
      continue;
    }

    if (!validate(document)) {
      for (const issue of validate.errors ?? []) {
        errors.push(`${path}${issue.instancePath || "/"}: ${issue.message ?? "schema inválido"}.`);
      }
    }
  }

  return errors;
}

function normalizePrescription(text) {
  if (typeof text !== "string") return undefined;
  const match =
    /^(\d+)(?:-(\d+))?(?:_(minutes|seconds|contacts|seconds_each_side|seconds_each_direction|each_side|each_leg|each_direction|easy|easy_or_assisted|at_60_75_90_percent))?$/.exec(
      text,
    );
  if (!match) return undefined;
  const suffix = match[3];
  const multiplier = suffix === "minutes" ? 60 : 1;
  const minimum = Number(match[1]) * multiplier;
  const maximum = Number(match[2] ?? match[1]) * multiplier;
  if (
    !Number.isSafeInteger(minimum) ||
    !Number.isSafeInteger(maximum) ||
    minimum < 1 ||
    maximum < minimum
  )
    return undefined;
  return {
    minimum,
    maximum,
    unit:
      suffix === "minutes" || suffix === "seconds" || suffix?.startsWith("seconds_")
        ? "seconds"
        : suffix === "contacts"
          ? "contacts"
          : "repetitions",
    scope: ["each_side", "each_leg", "seconds_each_side"].includes(suffix)
      ? "each_side"
      : suffix === "seconds_each_direction"
        ? "four_directions"
        : suffix === "each_direction"
          ? "two_directions"
          : "total",
    qualifier: ["easy", "easy_or_assisted", "at_60_75_90_percent"].includes(suffix) ? suffix : null,
  };
}

function validateExecutionMetadata(documents, planEntries, exerciseIds) {
  const errors = [];
  const path = "data/training-execution-metadata.json";
  const document = documents.get(path);
  if (!document) return [`${path}: metadados obrigatórios ausentes.`];
  const items = Array.isArray(document.exercises)
    ? document.exercises.filter((item) => item && typeof item === "object" && !Array.isArray(item))
    : [];
  validateUniqueIds(
    errors,
    path,
    "ID de metadado",
    items.map((item) => item.exercise_id),
  );
  const expected = new Map();
  for (const [, plan] of planEntries) {
    for (const session of Object.values(plan.sessions ?? {})) {
      for (const exercise of session.exercises ?? []) {
        if (!expected.has(exercise.exercise_id)) expected.set(exercise.exercise_id, new Set());
        expected.get(exercise.exercise_id).add(exercise.reps);
      }
    }
  }
  const reviewedPaths = Array.isArray(document.reviewed_plan_paths)
    ? document.reviewed_plan_paths
    : [];
  const actualPaths = planEntries.map(([planPath]) => planPath);
  if (JSON.stringify([...reviewedPaths].sort()) !== JSON.stringify(actualPaths.sort())) {
    errors.push(`${path}: reviewed_plan_paths deve cobrir exatamente os planos versionados.`);
  }
  for (const exerciseId of expected.keys()) {
    if (!items.some((item) => item.exercise_id === exerciseId))
      errors.push(`${path}: classificação ausente: ${exerciseId}.`);
  }
  for (const item of items) {
    const itemPath = `${path}/exercises/${item.exercise_id}`;
    if (!exerciseIds.has(item.exercise_id)) errors.push(`${itemPath}: exercício inexistente.`);
    if (!expected.has(item.exercise_id))
      errors.push(`${itemPath}: exercício não usado pelos planos.`);
    if (
      typeof item.load_applicable !== "boolean" ||
      item.load_unit !== (item.load_applicable ? "kg" : null)
    )
      errors.push(`${itemPath}: carga e unidade incompatíveis.`);
    const prescriptions = Array.isArray(item.normalization_rule?.prescriptions)
      ? item.normalization_rule.prescriptions.filter(
          (rule) => rule && typeof rule === "object" && !Array.isArray(rule),
        )
      : [];
    validateUniqueIds(
      errors,
      itemPath,
      "Texto prescrito",
      prescriptions.map((rule) => rule.source_text),
    );
    for (const text of expected.get(item.exercise_id) ?? []) {
      if (!prescriptions.some((rule) => rule.source_text === text))
        errors.push(`${itemPath}: normalização ausente: ${text}.`);
    }
    for (const rule of prescriptions) {
      const normalized = normalizePrescription(rule.source_text);
      if (!expected.get(item.exercise_id)?.has(rule.source_text))
        errors.push(`${itemPath}: prescrição não usada: ${rule.source_text}.`);
      if (!normalized || Object.entries(normalized).some(([key, value]) => rule[key] !== value))
        errors.push(`${itemPath}: normalização incompatível: ${rule.source_text}.`);
      const type = normalized?.scope === "each_side" ? "per_side" : normalized?.unit;
      if (item.measurement_type !== type)
        errors.push(`${itemPath}: medição incompatível: ${rule.source_text}.`);
    }
  }
  return errors;
}

function validateTrainingData(documents) {
  const errors = [];
  const exerciseLibrary = documents.get("data/exercises.json");
  const exerciseIdValues = Array.isArray(exerciseLibrary?.exercises)
    ? exerciseLibrary.exercises.map((exercise) => exercise.id)
    : [];
  const exerciseIds = new Set(exerciseIdValues);
  const planEntries = [...documents].filter(([path]) => /^data\/plans\/[^/]+\.json$/.test(path));

  validateUniqueIds(errors, "data/exercises.json", "ID de exercício", exerciseIdValues);
  validateUniqueIds(
    errors,
    "data/plans",
    "ID de plano",
    planEntries.map(([, plan]) => `${plan.plan_id}@${plan.version ?? "unknown"}`),
  );

  for (const [path, plan] of planEntries) {
    for (const [sessionId, session] of Object.entries(plan.sessions ?? {})) {
      if (session.blocks) {
        const exerciseIdsInOrder = session.blocks.flatMap((block) => block.exercise_ids);
        const prescriptionIds = session.exercises.map((exercise) => exercise.exercise_id);
        if (JSON.stringify(exerciseIdsInOrder) !== JSON.stringify(prescriptionIds)) {
          errors.push(
            `${path}/sessions/${sessionId}/blocks: blocos devem cobrir os exercícios na ordem da sessão.`,
          );
        }
        if (
          new Set(session.blocks.map((block) => block.id)).size !== session.blocks.length ||
          session.blocks.some((block) =>
            block.mode === "alternating"
              ? block.exercise_ids.length !== 2
              : block.exercise_ids.length !== 1,
          )
        ) {
          errors.push(
            `${path}/sessions/${sessionId}/blocks: IDs ou composição de blocos inválidos.`,
          );
        }
      }
      for (const [index, exercise] of (session.exercises ?? []).entries()) {
        if (!exerciseIds.has(exercise.exercise_id)) {
          errors.push(
            `${path}/sessions/${sessionId}/exercises/${index}: exercício inexistente: ${exercise.exercise_id}.`,
          );
        }
      }
    }
  }

  const schedule = documents.get("data/schedule.json");
  const activeTrainingPlanPath = documents.get("data/active.json")?.active_plan_path;
  const activeTrainingPlan = planEntries.find(([path]) => path === activeTrainingPlanPath);
  const genericSessions = new Set([
    "footvolley",
    "footvolley_only",
    "game",
    "rest",
    "rest_or_light_mobility",
  ]);
  if (schedule?.entries && activeTrainingPlan) {
    const [path, plan] = activeTrainingPlan;
    const seenEntries = new Set();
    for (const [index, entry] of schedule.entries.entries()) {
      const entryPath = `data/schedule.json/entries/${index}`;
      const identity = JSON.stringify(entry);
      if (seenEntries.has(identity)) errors.push(`${entryPath}: atividade semanal duplicada.`);
      seenEntries.add(identity);
      if (entry.type === "rest") {
        if (schedule.entries.filter((candidate) => candidate.day === entry.day).length !== 1) {
          errors.push(`${entryPath}: descanso não pode coexistir com outra atividade.`);
        }
      } else if (!entry.start_time || !entry.end_time || entry.end_time <= entry.start_time) {
        errors.push(`${entryPath}: horários planejados ausentes ou fora de ordem.`);
      }
      for (const sessionId of [entry.session_id, entry.preparation_session_id].filter(Boolean)) {
        if (!Object.hasOwn(plan.sessions ?? {}, sessionId)) {
          errors.push(
            `data/schedule.json/entries/${index}: sessão inexistente em ${path}: ${sessionId}.`,
          );
        }
      }
      const assignments = documents.get("data/training-execution-metadata.json")?.sessions ?? [];
      const roleFor = (sessionId) =>
        assignments.find(
          (item) =>
            item.plan_id === plan.plan_id &&
            item.plan_version === plan.version &&
            item.session_id === sessionId,
        )?.assignment_role;
      if (entry.type === "structured_training" && roleFor(entry.session_id) !== "main") {
        errors.push(`${entryPath}: treino estruturado deve referenciar sessão principal.`);
      }
      if (entry.preparation_session_id && roleFor(entry.preparation_session_id) !== "preparation") {
        errors.push(`${entryPath}: aquecimento deve referenciar uma preparação.`);
      }
    }
  }
  if (schedule?.models && activeTrainingPlan) {
    const [path, plan] = activeTrainingPlan;
    for (const [modelName, model] of Object.entries(schedule.models)) {
      for (const [index, entry] of (model ?? []).entries()) {
        if (
          !genericSessions.has(entry.session) &&
          !Object.hasOwn(plan.sessions ?? {}, entry.session)
        ) {
          errors.push(
            `data/schedule.json/models/${modelName}/${index}: sessão inexistente em ${path}: ${entry.session}.`,
          );
        }
      }
    }
  }

  return {
    errors: [...errors, ...validateExecutionMetadata(documents, planEntries, exerciseIds)],
    planIds: new Set(planEntries.map(([, plan]) => plan.plan_id)),
  };
}

function validateNutritionPlan(path, plan, trainingPlanIds) {
  const errors = [];
  const mealIds = (plan.meals ?? []).map((meal) => meal.id);
  const meals = new Map((plan.meals ?? []).map((meal) => [meal.id, meal]));
  const optionReferences = new Set();

  validateUniqueIds(errors, path, "ID de refeição", mealIds);
  validateUniqueIds(
    errors,
    path,
    "ID de tipo de dia",
    (plan.day_types ?? []).map((dayType) => dayType.id),
  );
  validateUniqueIds(
    errors,
    path,
    "ID de regra de horário",
    (plan.timing_rules ?? []).map((rule) => rule.id),
  );
  validateUniqueIds(
    errors,
    path,
    "ID de módulo de carboidrato",
    (plan.carbohydrate_modules ?? []).map((module) => module.id),
  );

  for (const meal of plan.meals ?? []) {
    validateUniqueIds(
      errors,
      `${path}/meals/${meal.id}`,
      "ID de opção",
      (meal.options ?? []).map((option) => option.id),
    );

    for (const option of meal.options ?? []) {
      optionReferences.add(`${meal.id}.${option.id}`);
    }
  }

  for (const [index, dayType] of (plan.day_types ?? []).entries()) {
    if (!(dayType.energy_band_id in (plan.energy_bands ?? {}))) {
      errors.push(
        `${path}/day_types/${index}: faixa de energia inexistente: ${dayType.energy_band_id}.`,
      );
    }

    for (const mealId of dayType.meal_ids ?? []) {
      if (!meals.has(mealId)) {
        errors.push(`${path}/day_types/${index}: refeição inexistente: ${mealId}.`);
      }
    }
  }

  for (const [index, rule] of (plan.timing_rules ?? []).entries()) {
    const meal = meals.get(rule.meal_id);

    if (!meal) {
      errors.push(`${path}/timing_rules/${index}: refeição inexistente: ${rule.meal_id}.`);
      continue;
    }

    const availableOptions = new Set((meal.options ?? []).map((option) => option.id));

    for (const optionId of rule.option_ids ?? []) {
      if (!availableOptions.has(optionId)) {
        errors.push(
          `${path}/timing_rules/${index}: opção inexistente em ${rule.meal_id}: ${optionId}.`,
        );
      }
    }
  }

  for (const [mealIndex, meal] of (plan.meals ?? []).entries()) {
    for (const [optionIndex, option] of (meal.options ?? []).entries()) {
      if (option.reference_option && !optionReferences.has(option.reference_option)) {
        errors.push(
          `${path}/meals/${mealIndex}/options/${optionIndex}: referência de opção inexistente: ${option.reference_option}.`,
        );
      }
    }
  }

  if (!trainingPlanIds.has(plan.provenance?.active_training_plan_id)) {
    errors.push(
      `${path}/provenance/active_training_plan_id: plano de treino inexistente: ${plan.provenance?.active_training_plan_id}.`,
    );
  }

  return errors;
}

function validatePointers(repositoryRoot, documents, trainingPlanIds, availablePaths) {
  const errors = [];
  const trainingActive = documents.get("data/active.json");
  const nutritionActive = documents.get("data/nutrition/active.json");

  if (trainingActive) {
    const activePlanPath = resolveRepositoryLink(
      repositoryRoot,
      "data/active.json/active_plan_path",
      trainingActive.active_plan_path,
      errors,
      availablePaths,
    );
    resolveRepositoryLink(
      repositoryRoot,
      "data/active.json/review_path",
      trainingActive.review_path,
      errors,
      availablePaths,
    );
    resolveRepositoryLink(
      repositoryRoot,
      "data/active.json/human_guide_path",
      trainingActive.human_guide_path,
      errors,
      availablePaths,
    );

    const activePlan = activePlanPath ? documents.get(activePlanPath) : undefined;

    if (activePlan && activePlan.plan_id !== trainingActive.active_plan_id) {
      errors.push("data/active.json: active_plan_id diverge do arquivo apontado.");
    }
  }

  if (nutritionActive) {
    const activePlanPath = resolveRepositoryLink(
      repositoryRoot,
      "data/nutrition/active.json/active_plan_path",
      nutritionActive.active_plan_path,
      errors,
      availablePaths,
    );
    resolveRepositoryLink(
      repositoryRoot,
      "data/nutrition/active.json/plan_schema_path",
      nutritionActive.plan_schema_path,
      errors,
      availablePaths,
    );
    resolveRepositoryLink(
      repositoryRoot,
      "data/nutrition/active.json/human_guide_path",
      nutritionActive.human_guide_path,
      errors,
      availablePaths,
    );

    const activePlan = activePlanPath ? documents.get(activePlanPath) : undefined;

    if (activePlan && activePlan.plan_id !== nutritionActive.active_plan_id) {
      errors.push("data/nutrition/active.json: active_plan_id diverge do arquivo apontado.");
    }
  }

  const nutritionPlans = [...documents].filter(([path]) =>
    /^data\/nutrition\/plans\/[^/]+\.json$/.test(path),
  );

  validateUniqueIds(
    errors,
    "data/nutrition/plans",
    "ID de plano",
    nutritionPlans.map(([, plan]) => `${plan.plan_id}@${plan.version ?? "unknown"}`),
  );

  for (const [path, plan] of nutritionPlans) {
    errors.push(...validateNutritionPlan(path, plan, trainingPlanIds));
  }

  return errors;
}

export function validateDocuments({
  documents,
  repositoryRoot = process.cwd(),
  availablePaths,
  stopOnSchemaError = false,
}) {
  const schemaErrors = validateSchemas(documents);
  if (stopOnSchemaError && schemaErrors.length) return schemaErrors.sort();
  const { errors: trainingErrors, planIds } = validateTrainingData(documents);
  const pointerErrors = validatePointers(repositoryRoot, documents, planIds, availablePaths);
  return [...schemaErrors, ...trainingErrors, ...pointerErrors].sort();
}

export function validateData({ repositoryRoot = process.cwd() } = {}) {
  const root = resolve(repositoryRoot);
  const files = [
    ...walkJsonFiles(resolve(root, "data")),
    ...walkJsonFiles(resolve(root, "schemas")),
  ];
  const { documents, errors } = parseJsonFiles(root, files);
  const catalogErrors = validateCatalogRequirements(documents);
  return [
    ...errors,
    ...catalogErrors,
    ...validateDocuments({ documents, repositoryRoot: root }),
  ].sort();
}

function validateCatalogRequirements(documents) {
  const exercises = documents.get("data/catalogs/exercicios.json")?.itens;
  const equipment = documents.get("data/catalogs/equipamentos.json")?.itens;
  if (!Array.isArray(exercises) || !Array.isArray(equipment)) {
    return ["Catálogo de exercícios ou equipamentos ausente ou inválido."];
  }
  const ids = new Set(equipment.map((item) => item.id));
  const errors = [];
  for (const exercise of exercises) {
    const requirements = exercise.perfil_catalogo?.requisitos_de_equipamentos;
    if (typeof exercise.nome_en !== "string" || !exercise.nome_en.trim()) {
      errors.push(`Catálogo: ${exercise.id} sem nome em inglês.`);
    }
    const configs = requirements?.configuracoes;
    if (!Array.isArray(configs) || !configs.length) {
      errors.push(`Catálogo: ${exercise.id} sem configuração de equipamentos.`);
      continue;
    }
    for (const config of configs) {
      if (!Array.isArray(config?.obrigatorios) || !Array.isArray(config?.opcionais)) {
        errors.push(`Catálogo: configuração inválida em ${exercise.id}.`);
        continue;
      }
      const references = [...config.obrigatorios, ...config.opcionais];
      if (references.some((id) => !ids.has(id)) || new Set(references).size !== references.length) {
        errors.push(`Catálogo: equipamento desconhecido ou repetido em ${exercise.id}.`);
      }
      if (
        Object.keys(config.caracteristicas_exigidas ?? {}).some(
          (id) => !config.obrigatorios.includes(id),
        )
      ) {
        errors.push(`Catálogo: característica sem equipamento obrigatório em ${exercise.id}.`);
      }
      if (
        !config.obrigatorios.length &&
        requirements.estado !== "sem_equipamento_obrigatorio_proposto"
      ) {
        errors.push(
          `Catálogo: explicitar a ausência de equipamento obrigatório em ${exercise.id}.`,
        );
      }
    }
  }
  return errors;
}

function run() {
  const errors = validateData();

  if (errors.length > 0) {
    for (const error of errors) {
      console.error(`[Data integrity] ${error}`);
    }

    process.exitCode = 1;
    return;
  }

  console.log("Data integrity validation passed.");
}

if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) {
  run();
}
