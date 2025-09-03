-- SCRIPT D'URGENCE : RESTAURER LES DONNÉES ESSENTIELLES
-- Recréer les profils et données nécessaires pour la connexion

-- 1. DÉSACTIVER TEMPORAIREMENT RLS SUR TOUTES LES TABLES
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- 2. RECRÉER TON PROFIL COACH
INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
VALUES (
    'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd',
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

-- 3. RECRÉER LE PROFIL CLIENT PAUL
DO $$
DECLARE
    paul_user_id UUID;
    coach_id UUID := 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd';
BEGIN
    -- Générer un ID pour Paul
    paul_user_id := gen_random_uuid();
    
    -- Créer le profil Paul
    INSERT INTO public.profiles (id, email, first_name, last_name, role, created_at, updated_at)
    VALUES (
        paul_user_id,
        'paulfst.business@gmail.com',
        'Paul',
        'FST',
        'client',
        NOW(),
        NOW()
    );
    
    -- Créer l'entrée client pour Paul
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
        created_at,
        updated_at
    ) VALUES (
        paul_user_id,
        coach_id,
        'Paul',
        'FST',
        30,
        'Améliorer ma condition physique générale',
        'Débutant',
        'Motivé et déterminé',
        'Suivi personnalisé',
        CURRENT_DATE,
        'paulfst.business@gmail.com',
        'Peu d''expérience sportive, souhaite commencer progressivement',
        NOW(),
        NOW()
    );
    
    RAISE NOTICE 'Client Paul créé avec ID: %', paul_user_id;
END $$;

-- 4. CRÉER UNE CONVERSATION ENTRE TOI ET PAUL
INSERT INTO conversations (id, client_id, coach_id, title, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    p_client.id,
    p_coach.id,
    'Conversation avec Paul FST',
    NOW(),
    NOW()
FROM profiles p_coach, profiles p_client
WHERE p_coach.email = 'etienne.guimbard@gmail.com' 
  AND p_client.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.coach_id = p_coach.id AND c.client_id = p_client.id
  );

-- 5. AJOUTER UN MESSAGE DE BIENVENUE
INSERT INTO messages (id, conversation_id, sender_id, content, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    conv.id,
    p_coach.id,
    'Bienvenue Paul ! Je suis là pour t''accompagner dans ton parcours fitness. N''hésite pas à me poser tes questions !',
    NOW(),
    NOW()
FROM conversations conv
JOIN profiles p_coach ON conv.coach_id = p_coach.id
JOIN profiles p_client ON conv.client_id = p_client.id
WHERE p_coach.email = 'etienne.guimbard@gmail.com'
  AND p_client.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM messages m WHERE m.conversation_id = conv.id
  );

-- 6. CRÉER QUELQUES EXERCICES DE BASE
INSERT INTO exercises (id, name, description, type, muscle_groups, difficulty, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Pompes', 'Exercice de base pour le haut du corps', 'Musculation', ARRAY['Pectoraux', 'Triceps'], 'Facile', NOW(), NOW()),
    (gen_random_uuid(), 'Squats', 'Exercice de base pour les jambes', 'Musculation', ARRAY['Quadriceps', 'Fessiers'], 'Facile', NOW(), NOW()),
    (gen_random_uuid(), 'Planche', 'Exercice de gainage', 'Musculation', ARRAY['Abdominaux', 'Core'], 'Intermédiaire', NOW(), NOW()),
    (gen_random_uuid(), 'Marche rapide', 'Cardio léger', 'Cardio', ARRAY['Cardio'], 'Facile', NOW(), NOW());

-- 7. CRÉER UN WORKOUT DE BASE
DO $$
DECLARE
    workout_id UUID;
    coach_id UUID := 'acd6c7fc-43b3-4b2a-9b97-c9f046468ddd';
    exercise_pompes UUID;
    exercise_squats UUID;
BEGIN
    -- Créer le workout
    workout_id := gen_random_uuid();
    INSERT INTO workouts (id, name, description, type, duration_minutes, difficulty, created_by, created_at, updated_at)
    VALUES (
        workout_id,
        'Entraînement débutant',
        'Programme de base pour commencer en douceur',
        'Entraînement',
        30,
        'Facile',
        coach_id,
        NOW(),
        NOW()
    );
    
    -- Récupérer les exercices
    SELECT id INTO exercise_pompes FROM exercises WHERE name = 'Pompes' LIMIT 1;
    SELECT id INTO exercise_squats FROM exercises WHERE name = 'Squats' LIMIT 1;
    
    -- Ajouter les exercices au workout
    INSERT INTO workout_exercises (id, workout_id, exercise_id, order_index, sets, reps, rest_seconds, created_at, updated_at)
    VALUES 
        (gen_random_uuid(), workout_id, exercise_pompes, 1, 3, 10, 60, NOW(), NOW()),
        (gen_random_uuid(), workout_id, exercise_squats, 2, 3, 15, 60, NOW(), NOW());
        
    RAISE NOTICE 'Workout créé avec ID: %', workout_id;
END $$;

-- 8. VÉRIFICATIONS FINALES
SELECT 'PROFILS' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'CLIENTS' as table_name, COUNT(*) as count FROM clients
UNION ALL
SELECT 'CONVERSATIONS' as table_name, COUNT(*) as count FROM conversations
UNION ALL
SELECT 'MESSAGES' as table_name, COUNT(*) as count FROM messages
UNION ALL
SELECT 'EXERCISES' as table_name, COUNT(*) as count FROM exercises
UNION ALL
SELECT 'WORKOUTS' as table_name, COUNT(*) as count FROM workouts;

-- 9. AFFICHER LES DONNÉES CRÉÉES
SELECT 'Coach Profile' as type, id, email, first_name, last_name, role FROM profiles WHERE role = 'coach';
SELECT 'Client Profile' as type, id, email, first_name, last_name, role FROM profiles WHERE role = 'client';
SELECT 'Client Details' as type, id, first_name, last_name, coach_id FROM clients;
SELECT 'Conversations' as type, id, coach_id, client_id FROM conversations;

RAISE NOTICE 'RESTAURATION TERMINÉE - Essaie de te connecter maintenant !';
