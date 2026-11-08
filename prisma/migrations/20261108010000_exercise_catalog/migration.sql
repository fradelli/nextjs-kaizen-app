-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "CatalogEquipment" (
    "id" TEXT NOT NULL,
    "namePt" TEXT NOT NULL,
    "details" JSONB NOT NULL,

    CONSTRAINT "CatalogEquipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogExercise" (
    "id" TEXT NOT NULL,
    "namePt" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "primaryGroups" TEXT[],
    "researchStatus" TEXT NOT NULL,
    "calisthenics" TEXT NOT NULL,
    "anatomy" JSONB NOT NULL,
    "profile" JSONB NOT NULL,

    CONSTRAINT "CatalogExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogExerciseAlias" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,

    CONSTRAINT "CatalogExerciseAlias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CatalogRequirement" (
    "exerciseId" TEXT NOT NULL,
    "configuration" INTEGER NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "optional" BOOLEAN NOT NULL,

    CONSTRAINT "CatalogRequirement_pkey" PRIMARY KEY ("exerciseId","configuration","equipmentId")
);

-- CreateTable
CREATE TABLE "CatalogImport" (
    "id" TEXT NOT NULL,
    "appliedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "metadata" JSONB NOT NULL,

    CONSTRAINT "CatalogImport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CatalogExercise_primaryGroups_idx" ON "CatalogExercise" USING GIN ("primaryGroups");

-- CreateIndex
CREATE INDEX "CatalogExerciseAlias_exerciseId_idx" ON "CatalogExerciseAlias"("exerciseId");

-- CreateIndex
CREATE INDEX "CatalogRequirement_equipmentId_idx" ON "CatalogRequirement"("equipmentId");

-- AddForeignKey
ALTER TABLE "CatalogExerciseAlias" ADD CONSTRAINT "CatalogExerciseAlias_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "CatalogExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogRequirement" ADD CONSTRAINT "CatalogRequirement_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "CatalogExercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CatalogRequirement" ADD CONSTRAINT "CatalogRequirement_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "CatalogEquipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
