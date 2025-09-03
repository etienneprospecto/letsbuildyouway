-- Script pour ajouter des données de test et vérifier la synchronisation

-- 1. Vérifier et ajouter des données de test pour un coach
DO $$ 
DECLARE
    coach_id_val UUID;
BEGIN
    -- Récupérer l'ID du premier coach
    SELECT id INTO coach_id_val FROM profiles WHERE role = 'coach' LIMIT 1;
    
    IF coach_id_val IS NOT NULL THEN
        -- Mettre à jour le coach avec des données de test
        UPDATE profiles 
        SET 
            first_name = 'Demo Coach',
            last_name = 'BYW',
            phone = '0123456789',
            bio = 'Coach professionnel spécialisé en fitness et bien-être',
            updated_at = NOW()
        WHERE id = coach_id_val;
        
        RAISE NOTICE 'Coach mis à jour avec des données de test: %', coach_id_val;
    ELSE
        RAISE NOTICE 'Aucun coach trouvé';
    END IF;
END $$;

-- 2. Vérifier et ajouter des données de test pour un client
DO $$ 
DECLARE
    client_id_val UUID;
BEGIN
    -- Récupérer l'ID du premier client
    SELECT id INTO client_id_val FROM clients LIMIT 1;
    
    IF client_id_val IS NOT NULL THEN
        -- Mettre à jour le client avec des données de test
        UPDATE clients 
        SET 
            first_name = 'Demo Client',
            last_name = 'Test',
            phone = '0987654321',
            age = 30,
            weight = 70.5,
            height = 175,
            primary_goal = 'Perte de poids et amélioration de la condition physique',
            updated_at = NOW()
        WHERE id = client_id_val;
        
        RAISE NOTICE 'Client mis à jour avec des données de test: %', client_id_val;
    ELSE
        RAISE NOTICE 'Aucun client trouvé';
    END IF;
END $$;

-- 3. Vérifier que les colonnes existent et sont accessibles
DO $$ 
BEGIN
    RAISE NOTICE '=== VÉRIFICATION FINALE DES COLONNES ===';
    
    -- Vérifier profiles
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        RAISE NOTICE '✅ Colonne profiles.phone existe';
    ELSE
        RAISE NOTICE '❌ Colonne profiles.phone manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        RAISE NOTICE '✅ Colonne profiles.bio existe';
    ELSE
        RAISE NOTICE '❌ Colonne profiles.bio manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        RAISE NOTICE '✅ Colonne profiles.updated_at existe';
    ELSE
        RAISE NOTICE '❌ Colonne profiles.updated_at manquante';
    END IF;
    
    -- Vérifier clients
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        RAISE NOTICE '✅ Colonne clients.phone existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.phone manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'age') THEN
        RAISE NOTICE '✅ Colonne clients.age existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.age manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'weight') THEN
        RAISE NOTICE '✅ Colonne clients.weight existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.weight manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'height') THEN
        RAISE NOTICE '✅ Colonne clients.height existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.height manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'primary_goal') THEN
        RAISE NOTICE '✅ Colonne clients.primary_goal existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.primary_goal manquante';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
        RAISE NOTICE '✅ Colonne clients.updated_at existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.updated_at manquante';
    END IF;
END $$;

-- 4. Afficher les données finales pour vérification
SELECT 'PROFILES' as table_name, id, first_name, last_name, phone, bio, updated_at FROM profiles WHERE role = 'coach' LIMIT 1
UNION ALL
SELECT 'CLIENTS' as table_name, id::text, first_name, last_name, phone, primary_goal as bio, updated_at FROM clients LIMIT 1;
