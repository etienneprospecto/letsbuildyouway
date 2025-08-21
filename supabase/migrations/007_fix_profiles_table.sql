-- Migration 007: Vérification et correction de la table profiles
-- Date: 2025-01-20
-- Description: Vérifier la structure et corriger les problèmes

-- Vérifier la structure actuelle de la table profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier les contraintes
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Vérifier les politiques RLS
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Vérifier que la table existe et est accessible
SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'profiles' 
    AND table_schema = 'public'
) as table_exists;

-- Tester l'accès à la table (devrait retourner 0 lignes si vide)
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Vérifier les permissions
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- Si la table n'existe pas, la recréer
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE NOTICE 'Table profiles does not exist, recreating...';
        
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
        
        -- Recréer les politiques RLS
        ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Allow profile insertion" ON profiles;
        DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
        DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
        DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;
        
        CREATE POLICY "Allow profile insertion" ON profiles
            FOR INSERT WITH CHECK (true);
            
        CREATE POLICY "Users can view own profile" ON profiles
            FOR SELECT USING (auth.uid() = id);
            
        CREATE POLICY "Users can update own profile" ON profiles
            FOR UPDATE USING (auth.uid() = id);
            
        CREATE POLICY "Coaches can view client profiles" ON profiles
            FOR SELECT USING (role = 'coach' OR role = 'client');
            
        RAISE NOTICE 'Table profiles recreated successfully';
    ELSE
        RAISE NOTICE 'Table profiles exists';
    END IF;
END $$;
