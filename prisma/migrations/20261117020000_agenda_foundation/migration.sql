-- CreateTable
CREATE TABLE "agenda_tag" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color_key" TEXT NOT NULL,
    "system_key" TEXT,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "agenda_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_list" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "color_key" TEXT,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "todo_list_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "list_id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "estimated_minutes" INTEGER,
    "completed_at" TIMESTAMPTZ(6),
    "archived_at" TIMESTAMPTZ(6),

    CONSTRAINT "todo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_placement_version" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "todo_id" UUID NOT NULL,
    "list_id" UUID NOT NULL,
    "effective_from" TIMESTAMPTZ(6) NOT NULL,
    "color_key" TEXT,

    CONSTRAINT "todo_placement_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_activity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "title" TEXT NOT NULL,
    "tag_id" UUID,
    "parent_activity_id" UUID,
    "starts_at" TIMESTAMPTZ(6),
    "ends_at" TIMESTAMPTZ(6),
    "scheduled_date" DATE,
    "removed_at" TIMESTAMPTZ(6),

    CONSTRAINT "agenda_activity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_reservation" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "todo_id" UUID NOT NULL,
    "placement_version_id" UUID NOT NULL,
    "parent_activity_id" UUID,
    "starts_at" TIMESTAMPTZ(6) NOT NULL,
    "ends_at" TIMESTAMPTZ(6) NOT NULL,
    "removed_at" TIMESTAMPTZ(6),

    CONSTRAINT "todo_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agenda_tag_workspace_id_system_key_key" ON "agenda_tag"("workspace_id", "system_key");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_tag_workspace_id_id_key" ON "agenda_tag"("workspace_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_list_workspace_id_id_key" ON "todo_list"("workspace_id", "id");

-- CreateIndex
CREATE INDEX "todo_workspace_id_list_id_id_idx" ON "todo"("workspace_id", "list_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_workspace_id_id_key" ON "todo"("workspace_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_placement_version_workspace_id_todo_id_id_key" ON "todo_placement_version"("workspace_id", "todo_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_placement_version_workspace_id_todo_id_effective_from_key" ON "todo_placement_version"("workspace_id", "todo_id", "effective_from");

-- CreateIndex
CREATE UNIQUE INDEX "todo_placement_version_workspace_id_id_key" ON "todo_placement_version"("workspace_id", "id");

-- CreateIndex
CREATE INDEX "agenda_activity_workspace_id_parent_activity_id_id_idx" ON "agenda_activity"("workspace_id", "parent_activity_id", "id");

-- CreateIndex
CREATE INDEX "agenda_activity_workspace_id_scheduled_date_id_idx" ON "agenda_activity"("workspace_id", "scheduled_date", "id");

-- CreateIndex
CREATE UNIQUE INDEX "agenda_activity_workspace_id_id_key" ON "agenda_activity"("workspace_id", "id");

-- CreateIndex
CREATE INDEX "todo_reservation_workspace_id_todo_id_starts_at_id_idx" ON "todo_reservation"("workspace_id", "todo_id", "starts_at", "id");

-- CreateIndex
CREATE INDEX "todo_reservation_workspace_id_parent_activity_id_id_idx" ON "todo_reservation"("workspace_id", "parent_activity_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "todo_reservation_workspace_id_id_key" ON "todo_reservation"("workspace_id", "id");

-- AddForeignKey
ALTER TABLE "agenda_tag" ADD CONSTRAINT "agenda_tag_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_list" ADD CONSTRAINT "todo_list_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo" ADD CONSTRAINT "todo_workspace_id_list_id_fkey" FOREIGN KEY ("workspace_id", "list_id") REFERENCES "todo_list"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_placement_version" ADD CONSTRAINT "todo_placement_version_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_placement_version" ADD CONSTRAINT "todo_placement_version_workspace_id_todo_id_fkey" FOREIGN KEY ("workspace_id", "todo_id") REFERENCES "todo"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_placement_version" ADD CONSTRAINT "todo_placement_version_workspace_id_list_id_fkey" FOREIGN KEY ("workspace_id", "list_id") REFERENCES "todo_list"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_workspace_id_tag_id_fkey" FOREIGN KEY ("workspace_id", "tag_id") REFERENCES "agenda_tag"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_workspace_id_parent_activity_id_fkey" FOREIGN KEY ("workspace_id", "parent_activity_id") REFERENCES "agenda_activity"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_workspace_id_todo_id_fkey" FOREIGN KEY ("workspace_id", "todo_id") REFERENCES "todo"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_workspace_id_todo_id_placement_version_id_fkey" FOREIGN KEY ("workspace_id", "todo_id", "placement_version_id") REFERENCES "todo_placement_version"("workspace_id", "todo_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_workspace_id_parent_activity_id_fkey" FOREIGN KEY ("workspace_id", "parent_activity_id") REFERENCES "agenda_activity"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Integrity independent of the UI.
ALTER TABLE "todo" ADD CONSTRAINT "todo_estimate_check"
 CHECK ("estimated_minutes" IS NULL OR ("estimated_minutes" > 0 AND "estimated_minutes" % 15 = 0));
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_schedule_check"
 CHECK (("scheduled_date" IS NOT NULL AND "starts_at" IS NULL AND "ends_at" IS NULL)
 OR ("scheduled_date" IS NULL AND "starts_at" IS NOT NULL AND "ends_at" IS NOT NULL AND "ends_at" > "starts_at"));
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_parent_check"
 CHECK ("parent_activity_id" IS DISTINCT FROM "id");
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_interval_check"
 CHECK ("ends_at" > "starts_at");
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_starts_at_quarter_check"
 CHECK ("starts_at" IS NULL OR (
 EXTRACT(SECOND FROM "starts_at" AT TIME ZONE 'America/Sao_Paulo') = 0
 AND EXTRACT(MINUTE FROM "starts_at" AT TIME ZONE 'America/Sao_Paulo')::int % 15 = 0));
ALTER TABLE "agenda_activity" ADD CONSTRAINT "agenda_activity_ends_at_quarter_check"
 CHECK ("ends_at" IS NULL OR (
 EXTRACT(SECOND FROM "ends_at" AT TIME ZONE 'America/Sao_Paulo') = 0
 AND EXTRACT(MINUTE FROM "ends_at" AT TIME ZONE 'America/Sao_Paulo')::int % 15 = 0));
CREATE INDEX "agenda_activity_interval_gist" ON "agenda_activity"
 USING gist (tstzrange("starts_at", "ends_at", '[)'))
 WHERE "removed_at" IS NULL AND "starts_at" IS NOT NULL AND "ends_at" IS NOT NULL;
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_starts_at_quarter_check"
 CHECK ("starts_at" IS NULL OR (
 EXTRACT(SECOND FROM "starts_at" AT TIME ZONE 'America/Sao_Paulo') = 0
 AND EXTRACT(MINUTE FROM "starts_at" AT TIME ZONE 'America/Sao_Paulo')::int % 15 = 0));
ALTER TABLE "todo_reservation" ADD CONSTRAINT "todo_reservation_ends_at_quarter_check"
 CHECK ("ends_at" IS NULL OR (
 EXTRACT(SECOND FROM "ends_at" AT TIME ZONE 'America/Sao_Paulo') = 0
 AND EXTRACT(MINUTE FROM "ends_at" AT TIME ZONE 'America/Sao_Paulo')::int % 15 = 0));
CREATE INDEX "todo_reservation_interval_gist" ON "todo_reservation"
 USING gist (tstzrange("starts_at", "ends_at", '[)'))
 WHERE "removed_at" IS NULL AND "starts_at" IS NOT NULL AND "ends_at" IS NOT NULL;
