-- ============================================================================
-- PokéProd Architecture V2 — Phase 3 & 5 Social, Duels & TCG Cards
-- Run this idempotent script in your Supabase Dashboard → SQL Editor.
-- ============================================================================

-- 1. PUBLIC TRAINER PROFILES & FRIEND CODES (Phase 3.1 / 3.3)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS friend_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT true;

-- Allow authenticated trainers to view public profiles & lookup by friend_code
DROP POLICY IF EXISTS "Authenticated users can view public profiles" ON public.profiles;
CREATE POLICY "Authenticated users can view public profiles"
  ON public.profiles FOR SELECT
  USING (auth.role() = 'authenticated' AND (is_public = true OR auth.uid() = id));

-- 2. FRIENDSHIPS TABLE (Phase 3.1)
CREATE TABLE IF NOT EXISTS public.friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_a, user_b)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own friendships" ON public.friendships;
CREATE POLICY "Users manage own friendships"
  ON public.friendships FOR ALL
  USING (auth.uid() = user_a OR auth.uid() = user_b)
  WITH CHECK (auth.uid() = user_a OR auth.uid() = user_b);

-- 3. TRAINER DUELS TABLE (Phase 3.2)
CREATE TABLE IF NOT EXISTS public.duels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  opponent_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  challenger_name TEXT NOT NULL,
  opponent_name TEXT NOT NULL,
  goal_tasks INTEGER NOT NULL DEFAULT 5,
  challenger_progress INTEGER NOT NULL DEFAULT 0,
  opponent_progress INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  winner_id UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Participants manage own duels" ON public.duels;
CREATE POLICY "Participants manage own duels"
  ON public.duels FOR ALL
  USING (auth.uid() = challenger_id OR auth.uid() = opponent_id)
  WITH CHECK (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- 4. COLLECTED TCG CARDS TABLE (Phase 5.1)
CREATE TABLE IF NOT EXISTS public.collected_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pokemon_id INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common',
  card_title TEXT NOT NULL,
  atk INTEGER NOT NULL DEFAULT 50,
  obtained_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.collected_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users manage own cards" ON public.collected_cards;
CREATE POLICY "Users manage own cards"
  ON public.collected_cards FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
