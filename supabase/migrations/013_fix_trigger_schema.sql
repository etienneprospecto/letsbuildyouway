-- Migration 013: Correction du schéma du trigger
-- Date: 2025-01-20
-- Description: S'assurer que le trigger s'exécute sur le bon schéma

-- Vérifier l'état actuel du trigger
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    event_object_schema,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier que la fonction existe dans le bon schéma
SELECT 
    routine_name,
    routine_schema,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Supprimer complètement le trigger et la fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer une fonction de test ultra-simple
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Log simple pour debug
    RAISE LOG '=== TRIGGER EXECUTED ===';
    RAISE LOG 'Schema: %', TG_TABLE_SCHEMA;
    RAISE LOG 'Table: %', TG_TABLE_NAME;
    RAISE LOG 'User ID: %', new.id;
    RAISE LOG 'Email: %', new.email;
    RAISE LOG 'Metadata: %', new.raw_user_meta_data;
    
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
        RAISE LOG 'SQLSTATE: %', SQLSTATE;
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger sur le schéma auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que le trigger est créé sur le bon schéma
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing,
    event_object_schema,
    event_object_table
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Vérifier que la fonction est accessible
SELECT 
    routine_name,
    routine_schema,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Tester l'accès à la table profiles
SELECT COUNT(*) as profile_count FROM public.profiles;

-- Vérifier que le type user_role existe
SELECT 
    typname,
    typtype,
    typlen
FROM pg_type 
WHERE typname = 'user_role';
