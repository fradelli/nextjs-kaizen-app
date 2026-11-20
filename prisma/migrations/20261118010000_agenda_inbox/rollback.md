# Rollback

Roll back the application code before removing the Inbox key. This rollback preserves groups, tasks, reservations, and historical records; groups previously identified as Inbox become ordinary groups.

```sql
DROP INDEX "todo_list_workspace_id_system_key_key";
ALTER TABLE "todo_list" DROP COLUMN "system_key";
```

Use Prisma migration resolution or a forward corrective migration to reconcile migration metadata in the target environment.
