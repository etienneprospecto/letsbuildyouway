-- Migration 012: Test manuel du trigger
-- Date: 2025-01-20
-- Description: Tester manuellement le trigger pour identifier le problème

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

-- Vérifier que la fonction existe et est accessible
SELECT 
    routine_name,
    routine_schema,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Vérifier les permissions sur la fonction
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Tester manuellement la fonction avec des données de test
DO $$
DECLARE
    test_user_id uuid := gen_random_uuid();
    test_metadata jsonb := '{"first_name": "Test", "last_name": "User", "role": "coach"}'::jsonb;
    result text;
BEGIN
    RAISE NOTICE 'Testing trigger function manually...';
    RAISE NOTICE 'Test user ID: %', test_user_id;
    RAISE NOTICE 'Test metadata: %', test_metadata;
    
    -- Tester l'insertion directe dans profiles (simulation du trigger)
    BEGIN
        INSERT INTO public.profiles (
            id, 
            email, 
            first_name, 
            last_name, 
            role
        ) VALUES (
            test_user_id,
            'test@example.com',
            test_metadata->>'first_name',
            test_metadata->>'last_name',
            (test_metadata->>'role')::user_role
        );
        
        RAISE NOTICE 'SUCCESS: Direct profile insertion works';
        
        -- Vérifier que le profil a été créé
        SELECT COUNT(*) INTO result FROM public.profiles WHERE id = test_user_id;
        RAISE NOTICE 'Profile count after insertion: %', result;
        
        -- Nettoyer le test
        DELETE FROM public.profiles WHERE id = test_user_id;
        RAISE NOTICE 'Test profile cleaned up';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR in direct insertion: %', SQLERRM;
    END;
    
    -- Tester l'appel direct de la fonction
    BEGIN
        -- Simuler l'appel de la fonction (sans le trigger)
        RAISE NOTICE 'Testing function call...';
        -- Note: On ne peut pas appeler directement une fonction trigger sans le trigger
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'ERROR in function test: %', SQLERRM;
    END;
    
END $$;

-- Vérifier que la table profiles est accessible
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE tablename = 'profiles';

-- Vérifier les contraintes sur la table profiles
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    tc.table_name,
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'profiles' 
AND tc.table_schema = 'public';

-- Vérifier que le type user_role existe
SELECT 
    typname,
    typtype,
    typlen
FROM pg_type 
WHERE typname = 'user_role';
