-- ============================================================================
-- PokéProd Architecture V2 — Phase 1 Foundation, Cloud Projects & RLS Security
-- Run this idempotent script in your Supabase Dashboard → SQL Editor.
-- ============================================================================

-- 1. PROFILES TABLE (XP, Username, Starter, Theme)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT,
  xp INTEGER NOT NULL DEFAULT 0,
  starter_id INTEGER NOT NULL DEFAULT 155,
  starter_name TEXT NOT NULL DEFAULT 'CYNDAQUIL',
  theme TEXT NOT NULL DEFAULT 'gen3',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if profiles was created earlier with minimal schema
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS starter_id INTEGER NOT NULL DEFAULT 155;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS starter_name TEXT NOT NULL DEFAULT 'CYNDAQUIL';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'gen3';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Auto-create profile row on signup so fresh trainers start cleanly at 0 XP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, xp)
  VALUES (
    NEW.id,
    UPPER(COALESCE(SPLIT_PART(NEW.email, '@', 1), 'TRAINER')),
    0
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. TASKS TABLE (Journey Tab Quick Quests)
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  element_type TEXT NOT NULL DEFAULT 'fire',
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own tasks" ON public.tasks;
CREATE POLICY "Users manage own tasks"
  ON public.tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_created ON public.tasks (user_id, created_at DESC);

-- 3. PROJECTS & PROJECT SUBTASKS (Phase 2.4 / Sprint 1 Cloud-Synced Projects)
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  evo_line_id INTEGER NOT NULL DEFAULT 0,
  current_stage INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own projects" ON public.projects;
CREATE POLICY "Users manage own projects"
  ON public.projects FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_projects_user_created ON public.projects (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.project_subtasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL DEFAULT auth.uid(),
  text TEXT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.project_subtasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own project subtasks" ON public.project_subtasks;
CREATE POLICY "Users manage own project subtasks"
  ON public.project_subtasks FOR ALL
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_subtasks.project_id AND p.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects p
      WHERE p.id = project_subtasks.project_id AND p.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_project_subtasks_project ON public.project_subtasks (project_id, sort_order ASC);

-- 4. NUZLOCKE PARTY TABLE
CREATE TABLE IF NOT EXISTS public.nuzlocke_party (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  task_name TEXT NOT NULL,
  pokemon_id INTEGER,
  deadline TIMESTAMPTZ,
  status TEXT DEFAULT 'active',
  location TEXT NOT NULL DEFAULT 'daycare',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.nuzlocke_party ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own nuzlocke party" ON public.nuzlocke_party;
CREATE POLICY "Users manage own nuzlocke party"
  ON public.nuzlocke_party FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. SECRET BASE ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.secret_base_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  sprite_name TEXT NOT NULL,
  is_placed BOOLEAN NOT NULL DEFAULT false,
  grid_x INTEGER,
  grid_y INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.secret_base_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own secret base items" ON public.secret_base_items;
CREATE POLICY "Users manage own secret base items"
  ON public.secret_base_items FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. DAILY HABITS TABLE
CREATE TABLE IF NOT EXISTS public.daily_habits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  streak INTEGER NOT NULL DEFAULT 0,
  last_completed_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own daily habits" ON public.daily_habits;
CREATE POLICY "Users manage own daily habits"
  ON public.daily_habits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 7. RAID BOSS TABLE (Co-op Multiplayer)
CREATE TABLE IF NOT EXISTS public.raid_boss (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Giant Slaking of Sloth',
  max_hp INTEGER NOT NULL DEFAULT 10000,
  current_hp INTEGER NOT NULL DEFAULT 10000
);

INSERT INTO public.raid_boss (id, name, max_hp, current_hp)
VALUES (1, 'Giant Slaking of Sloth', 10000, 10000)
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.raid_boss ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read boss" ON public.raid_boss;
CREATE POLICY "Authenticated users can read boss"
  ON public.raid_boss FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update boss HP" ON public.raid_boss;
CREATE POLICY "Authenticated users can update boss HP"
  ON public.raid_boss FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime publication for raid_boss safely
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'raid_boss'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.raid_boss;
  END IF;
END $$;
