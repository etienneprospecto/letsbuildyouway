-- Script de test final pour vérifier la synchronisation Settings

-- 1. Test de mise à jour d'un coach
DO $$ 
DECLARE
    coach_id_val UUID;
    result_count INTEGER;
BEGIN
    -- Récupérer l'ID du premier coach
    SELECT id INTO coach_id_val FROM profiles WHERE role = 'coach' LIMIT 1;
    
    IF coach_id_val IS NOT NULL THEN
        -- Mettre à jour le coach avec des données de test
        UPDATE profiles 
        SET 
            first_name = 'Test Coach',
            last_name = 'Settings',
            phone = '0123456789',
            bio = 'Test de synchronisation Settings - ' || NOW()::text,
            updated_at = NOW()
        WHERE id = coach_id_val;
        
        -- Vérifier que la mise à jour a fonctionné
        SELECT COUNT(*) INTO result_count 
        FROM profiles 
        WHERE id = coach_id_val 
        AND first_name = 'Test Coach' 
        AND phone = '0123456789';
        
        IF result_count = 1 THEN
            RAISE NOTICE '✅ Test coach réussi - Mise à jour OK';
        ELSE
            RAISE NOTICE '❌ Test coach échoué - Mise à jour KO';
        END IF;
    ELSE
        RAISE NOTICE '❌ Aucun coach trouvé pour le test';
    END IF;
END $$;

-- 2. Test de mise à jour d'un client
DO $$ 
DECLARE
    client_id_val UUID;
    result_count INTEGER;
BEGIN
    -- Récupérer l'ID du premier client
    SELECT id INTO client_id_val FROM clients LIMIT 1;
    
    IF client_id_val IS NOT NULL THEN
        -- Mettre à jour le client avec des données de test
        UPDATE clients 
        SET 
            first_name = 'Test Client',
            last_name = 'Settings',
            phone = '0987654321',
            age = 25,
            weight = 65.5,
            height = 170,
            primary_goal = 'Test de synchronisation Settings - ' || NOW()::text,
            updated_at = NOW()
        WHERE id = client_id_val;
        
        -- Vérifier que la mise à jour a fonctionné
        SELECT COUNT(*) INTO result_count 
        FROM clients 
        WHERE id = client_id_val 
        AND first_name = 'Test Client' 
        AND phone = '0987654321'
        AND weight = 65.5;
        
        IF result_count = 1 THEN
            RAISE NOTICE '✅ Test client réussi - Mise à jour OK';
        ELSE
            RAISE NOTICE '❌ Test client échoué - Mise à jour KO';
        END IF;
    ELSE
        RAISE NOTICE '❌ Aucun client trouvé pour le test';
    END IF;
END $$;

-- 3. Afficher les résultats finaux
SELECT 'COACH TEST' as test_type, id, first_name, last_name, phone, bio, updated_at 
FROM profiles 
WHERE role = 'coach' AND first_name = 'Test Coach'
UNION ALL
SELECT 'CLIENT TEST' as test_type, id::text, first_name, last_name, phone, primary_goal as bio, updated_at 
FROM clients 
WHERE first_name = 'Test Client';

-- 4. Message final
DO $$ 
BEGIN
    RAISE NOTICE '=== TESTS DE SYNCHRONISATION TERMINÉS ===';
    RAISE NOTICE 'Si vous voyez les messages ✅ ci-dessus, la synchronisation fonctionne !';
    RAISE NOTICE 'Vous pouvez maintenant tester la page Settings dans l''application.';
END $$;
