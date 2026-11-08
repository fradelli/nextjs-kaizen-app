import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";

async function readCatalog(name) {
  return JSON.parse(
    await readFile(new URL("../data/catalogs/" + name + ".json", import.meta.url), "utf8"),
  );
}

const [equipment, exercises] = await Promise.all([
  readCatalog("equipamentos"),
  readCatalog("exercicios"),
]);
const digest = createHash("sha256")
  .update(JSON.stringify([1, equipment, exercises]))
  .digest("hex");
const equipmentRows = equipment.itens.map(({ id, nome_pt_br, ...details }) => ({
  id,
  namePt: nome_pt_br,
  details,
}));
const requirements = [];
const exerciseRows = exercises.itens.map((entry) => {
  const research = entry.pesquisa_muscular;
  const reports = Object.entries(research.analises_por_grupo);
  const [group, first] = reports[0];
  if (research.campos_para_conciliar?.length) throw new Error("Ficha divergente: " + entry.id);
  const card = research.ficha_conciliada ?? first;
  const profile = entry.perfil_catalogo;
  if (!entry.nome_en || !profile.modalidade_de_medicao || !profile.modalidade_de_carga)
    throw new Error("Perfil incompleto: " + entry.id);
  profile.requisitos_de_equipamentos.configuracoes.forEach((config, index) => {
    for (const [key, optional] of [
      ["obrigatorios", false],
      ["opcionais", true],
    ]) {
      for (const equipmentId of config[key])
        requirements.push({ exerciseId: entry.id, configuration: index, equipmentId, optional });
    }
  });
  const states = reports.map(([, report]) => report.estado);
  const researchStatus = states.includes("indeterminado")
    ? "indeterminado"
    : states.includes("parcial")
      ? "parcial"
      : "revisado";
  return {
    id: entry.id,
    namePt: entry.nome_pt_br,
    nameEn: entry.nome_en,
    primaryGroups: card.grupos_principais,
    researchStatus,
    calisthenics: card.calistenia,
    anatomy: {
      ficha: card,
      grupo_fonte: research.ficha_conciliada ? null : group,
      analises_por_grupo: research.analises_por_grupo,
    },
    profile,
  };
});
const aliases = Object.entries(exercises.aliases_ids).map(([id, exerciseId]) => ({
  id,
  exerciseId,
}));
const exerciseIds = new Set(exerciseRows.map((r) => r.id));
const equipmentIds = new Set(equipmentRows.map((r) => r.id));
if (
  exerciseIds.size !== exerciseRows.length ||
  equipmentIds.size !== equipmentRows.length ||
  aliases.some((a) => exerciseIds.has(a.id) || !exerciseIds.has(a.exerciseId)) ||
  requirements.some((r) => !equipmentIds.has(r.equipmentId))
)
  throw new Error("Identidades ou vínculos inválidos.");
const summary = {
  digest,
  equipment: equipmentRows.length,
  exercises: exerciseRows.length,
  requirements: requirements.length,
  aliases: aliases.length,
};
const mode = process.argv[2];
if (mode === "--check") console.log(summary);
else if (mode === "--apply") {
  if (!process.env.DIRECT_URL) throw new Error("Informe DIRECT_URL para o banco de destino.");
  const db = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL }),
  });
  try {
    const result = await db.$transaction(
      async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(705831204)`;
        if (await tx.catalogImport.findUnique({ where: { id: digest } })) {
          const latest = await tx.catalogImport.findFirst({ orderBy: { appliedAt: "desc" } });
          if (latest.id !== digest)
            throw new Error("O pacote já foi substituído por uma versão posterior.");
          return "já aplicado";
        }
        for (const row of equipmentRows)
          await tx.catalogEquipment.upsert({ where: { id: row.id }, create: row, update: row });
        for (const row of exerciseRows)
          await tx.catalogExercise.upsert({ where: { id: row.id }, create: row, update: row });
        for (const row of aliases) {
          const saved = await tx.catalogExerciseAlias.upsert({
            where: { id: row.id },
            create: row,
            update: {},
          });
          if (saved.exerciseId !== row.exerciseId)
            throw new Error("Redirecionamento de alias: " + row.id);
        }
        await tx.catalogRequirement.deleteMany({ where: { exerciseId: { in: [...exerciseIds] } } });
        await tx.catalogRequirement.createMany({ data: requirements });
        await tx.catalogImport.create({
          data: {
            id: digest,
            metadata: {
              fontes: exercises.fontes_pesquisa_muscular_por_grupo,
              equipamentos: equipment.fontes_base,
              regras: equipment.regras,
              contrato: exercises.contrato_de_registro_proposto,
            },
          },
        });
        return "aplicado";
      },
      { timeout: 180000 },
    );
    console.log(result, summary);
  } finally {
    await db.$disconnect();
  }
} else throw new Error("Use --check ou --apply.");
