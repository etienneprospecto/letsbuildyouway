-- Migration 033: Vérifier toutes les données
-- Date: 2025-08-21

-- 1. Vérifier tous les clients
SELECT 'CLIENTS' as table_name, COUNT(*) as count FROM public.clients;
SELECT * FROM public.clients LIMIT 5;

-- 2. Vérifier tous les profils
SELECT 'PROFILES' as table_name, COUNT(*) as count FROM public.profiles;
SELECT * FROM public.profiles LIMIT 5;

-- 3. Vérifier tous les utilisateurs auth
SELECT 'AUTH_USERS' as table_name, COUNT(*) as count FROM auth.users;
SELECT id, email, created_at FROM auth.users LIMIT 5;

-- 4. Vérifier les exercices
SELECT 'EXERCISES' as table_name, COUNT(*) as count FROM public.exercises;
SELECT id, name, category FROM public.exercises LIMIT 5;

-- 5. Vérifier les workouts
SELECT 'WORKOUTS' as table_name, COUNT(*) as count FROM public.workouts;
SELECT * FROM public.workouts LIMIT 5;
