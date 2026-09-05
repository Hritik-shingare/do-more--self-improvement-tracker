-- ============================================================
-- Self-Improvement Tracker — Supabase Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES (extends Supabase auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 2. USER GOALS
-- ============================================================
CREATE TABLE IF NOT EXISTS user_goals (
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE PRIMARY KEY,
  step_goal INT DEFAULT 8000,
  calorie_burn_goal INT DEFAULT 500,
  weekly_skill_minutes_goal INT DEFAULT 300
);

-- ============================================================
-- 3. DAILY FITNESS LOGS
-- ============================================================
CREATE TABLE IF NOT EXISTS daily_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  steps INT DEFAULT 0,
  ran_today BOOLEAN DEFAULT FALSE,
  run_distance_km DECIMAL(5,2),
  calories_burned INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, log_date)
);

-- ============================================================
-- 4. FOOD ENTRIES (linked to daily_logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS food_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_log_id UUID REFERENCES daily_logs(id) ON DELETE CASCADE NOT NULL,
  food_name TEXT NOT NULL,
  estimated_calories INT NOT NULL CHECK (estimated_calories >= 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 5. SKILLS (user-defined)
-- ============================================================
CREATE TABLE IF NOT EXISTS skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 6. SKILL AREAS (sub-areas with progress sliders)
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  progress_percent INT DEFAULT 0 CHECK (progress_percent BETWEEN 0 AND 100),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 7. SKILL TIME LOGS (time spent per skill per day)
-- ============================================================
CREATE TABLE IF NOT EXISTS skill_time_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE NOT NULL,
  log_date DATE NOT NULL,
  minutes_spent INT NOT NULL CHECK (minutes_spent > 0),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- 8. WEEKLY SCORES (stored historically)
-- ============================================================
CREATE TABLE IF NOT EXISTS weekly_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  fitness_score DECIMAL(5,2) DEFAULT 0,
  skill_score DECIMAL(5,2) DEFAULT 0,
  nutrition_score DECIMAL(5,2) DEFAULT 0,
  total_score DECIMAL(5,2) DEFAULT 0,
  rank_in_friend_group INT,
  computed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start_date)
);

-- ============================================================
-- 9. FRIENDSHIPS
-- ============================================================
CREATE TABLE IF NOT EXISTS friendships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  friend_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, friend_id)
);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE food_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE skill_time_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;

-- ---- user_profiles ----
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view friends profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND ((user_id = auth.uid() AND friend_id = id)
          OR (friend_id = auth.uid() AND user_id = id))
    )
  );
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Public username lookup (needed for friend requests)
CREATE POLICY "Anyone can look up username" ON user_profiles
  FOR SELECT USING (true);

-- ---- user_goals ----
CREATE POLICY "Users manage own goals" ON user_goals
  FOR ALL USING (auth.uid() = user_id);

-- ---- daily_logs ----
CREATE POLICY "Users manage own logs" ON daily_logs
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Friends can view logs" ON daily_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND ((user_id = auth.uid() AND friend_id = daily_logs.user_id)
          OR (friend_id = auth.uid() AND user_id = daily_logs.user_id))
    )
  );

-- ---- food_entries ----
CREATE POLICY "Users manage own food entries" ON food_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM daily_logs dl
      WHERE dl.id = daily_log_id AND dl.user_id = auth.uid()
    )
  );

-- ---- skills ----
CREATE POLICY "Users manage own skills" ON skills
  FOR ALL USING (auth.uid() = user_id);

-- ---- skill_areas ----
CREATE POLICY "Users manage own skill areas" ON skill_areas
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM skills s
      WHERE s.id = skill_id AND s.user_id = auth.uid()
    )
  );

-- ---- skill_time_logs ----
CREATE POLICY "Users manage own skill time logs" ON skill_time_logs
  FOR ALL USING (auth.uid() = user_id);

-- ---- weekly_scores ----
CREATE POLICY "Users manage own scores" ON weekly_scores
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Friends can view scores" ON weekly_scores
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friendships
      WHERE status = 'accepted'
        AND ((user_id = auth.uid() AND friend_id = weekly_scores.user_id)
          OR (friend_id = auth.uid() AND user_id = weekly_scores.user_id))
    )
  );

-- ---- friendships ----
CREATE POLICY "Users manage own friendship requests" ON friendships
  FOR ALL USING (auth.uid() = user_id OR auth.uid() = friend_id);

-- ============================================================
-- TRIGGER: Auto-create user_profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved_username TEXT;
  resolved_display_name TEXT;
  resolved_step_goal INT;
  resolved_calorie_goal INT;
  resolved_skill_goal INT;
BEGIN
  resolved_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1)
  );

  resolved_display_name := COALESCE(
    NEW.raw_user_meta_data->>'display_name',
    resolved_username
  );

  resolved_step_goal := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'step_goal', '')::INT,
    8000
  );

  resolved_calorie_goal := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'calorie_burn_goal', '')::INT,
    500
  );

  resolved_skill_goal := COALESCE(
    NULLIF(NEW.raw_user_meta_data->>'weekly_skill_minutes_goal', '')::INT,
    300
  );

  -- 1. Create profile
  INSERT INTO public.user_profiles (id, username, display_name)
  VALUES (
    NEW.id,
    resolved_username,
    resolved_display_name
  )
  ON CONFLICT (id) DO UPDATE SET
    username = EXCLUDED.username,
    display_name = EXCLUDED.display_name;

  -- 2. Create goals
  INSERT INTO public.user_goals (user_id, step_goal, calorie_burn_goal, weekly_skill_minutes_goal)
  VALUES (
    NEW.id,
    resolved_step_goal,
    resolved_calorie_goal,
    resolved_skill_goal
  )
  ON CONFLICT (user_id) DO UPDATE SET
    step_goal = EXCLUDED.step_goal,
    calorie_burn_goal = EXCLUDED.calorie_burn_goal,
    weekly_skill_minutes_goal = EXCLUDED.weekly_skill_minutes_goal;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

