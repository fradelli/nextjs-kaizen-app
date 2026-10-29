ALTER TABLE "training_activity_set_execution" ADD COLUMN "kind" TEXT NOT NULL DEFAULT 'work', ADD COLUMN "confirmed" BOOLEAN;
ALTER TABLE "training_activity_set_execution" ADD CONSTRAINT "training_activity_set_kind_check" CHECK ("kind" IN ('work', 'warmup'));
