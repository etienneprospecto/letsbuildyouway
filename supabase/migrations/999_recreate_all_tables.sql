-- Script d'urgence : RECRÉER TOUTES LES TABLES SUPABASE
-- ATTENTION : Ceci va supprimer et recréer TOUTES les tables

-- 1. Supprimer toutes les tables existantes
DROP TABLE IF EXISTS public.exercices_seance CASCADE;
DROP TABLE IF EXISTS public.seances CASCADE;
DROP TABLE IF EXISTS public.ressources_personnalisees CASCADE;
DROP TABLE IF EXISTS public.user_trophies CASCADE;
DROP TABLE IF EXISTS public.trophies CASCADE;
DROP TABLE IF EXISTS public.resources CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.conversations CASCADE;
DROP TABLE IF EXISTS public.progress_data CASCADE;
DROP TABLE IF EXISTS public.weekly_feedbacks CASCADE;
DROP TABLE IF EXISTS public.workout_exercises CASCADE;
DROP TABLE IF EXISTS public.workouts CASCADE;
DROP TABLE IF EXISTS public.exercises CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 2. Supprimer les types personnalisés
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS exercise_type CASCADE;
DROP TYPE IF EXISTS workout_type CASCADE;
DROP TYPE IF EXISTS feedback_type CASCADE;

-- 3. Recréer les extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 4. Recréer les types
CREATE TYPE user_role AS ENUM ('coach', 'client');
CREATE TYPE exercise_type AS ENUM ('Cardio', 'Musculation', 'Étirement', 'Pilates', 'Yoga', 'CrossFit', 'Fonctionnel', 'Autre');
CREATE TYPE workout_type AS ENUM ('Entraînement', 'Récupération', 'Test', 'Compétition', 'Autre');
CREATE TYPE feedback_type AS ENUM ('Hebdomadaire', 'Mensuel', 'Trimestriel', 'Personnalisé');

-- 5. Recréer la table profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 6. Recréer la table clients
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 16 AND age <= 100),
  photo_url text,
  objective text NOT NULL,
  level text NOT NULL CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  mentality text NOT NULL,
  coaching_type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  constraints text,
  allergies text,
  morphotype text,
  equipment text,
  lifestyle text,
  contact text NOT NULL,
  sports_history text NOT NULL,
  needs_attention boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 7. Recréer la table exercises
CREATE TABLE public.exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type exercise_type NOT NULL,
  muscle_groups text[],
  difficulty text CHECK (difficulty IN ('Facile', 'Intermédiaire', 'Difficile')),
  equipment_needed text[],
  video_url text,
  image_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 8. Recréer la table workouts
CREATE TABLE public.workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  type workout_type NOT NULL,
  duration_minutes integer,
  difficulty text CHECK (difficulty IN ('Facile', 'Intermédiaire', 'Difficile')),
  target_muscle_groups text[],
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_template boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 9. Recréer la table workout_exercises
CREATE TABLE public.workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index integer NOT NULL,
  sets integer,
  reps integer,
  duration_seconds integer,
  rest_seconds integer,
  weight_kg numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(workout_id, exercise_id, order_index)
);

-- 10. Recréer la table weekly_feedbacks
CREATE TABLE public.weekly_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start_date date NOT NULL,
  week_end_date date NOT NULL,
  general_mood text,
  energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
  sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_quality <= 10),
  stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
  motivation_level integer CHECK (motivation_level >= 1 AND motivation_level <= 10),
  adherence_percentage integer CHECK (adherence_percentage >= 0 AND adherence_percentage <= 100),
  notes text,
  coach_feedback text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 11. Recréer la table progress_data
CREATE TABLE public.progress_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  measurement_date date NOT NULL,
  weight_kg numeric(5,2),
  body_fat_percentage numeric(4,2),
  muscle_mass_kg numeric(5,2),
  measurements jsonb,
  photos_urls text[],
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 12. Recréer la table sessions
CREATE TABLE public.sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  session_date date NOT NULL,
  duration_minutes integer,
  notes text,
  rating integer CHECK (rating >= 1 AND rating <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 13. Recréer la table conversations
CREATE TABLE public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 14. Recréer la table messages
CREATE TABLE public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  message_type text DEFAULT 'text',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 15. Recréer la table resources
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL,
  url text,
  file_path text,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  is_public boolean DEFAULT false,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 16. Recréer la table trophies
CREATE TABLE public.trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  icon_url text,
  criteria jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 17. Recréer la table user_trophies
CREATE TABLE public.user_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_id uuid NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
  earned_date timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trophy_id)
);

-- 18. Recréer la table seances
CREATE TABLE public.seances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workout_id uuid REFERENCES workouts(id) ON DELETE SET NULL,
  date_seance date NOT NULL,
  duree_minutes integer,
  notes text,
  evaluation integer CHECK (evaluation >= 1 AND evaluation <= 5),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 19. Recréer la table exercices_seance
CREATE TABLE public.exercices_seance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id uuid NOT NULL REFERENCES seances(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  ordre integer NOT NULL,
  series integer,
  repetitions integer,
  duree_secondes integer,
  repos_secondes integer,
  poids_kg numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 20. Recréer la table ressources_personnalisees
CREATE TABLE public.ressources_personnalisees (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  titre text NOT NULL,
  description text,
  type_ressource text NOT NULL,
  url text,
  fichier_path text,
  date_creation date DEFAULT CURRENT_DATE,
  tags text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 21. Créer les index
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_level ON clients(level);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_workout_id ON workout_exercises(workout_id);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_exercise_id ON workout_exercises(exercise_id);
CREATE INDEX IF NOT EXISTS idx_weekly_feedbacks_client_id ON weekly_feedbacks(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_data_client_id ON progress_data(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_resources_created_by ON resources(created_by);
CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON user_trophies(user_id);
CREATE INDEX IF NOT EXISTS idx_seances_client_id ON seances(client_id);
CREATE INDEX IF NOT EXISTS idx_exercices_seance_seance_id ON exercices_seance(seance_id);

-- 22. Créer les fonctions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 23. Créer les triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 24. Insérer les données de base
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd',
    'etienne.guimbard@gmail.com',
    'Etienne',
    'Guimbard',
    'coach',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 25. Vérifier que tout est créé
SELECT 
    schemaname, 
    tablename, 
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

