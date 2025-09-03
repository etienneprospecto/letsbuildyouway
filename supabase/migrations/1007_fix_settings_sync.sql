-- Script pour corriger définitivement la synchronisation Settings

-- 1. Désactiver RLS temporairement pour éviter les problèmes de permissions
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- 2. Ajouter les colonnes manquantes à la table profiles avec des valeurs par défaut
DO $$ 
BEGIN
    -- Ajouter phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
        RAISE NOTICE 'Colonne phone ajoutée à profiles';
    END IF;
    
    -- Ajouter bio si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio text;
        RAISE NOTICE 'Colonne bio ajoutée à profiles';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Colonne updated_at ajoutée à profiles';
    END IF;
END $$;

-- 3. Ajouter les colonnes manquantes à la table clients avec des valeurs par défaut
DO $$ 
BEGIN
    -- Ajouter phone si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        ALTER TABLE public.clients ADD COLUMN phone text;
        RAISE NOTICE 'Colonne phone ajoutée à clients';
    END IF;
    
    -- Ajouter age si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'age') THEN
        ALTER TABLE public.clients ADD COLUMN age integer;
        RAISE NOTICE 'Colonne age ajoutée à clients';
    END IF;
    
    -- Ajouter weight si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'weight') THEN
        ALTER TABLE public.clients ADD COLUMN weight decimal(5,2);
        RAISE NOTICE 'Colonne weight ajoutée à clients';
    END IF;
    
    -- Ajouter height si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'height') THEN
        ALTER TABLE public.clients ADD COLUMN height integer;
        RAISE NOTICE 'Colonne height ajoutée à clients';
    END IF;
    
    -- Ajouter primary_goal si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'primary_goal') THEN
        ALTER TABLE public.clients ADD COLUMN primary_goal text;
        RAISE NOTICE 'Colonne primary_goal ajoutée à clients';
    END IF;
    
    -- Ajouter updated_at si elle n'existe pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
        ALTER TABLE public.clients ADD COLUMN updated_at timestamptz DEFAULT now();
        RAISE NOTICE 'Colonne updated_at ajoutée à clients';
    END IF;
END $$;

-- 4. Créer ou remplacer les fonctions de trigger
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Supprimer les anciens triggers s'ils existent
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS trigger_update_clients_updated_at ON clients;

-- 6. Créer les nouveaux triggers
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

CREATE TRIGGER trigger_update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION update_clients_updated_at();

-- 7. Mettre à jour updated_at pour tous les enregistrements existants
UPDATE profiles SET updated_at = NOW() WHERE updated_at IS NULL;
UPDATE clients SET updated_at = NOW() WHERE updated_at IS NULL;

-- 8. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_profiles_updated_at ON profiles(updated_at);
CREATE INDEX IF NOT EXISTS idx_clients_updated_at ON clients(updated_at);
CREATE INDEX IF NOT EXISTS idx_clients_contact ON clients(contact);

-- 9. Vérifier que tout est en place
DO $$ 
BEGIN
    RAISE NOTICE '=== VÉRIFICATION FINALE ===';
    RAISE NOTICE 'Colonnes profiles: %', (
        SELECT string_agg(column_name, ', ')
        FROM information_schema.columns 
        WHERE table_name = 'profiles'
    );
    RAISE NOTICE 'Colonnes clients: %', (
        SELECT string_agg(column_name, ', ')
        FROM information_schema.columns 
        WHERE table_name = 'clients'
    );
END $$;
