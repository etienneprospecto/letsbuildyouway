-- Script d'urgence : DÉSACTIVER RLS SUR TOUTES LES TABLES
-- ATTENTION : Ceci supprime TOUTE la sécurité des données

-- Désactiver RLS sur toutes les tables du schéma public
DO $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename 
        FROM pg_tables 
        WHERE schemaname = 'public' 
        AND rowsecurity = true
    ) LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
        RAISE NOTICE 'RLS désactivé sur %.%', r.schemaname, r.tablename;
    END LOOP;
END $$;

-- Supprimer TOUTES les politiques RLS du schéma public
DO $$
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
        RAISE NOTICE 'Politique supprimée: % sur %.%', r.policyname, r.schemaname, r.tablename;
    END LOOP;
END $$;

-- Vérifier l'état final
SELECT 
    schemaname, 
    tablename, 
    rowsecurity,
    CASE WHEN rowsecurity THEN 'RLS ACTIF' ELSE 'RLS DÉSACTIVÉ' END as status
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;

-- Compter les politiques restantes
SELECT COUNT(*) as politiques_restantes
FROM pg_policies 
WHERE schemaname = 'public';

