-- Migration 048: Création du système de feedback hebdomadaire complet
-- Date: 2025-09-01
-- Description: Système complet de feedback avec templates, questions et réponses

-- Créer les types enum nécessaires
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE feedback_status AS ENUM ('draft', 'sent', 'in_progress', 'completed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
    CREATE TYPE question_type AS ENUM ('text', 'scale_1_10', 'multiple_choice', 'yes_no');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('coach', 'client');
  END IF;
END $$;

-- Table des profils utilisateurs (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'client',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des clients (si elle n'existe pas)
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text UNIQUE NOT NULL,
  age integer CHECK (age >= 16 AND age <= 100),
  photo_url text,
  objective text NOT NULL,
  level text NOT NULL CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  mentality text NOT NULL,
  coaching_type text NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
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

-- Table des templates de feedback
CREATE TABLE IF NOT EXISTS feedback_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des questions de feedback
CREATE TABLE IF NOT EXISTS feedback_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  order_index integer NOT NULL,
  required boolean DEFAULT true,
  options jsonb, -- Pour les questions à choix multiple
  created_at timestamptz DEFAULT now()
);

-- Table des feedbacks hebdomadaires
CREATE TABLE IF NOT EXISTS feedbacks_hebdomadaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  template_id uuid REFERENCES feedback_templates(id) ON DELETE SET NULL,
  week_start date NOT NULL,
  week_end date NOT NULL,
  alimentary_scores jsonb,
  lifestyle_scores jsonb,
  feelings_scores jsonb,
  alimentary_comment text,
  lifestyle_comment text,
  feelings_comment text,
  score integer CHECK (score >= 0 AND score <= 100),
  status feedback_status DEFAULT 'draft',
  sent_at timestamptz,
  completed_at timestamptz,
  submitted_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, week_start)
);

-- Table des réponses aux feedbacks
CREATE TABLE IF NOT EXISTS feedback_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feedback_id uuid NOT NULL REFERENCES feedbacks_hebdomadaires(id) ON DELETE CASCADE,
  question_id uuid NOT NULL REFERENCES feedback_questions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  response jsonb NOT NULL, -- Peut contenir texte, nombre, ou tableau
  created_at timestamptz DEFAULT now()
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_feedback_templates_coach_id ON feedback_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_feedback_questions_template_id ON feedback_questions(template_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_coach_id ON feedbacks_hebdomadaires(coach_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_client_id ON feedbacks_hebdomadaires(client_id);
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_status ON feedbacks_hebdomadaires(status);
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdomadaires_week_start ON feedbacks_hebdomadaires(week_start);
CREATE INDEX IF NOT EXISTS idx_feedback_responses_feedback_id ON feedback_responses(feedback_id);
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- RLS Policies pour profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid()::text = id::text);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid()::text = id::text);

-- RLS Policies pour clients
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own clients" ON clients
  FOR ALL USING (coach_id::text = auth.uid()::text);

CREATE POLICY "Clients can view own profile" ON clients
  FOR SELECT USING (
    id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON c.id = p.id
      WHERE p.id::text = auth.uid()::text
    )
  );

-- RLS Policies pour feedback_templates
ALTER TABLE feedback_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own templates" ON feedback_templates
  FOR ALL USING (coach_id::text = auth.uid()::text);

-- RLS Policies pour feedback_questions
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage questions in own templates" ON feedback_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM feedback_templates 
      WHERE feedback_templates.id = feedback_questions.template_id 
      AND feedback_templates.coach_id::text = auth.uid()::text
    )
  );

-- RLS Policies pour feedbacks_hebdomadaires
ALTER TABLE feedbacks_hebdomadaires ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own feedbacks" ON feedbacks_hebdomadaires
  FOR ALL USING (coach_id::text = auth.uid()::text);

CREATE POLICY "Clients can view own feedbacks" ON feedbacks_hebdomadaires
  FOR SELECT USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON c.id = p.id
      WHERE p.id::text = auth.uid()::text
    )
  );

CREATE POLICY "Clients can update own feedbacks" ON feedbacks_hebdomadaires
  FOR UPDATE USING (
    client_id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON c.id = p.id
      WHERE p.id::text = auth.uid()::text
    )
  );

-- RLS Policies pour feedback_responses
ALTER TABLE feedback_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can view responses of own feedbacks" ON feedback_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.coach_id::text = auth.uid()::text
    )
  );

CREATE POLICY "Clients can manage own responses" ON feedback_responses
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.client_id IN (
        SELECT c.id FROM clients c
        JOIN profiles p ON c.id = p.id
        WHERE p.id::text = auth.uid()::text
      )
    )
  );

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at (création conditionnelle)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feedback_templates_updated_at') THEN
    CREATE TRIGGER update_feedback_templates_updated_at 
      BEFORE UPDATE ON feedback_templates 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_feedbacks_hebdomadaires_updated_at') THEN
    CREATE TRIGGER update_feedbacks_hebdomadaires_updated_at 
      BEFORE UPDATE ON feedbacks_hebdomadaires 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_profiles_updated_at') THEN
    CREATE TRIGGER update_profiles_updated_at 
      BEFORE UPDATE ON profiles 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_clients_updated_at') THEN
    CREATE TRIGGER update_clients_updated_at 
      BEFORE UPDATE ON clients 
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

-- Fonction pour calculer automatiquement le score d'un feedback
CREATE OR REPLACE FUNCTION calculate_feedback_score()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculer le score basé sur les réponses
  -- Cette fonction peut être personnalisée selon vos besoins
  NEW.score = 0;
  
  -- Exemple de calcul simple (à adapter selon vos besoins)
  IF NEW.responses IS NOT NULL THEN
    -- Logique de calcul du score
    NEW.score = 50; -- Score par défaut
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour calculer automatiquement le score (création conditionnelle)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'calculate_feedback_score_trigger') THEN
    CREATE TRIGGER calculate_feedback_score_trigger
      BEFORE INSERT OR UPDATE ON feedbacks_hebdomadaires
      FOR EACH ROW EXECUTE FUNCTION calculate_feedback_score();
  END IF;
END $$;

-- Vérification des tables créées
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'clients', 'feedback_templates', 'feedback_questions', 'feedbacks_hebdomadaires', 'feedback_responses')
ORDER BY tablename;
