-- SCRIPT POUR CORRIGER L'AFFICHAGE DE PAUL DANS "MES CLIENTS"

-- 1. Vérifier l'état actuel de la table clients
SELECT 'Clients existants' as type, id, coach_id, first_name, last_name FROM public.clients;

-- 2. Vérifier les profils
SELECT 'Profils' as type, id, email, first_name, last_name, role FROM public.profiles;

-- 3. Corriger l'entrée client pour Paul s'il manque
DO $$
DECLARE
    paul_profile_id UUID;
    coach_id UUID := 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd';
BEGIN
    -- Récupérer l'ID du profil Paul
    SELECT id INTO paul_profile_id FROM public.profiles WHERE email = 'paulfst.business@gmail.com' AND role = 'client';
    
    IF paul_profile_id IS NULL THEN
        RAISE EXCEPTION 'Profil Paul introuvable';
    END IF;
    
    -- Supprimer l'entrée existante si elle existe (au cas où)
    DELETE FROM public.clients WHERE id = paul_profile_id;
    
    -- Créer/recréer l'entrée client pour Paul
    INSERT INTO public.clients (
        id,
        coach_id,
        first_name,
        last_name,
        age,
        objective,
        level,
        mentality,
        coaching_type,
        start_date,
        contact,
        sports_history,
        needs_attention,
        created_at,
        updated_at
    ) VALUES (
        paul_profile_id,
        coach_id,
        'Paul',
        'FST',
        30,
        'Améliorer ma condition physique générale et perdre du poids',
        'Débutant',
        'Motivé et déterminé à changer ses habitudes',
        'Suivi personnalisé avec séances en ligne',
        CURRENT_DATE,
        'paulfst.business@gmail.com',
        'Peu d''expérience sportive, mode de vie sédentaire, souhaite commencer progressivement',
        false,
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Client Paul corrigé avec ID: %', paul_profile_id;
END $$;

-- 4. Vérifier que Paul apparaît maintenant
SELECT 
    'Résultat final' as type,
    c.id,
    c.coach_id,
    c.first_name,
    c.last_name,
    c.objective,
    c.level,
    p.email
FROM public.clients c
JOIN public.profiles p ON c.id = p.id
WHERE c.coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd';

-- 5. Vérifier la requête que ton front-end utilise probablement
SELECT 
    c.*,
    p.email,
    p.avatar_url
FROM public.clients c
JOIN public.profiles p ON c.id = p.id
WHERE c.coach_id = 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd'
ORDER BY c.created_at DESC;
