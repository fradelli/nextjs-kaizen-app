import { readFileSync } from "node:fs";
import type { PrismaClient } from "@/generated/prisma/client";
import { withImportDatabase } from "./import-database.fixture";

export function withAgendaDatabase(run: (db: PrismaClient) => Promise<void>) {
  return withImportDatabase(async (db) => {
    for (const migration of [
      "20261117020000_agenda_foundation",
      "20261117030000_agenda_transactions",
      "20261117040000_agenda_default_tags",
      "20261117050000_agenda_activity_color",
      "20261118010000_agenda_inbox",
    ]) {
      const sql = readFileSync("prisma/migrations/" + migration + "/migration.sql", "utf8");
      for (const statement of sql.split(";").filter((part) => part.trim())) {
        await db.$executeRawUnsafe(statement);
      }
    }
    await run(db);
  });
}
