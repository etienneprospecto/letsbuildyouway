-- Migration 005: Debug et correction de handle_new_user
-- Date: 2025-01-20
-- Description: Vérification et correction de la fonction trigger

-- Vérifier l'état actuel des triggers
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Vérifier l'état de la fonction
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Vérifier que la table profiles existe et a la bonne structure
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Recréer complètement la fonction et le trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer une fonction plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    user_role text;
    first_name text;
    last_name text;
BEGIN
    -- Log pour debug
    RAISE LOG 'handle_new_user called for user: %', new.id;
    RAISE LOG 'Metadata: %', new.raw_user_meta_data;
    
    -- Extraire les métadonnées avec gestion des valeurs NULL
    user_role := COALESCE(new.raw_user_meta_data->>'role', 'client');
    first_name := COALESCE(new.raw_user_meta_data->>'first_name', '');
    last_name := COALESCE(new.raw_user_meta_data->>'last_name', '');
    
    RAISE LOG 'Extracted: role=%, first_name=%, last_name=%', user_role, first_name, last_name;
    
    -- Insérer le profil
    INSERT INTO public.profiles (
        id, 
        email, 
        first_name, 
        last_name, 
        role
    ) VALUES (
        new.id,
        COALESCE(new.email, ''),
        first_name,
        last_name,
        user_role::user_role
    );
    
    RAISE LOG 'Profile created successfully for user: %', new.id;
    
    RETURN new;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user for user %: %', new.id, SQLERRM;
        RAISE LOG 'SQLSTATE: %', SQLSTATE;
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
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';

-- Test: insérer un utilisateur de test pour vérifier
-- (à supprimer après test)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES (
--     gen_random_uuid(),
--     'test@example.com',
--     'encrypted_password',
--     now(),
--     now(),
--     now(),
--     '{"first_name": "Test", "last_name": "User", "role": "coach"}'::jsonb
-- );
