-- Migration 006: Vérification de l'état de l'authentification
-- Date: 2025-01-20
-- Description: Vérifier l'état des utilisateurs et profils

-- Vérifier les utilisateurs dans auth.users
SELECT 
    id,
    email,
    created_at,
    raw_user_meta_data
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les profils dans public.profiles
SELECT 
    id,
    email,
    first_name,
    last_name,
    role,
    created_at
FROM public.profiles 
ORDER BY created_at DESC 
LIMIT 5;

-- Vérifier les politiques RLS sur profiles
SELECT 
    policyname,
    cmd,
    permissive,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- Vérifier que la fonction handle_new_user existe
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user' 
AND routine_schema = 'public';

-- Vérifier que le trigger existe
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    action_timing
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND trigger_schema = 'auth';
