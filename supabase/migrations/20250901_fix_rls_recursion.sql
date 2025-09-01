-- Migration pour résoudre la récursion infinie dans les politiques RLS
-- Désactive temporairement RLS sur la table clients

-- Désactiver RLS sur la table clients
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Vérifier que RLS est désactivé
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'clients';

-- Optionnel : Recréer des politiques RLS simples sans récursion
-- CREATE POLICY "coaches_can_see_own_clients" ON clients
--   FOR ALL USING (coach_id = auth.uid());

-- CREATE POLICY "clients_can_see_own_profile" ON clients
--   FOR ALL USING (id = auth.uid());
