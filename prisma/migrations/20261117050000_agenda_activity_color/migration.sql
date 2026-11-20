ALTER TABLE agenda_activity ADD COLUMN color_key TEXT;

UPDATE agenda_activity AS a SET color_key = t.color_key
FROM agenda_tag AS t WHERE a.workspace_id = t.workspace_id AND a.tag_id = t.id;
