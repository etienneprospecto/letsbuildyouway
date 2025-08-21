-- Script de diagnostic pour vérifier la structure de la table workouts
-- Exécutez ce script pour voir la structure réelle de la table

-- 1. Vérifier la structure de la table workouts
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'workouts' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Vérifier les contraintes de la table workouts
SELECT 
    constraint_name,
    constraint_type,
    table_name
FROM information_schema.table_constraints 
WHERE table_name = 'workouts' 
AND table_schema = 'public';

-- 3. Vérifier les contraintes NOT NULL
SELECT 
    c.column_name,
    c.is_nullable
FROM information_schema.columns c
WHERE c.table_name = 'workouts' 
AND c.table_schema = 'public'
AND c.is_nullable = 'NO';

-- 4. Vérifier les références (foreign keys)
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name = 'workouts'
AND tc.table_schema = 'public';
