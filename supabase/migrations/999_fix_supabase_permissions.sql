-- Script d'urgence : CORRIGER LES PERMISSIONS SUPABASE
-- Le problème est au niveau des rôles, pas juste RLS

-- Donner tous les droits au rôle authenticated sur le schéma public
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Donner tous les droits au rôle anon sur le schéma public (pour la connexion)
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon;

-- S'assurer que les futures tables auront les bonnes permissions
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon;

-- Vérifier les permissions actuelles
SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type
FROM information_schema.table_privileges 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'clients')
ORDER BY grantee, table_name, privilege_type;

