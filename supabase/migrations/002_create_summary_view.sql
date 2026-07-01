-- Migration 002: Summary view and helper functions for n8n automation
-- BuildableLabs Assignment — Phase 3

-- Task summary view (used by n8n for digest emails and reminders)
CREATE OR REPLACE VIEW public.task_summary AS
SELECT
  user_id,
  COUNT(*) FILTER (WHERE deleted_at IS NULL)                                           AS total_tasks,
  COUNT(*) FILTER (WHERE is_completed AND deleted_at IS NULL)                           AS completed_tasks,
  COUNT(*) FILTER (WHERE NOT is_completed AND deleted_at IS NULL)                       AS pending_tasks,
  COUNT(*) FILTER (
    WHERE NOT is_completed AND due_date < NOW() AND deleted_at IS NULL
  )                                                                                      AS overdue_tasks,
  COUNT(*) FILTER (
    WHERE created_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL
  )                                                                                      AS created_this_week,
  COUNT(*) FILTER (
    WHERE is_completed AND updated_at > NOW() - INTERVAL '7 days' AND deleted_at IS NULL
  )                                                                                      AS completed_this_week,
  COUNT(*) FILTER (
    WHERE NOT is_completed
      AND due_date >= DATE_TRUNC('day', NOW())
      AND due_date < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
      AND deleted_at IS NULL
  )                                                                                      AS due_today,
  COUNT(*) FILTER (
    WHERE NOT is_completed
      AND due_date >= DATE_TRUNC('day', NOW())
      AND due_date < DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
      AND deleted_at IS NULL
  )                                                                                      AS due_this_week
FROM public.tasks
GROUP BY user_id;

-- Helper function: get tasks due today for a user
CREATE OR REPLACE FUNCTION public.get_tasks_due_today(p_user_id UUID)
RETURNS SETOF public.tasks AS $$
  SELECT * FROM public.tasks
  WHERE user_id = p_user_id
    AND deleted_at IS NULL
    AND is_completed = FALSE
    AND due_date >= DATE_TRUNC('day', NOW())
    AND due_date < DATE_TRUNC('day', NOW()) + INTERVAL '1 day'
  ORDER BY priority DESC, due_date ASC;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function: get tasks due next week for digest
CREATE OR REPLACE FUNCTION public.get_tasks_due_next_week(p_user_id UUID)
RETURNS SETOF public.tasks AS $$
  SELECT * FROM public.tasks
  WHERE user_id = p_user_id
    AND deleted_at IS NULL
    AND is_completed = FALSE
    AND due_date >= DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
    AND due_date < DATE_TRUNC('week', NOW()) + INTERVAL '14 days'
  ORDER BY due_date ASC, priority DESC;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

COMMENT ON VIEW public.task_summary IS 'Aggregated task statistics per user — used by n8n automation';
