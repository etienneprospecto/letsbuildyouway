-- Vérifier la structure actuelle de la table clients
DO $$
DECLARE
  col RECORD;
BEGIN
  RAISE LOG 'Checking clients table structure...';
  
  -- Lister toutes les colonnes de la table clients
  RAISE LOG 'Current columns in clients table:';
  FOR col IN 
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns 
    WHERE table_name = 'clients' AND table_schema = 'public'
    ORDER BY ordinal_position
  LOOP
    RAISE LOG 'Column: % - Type: % - Nullable: %', col.column_name, col.data_type, col.is_nullable;
  END LOOP;
END $$;

-- Supprimer la table clients si elle existe (pour repartir de zéro)
DROP TABLE IF EXISTS public.clients CASCADE;

-- Recréer la table clients complète
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  
  -- Informations de base
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other')),
  
  -- Informations physiques
  height_cm INTEGER,
  weight_kg DECIMAL(5,2),
  body_fat_percentage DECIMAL(4,2),
  muscle_mass_kg DECIMAL(5,2),
  
  -- Objectifs et statut
  primary_goal TEXT NOT NULL DEFAULT 'general_fitness',
  fitness_level TEXT NOT NULL DEFAULT 'beginner' CHECK (fitness_level IN ('beginner', 'intermediate', 'advanced')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'paused')),
  
  -- Dates importantes
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  last_session_date DATE,
  next_session_date DATE,
  
  -- Métriques de progression
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
  sessions_completed INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  
  -- Notes et commentaires
  notes TEXT,
  medical_conditions TEXT,
  dietary_restrictions TEXT,
  
  -- Métadonnées
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contraintes
  CONSTRAINT valid_height CHECK (height_cm > 0 AND height_cm < 300),
  CONSTRAINT valid_weight CHECK (weight_kg > 0 AND weight_kg < 500),
  CONSTRAINT valid_body_fat CHECK (body_fat_percentage >= 0 AND body_fat_percentage <= 50),
  CONSTRAINT valid_muscle_mass CHECK (muscle_mass_kg >= 0 AND muscle_mass_kg < 200)
);

-- Index pour les performances
CREATE INDEX idx_clients_coach_id ON public.clients(coach_id);
CREATE INDEX idx_clients_status ON public.clients(status);
CREATE INDEX idx_clients_start_date ON public.clients(start_date);
CREATE INDEX idx_clients_progress ON public.clients(progress_percentage);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at 
  BEFORE UPDATE ON public.clients 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- Coaches peuvent voir et gérer leurs propres clients
DROP POLICY IF EXISTS "Coaches can manage their own clients" ON public.clients;
CREATE POLICY "Coaches can manage their own clients" ON public.clients
  FOR ALL USING (coach_id = auth.uid());

-- Clients peuvent voir leurs propres informations
DROP POLICY IF EXISTS "Clients can view own data" ON public.clients;
CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (id = auth.uid());

-- Données d'exemple pour tester
INSERT INTO public.clients (
  coach_id,
  first_name,
  last_name,
  email,
  phone,
  primary_goal,
  fitness_level,
  status,
  progress_percentage,
  sessions_completed
) VALUES 
  ('ef371912-96dc-40bd-9e52-1f20815a0a15', 'Jean', 'Dupont', 'jean.dupont@email.com', '+33123456789', 'weight_loss', 'intermediate', 'active', 65, 12),
  ('ef371912-96dc-40bd-9e52-1f20815a0a15', 'Marie', 'Martin', 'marie.martin@email.com', '+33987654321', 'muscle_gain', 'beginner', 'active', 30, 8),
  ('ef371912-96dc-40bd-9e52-1f20815a0a15', 'Pierre', 'Bernard', 'pierre.bernard@email.com', '+33555555555', 'general_fitness', 'advanced', 'active', 85, 20);

-- Log de création
DO $$
BEGIN
  RAISE LOG 'Recreated clients table with correct structure and sample data';
END $$;
