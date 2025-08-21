-- Migration 031: Mettre à jour le profil du coach avec le nouvel ID
-- Date: 2025-08-21

-- Supprimer l'ancien profil s'il existe
DELETE FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com';

-- Créer le nouveau profil avec le nouvel ID
INSERT INTO public.profiles (id, email, first_name, last_name, role)
VALUES (
  'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd', -- Nouvel ID de auth.users
  'etienne.guimbard@gmail.com',
  'Etienne',
  'guimbard',
  'coach'
);

-- Vérifier que le profil est créé
SELECT id, email, role FROM public.profiles WHERE email = 'etienne.guimbard@gmail.com';

-- Mettre à jour les clients qui référencent l'ancien coach_id
UPDATE public.clients 
SET coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd'
WHERE coach_id = 'ef371912-96dc-40bd-9e52-1f20815a0a15';

-- Mettre à jour les workouts qui référencent l'ancien coach_id
UPDATE public.workouts 
SET coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd'
WHERE coach_id = 'ef371912-96dc-40bd-9e52-1f20815a0a15';

-- Vérifier les mises à jour
SELECT 'clients' as table_name, COUNT(*) as count FROM public.clients WHERE coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd'
UNION ALL
SELECT 'workouts' as table_name, COUNT(*) as count FROM public.workouts WHERE coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd';
