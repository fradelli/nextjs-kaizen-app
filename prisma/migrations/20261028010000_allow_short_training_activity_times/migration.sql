-- Clock-minute labels may match for subminute executions or wrap at midnight.
-- Chronology remains validated by timestamps and execution intervals.
ALTER TABLE "training_day_activity"
  DROP CONSTRAINT "training_day_activity_actual_time_v2_ck",
  ADD CONSTRAINT "training_day_activity_actual_time_v3_ck"
    CHECK (
      ("actual_start_minute" IS NULL AND "actual_end_minute" IS NULL)
      OR
      ("actual_start_minute" >= 0
        AND "actual_start_minute" < 1440
        AND "actual_end_minute" >= 0
        AND "actual_end_minute" <= 1440)
    );
