// @vitest-environment node
import assert from "node:assert/strict";
import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
// A mesma regressão participa do gate de scripts e da cobertura do importador.
const { afterEach, beforeEach, describe, test } = process.env.VITEST
  ? await import("vitest")
  : await import("node:test");

import { validateData } from "./validate-data.mjs";

let repositoryRoot;

function writeJson(path, value) {
  mkdirSync(join(repositoryRoot, path, ".."), { recursive: true });
  writeFileSync(join(repositoryRoot, path), JSON.stringify(value));
}

function createSchema(id, required = []) {
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    $id: id,
    type: "object",
    required,
  };
}

function createValidFixture() {
  repositoryRoot = join(tmpdir(), `kaizen-data-${process.pid}-${Date.now()}-${Math.random()}`);
  writeJson("data/catalogs/equipamentos.json", { itens: [{ id: "halter" }] });
  writeJson("data/catalogs/exercicios.json", {
    itens: [
      {
        id: "rosca_com_halter",
        nome_en: "Dumbbell curl",
        perfil_catalogo: {
          requisitos_de_equipamentos: {
            estado: "configuracoes_propostas",
            configuracoes: [{ obrigatorios: ["halter"], opcionais: [] }],
          },
        },
      },
    ],
  });
  mkdirSync(join(repositoryRoot, "docs", "guides"), { recursive: true });
  writeFileSync(join(repositoryRoot, "docs", "guides", "TRAINING-GUIDE.md"), "# Treino\n");
  writeFileSync(join(repositoryRoot, "docs", "guides", "NUTRITION.md"), "# Nutrição\n");

  writeJson(
    "schemas/exercise-library.schema.json",
    createSchema("https://example.local/schemas/exercise-library.schema.json", ["exercises"]),
  );
  writeJson(
    "schemas/training-plan.schema.json",
    createSchema("https://example.local/schemas/training-plan.schema.json", [
      "plan_id",
      "sessions",
    ]),
  );
  writeJson(
    "schemas/nutrition-plan.schema.json",
    createSchema("https://example.local/schemas/nutrition-plan.schema.json", ["plan_id", "meals"]),
  );
  writeJson("data/exercises.json", { exercises: [{ id: "jump" }] });
  writeJson(
    "schemas/training-execution-metadata.schema.json",
    JSON.parse(
      readFileSync(
        new URL("../schemas/training-execution-metadata.schema.json", import.meta.url),
        "utf8",
      ),
    ),
  );
  writeJson("data/training-execution-metadata.json", {
    schema_version: "1.0.0",
    last_updated: "2026-09-12",
    reviewed_plan_paths: ["data/plans/training.json"],
    sessions: [
      {
        plan_id: "training_v1",
        plan_version: "1.0.0",
        session_id: "main",
        assignment_role: "main",
        compatible_preparation_session_ids: [],
      },
    ],
    exercises: [
      {
        exercise_id: "jump",
        measurement_type: "repetitions",
        load_applicable: false,
        load_unit: null,
        normalization_rule: {
          prescriptions: [
            {
              source_text: "3",
              minimum: 3,
              maximum: 3,
              unit: "repetitions",
              scope: "total",
              qualifier: null,
            },
          ],
        },
      },
    ],
  });
  writeJson("data/plans/training.json", {
    plan_id: "training_v1",
    sessions: {
      main: { exercises: [{ exercise_id: "jump", reps: "3" }] },
    },
  });
  writeJson("data/reviews/review.json", { review_id: "review_v1" });
  writeJson("data/active.json", {
    active_plan_id: "training_v1",
    active_plan_path: "data/plans/training.json",
    review_path: "data/reviews/review.json",
    human_guide_path: "docs/guides/TRAINING-GUIDE.md",
  });
  writeJson("data/nutrition/plans/nutrition.json", {
    plan_id: "nutrition_v1",
    provenance: { active_training_plan_id: "training_v1" },
    energy_bands: { standard: {} },
    day_types: [
      {
        id: "training_day",
        energy_band_id: "standard",
        meal_ids: ["breakfast"],
      },
    ],
    timing_rules: [
      {
        id: "breakfast_time",
        meal_id: "breakfast",
        option_ids: ["standard_breakfast"],
      },
    ],
    meals: [
      {
        id: "breakfast",
        options: [{ id: "standard_breakfast" }],
      },
    ],
    carbohydrate_modules: [],
  });
  writeJson("data/nutrition/active.json", {
    active_plan_id: "nutrition_v1",
    active_plan_path: "data/nutrition/plans/nutrition.json",
    plan_schema_path: "schemas/nutrition-plan.schema.json",
    human_guide_path: "docs/guides/NUTRITION.md",
  });
}

beforeEach(createValidFixture);

afterEach(() => {
  rmSync(repositoryRoot, { force: true, recursive: true });
});

describe("validateData", () => {
  test("rejeita sessão semanal ausente do plano importado", () => {
    writeJson(
      "schemas/schedule.schema.json",
      JSON.parse(readFileSync(new URL("../schemas/schedule.schema.json", import.meta.url), "utf8")),
    );
    const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];
    const model = days.map((day) => ({ day, time: null, session: "rest" }));
    model[0] = { day: "monday", time: "09:00", session: "missing_session" };
    writeJson("data/schedule.json", {
      schema_version: "1.0.0",
      last_updated: "2026-09-22",
      timezone: "America/Sao_Paulo",
      footvolley_sessions: [{ day: "monday", start_time: "16:00", intensity: null }],
      weekend_game: { enabled: true, day: "saturday", start_time: null },
      planning_defaults: { footvolley_duration_minutes: 90 },
      placement_rules: {},
      models: {
        saturday_game: model,
        sunday_game: days.map((day) => ({ day, time: null, session: "rest" })),
      },
    });
    assert.ok(
      validateData({ repositoryRoot }).some((error) => error.includes("sessão inexistente")),
    );
  });
  test("metadado estruturalmente inválido retorna erros sem interromper a validação", () => {
    writeJson("data/training-execution-metadata.json", {
      schema_version: "1.0.0",
      last_updated: "invalid",
      reviewed_plan_paths: [],
      exercises: [null],
    });
    assert.ok(
      validateData({ repositoryRoot }).some((error) => error.includes("classificação ausente")),
    );
  });

  test("rejeita gramática desconhecida, faixa invertida e zero na dose prescrita", () => {
    for (const source_text of ["3_new", "8-3", "0"]) {
      writeJson("data/plans/training.json", {
        plan_id: "training_v1",
        sessions: { main: { exercises: [{ exercise_id: "jump", reps: source_text }] } },
      });
      writeJson("data/training-execution-metadata.json", {
        schema_version: "1.0.0",
        last_updated: "2026-09-12",
        reviewed_plan_paths: ["data/plans/training.json"],
        sessions: [
          {
            plan_id: "training_v1",
            plan_version: "1.0.0",
            session_id: "main",
            assignment_role: "main",
            compatible_preparation_session_ids: [],
          },
        ],
        exercises: [
          {
            exercise_id: "jump",
            measurement_type: "repetitions",
            load_applicable: false,
            load_unit: null,
            normalization_rule: {
              prescriptions: [
                {
                  source_text,
                  minimum: 3,
                  maximum: 3,
                  unit: "repetitions",
                  scope: "total",
                  qualifier: null,
                },
              ],
            },
          },
        ],
      });
      assert.ok(
        validateData({ repositoryRoot }).some((error) =>
          error.includes("normalização incompatível"),
        ),
        source_text,
      );
    }
  });
  test("rejeita metadados ausentes", () => {
    rmSync(join(repositoryRoot, "data/training-execution-metadata.json"));
    assert.ok(
      validateData({ repositoryRoot }).some((error) =>
        error.includes("metadados obrigatórios ausentes"),
      ),
    );
  });

  test("rejeita cobertura, IDs e textos duplicados", () => {
    const path = "data/training-execution-metadata.json";
    const metadata = JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
    metadata.exercises.push(structuredClone(metadata.exercises[0]));
    metadata.exercises[0].normalization_rule.prescriptions.push(
      structuredClone(metadata.exercises[0].normalization_rule.prescriptions[0]),
    );
    metadata.reviewed_plan_paths = ["data/plans/missing.json"];
    writeJson(path, metadata);
    const errors = validateData({ repositoryRoot });
    assert.ok(errors.some((error) => error.includes("ID de metadado duplicado")));
    assert.ok(errors.some((error) => error.includes("Texto prescrito duplicado")));
    assert.ok(errors.some((error) => error.includes("reviewed_plan_paths")));
  });

  test("rejeita classificação ausente e exercício extra", () => {
    const path = "data/training-execution-metadata.json";
    const metadata = JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
    metadata.exercises[0].exercise_id = "unknown";
    writeJson(path, metadata);
    const errors = validateData({ repositoryRoot });
    assert.ok(errors.some((error) => error.includes("classificação ausente")));
    assert.ok(errors.some((error) => error.includes("exercício inexistente")));
    assert.ok(errors.some((error) => error.includes("não usado pelos planos")));
  });

  test("rejeita carga, medição, normalização e propriedade desconhecida", () => {
    const path = "data/training-execution-metadata.json";
    const metadata = JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
    const item = metadata.exercises[0];
    item.load_unit = "kg";
    item.measurement_type = "invalid";
    item.unknown = true;
    item.normalization_rule.prescriptions[0].maximum = 2;
    writeJson(path, metadata);
    const errors = validateData({ repositoryRoot });
    for (const message of [
      "carga e unidade",
      "medição incompatível",
      "normalização incompatível",
      "additional properties",
    ])
      assert.ok(
        errors.some((error) => error.includes(message)),
        message,
      );
  });

  test("rejeita unidade ausente quando carga é aplicável", () => {
    const path = "data/training-execution-metadata.json";
    const metadata = JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
    metadata.exercises[0].load_applicable = true;
    writeJson(path, metadata);
    assert.ok(validateData({ repositoryRoot }).some((error) => error.includes("carga e unidade")));
  });

  test("normaliza minutos, lados, direções, contatos e qualificadores sem inferir carga", () => {
    const cases = [
      ["2-3_minutes", 120, 180, "seconds", "total", null, "seconds"],
      ["15-20_seconds_each_side", 15, 20, "seconds", "each_side", null, "per_side"],
      ["5_each_leg", 5, 5, "repetitions", "each_side", null, "per_side"],
      ["8_each_direction", 8, 8, "repetitions", "two_directions", null, "repetitions"],
      ["15-20_seconds_each_direction", 15, 20, "seconds", "four_directions", null, "seconds"],
      ["8_contacts", 8, 8, "contacts", "total", null, "contacts"],
      ["3_at_60_75_90_percent", 3, 3, "repetitions", "total", "at_60_75_90_percent", "repetitions"],
      ["3_easy_or_assisted", 3, 3, "repetitions", "total", "easy_or_assisted", "repetitions"],
    ];
    for (const [source_text, minimum, maximum, unit, scope, qualifier, measurement_type] of cases) {
      writeJson("data/plans/training.json", {
        plan_id: "training_v1",
        sessions: { main: { exercises: [{ exercise_id: "jump", reps: source_text }] } },
      });
      writeJson("data/training-execution-metadata.json", {
        schema_version: "1.0.0",
        last_updated: "2026-09-12",
        reviewed_plan_paths: ["data/plans/training.json"],
        sessions: [
          {
            plan_id: "training_v1",
            plan_version: "1.0.0",
            session_id: "main",
            assignment_role: "main",
            compatible_preparation_session_ids: [],
          },
        ],
        exercises: [
          {
            exercise_id: "jump",
            measurement_type,
            load_applicable: false,
            load_unit: null,
            normalization_rule: {
              prescriptions: [{ source_text, minimum, maximum, unit, scope, qualifier }],
            },
          },
        ],
      });
      assert.deepEqual(validateData({ repositoryRoot }), [], source_text);
    }
  });

  test("nova dose e gramática desconhecida exigem revisão explícita", () => {
    writeJson("data/plans/training.json", {
      plan_id: "training_v1",
      sessions: { main: { exercises: [{ exercise_id: "jump", reps: "3_new" }] } },
    });
    assert.ok(
      validateData({ repositoryRoot }).some((error) => error.includes("normalização ausente")),
    );
  });
  test("aceita schemas, ponteiros e referências válidos", () => {
    assert.deepEqual(validateData({ repositoryRoot }), []);
  });

  test("permite ID estável com versão nova e rejeita o mesmo par ID/versão", () => {
    const path = "data/plans/training.json";
    const original = JSON.parse(readFileSync(join(repositoryRoot, path), "utf8"));
    writeJson(path, { ...original, version: "1.0.0" });
    writeJson("data/plans/training-v2.json", { ...original, version: "2.0.0" });
    const metadataPath = "data/training-execution-metadata.json";
    const metadata = JSON.parse(readFileSync(join(repositoryRoot, metadataPath), "utf8"));
    writeJson(metadataPath, {
      ...metadata,
      reviewed_plan_paths: [path, "data/plans/training-v2.json"],
    });
    assert.deepEqual(validateData({ repositoryRoot }), []);
    writeJson("data/plans/training-v2.json", { ...original, version: "1.0.0" });
    assert.ok(
      validateData({ repositoryRoot }).some((error) => error.includes("ID de plano duplicado")),
    );
  });

  test("rejeita JSON inválido", () => {
    writeFileSync(join(repositoryRoot, "data", "broken.json"), "{");
    const errors = validateData({ repositoryRoot });

    assert.ok(errors.some((error) => error.includes("broken.json: JSON inválido")));
  });

  test("rejeita documento incompatível com o schema", () => {
    writeJson("data/exercises.json", {});
    const errors = validateData({ repositoryRoot });

    assert.ok(
      errors.some((error) => error.includes("data/exercises.json/") && error.includes("exercises")),
    );
  });

  test("rejeita schema que não pode ser compilado", () => {
    writeJson("schemas/exercise-library.schema.json", {
      ...createSchema("https://example.local/schemas/exercise-library.schema.json", ["exercises"]),
      unsupported_keyword: true,
    });
    const errors = validateData({ repositoryRoot });

    assert.ok(errors.some((error) => error.includes("schema inválido")));
  });

  test("rejeita IDs duplicados e exercício inexistente", () => {
    writeJson("data/exercises.json", {
      exercises: [{ id: "jump" }, { id: "jump" }],
    });
    writeJson("data/plans/training.json", {
      plan_id: "training_v1",
      sessions: {
        main: { exercises: [{ exercise_id: "missing" }] },
      },
    });
    const errors = validateData({ repositoryRoot });

    assert.ok(errors.some((error) => error.includes("ID de exercício duplicado")));
    assert.ok(errors.some((error) => error.includes("exercício inexistente")));
  });

  test("rejeita ponteiro que escapa ou não existe", () => {
    writeJson("data/active.json", {
      active_plan_id: "training_v1",
      active_plan_path: "../private.json",
      review_path: "data/reviews/missing.json",
      human_guide_path: "docs/guides/TRAINING-GUIDE.md",
    });
    const errors = validateData({ repositoryRoot });

    assert.ok(errors.some((error) => error.includes("dentro do repositório")));
    assert.ok(errors.some((error) => error.includes("destino inexistente")));
  });

  test("rejeita referências nutricionais quebradas", () => {
    const planPath = join(repositoryRoot, "data", "nutrition", "plans", "nutrition.json");
    const plan = JSON.parse(readFileSync(planPath, "utf8"));
    plan.day_types[0].energy_band_id = "missing";
    plan.timing_rules[0].option_ids = ["missing"];
    plan.meals[0].options.push({
      id: "reference",
      reference_option: "missing.option",
    });
    writeFileSync(planPath, JSON.stringify(plan));
    const errors = validateData({ repositoryRoot });

    assert.ok(errors.some((error) => error.includes("faixa de energia inexistente")));
    assert.ok(errors.some((error) => error.includes("opção inexistente")));
    assert.ok(errors.some((error) => error.includes("referência de opção inexistente")));
  });
});
