-- Migration 001: Create tasks table with RLS, triggers, and indexes
-- BuildableLabs Assignment — Phase 1

-- Enable UUID generation (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title         VARCHAR(200) NOT NULL,
  description   TEXT,
  is_completed  BOOLEAN NOT NULL DEFAULT FALSE,
  priority      VARCHAR(10) NOT NULL DEFAULT 'medium'
                  CHECK (priority IN ('low', 'medium', 'high')),
  due_date      TIMESTAMPTZ,
  source        VARCHAR(20) NOT NULL DEFAULT 'mobile'
                  CHECK (source IN ('mobile', 'email', 'api')),
  deleted_at    TIMESTAMPTZ,          -- Soft delete
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can view their own tasks
CREATE POLICY "Users can view own tasks"
  ON public.tasks FOR SELECT
  USING (auth.uid() = user_id AND deleted_at IS NULL);

-- Users can insert their own tasks
CREATE POLICY "Users can insert own tasks"
  ON public.tasks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own tasks
CREATE POLICY "Users can update own tasks"
  ON public.tasks FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete (soft) their own tasks
CREATE POLICY "Users can delete own tasks"
  ON public.tasks FOR DELETE
  USING (auth.uid() = user_id);

-- Service role bypass (for n8n API key operations via backend)
CREATE POLICY "Service role full access"
  ON public.tasks FOR ALL
  USING (auth.role() = 'service_role');

-- Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_tasks_user_id
  ON public.tasks(user_id) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON public.tasks(user_id, due_date)
  WHERE deleted_at IS NULL AND is_completed = FALSE;

CREATE INDEX IF NOT EXISTS idx_tasks_priority
  ON public.tasks(user_id, priority)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_tasks_source
  ON public.tasks(source);

CREATE INDEX IF NOT EXISTS idx_tasks_created_at
  ON public.tasks(user_id, created_at DESC)
  WHERE deleted_at IS NULL;

COMMENT ON TABLE public.tasks IS 'Task items for BuildableLabs task system';
COMMENT ON COLUMN public.tasks.source IS 'Origin of task creation: mobile app, email ingestion, or API';
COMMENT ON COLUMN public.tasks.deleted_at IS 'Soft delete timestamp — non-null means deleted';
