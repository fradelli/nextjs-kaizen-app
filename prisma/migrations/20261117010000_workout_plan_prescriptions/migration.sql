-- CreateTable
CREATE TABLE "workout_plan" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "planned_workout" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "plan_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "planned_workout_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_prescription_version" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "workout_id" UUID NOT NULL,
    "revision" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workout_prescription_version_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_prescription_block" (
    "id" UUID NOT NULL,
    "version_id" UUID NOT NULL,
    "logical_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "phase" TEXT NOT NULL,
    "mode" TEXT NOT NULL,

    CONSTRAINT "workout_prescription_block_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_prescription_exercise" (
    "id" UUID NOT NULL,
    "block_id" UUID NOT NULL,
    "logical_id" UUID NOT NULL,
    "catalog_exercise_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "measurement_contract" JSONB NOT NULL,
    "notes" TEXT,

    CONSTRAINT "workout_prescription_exercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_prescription_set" (
    "id" UUID NOT NULL,
    "exercise_id" UUID NOT NULL,
    "logical_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "rest_seconds" INTEGER NOT NULL,

    CONSTRAINT "workout_prescription_set_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workout_prescription_stage" (
    "id" UUID NOT NULL,
    "set_id" UUID NOT NULL,
    "logical_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "targets" JSONB NOT NULL,
    "load_kg" DECIMAL(10,3),

    CONSTRAINT "workout_prescription_stage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_group" (
    "id" UUID NOT NULL,
    "workspace_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "revision" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "equipment_group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "equipment_group_item" (
    "group_id" UUID NOT NULL,
    "equipment_id" TEXT NOT NULL,

    CONSTRAINT "equipment_group_item_pkey" PRIMARY KEY ("group_id","equipment_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "workout_plan_workspace_id_id_key" ON "workout_plan"("workspace_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "planned_workout_workspace_id_id_key" ON "planned_workout"("workspace_id", "id");

-- CreateIndex
CREATE UNIQUE INDEX "planned_workout_plan_id_position_key" ON "planned_workout"("plan_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_version_workout_id_revision_key" ON "workout_prescription_version"("workout_id", "revision");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_block_version_id_position_key" ON "workout_prescription_block"("version_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_block_version_id_logical_id_key" ON "workout_prescription_block"("version_id", "logical_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_exercise_block_id_position_key" ON "workout_prescription_exercise"("block_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_exercise_block_id_logical_id_key" ON "workout_prescription_exercise"("block_id", "logical_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_set_exercise_id_position_key" ON "workout_prescription_set"("exercise_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_set_exercise_id_logical_id_key" ON "workout_prescription_set"("exercise_id", "logical_id");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_stage_set_id_position_key" ON "workout_prescription_stage"("set_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "workout_prescription_stage_set_id_logical_id_key" ON "workout_prescription_stage"("set_id", "logical_id");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_group_workspace_id_id_key" ON "equipment_group"("workspace_id", "id");

-- AddForeignKey
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "planned_workout" ADD CONSTRAINT "planned_workout_workspace_id_plan_id_fkey" FOREIGN KEY ("workspace_id", "plan_id") REFERENCES "workout_plan"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_version" ADD CONSTRAINT "workout_prescription_version_workspace_id_workout_id_fkey" FOREIGN KEY ("workspace_id", "workout_id") REFERENCES "planned_workout"("workspace_id", "id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_block" ADD CONSTRAINT "workout_prescription_block_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "workout_prescription_version"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_exercise" ADD CONSTRAINT "workout_prescription_exercise_block_id_fkey" FOREIGN KEY ("block_id") REFERENCES "workout_prescription_block"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_exercise" ADD CONSTRAINT "workout_prescription_exercise_catalog_exercise_id_fkey" FOREIGN KEY ("catalog_exercise_id") REFERENCES "CatalogExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_set" ADD CONSTRAINT "workout_prescription_set_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "workout_prescription_exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workout_prescription_stage" ADD CONSTRAINT "workout_prescription_stage_set_id_fkey" FOREIGN KEY ("set_id") REFERENCES "workout_prescription_set"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_group" ADD CONSTRAINT "equipment_group_workspace_id_fkey" FOREIGN KEY ("workspace_id") REFERENCES "workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_group_item" ADD CONSTRAINT "equipment_group_item_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "equipment_group"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_group_item" ADD CONSTRAINT "equipment_group_item_equipment_id_fkey" FOREIGN KEY ("equipment_id") REFERENCES "CatalogEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workout_plan" ADD CONSTRAINT "workout_plan_name_check" CHECK (length(btrim("name")) > 0), ADD CONSTRAINT "workout_plan_revision_check" CHECK ("revision" >= 0);
ALTER TABLE "planned_workout" ADD CONSTRAINT "planned_workout_position_check" CHECK ("position" >= 0);
ALTER TABLE "workout_prescription_version" ADD CONSTRAINT "prescription_revision_check" CHECK ("revision" >= 0), ADD CONSTRAINT "prescription_name_check" CHECK (length(btrim("name")) > 0);
ALTER TABLE "workout_prescription_block" ADD CONSTRAINT "prescription_block_shape_check" CHECK ("position" >= 0 AND "phase" IN ('preparation', 'main') AND "mode" IN ('simple', 'circuit', 'combined'));
ALTER TABLE "workout_prescription_exercise" ADD CONSTRAINT "prescription_exercise_position_check" CHECK ("position" >= 0);
ALTER TABLE "workout_prescription_set" ADD CONSTRAINT "prescription_set_shape_check" CHECK ("position" >= 0 AND "rest_seconds" >= 0 AND "kind" IN ('warmup', 'work', 'drop'));
ALTER TABLE "workout_prescription_stage" ADD CONSTRAINT "prescription_stage_shape_check" CHECK ("position" >= 0 AND ("load_kg" IS NULL OR "load_kg" >= 0));
ALTER TABLE "equipment_group" ADD CONSTRAINT "equipment_group_name_check" CHECK (length(btrim("name")) > 0), ADD CONSTRAINT "equipment_group_revision_check" CHECK ("revision" >= 0);
