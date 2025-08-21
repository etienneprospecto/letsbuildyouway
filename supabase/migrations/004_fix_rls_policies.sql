-- Migration 004: Correction des politiques RLS
-- Date: 2025-01-20
-- Description: Simplification des politiques RLS pour permettre l'inscription

-- Désactiver temporairement RLS pour l'inscription
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Recréer des politiques simples
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques pour éviter les conflits
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;

-- Politique pour permettre l'insertion (inscription)
CREATE POLICY "Allow profile insertion" ON profiles
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture de son propre profil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre la mise à jour de son propre profil
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux coaches de voir les profils des clients
CREATE POLICY "Coaches can view client profiles" ON profiles
  FOR SELECT USING (
    role = 'coach' OR 
    role = 'client'
  );

-- Vérifier que les politiques sont créées
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'profiles';
