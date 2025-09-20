-- Script de test pour vérifier le système de facturation
-- À exécuter après setup_billing_tables.sql

-- 1. Vérifier que toutes les tables existent
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'pricing_plans', 'subscriptions', 'invoices', 'payments', 
            'payment_reminders', 'payment_settings', 'stripe_webhooks', 'reminder_templates'
        ) THEN '✅ Table créée'
        ELSE '❌ Table manquante'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'pricing_plans', 'subscriptions', 'invoices', 'payments', 
    'payment_reminders', 'payment_settings', 'stripe_webhooks', 'reminder_templates'
)
ORDER BY table_name;

-- 2. Vérifier que tous les types ENUM existent
SELECT 
    typname as enum_name,
    CASE 
        WHEN typname IN (
            'billing_interval', 'subscription_status', 'invoice_status', 
            'payment_status', 'payment_method', 'reminder_type', 'reminder_status'
        ) THEN '✅ Type créé'
        ELSE '❌ Type manquant'
    END as status
FROM pg_type 
WHERE typtype = 'e' 
AND typname IN (
    'billing_interval', 'subscription_status', 'invoice_status', 
    'payment_status', 'payment_method', 'reminder_type', 'reminder_status'
)
ORDER BY typname;

-- 3. Vérifier que les index existent
SELECT 
    indexname,
    CASE 
        WHEN indexname LIKE 'idx_%' THEN '✅ Index créé'
        ELSE '❌ Index manquant'
    END as status
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY indexname;

-- 4. Vérifier que RLS est activé
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS activé'
        ELSE '❌ RLS désactivé'
    END as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'pricing_plans', 'subscriptions', 'invoices', 'payments', 
    'payment_reminders', 'payment_settings', 'stripe_webhooks', 'reminder_templates'
)
ORDER BY tablename;

-- 5. Vérifier que les fonctions existent
SELECT 
    routine_name,
    CASE 
        WHEN routine_name IN ('get_coach_financial_stats', 'update_updated_at_column') THEN '✅ Fonction créée'
        ELSE '❌ Fonction manquante'
    END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('get_coach_financial_stats', 'update_updated_at_column')
ORDER BY routine_name;

-- 6. Test de création d'un plan tarifaire (remplacer USER_ID par un ID d'utilisateur coach existant)
-- SELECT gen_random_uuid() as test_plan_id;

-- 7. Vérifier les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    CASE 
        WHEN policyname IS NOT NULL THEN '✅ Politique créée'
        ELSE '❌ Politique manquante'
    END as status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
    'pricing_plans', 'subscriptions', 'invoices', 'payments', 
    'payment_reminders', 'payment_settings', 'stripe_webhooks', 'reminder_templates'
)
ORDER BY tablename, policyname;

-- 8. Compter les templates de relance créés
SELECT 
    COUNT(*) as total_templates,
    COUNT(DISTINCT coach_id) as coaches_with_templates,
    reminder_type,
    COUNT(*) as templates_per_type
FROM reminder_templates 
GROUP BY reminder_type
ORDER BY reminder_type;

-- 9. Vérifier les triggers
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    CASE 
        WHEN trigger_name LIKE '%updated_at%' THEN '✅ Trigger créé'
        ELSE '❌ Trigger manquant'
    END as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public' 
AND event_object_table IN (
    'pricing_plans', 'subscriptions', 'invoices', 
    'payment_settings', 'reminder_templates'
)
ORDER BY event_object_table, trigger_name;

-- 10. Test de la fonction de statistiques financières
-- (Décommentez et remplacez USER_ID par un ID d'utilisateur coach existant)
-- SELECT get_coach_financial_stats('USER_ID'::UUID) as financial_stats;

-- Résumé du test
SELECT 
    'Résumé du test' as test_type,
    'Vérifiez que toutes les colonnes "status" affichent ✅' as instruction,
    'Si des ❌ apparaissent, relancez le script setup_billing_tables.sql' as action;
