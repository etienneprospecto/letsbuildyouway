-- Migration pour corriger la table ressources_personnalisees

-- Vérifier et corriger la structure de la table ressources_personnalisees
DO $$ 
BEGIN
    -- Ajouter les colonnes manquantes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'url_fichier') THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN url_fichier text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'theme') THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN theme text CHECK (theme IN ('Alimentation', 'Style de vie', 'Ressentis', 'Entraînement'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'nom_ressource') THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN nom_ressource text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'taille_fichier') THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN taille_fichier integer;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'type_ressource') THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN type_ressource text CHECK (type_ressource IN ('video', 'pdf', 'link', 'image', 'document'));
    END IF;
    
    -- Si la colonne titre existe mais pas nom_ressource, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'titre') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'nom_ressource') THEN
        UPDATE public.ressources_personnalisees SET nom_ressource = titre WHERE nom_ressource IS NULL;
    END IF;
    
    -- Si la colonne url existe mais pas url_fichier, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'url') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'url_fichier') THEN
        UPDATE public.ressources_personnalisees SET url_fichier = url WHERE url_fichier IS NULL;
    END IF;
    
    -- Si la colonne fichier_path existe mais pas url_fichier, copier les données
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'fichier_path') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ressources_personnalisees' AND column_name = 'url_fichier') THEN
        UPDATE public.ressources_personnalisees SET url_fichier = fichier_path WHERE url_fichier IS NULL;
    END IF;
END $$;

-- Créer les index manquants
CREATE INDEX IF NOT EXISTS idx_ressources_personnalisees_client_id ON ressources_personnalisees(client_id);
CREATE INDEX IF NOT EXISTS idx_ressources_personnalisees_theme ON ressources_personnalisees(theme);
CREATE INDEX IF NOT EXISTS idx_ressources_personnalisees_type ON ressources_personnalisees(type_ressource);

-- Désactiver RLS temporairement pour les tests
ALTER TABLE ressources_personnalisees DISABLE ROW LEVEL SECURITY;
