-- profiles ---------------------------------------------------------------
CREATE TABLE public.profiles (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  age_range TEXT NOT NULL DEFAULT '25-34' CHECK (age_range IN ('13-17','18-24','25-34','35-44','45-54','55+')),
  height TEXT NOT NULL DEFAULT '',
  weight TEXT NOT NULL DEFAULT '',
  gender TEXT CHECK (gender IN ('male','female')),
  fitness_level TEXT NOT NULL DEFAULT 'beginner' CHECK (fitness_level IN ('beginner','intermediate','advanced')),
  primary_goal TEXT NOT NULL DEFAULT 'general_fitness' CHECK (primary_goal IN ('build_strength','lose_fat','improve_endurance','improve_mobility','general_fitness','build_consistency')),
  goals TEXT[] NOT NULL DEFAULT '{}',
  onboarded BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.profiles
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_lifestyle ---------------------------------------------------------
CREATE TABLE public.user_lifestyle (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lifestyle TEXT NOT NULL DEFAULT 'office' CHECK (lifestyle IN ('student','office','gamer','developer','creator','business','nightshift','freelancer','parent','custom')),
  wake_time TEXT NOT NULL DEFAULT '07:00',
  sleep_time TEXT NOT NULL DEFAULT '23:00',
  schedule TEXT NOT NULL DEFAULT 'daytime' CHECK (schedule IN ('daytime','evening','night','rotating','flexible')),
  sitting_hours SMALLINT NOT NULL DEFAULT 6 CHECK (sitting_hours BETWEEN 0 AND 16),
  room_size TEXT NOT NULL DEFAULT 'medium' CHECK (room_size IN ('tiny','small','medium','large')),
  equipment TEXT[] NOT NULL DEFAULT '{none}',
  energy SMALLINT NOT NULL DEFAULT 3 CHECK (energy BETWEEN 1 AND 5),
  stress SMALLINT NOT NULL DEFAULT 3 CHECK (stress BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_lifestyle TO authenticated;
GRANT ALL ON public.user_lifestyle TO service_role;
ALTER TABLE public.user_lifestyle ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own lifestyle" ON public.user_lifestyle
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_lifestyle_updated_at BEFORE UPDATE ON public.user_lifestyle
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- user_preferences -------------------------------------------------------
CREATE TABLE public.user_preferences (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  motivation_mode TEXT NOT NULL DEFAULT 'zen' CHECK (motivation_mode IN ('hunter','hero','zen','discipline','scientist','story')),
  demonstration_preference TEXT NOT NULL DEFAULT 'male' CHECK (demonstration_preference IN ('male','female')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON public.user_preferences
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();