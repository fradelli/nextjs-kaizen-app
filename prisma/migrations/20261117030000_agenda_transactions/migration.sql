-- AlterTable
ALTER TABLE "todo_reservation" ADD COLUMN     "color_key" TEXT;

-- CreateTable
CREATE TABLE "agenda_activity_revision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "agenda_activity_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_revision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "todo_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todo_reservation_revision" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "workspace_id" UUID NOT NULL,
    "entity_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "recorded_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "snapshot" JSONB NOT NULL,

    CONSTRAINT "todo_reservation_revision_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agenda_mutation_receipt" (
    "workspace_id" UUID NOT NULL,
    "operation_id" UUID NOT NULL,
    "command_hash" TEXT NOT NULL,
    "result" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agenda_mutation_receipt_pkey" PRIMARY KEY ("workspace_id","operation_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agenda_activity_revision_workspace_id_entity_id_revision_key" ON "agenda_activity_revision"("workspace_id", "entity_id", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "todo_revision_workspace_id_entity_id_revision_key" ON "todo_revision"("workspace_id", "entity_id", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "todo_reservation_revision_workspace_id_entity_id_revision_key" ON "todo_reservation_revision"("workspace_id", "entity_id", "revision");

-- AddForeignKey
ALTER TABLE "agenda_activity_revision" ADD CONSTRAINT "agenda_activity_revision_workspace_id_entity_id_fkey" FOREIGN KEY ("workspace_id", "entity_id") REFERENCES "agenda_activity"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_revision" ADD CONSTRAINT "todo_revision_workspace_id_entity_id_fkey" FOREIGN KEY ("workspace_id", "entity_id") REFERENCES "todo"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todo_reservation_revision" ADD CONSTRAINT "todo_reservation_revision_workspace_id_entity_id_fkey" FOREIGN KEY ("workspace_id", "entity_id") REFERENCES "todo_reservation"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agenda_mutation_receipt" ADD CONSTRAINT "agenda_mutation_receipt_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
