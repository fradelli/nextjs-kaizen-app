import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import { Client } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import {
  assertDisposableTestSchema,
  getTestDatabaseConfiguration,
} from "@/lib/db/test-database-configuration.utils";
import type { ImportDatabaseFixtureContext } from "./import-database.fixture.types";

export async function withImportDatabase(
  run: (client: PrismaClient, context: ImportDatabaseFixtureContext) => Promise<void>,
): Promise<void> {
  const { directUrl: connectionString } = getTestDatabaseConfiguration(process.env);
  const schema = `kaizen_import_test_${randomUUID().replaceAll("-", "")}`;
  assertDisposableTestSchema(schema);
  const admin = new Client({ connectionString });
  await admin.connect();
  let client: PrismaClient | undefined;
  const connections: PrismaClient[] = [];
  const createConnection = () => {
    const connection = new PrismaClient({
      adapter: new PrismaPg({ connectionString, options: `-c search_path=${schema}` }, { schema }),
      log: [],
    });
    connections.push(connection);
    return connection;
  };
  try {
    await admin.query(`CREATE SCHEMA "${schema}"`);
    await admin.query(`SET search_path TO "${schema}"`);
    await admin.query(
      readFileSync("prisma/migrations/20260913011504_initial_p0/migration.sql", "utf8"),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260916150000_training_session_assignment_metadata/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync("prisma/migrations/20260916190000_training_activity_log/migration.sql", "utf8"),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260919010000_generalize_training_day_activity/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260919020000_training_assignment_times/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260919030000_training_activity_execution_lifecycle/migration.sql",
        "utf8",
      ),
    );
    const unifiedActivityMigration = readFileSync(
      "prisma/migrations/20260919040000_unify_training_activity_execution/migration.sql",
      "utf8",
    );
    const enumStatementEnd = unifiedActivityMigration.indexOf(";") + 1;
    await admin.query(unifiedActivityMigration.slice(0, enumStatementEnd));
    await admin.query(unifiedActivityMigration.slice(enumStatementEnd));
    await admin.query(
      readFileSync(
        "prisma/migrations/20260919050000_allow_planned_mobility_definition/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260922160000_training_weekly_schedule/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260923180000_allow_training_schedule_import_batch/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260925010000_training_exercise_blocks/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20260926010000_validate_training_block_shape/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20261004120000_allow_retrospective_external_activity/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20261028010000_allow_short_training_activity_times/migration.sql",
        "utf8",
      ),
    );
    await admin.query(
      readFileSync(
        "prisma/migrations/20261029190000_training_set_confirmation/migration.sql",
        "utf8",
      ),
    );
    client = createConnection();
    await run(client, { schema, createConnection });
  } finally {
    try {
      await Promise.all(connections.map((connection) => connection.$disconnect()));
    } finally {
      try {
        await admin.query("ROLLBACK");
        await admin.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
      } finally {
        await admin.end();
      }
    }
  }
}
