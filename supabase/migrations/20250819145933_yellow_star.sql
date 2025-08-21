/*
  # Schema initial pour FitCoach Pro

  1. Tables principales
    - `profiles` - Profils utilisateurs (coaches et clients)
    - `clients` - Informations détaillées des clients
    - `exercises` - Base de données d'exercices
    - `workouts` - Séances d'entraînement
    - `workout_exercises` - Relation exercices/séances
    - `weekly_feedbacks` - Feedbacks hebdomadaires clients
    - `progress_data` - Données de progression physique
    - `sessions` - Sessions d'entraînement planifiées/réalisées
    - `conversations` - Conversations coach/client
    - `messages` - Messages dans les conversations
    - `resources` - Ressources partagées
    - `trophies` - Système de trophées
    - `user_trophies` - Trophées débloqués par utilisateur

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques d'accès basées sur les rôles
    - Isolation des données par coach/client

  3. Fonctionnalités
    - Authentification email/password
    - Gestion des rôles (coach/client)
    - Système de messaging
    - Suivi de progression
    - Gamification avec trophées
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('coach', 'client');
CREATE TYPE exercise_theme AS ENUM (
  'Full Body', 'Upper Body', 'Lower Body', 'Core', 
  'Mobilité', 'Assouplissement', 'Respiration', 
  'Circuit Training', 'Split', 'Yoga/Flow', 'Force/Explosivité'
);
CREATE TYPE session_status AS ENUM ('upcoming', 'completed', 'missed');
CREATE TYPE message_type AS ENUM ('text', 'image', 'resource', 'exercise');
CREATE TYPE resource_type AS ENUM ('video', 'pdf', 'link', 'text');
CREATE TYPE trophy_category AS ENUM ('engagement', 'discipline', 'objective', 'curiosity');
CREATE TYPE trophy_type AS ENUM ('simple', 'progressive');

-- Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
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

-- Exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  theme exercise_theme NOT NULL,
  video_url text,
  objective text NOT NULL,
  instructions text NOT NULL,
  common_mistakes text NOT NULL,
  variations text,
  image_url text,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  is_custom boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workouts table
CREATE TABLE IF NOT EXISTS workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  themes text[] NOT NULL,
  level text NOT NULL CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  duration integer,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Workout exercises junction table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id uuid NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  sets integer NOT NULL,
  reps text NOT NULL,
  rest text NOT NULL,
  order_index integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Weekly feedbacks table
CREATE TABLE IF NOT EXISTS weekly_feedbacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  alimentary_scores jsonb NOT NULL,
  lifestyle_scores jsonb NOT NULL,
  feelings_scores jsonb NOT NULL,
  alimentary_comment text,
  lifestyle_comment text,
  feelings_comment text,
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, week_start)
);

-- Progress data table
CREATE TABLE IF NOT EXISTS progress_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  date date NOT NULL,
  weight decimal(5,2),
  body_fat decimal(5,2),
  muscle_mass decimal(5,2),
  measurements jsonb,
  photos text[],
  created_at timestamptz DEFAULT now(),
  UNIQUE(client_id, date)
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  workout_id uuid NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  status session_status DEFAULT 'upcoming',
  intensity integer CHECK (intensity >= 1 AND intensity <= 10),
  mood text,
  comment text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at timestamptz,
  unread_count integer DEFAULT 0,
  is_priority boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, coach_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  sender_type user_role NOT NULL,
  content text NOT NULL,
  type message_type DEFAULT 'text',
  resource_id uuid,
  exercise_id uuid REFERENCES exercises(id),
  image_url text,
  read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  type resource_type NOT NULL,
  url text,
  content text,
  week_start date NOT NULL,
  created_by uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Trophies table
CREATE TABLE IF NOT EXISTS trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  category trophy_category NOT NULL,
  type trophy_type NOT NULL,
  levels integer[],
  icon text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- User trophies table
CREATE TABLE IF NOT EXISTS user_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  trophy_id uuid NOT NULL REFERENCES trophies(id) ON DELETE CASCADE,
  earned boolean DEFAULT false,
  earned_at timestamptz,
  progress integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, trophy_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trophies ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for clients
CREATE POLICY "Coaches can manage their clients"
  ON clients
  FOR ALL
  TO authenticated
  USING (coach_id = auth.uid());

CREATE POLICY "Clients can read own data"
  ON clients
  FOR SELECT
  TO authenticated
  USING (id IN (
    SELECT id FROM clients WHERE coach_id = auth.uid()
    UNION
    SELECT c.id FROM clients c 
    JOIN profiles p ON p.id = auth.uid() 
    WHERE p.role = 'client' AND c.contact = p.email
  ));

-- RLS Policies for exercises
CREATE POLICY "Everyone can read exercises"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coaches can manage exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for workouts
CREATE POLICY "Coaches can manage their workouts"
  ON workouts
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- RLS Policies for workout_exercises
CREATE POLICY "Users can access workout exercises"
  ON workout_exercises
  FOR SELECT
  TO authenticated
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Coaches can manage workout exercises"
  ON workout_exercises
  FOR ALL
  TO authenticated
  USING (
    workout_id IN (
      SELECT id FROM workouts WHERE created_by = auth.uid()
    )
  );

-- RLS Policies for weekly_feedbacks
CREATE POLICY "Coaches can read client feedbacks"
  ON weekly_feedbacks
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can manage own feedbacks"
  ON weekly_feedbacks
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN profiles p ON p.id = auth.uid() 
      WHERE p.role = 'client' AND c.contact = p.email
    )
  );

-- RLS Policies for progress_data
CREATE POLICY "Coaches can read client progress"
  ON progress_data
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can manage own progress"
  ON progress_data
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN profiles p ON p.id = auth.uid() 
      WHERE p.role = 'client' AND c.contact = p.email
    )
  );

-- RLS Policies for sessions
CREATE POLICY "Coaches can manage client sessions"
  ON sessions
  FOR ALL
  TO authenticated
  USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can read own sessions"
  ON sessions
  FOR SELECT
  TO authenticated
  USING (
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN profiles p ON p.id = auth.uid() 
      WHERE p.role = 'client' AND c.contact = p.email
    )
  );

-- RLS Policies for conversations
CREATE POLICY "Users can access their conversations"
  ON conversations
  FOR ALL
  TO authenticated
  USING (
    coach_id = auth.uid() OR 
    client_id IN (
      SELECT c.id FROM clients c 
      JOIN profiles p ON p.id = auth.uid() 
      WHERE p.role = 'client' AND c.contact = p.email
    )
  );

-- RLS Policies for messages
CREATE POLICY "Users can access conversation messages"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    conversation_id IN (
      SELECT id FROM conversations 
      WHERE coach_id = auth.uid() OR 
      client_id IN (
        SELECT c.id FROM clients c 
        JOIN profiles p ON p.id = auth.uid() 
        WHERE p.role = 'client' AND c.contact = p.email
      )
    )
  );

-- RLS Policies for resources
CREATE POLICY "Coaches can manage resources"
  ON resources
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

CREATE POLICY "Clients can read resources"
  ON resources
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for trophies
CREATE POLICY "Everyone can read trophies"
  ON trophies
  FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policies for user_trophies
CREATE POLICY "Users can manage own trophies"
  ON user_trophies
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_exercises_theme ON exercises(theme);
CREATE INDEX IF NOT EXISTS idx_workouts_created_by ON workouts(created_by);
CREATE INDEX IF NOT EXISTS idx_weekly_feedbacks_client_id ON weekly_feedbacks(client_id);
CREATE INDEX IF NOT EXISTS idx_weekly_feedbacks_week_start ON weekly_feedbacks(week_start);
CREATE INDEX IF NOT EXISTS idx_progress_data_client_id ON progress_data(client_id);
CREATE INDEX IF NOT EXISTS idx_progress_data_date ON progress_data(date);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_scheduled_date ON sessions(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_conversations_coach_id ON conversations(coach_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_user_trophies_user_id ON user_trophies(user_id);

-- Function to handle profile creation
CREATE OR REPLACE FUNCTION handle_new_user()
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

-- Trigger for profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workouts_updated_at
  BEFORE UPDATE ON workouts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();