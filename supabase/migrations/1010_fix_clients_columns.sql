-- Script pour corriger les colonnes de la table clients et s'assurer de la cohérence

-- 1. Vérifier et corriger les données entre les colonnes similaires
DO $$ 
BEGIN
    -- Si weight_kg existe mais pas weight, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'weight_kg') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'weight') THEN
        UPDATE clients SET weight = weight_kg WHERE weight IS NULL AND weight_kg IS NOT NULL;
        RAISE NOTICE 'Données copiées de weight_kg vers weight';
    END IF;
    
    -- Si height_cm existe mais pas height, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'height_cm') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'height') THEN
        UPDATE clients SET height = height_cm WHERE height IS NULL AND height_cm IS NOT NULL;
        RAISE NOTICE 'Données copiées de height_cm vers height';
    END IF;
    
    -- Si objective existe mais pas primary_goal, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'objective') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'primary_goal') THEN
        UPDATE clients SET primary_goal = objective WHERE primary_goal IS NULL AND objective IS NOT NULL;
        RAISE NOTICE 'Données copiées de objective vers primary_goal';
    END IF;
END $$;

-- 2. Vérifier que les colonnes nécessaires existent
DO $$ 
BEGIN
    RAISE NOTICE '=== VÉRIFICATION DES COLONNES CLIENTS ===';
    
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        RAISE NOTICE '✅ Colonne clients.phone existe';
    ELSE
        RAISE NOTICE '❌ Colonne clients.phone manquante';
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

-- 3. Créer un trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_clients_updated_at ON clients;
CREATE TRIGGER trigger_update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- 4. Désactiver RLS temporairement pour les tests
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 5. Afficher un exemple de données pour vérification
SELECT 
    id, 
    first_name, 
    last_name, 
    contact, 
    phone, 
    weight, 
    height, 
    primary_goal,
    updated_at
FROM clients 
LIMIT 3;
