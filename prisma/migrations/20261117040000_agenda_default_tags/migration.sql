INSERT INTO agenda_tag (id, workspace_id, name, color_key, system_key, revision, created_at, updated_at)
SELECT gen_random_uuid(), w.id, defaults.name, defaults.color_key, defaults.system_key, 0, now(), now()
FROM workspace AS w
CROSS JOIN (VALUES
  ('Treino', 'green', 'training'),
  ('Alimentação', 'orange', 'nutrition')
) AS defaults(name, color_key, system_key)
ON CONFLICT (workspace_id, system_key) DO NOTHING;
