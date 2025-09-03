-- Migration d'urgence pour restaurer l'accès aux tables
-- Restaure les permissions de base pour permettre la connexion

-- DÉSACTIVER COMPLÈTEMENT RLS EN URGENCE pour permettre la connexion
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques existantes pour éviter les conflits
DROP POLICY IF EXISTS "users_can_manage_own_profile" ON public.profiles;
DROP POLICY IF EXISTS "users_can_manage_own_client_profile" ON public.clients;
DROP POLICY IF EXISTS "coaches_can_see_own_clients" ON public.clients;
DROP POLICY IF EXISTS "coaches_can_modify_own_clients" ON public.clients;
DROP POLICY IF EXISTS "Allow profile insertion" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

-- Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'clients')
ORDER BY tablename;
