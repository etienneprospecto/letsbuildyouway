-- Migration 047: Vérifier et corriger le profil de Paul
-- Date: 2025-01-20

-- 1. Vérifier l'état actuel de Paul
SELECT 'Paul auth.users' as type, id, email FROM auth.users WHERE email = 'paulfst.business@gmail.com';
SELECT 'Paul profiles' as type, id, email, first_name, last_name, role FROM public.profiles WHERE email = 'paulfst.business@gmail.com';
SELECT 'Paul clients' as type, id, email, first_name, last_name, coach_id, status FROM public.clients WHERE email = 'paulfst.business@gmail.com';

-- 2. Créer le profil de Paul s'il n'existe pas
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  auth_users.id,
  auth_users.email,
  'Paul' as first_name,
  'FST' as last_name,
  'client' as role
FROM auth.users auth_users
WHERE auth_users.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth_users.id
  );

-- 3. Créer l'entrée client pour Paul s'il n'existe pas
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
)
SELECT 
  auth_users.id,
  coach_profiles.id as coach_id,
  'Paul' as first_name,
  'FST' as last_name,
  auth_users.email,
  '+33123456789' as phone,
  'general_fitness' as primary_goal,
  'beginner' as fitness_level,
  'active' as status,
  0 as progress_percentage,
  0 as sessions_completed,
  0 as total_workouts
FROM auth.users auth_users
CROSS JOIN public.profiles coach_profiles
WHERE auth_users.email = 'paulfst.business@gmail.com'
  AND coach_profiles.email = 'etienne.guimbard@gmail.com'
  AND coach_profiles.role = 'coach'
  AND NOT EXISTS (
    SELECT 1 FROM public.clients c WHERE c.id = auth_users.id
  );

-- 4. Créer la conversation si elle n'existe pas
INSERT INTO conversations (coach_id, client_id, client_name, last_message, last_message_time, unread_count, is_online)
SELECT 
  coach_profiles.id as coach_id,
  client_profiles.id as client_id,
  'Paul FST' as client_name,
  'Bienvenue Paul ! Votre coach est là pour vous accompagner.' as last_message,
  NOW()::time::text as last_message_time,
  0 as unread_count,
  false as is_online
FROM public.profiles coach_profiles
JOIN public.profiles client_profiles ON client_profiles.role = 'client'
WHERE coach_profiles.email = 'etienne.guimbard@gmail.com'
  AND coach_profiles.role = 'coach'
  AND client_profiles.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM conversations conv 
    WHERE conv.coach_id = coach_profiles.id AND conv.client_id = client_profiles.id
  );

-- 5. Créer un message de bienvenue si la conversation existe
INSERT INTO messages (conversation_id, content, sender_id, sender_type, timestamp, is_read)
SELECT 
  conv.id as conversation_id,
  'Bienvenue Paul ! Votre coach est là pour vous accompagner dans votre parcours fitness.' as content,
  conv.coach_id as sender_id,
  'coach' as sender_type,
  NOW()::time::text as timestamp,
  false as is_read
FROM conversations conv
JOIN public.profiles client_profiles ON client_profiles.id = conv.client_id
WHERE client_profiles.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.conversation_id = conv.id
  );

-- 6. Vérification finale
SELECT 'Final check - Paul profiles' as type, id, email, first_name, last_name, role FROM public.profiles WHERE email = 'paulfst.business@gmail.com';
SELECT 'Final check - Paul clients' as type, id, email, first_name, last_name, coach_id, status FROM public.clients WHERE email = 'paulfst.business@gmail.com';
SELECT 'Final check - Paul conversations' as type, id, coach_id, client_id, client_name FROM conversations WHERE client_id IN (SELECT id FROM public.profiles WHERE email = 'paulfst.business@gmail.com');
SELECT 'Final check - Paul messages' as type, id, conversation_id, content, sender_type FROM messages WHERE conversation_id IN (SELECT id FROM conversations WHERE client_id IN (SELECT id FROM public.profiles WHERE email = 'paulfst.business@gmail.com'));
