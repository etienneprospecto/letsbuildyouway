-- Migration pour créer les tables de feedback manquantes

-- Créer les types enum nécessaires
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_status') THEN
    CREATE TYPE feedback_status AS ENUM ('draft', 'sent', 'in_progress', 'completed');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
    CREATE TYPE question_type AS ENUM ('text', 'scale_1_10', 'multiple_choice', 'yes_no');
  END IF;
END $$;

-- Table des templates de feedback
CREATE TABLE IF NOT EXISTS public.feedback_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Ajouter la colonne is_active si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback_templates' AND column_name = 'is_active') THEN
        ALTER TABLE public.feedback_templates ADD COLUMN is_active boolean DEFAULT true;
    END IF;
END $$;

-- Table des questions de feedback
CREATE TABLE IF NOT EXISTS public.feedback_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES feedback_templates(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type question_type NOT NULL,
  order_index integer NOT NULL,
  required boolean DEFAULT true,
  options jsonb, -- Pour les questions à choix multiple
  created_at timestamptz DEFAULT now()
);

-- Table des feedbacks hebdomadaires (version complète)
CREATE TABLE IF NOT EXISTS public.feedbacks_hebdomadaires (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  week_start date NOT NULL,
  week_end date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id, week_start)
);

-- Ajouter les colonnes manquantes à feedbacks_hebdomadaires
DO $$ 
BEGIN
    -- Ajouter coach_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'coach_id') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN coach_id uuid;
    END IF;
    
    -- Ajouter template_id si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'template_id') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN template_id uuid;
    END IF;
    
    -- Ajouter status si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'status') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN status feedback_status DEFAULT 'draft';
    END IF;
    
    -- Ajouter sent_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'sent_at') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN sent_at timestamptz;
    END IF;
    
    -- Ajouter completed_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'completed_at') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN completed_at timestamptz;
    END IF;
    
    -- Ajouter score si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedbacks_hebdomadaires' AND column_name = 'score') THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD COLUMN score integer CHECK (score >= 0 AND score <= 100);
    END IF;
END $$;

-- Ajouter les contraintes de clé étrangère pour feedbacks_hebdomadaires
DO $$ 
BEGIN
    -- Ajouter la contrainte client_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feedbacks_hebdomadaires_client_id_fkey'
    ) THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD CONSTRAINT feedbacks_hebdomadaires_client_id_fkey 
        FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE;
    END IF;
    
    -- Ajouter la contrainte coach_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feedbacks_hebdomadaires_coach_id_fkey'
    ) THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD CONSTRAINT feedbacks_hebdomadaires_coach_id_fkey 
        FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE;
    END IF;
    
    -- Ajouter la contrainte template_id si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'feedbacks_hebdomadaires_template_id_fkey'
    ) THEN
        ALTER TABLE public.feedbacks_hebdomadaires ADD CONSTRAINT feedbacks_hebdomadaires_template_id_fkey 
        FOREIGN KEY (template_id) REFERENCES feedback_templates(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Table des réponses aux feedbacks
CREATE TABLE IF NOT EXISTS public.feedback_responses (
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

-- Vérifier et corriger la table weekly_feedbacks existante
DO $$ 
BEGIN
    -- Vérifier si la table existe
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_feedbacks') THEN
        
        -- Ajouter les colonnes manquantes UNE PAR UNE
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'week_start') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN week_start date;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'week_end') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN week_end date;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'coach_id') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN coach_id uuid;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'template_id') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN template_id uuid;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'status') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN status feedback_status DEFAULT 'draft';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'sent_at') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN sent_at timestamptz;
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'completed_at') THEN
            ALTER TABLE public.weekly_feedbacks ADD COLUMN completed_at timestamptz;
        END IF;
        
        -- Copier les données des anciennes colonnes vers les nouvelles
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'week_start_date') THEN
            UPDATE public.weekly_feedbacks SET week_start = week_start_date WHERE week_start IS NULL;
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'week_end_date') THEN
            UPDATE public.weekly_feedbacks SET week_end = week_end_date WHERE week_end IS NULL;
        END IF;
        
    END IF;
END $$;

-- Ajouter les contraintes de clé étrangère APRÈS avoir créé les colonnes
DO $$ 
BEGIN
    -- Vérifier si la table existe ET si les colonnes existent
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_feedbacks') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'coach_id') THEN
        
        -- Ajouter la contrainte coach_id si elle n'existe pas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'weekly_feedbacks_coach_id_fkey'
        ) THEN
            ALTER TABLE public.weekly_feedbacks ADD CONSTRAINT weekly_feedbacks_coach_id_fkey 
            FOREIGN KEY (coach_id) REFERENCES profiles(id) ON DELETE CASCADE;
        END IF;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'weekly_feedbacks') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'weekly_feedbacks' AND column_name = 'template_id') THEN
        
        -- Ajouter la contrainte template_id si elle n'existe pas
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints 
            WHERE constraint_name = 'weekly_feedbacks_template_id_fkey'
        ) THEN
            ALTER TABLE public.weekly_feedbacks ADD CONSTRAINT weekly_feedbacks_template_id_fkey 
            FOREIGN KEY (template_id) REFERENCES feedback_templates(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;

-- Désactiver RLS temporairement pour les tests
ALTER TABLE feedback_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks_hebdomadaires DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_responses DISABLE ROW LEVEL SECURITY;
