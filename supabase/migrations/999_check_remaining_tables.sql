-- SCRIPT POUR VOIR QUOI IL RESTE DE CETTE MERDE

-- 1. Voir TOUTES les tables dans TOUS les schémas
SELECT 
    schemaname,
    tablename,
    tableowner,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, tablename;

-- 2. Voir les tables dans le schéma public spécifiquement
SELECT 
    'PUBLIC SCHEMA' as schema_type,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Voir les vues aussi
SELECT 
    'VIEWS' as type,
    schemaname,
    viewname
FROM pg_views 
WHERE schemaname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY schemaname, viewname;

-- 4. Voir les types personnalisés
SELECT 
    'CUSTOM TYPES' as type,
    n.nspname as schema_name,
    t.typname as type_name,
    t.typtype as type_type
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY n.nspname, t.typname;

-- 5. Voir les fonctions
SELECT 
    'FUNCTIONS' as type,
    n.nspname as schema_name,
    p.proname as function_name
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('information_schema', 'pg_catalog', 'pg_toast')
ORDER BY n.nspname, p.proname;

-- 6. Compter les données dans chaque table du schéma public
SELECT 
    'DATA COUNT' as type,
    schemaname,
    relname as tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_rows,
    n_dead_tup as dead_rows
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;

-- 7. Voir les contraintes et clés étrangères
SELECT 
    'CONSTRAINTS' as type,
    tc.table_schema,
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
ORDER BY tc.table_name, tc.constraint_type;

-- 8. Voir les index
SELECT 
    'INDEXES' as type,
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- 9. Voir les triggers
SELECT 
    'TRIGGERS' as type,
    trigger_schema,
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- 10. Résumé final
SELECT 
    'SUMMARY' as type,
    'Tables in public' as description,
    COUNT(*) as count
FROM pg_tables 
WHERE schemaname = 'public'
UNION ALL
SELECT 
    'SUMMARY' as type,
    'Total rows in public tables' as description,
    SUM(n_live_tup) as count
FROM pg_stat_user_tables 
WHERE schemaname = 'public';
