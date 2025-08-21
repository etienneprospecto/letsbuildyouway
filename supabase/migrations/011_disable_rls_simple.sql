-- Migration 011: Désactiver RLS et simplifier le trigger
-- Date: 2025-01-20
-- Description: Désactiver RLS temporairement pour identifier le problème

-- Désactiver RLS sur la table profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Supprimer toutes les politiques RLS
DROP POLICY IF EXISTS "Allow profile insertion" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;

-- Vérifier que RLS est désactivé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles';

-- Supprimer et recréer le trigger avec une fonction ultra-simple
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer une fonction ultra-simple sans gestion d'erreur complexe
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Log simple
    RAISE LOG 'TRIGGER: Creating profile for user %', new.id;
    
    -- Insérer le profil directement
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role
    ) VALUES (
        new.id,
        new.email,
        COALESCE(new.raw_user_meta_data->>'first_name', ''),
        COALESCE(new.raw_user_meta_data->>'last_name', ''),
        COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role
    );
    
    RAISE LOG 'SUCCESS: Profile created for user %', new.id;
    
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'ERROR in trigger: %', SQLERRM;
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que le trigger est créé
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    event_object_schema,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier que la fonction existe
SELECT 
    routine_name,
    routine_schema,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Tester l'accès direct à la table (devrait fonctionner sans RLS)
SELECT COUNT(*) as profile_count FROM public.profiles;
