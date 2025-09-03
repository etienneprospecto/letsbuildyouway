-- Migration pour vérifier et corriger les tables nécessaires pour les Settings

-- Vérifier que la table profiles a les bonnes colonnes pour les coaches
DO $$ 
BEGIN
    -- Ajouter les colonnes manquantes à la table profiles si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') THEN
        ALTER TABLE public.profiles ADD COLUMN bio text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE public.profiles ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Vérifier que la table clients a les bonnes colonnes pour les clients
DO $$ 
BEGIN
    -- Ajouter les colonnes manquantes à la table clients si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'phone') THEN
        ALTER TABLE public.clients ADD COLUMN phone text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'age') THEN
        ALTER TABLE public.clients ADD COLUMN age integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'weight') THEN
        ALTER TABLE public.clients ADD COLUMN weight decimal(5,2);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'height') THEN
        ALTER TABLE public.clients ADD COLUMN height integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'primary_goal') THEN
        ALTER TABLE public.clients ADD COLUMN primary_goal text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'updated_at') THEN
        ALTER TABLE public.clients ADD COLUMN updated_at timestamptz DEFAULT now();
    END IF;
END $$;

-- Créer des triggers pour mettre à jour updated_at automatiquement
-- Pour la table profiles
CREATE OR REPLACE FUNCTION update_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON profiles;
CREATE TRIGGER trigger_update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_profiles_updated_at();

-- Pour la table clients
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

-- Désactiver RLS temporairement pour les tests
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;

-- Commentaires sur les colonnes ajoutées
COMMENT ON COLUMN profiles.phone IS 'Numéro de téléphone du coach';
COMMENT ON COLUMN profiles.bio IS 'Biographie du coach';
COMMENT ON COLUMN profiles.updated_at IS 'Date de dernière mise à jour du profil';

COMMENT ON COLUMN clients.phone IS 'Numéro de téléphone du client';
COMMENT ON COLUMN clients.age IS 'Âge du client';
COMMENT ON COLUMN clients.weight IS 'Poids du client en kg';
COMMENT ON COLUMN clients.height IS 'Taille du client en cm';
COMMENT ON COLUMN clients.primary_goal IS 'Objectif principal du client';
COMMENT ON COLUMN clients.updated_at IS 'Date de dernière mise à jour du profil client';
