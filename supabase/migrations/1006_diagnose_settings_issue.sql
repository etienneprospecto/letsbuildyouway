-- Script de diagnostic pour identifier le problème de synchronisation Settings

-- 1. Vérifier la structure de la table profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Vérifier la structure de la table clients
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'clients' 
ORDER BY ordinal_position;

-- 3. Vérifier les données existantes dans profiles
SELECT 
    id, 
    first_name, 
    last_name, 
    email, 
    phone, 
    bio, 
    role,
    created_at,
    updated_at
FROM profiles 
LIMIT 5;

-- 4. Vérifier les données existantes dans clients
SELECT 
    id, 
    first_name, 
    last_name, 
    contact, 
    phone, 
    age, 
    weight, 
    height, 
    primary_goal,
    coach_id,
    created_at,
    updated_at
FROM clients 
LIMIT 5;

-- 5. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('profiles', 'clients');

-- 6. Vérifier si RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('profiles', 'clients');
