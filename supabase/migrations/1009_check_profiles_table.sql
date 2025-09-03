-- Script pour vérifier la structure de la table profiles

-- 1. Vérifier la structure de la table profiles
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY ordinal_position;

-- 2. Vérifier les données existantes dans profiles
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
WHERE role = 'coach'
LIMIT 5;
