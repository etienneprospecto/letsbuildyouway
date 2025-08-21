-- Migration 032: Diagnostic du profil coach
-- Date: 2025-08-21

-- Vérifier le profil du coach
SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  created_at,
  updated_at
FROM public.profiles 
WHERE email = 'etienne.guimbard@gmail.com';

-- Vérifier l'utilisateur auth
SELECT 
  id,
  email,
  raw_user_meta_data,
  raw_app_meta_data
FROM auth.users 
WHERE email = 'etienne.guimbard@gmail.com';

-- Vérifier les clients associés
SELECT 
  id,
  first_name,
  last_name,
  email,
  coach_id,
  status
FROM public.clients 
WHERE coach_id IN (
  SELECT id FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com'
);

-- Vérifier les workouts associés
SELECT 
  id,
  name,
  coach_id,
  created_at
FROM public.workouts 
WHERE coach_id IN (
  SELECT id FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com'
);

-- Vérifier les exercices
SELECT 
  id,
  name,
  category,
  created_at
FROM public.exercises 
ORDER BY created_at DESC 
LIMIT 5;
