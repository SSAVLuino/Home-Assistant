-- Funzione richiamata dall'Edge Function per trovare le scadenze da notificare oggi.
-- Eseguire nel SQL Editor di Supabase.

CREATE OR REPLACE FUNCTION get_deadlines_to_notify(check_date DATE)
RETURNS TABLE (
  id              UUID,
  title           TEXT,
  due_date        DATE,
  notify_before_days INTEGER,
  notify_push     BOOLEAN,
  notify_email    BOOLEAN,
  user_id         UUID,
  user_email      TEXT,
  project_name    TEXT,
  asset_name      TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    d.id,
    d.title,
    d.due_date,
    d.notify_before_days,
    d.notify_push,
    d.notify_email,
    d.user_id,
    u.email AS user_email,
    p.name  AS project_name,
    a.name  AS asset_name
  FROM deadlines d
  JOIN auth.users u ON u.id = d.user_id
  LEFT JOIN projects p ON p.id = d.project_id
  LEFT JOIN assets a   ON a.id = d.asset_id
  WHERE
    d.notify_before_days IS NOT NULL
    AND (d.notify_push = TRUE OR d.notify_email = TRUE)
    AND d.due_date = check_date + (d.notify_before_days || ' days')::INTERVAL
    AND (
      d.notify_sent_at IS NULL
      OR d.notify_sent_at < NOW() - INTERVAL '23 hours'
    );
$$;
