-- Migration 088: Correction critique de l'isolation des données clients
-- Date: 2025-01-20
-- Description: Ajouter user_id à la table clients pour l'isolation par utilisateur

-- 1. Ajouter la colonne user_id à la table clients
ALTER TABLE public.clients 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE;

-- 2. Créer un index pour les performances
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON public.clients(user_id);

-- 3. Mettre à jour les clients existants avec leur user_id correspondant
-- (Cette requête suppose que l'email du client correspond à l'email dans auth.users)
UPDATE public.clients 
SET user_id = au.id
FROM auth.users au
WHERE clients.email = au.email
AND clients.user_id IS NULL;

-- 4. Supprimer les anciennes policies RLS incorrectes
DROP POLICY IF EXISTS "Coaches can manage own clients" ON public.clients;
DROP POLICY IF EXISTS "Clients can view own profile" ON public.clients;

-- 5. Créer les nouvelles policies RLS avec isolation par user_id
-- Policy pour les coaches : peuvent voir leurs clients
CREATE POLICY "Coaches can manage own clients" ON public.clients
  FOR ALL USING (coach_id = auth.uid());

-- Policy pour les clients : peuvent voir UNIQUEMENT leurs propres données
CREATE POLICY "Clients can view own data" ON public.clients
  FOR SELECT USING (user_id = auth.uid());

-- 6. Activer RLS sur la table clients
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 7. Créer des policies pour les tables liées (séances, workouts, etc.)
-- Policy pour les séances : isolation par client
DROP POLICY IF EXISTS "Clients can view own seances" ON public.seances;
CREATE POLICY "Clients can view own seances" ON public.seances
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- Policy pour les workouts : isolation par client
DROP POLICY IF EXISTS "Clients can view own workouts" ON public.workouts;
CREATE POLICY "Clients can view own workouts" ON public.workouts
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM public.clients WHERE user_id = auth.uid()
    )
  );

-- 8. Vérifier l'isolation
-- Cette requête doit retourner uniquement les données du client connecté
-- SELECT * FROM public.clients WHERE user_id = auth.uid();

-- 9. Ajouter une contrainte d'unicité pour éviter les doublons
ALTER TABLE public.clients 
ADD CONSTRAINT unique_client_user_id UNIQUE (user_id);

-- 10. Log de la migration
INSERT INTO public.migration_logs (migration_name, applied_at, description)
VALUES (
  '088_fix_clients_user_id_isolation',
  NOW(),
  'Correction critique de l''isolation des données clients avec user_id'
) ON CONFLICT DO NOTHING;
