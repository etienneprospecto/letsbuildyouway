-- Migration 034: Créer le client Paul
-- Date: 2025-08-21

-- 1. Récupérer l'ID du coach
DO $$
DECLARE
  coach_id UUID;
  paul_user_id UUID;
BEGIN
  -- Récupérer l'ID du coach
  SELECT id INTO coach_id FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com' AND role = 'coach';
  
  IF coach_id IS NULL THEN
    RAISE EXCEPTION 'Coach not found';
  END IF;
  
  RAISE NOTICE 'Coach ID found: %', coach_id;
  
  -- Générer un ID pour Paul
  paul_user_id := gen_random_uuid();
  
  -- 2. Créer le compte auth pour Paul
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    paul_user_id,
    'paul.fst@gmail.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"email_verified": true}',
    false,
    '',
    '',
    '',
    ''
  );
  
  -- 3. Créer le profil pour Paul
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (paul_user_id, 'paul.fst@gmail.com', 'Paul', 'FST', 'client');
  
  -- 4. Créer l'entrée client pour Paul
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
    paul_user_id,
    coach_id,
    'Paul',
    'FST',
    'paul.fst@gmail.com',
    '+33123456789',
    'general_fitness',
    'beginner',
    'active',
    0,
    0,
    0
  );
  
  RAISE NOTICE 'Client Paul créé avec succès avec ID: %', paul_user_id;
END $$;

-- 5. Vérifier que tout est créé
SELECT 'Paul auth.users' as type, id, email FROM auth.users WHERE email = 'paul.fst@gmail.com'
UNION ALL
SELECT 'Paul profiles' as type, id, email FROM public.profiles WHERE email = 'paul.fst@gmail.com'
UNION ALL
SELECT 'Paul clients' as type, id, email FROM public.clients WHERE email = 'paul.fst@gmail.com';
