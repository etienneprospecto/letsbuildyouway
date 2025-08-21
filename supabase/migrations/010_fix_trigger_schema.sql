-- Migration 010: Correction du schéma du trigger
-- Date: 2025-01-20
-- Description: Corriger le schéma du trigger et vérifier son fonctionnement

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

-- Supprimer et recréer le trigger avec le bon schéma
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer une fonction de test plus robuste
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    profile_count integer;
BEGIN
    -- Log pour debug
    RAISE LOG '=== TRIGGER EXECUTED ===';
    RAISE LOG 'Schema: %', TG_TABLE_SCHEMA;
    RAISE LOG 'Table: %', TG_TABLE_NAME;
    RAISE LOG 'User ID: %', new.id;
    RAISE LOG 'Email: %', new.email;
    RAISE LOG 'Metadata: %', new.raw_user_meta_data;
    
    -- Vérifier que la table profiles existe
    SELECT COUNT(*) INTO profile_count 
    FROM information_schema.tables 
    WHERE table_name = 'profiles' AND table_schema = 'public';
    
    IF profile_count = 0 THEN
        RAISE LOG 'ERROR: Table profiles does not exist!';
        RETURN new;
    END IF;
    
    -- Vérifier que l'utilisateur n'a pas déjà un profil
    SELECT COUNT(*) INTO profile_count 
    FROM public.profiles 
    WHERE id = new.id;
    
    IF profile_count > 0 THEN
        RAISE LOG 'WARNING: Profile already exists for user %', new.id;
        RETURN new;
    END IF;
    
    -- Insérer le profil
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
        
        -- Vérifier que le profil a bien été créé
        SELECT COUNT(*) INTO profile_count 
        FROM public.profiles 
        WHERE id = new.id;
        
        RAISE LOG 'Profile count after creation: %', profile_count;
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE LOG 'ERROR creating profile: %', SQLERRM;
            RAISE LOG 'SQLSTATE: %', SQLSTATE;
            RAISE LOG 'Detail: %', SQLERRM_DETAIL;
    END;
    
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger sur le bon schéma
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

-- Tester manuellement la fonction
-- SELECT public.handle_new_user();

-- Vérifier les permissions sur la fonction
SELECT 
    grantee,
    privilege_type,
    is_grantable
FROM information_schema.routine_privileges 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';
