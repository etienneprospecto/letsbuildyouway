-- Migration pour créer la table coach_client_relations

-- Table des relations coach-client
CREATE TABLE IF NOT EXISTS public.coach_client_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  coach_email text NOT NULL,
  client_email text NOT NULL,
  relation_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_coach_client_relations_coach_id ON coach_client_relations(coach_id);
CREATE INDEX IF NOT EXISTS idx_coach_client_relations_client_id ON coach_client_relations(client_id);
CREATE INDEX IF NOT EXISTS idx_coach_client_relations_active ON coach_client_relations(relation_active);

-- Désactiver RLS temporairement pour les tests
ALTER TABLE coach_client_relations DISABLE ROW LEVEL SECURITY;
