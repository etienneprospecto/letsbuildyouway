-- Migration 035: Vérifier Paul avec son vrai email
-- Date: 2025-08-21

-- 1. Vérifier Paul dans profiles
SELECT 'Paul profiles' as type, id, email, first_name, last_name, role 
FROM public.profiles 
WHERE email = 'paulfst.business@gmail.com';

-- 2. Vérifier Paul dans clients
SELECT 'Paul clients' as type, id, email, first_name, last_name, coach_id, status
FROM public.clients 
WHERE email = 'paulfst.business@gmail.com';

-- 3. Vérifier si Paul a un profil mais pas de client
SELECT 'Paul auth only' as type, id, email
FROM auth.users 
WHERE email = 'paulfst.business@gmail.com'
AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.users.id);

-- 4. Si Paul n'a pas de profil, le créer
DO $$
DECLARE
  paul_auth_id UUID := '48a53cd6-12eb-417d-a1ec-74fc02b7730a';
  coach_id UUID;
BEGIN
  -- Récupérer l'ID du coach
  SELECT id INTO coach_id FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com' AND role = 'coach';
  
  IF coach_id IS NULL THEN
    RAISE EXCEPTION 'Coach not found';
  END IF;
  
  -- Créer le profil pour Paul s'il n'existe pas
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (paul_auth_id, 'paulfst.business@gmail.com', 'Paul', 'FST', 'client')
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        role = EXCLUDED.role;
  
  -- Créer l'entrée client pour Paul s'il n'existe pas
  INSERT INTO public.clients (
    id,
    coach_id,
    first_name,
    last_name,
    email,
    phone,
    primary_goal,
    fitness_level,
    status,
    progress_percentage,
    sessions_completed,
    total_workouts
  ) VALUES (
    paul_auth_id,
    coach_id,
    'Paul',
    'FST',
    'paulfst.business@gmail.com',
    '+33123456789',
    'general_fitness',
    'beginner',
    'active',
    0,
    0,
    0
  )
  ON CONFLICT (id) DO UPDATE
    SET coach_id = EXCLUDED.coach_id,
        first_name = EXCLUDED.first_name,
        last_name = EXCLUDED.last_name,
        email = EXCLUDED.email,
        status = EXCLUDED.status;
  
  RAISE NOTICE 'Paul configuré avec succès';
END $$;

-- 5. Vérifier le résultat final
SELECT 'Final check - Paul profiles' as type, id, email, role FROM public.profiles WHERE email = 'paulfst.business@gmail.com'
UNION ALL
SELECT 'Final check - Paul clients' as type, id, email, status FROM public.clients WHERE email = 'paulfst.business@gmail.com';
