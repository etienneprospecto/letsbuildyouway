-- Migration 009: Debug du trigger handle_new_user
-- Date: 2025-01-20
-- Description: Vérifier et corriger le trigger

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

-- Vérifier que la fonction existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Vérifier les logs récents (si activés)
-- SELECT * FROM pg_stat_activity WHERE query LIKE '%handle_new_user%';

-- Recréer complètement le trigger avec une fonction simplifiée
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Créer une fonction de test simple
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Log simple pour debug
    RAISE LOG '=== TRIGGER EXECUTED ===';
    RAISE LOG 'User ID: %', new.id;
    RAISE LOG 'Email: %', new.email;
    RAISE LOG 'Metadata: %', new.raw_user_meta_data;
    
    -- Vérifier que la table profiles existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles' AND table_schema = 'public') THEN
        RAISE LOG 'ERROR: Table profiles does not exist!';
        RETURN new;
    END IF;
    
    -- Insérer le profil avec gestion d'erreur
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            first_name, 
            last_name, 
            role
        ) VALUES (
            new.id,
            COALESCE(new.email, ''),
            COALESCE(new.raw_user_meta_data->>'first_name', ''),
            COALESCE(new.raw_user_meta_data->>'last_name', ''),
            COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role
        );
        
        RAISE LOG 'SUCCESS: Profile created for user %', new.id;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'ERROR creating profile: %', SQLERRM;
            RAISE LOG 'SQLSTATE: %', SQLSTATE;
    END;
    
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
WHERE trigger_name = 'on_auth_user_created';

-- Tester avec un utilisateur de test
-- (à supprimer après test)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_user_meta_data)
-- VALUES (
--     gen_random_uuid(),
--     'testtrigger@gmail.com',
--     'encrypted_password',
--     now(),
--     now(),
--     now(),
--     '{"first_name": "Trigger", "last_name": "Test", "role": "coach"}'::jsonb
-- );
