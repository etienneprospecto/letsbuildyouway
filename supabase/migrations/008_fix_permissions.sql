-- Migration 008: Correction des permissions sur la table profiles
-- Date: 2025-01-20
-- Description: Donner les bonnes permissions aux rôles anon et authenticated

-- Vérifier l'état actuel des permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- Donner les permissions nécessaires au rôle anon (pour l'inscription)
GRANT INSERT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO anon;

-- Donner les permissions nécessaires au rôle authenticated
GRANT SELECT ON public.profiles TO authenticated;
GRANT INSERT ON public.profiles TO authenticated;
GRANT UPDATE ON public.profiles TO authenticated;

-- Vérifier que les politiques RLS sont bien configurées
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Recréer les politiques RLS si nécessaire
DO $$
BEGIN
    -- Supprimer les anciennes politiques
    DROP POLICY IF EXISTS "Allow profile insertion" ON profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
    DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;
    
    -- Recréer les politiques avec les bonnes permissions
    CREATE POLICY "Allow profile insertion" ON profiles
        FOR INSERT WITH CHECK (true);
        
    CREATE POLICY "Users can view own profile" ON profiles
        FOR SELECT USING (auth.uid() = id);
        
    CREATE POLICY "Users can update own profile" ON profiles
        FOR UPDATE USING (auth.uid() = id);
        
    CREATE POLICY "Coaches can view client profiles" ON profiles
        FOR SELECT USING (role = 'coach' OR role = 'client');
        
    RAISE NOTICE 'Policies recreated successfully';
END $$;

-- Vérifier les nouvelles permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- Tester l'accès à la table
SELECT COUNT(*) as profile_count FROM public.profiles;
