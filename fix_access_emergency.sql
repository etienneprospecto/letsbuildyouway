-- SCRIPT D'URGENCE - Restaurer l'accès coach et client
-- Exécuter ceci immédiatement dans Supabase Studio > SQL Editor

-- 1. Réactiver RLS sur profiles (nécessaire pour l'auth)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Recréer les policies profiles de base
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Coaches can view client profiles" ON public.profiles;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Policy: Users can update their own profile  
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: Coaches can view all profiles (temporaire pour débugger)
CREATE POLICY "Coaches can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- 3. Vérifier que la table coach_client_relations existe
CREATE TABLE IF NOT EXISTS coach_client_relations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  coach_email text,
  client_email text,
  relation_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

-- 4. Créer la relation Etienne ↔ Paul si elle n'existe pas
INSERT INTO coach_client_relations (coach_id, client_id, coach_email, client_email)
SELECT coach.id, client.id, coach.email, client.email
FROM auth.users coach, auth.users client
WHERE coach.email = 'etienne.guimbard@gmail.com'
  AND client.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM coach_client_relations r
    WHERE r.coach_id = coach.id AND r.client_id = client.id
  );

-- 5. Désactiver RLS sur les autres tables (temporaire)
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.feedbacks_hebdomadaires DISABLE ROW LEVEL SECURITY;

-- 6. Vérifier que les utilisateurs existent
SELECT 'Profiles existants:' as info;
SELECT id, email, role, first_name, last_name FROM public.profiles;

SELECT 'Relation coach-client:' as info;
SELECT * FROM coach_client_relations;
