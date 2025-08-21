-- Migration 036: Désactiver temporairement les RLS pour débugger
-- Date: 2025-08-21

-- 1. Désactiver RLS sur la table clients
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 2. Désactiver RLS sur la table profiles
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- 3. Vérifier que les RLS sont désactivés
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('clients', 'profiles', 'workouts', 'workout_exercises', 'exercises');

-- 4. Tester l'accès aux données
SELECT 'Testing clients access' as test, COUNT(*) as count FROM public.clients;
SELECT 'Testing profiles access' as test, COUNT(*) as count FROM public.profiles;

-- 5. Vérifier Paul spécifiquement
SELECT 'Paul in clients' as test, * FROM public.clients WHERE email = 'paulfst.business@gmail.com';
SELECT 'Paul in profiles' as test, * FROM public.profiles WHERE email = 'paulfst.business@gmail.com';
