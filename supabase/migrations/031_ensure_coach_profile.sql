-- Migration 031: S'assurer que le coach a un profil correct
-- Date: 2025-08-21

-- 1. Vérifier l'état actuel des utilisateurs auth
SELECT 'Current auth users:' as message;
SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'etienne.guimbard@gmail.com';

-- 2. Vérifier les profils existants
SELECT 'Current profiles:' as message;
SELECT * FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com';

-- 3. Créer ou mettre à jour le profil du coach avec l'ID correct de auth.users
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  COALESCE((au.raw_user_meta_data->>'first_name')::text, 'Etienne'),
  COALESCE((au.raw_user_meta_data->>'last_name')::text, 'Guimbard'),
  'coach'::user_role,
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'etienne.guimbard@gmail.com'
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  role = EXCLUDED.role,
  updated_at = EXCLUDED.updated_at;

-- 4. Vérifier le résultat
SELECT 'Coach profile after creation:' as message;
SELECT * FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com';

-- 5. Mettre à jour les clients pour utiliser le bon coach_id
UPDATE public.clients 
SET coach_id = (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.email = 'etienne.guimbard@gmail.com'
)
WHERE coach_id != (
  SELECT p.id 
  FROM public.profiles p 
  WHERE p.email = 'etienne.guimbard@gmail.com'
);

-- 6. Vérifier que les clients ont le bon coach_id
SELECT 'Clients after coach_id update:' as message;
SELECT id, email, first_name, last_name, coach_id FROM public.clients;
