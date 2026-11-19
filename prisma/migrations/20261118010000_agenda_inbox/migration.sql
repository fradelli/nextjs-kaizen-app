ALTER TABLE "todo_list" ADD COLUMN "system_key" TEXT;
CREATE UNIQUE INDEX "todo_list_workspace_id_system_key_key" ON "todo_list"("workspace_id", "system_key");
