-- ============================================================================
-- PokéProd Architecture V2 — Phase 2 Core Gameplay Tables (Pokédex, Gyms, Stats)
-- Run this idempotent script in your Supabase Dashboard → SQL Editor.
-- ============================================================================

-- 1. POKÉDEX ENTRIES (Phase 2.1)
CREATE TABLE IF NOT EXISTS public.pokedex_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pokemon_id INTEGER NOT NULL,
  is_shiny BOOLEAN NOT NULL DEFAULT false,
  source TEXT NOT NULL DEFAULT 'safari',
  first_seen_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, pokemon_id, is_shiny)
);

ALTER TABLE public.pokedex_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own pokedex" ON public.pokedex_entries;
CREATE POLICY "Users manage own pokedex"
  ON public.pokedex_entries FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_pokedex_user ON public.pokedex_entries (user_id, pokemon_id);

-- 2. GYM BADGES (Phase 2.2)
CREATE TABLE IF NOT EXISTS public.gym_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_type TEXT NOT NULL,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
);

ALTER TABLE public.gym_badges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own gym badges" ON public.gym_badges;
CREATE POLICY "Users manage own gym badges"
  ON public.gym_badges FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. DAILY BOSS CHALLENGE (Phase 2.2)
CREATE TABLE IF NOT EXISTS public.daily_boss (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  boss_type TEXT NOT NULL,
  leader_id TEXT NOT NULL,
  boss_hp NUMERIC NOT NULL DEFAULT 4,
  current_hp NUMERIC NOT NULL DEFAULT 4,
  is_defeated BOOLEAN NOT NULL DEFAULT false,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_boss ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own daily boss" ON public.daily_boss;
CREATE POLICY "Users manage own daily boss"
  ON public.daily_boss FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. DAILY ANALYTICS SNAPSHOTS (Phase 2.3)
CREATE TABLE IF NOT EXISTS public.daily_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  tasks_completed INTEGER NOT NULL DEFAULT 0,
  total_xp INTEGER NOT NULL DEFAULT 0,
  habits_completed INTEGER NOT NULL DEFAULT 0,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own daily snapshots" ON public.daily_snapshots;
CREATE POLICY "Users manage own daily snapshots"
  ON public.daily_snapshots FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON public.daily_snapshots (user_id, date DESC);
