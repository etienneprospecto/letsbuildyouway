-- Script d'urgence : RECRÉER LES UTILISATEURS ET PROFILS
-- ATTENTION : Ceci recrée manuellement les utilisateurs perdus

-- 1. Recréer le profil coach (Etienne)
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd', -- ID de l'utilisateur connecté
    'etienne.guimbard@gmail.com',
    'Etienne',
    'Guimbard',
    'coach',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 2. Recréer le profil client (Paul)
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    gen_random_uuid(), -- Générer un nouvel ID
    'paulfst.business@gmail.com',
    'Paul',
    'Client',
    'client',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    role = EXCLUDED.role,
    updated_at = NOW();

-- 3. Récupérer l'ID du client créé
DO $$
DECLARE
    client_id UUID;
BEGIN
    SELECT id INTO client_id FROM public.profiles WHERE email = 'paulfst.business@gmail.com' AND role = 'client';
    
    -- 4. Créer le profil client associé
    INSERT INTO public.clients (id, coach_id, created_at, updated_at)
    VALUES (
        client_id,
        'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd', -- ID du coach Etienne
        NOW(),
        NOW()
    ) ON CONFLICT (id) DO UPDATE SET
        coach_id = EXCLUDED.coach_id,
        updated_at = NOW();
END $$;

-- 5. Vérifier que les profils sont créés
SELECT 
    id, 
    email, 
    full_name, 
    role, 
    created_at
FROM public.profiles 
ORDER BY role, email;

-- 6. Vérifier la relation coach-client
SELECT 
    c.id as client_id,
    c.coach_id,
    p.email as client_email,
    p.full_name as client_name
FROM public.clients c
JOIN public.profiles p ON c.id = p.id;
