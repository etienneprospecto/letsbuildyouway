-- Migration pour corriger la table seances et ajouter les colonnes manquantes

-- Ajouter la colonne nom_seance manquante
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS nom_seance TEXT;

-- Ajouter d'autres colonnes manquantes pour la compatibilité
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS statut TEXT CHECK (statut IN ('programmée', 'terminée', 'manquée')) DEFAULT 'programmée';
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS intensite_ressentie INTEGER CHECK (intensite_ressentie BETWEEN 1 AND 10);
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS humeur TEXT;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS commentaire_client TEXT;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS date_fin TIMESTAMP;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS exercices_termines INTEGER DEFAULT 0;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS taux_reussite DECIMAL DEFAULT 0;
ALTER TABLE public.seances ADD COLUMN IF NOT EXISTS reponse_coach TEXT;

-- Mettre à jour les colonnes existantes si nécessaire
ALTER TABLE public.seances ALTER COLUMN nom_seance SET NOT NULL;

-- Corriger la table exercices_seance
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS completed BOOLEAN DEFAULT false;
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS nom_exercice TEXT;
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS series INTEGER;
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS repetitions TEXT;
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS temps_repos TEXT;
ALTER TABLE public.exercices_seance ADD COLUMN IF NOT EXISTS ordre INTEGER;

-- Corriger les types de colonnes existantes si nécessaire
-- Si repetitions est INTEGER, le changer en TEXT pour accepter "10-12"
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'exercices_seance' 
        AND column_name = 'repetitions' 
        AND data_type = 'integer'
    ) THEN
        ALTER TABLE public.exercices_seance ALTER COLUMN repetitions TYPE TEXT;
    END IF;
END $$;

-- Corriger la table ressources_personnalisees
ALTER TABLE public.ressources_personnalisees ADD COLUMN IF NOT EXISTS nom_ressource TEXT;
ALTER TABLE public.ressources_personnalisees ADD COLUMN IF NOT EXISTS theme TEXT CHECK (theme IN ('Alimentation', 'Style de vie', 'Ressentis', 'Entraînement'));
ALTER TABLE public.ressources_personnalisees ADD COLUMN IF NOT EXISTS url_fichier TEXT;
ALTER TABLE public.ressources_personnalisees ADD COLUMN IF NOT EXISTS taille_fichier INTEGER;

-- Mettre à jour les colonnes existantes si nécessaire
-- Si nom_ressource n'existe pas, utiliser titre comme nom_ressource
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ressources_personnalisees' 
        AND column_name = 'nom_ressource'
    ) THEN
        ALTER TABLE public.ressources_personnalisees ADD COLUMN nom_ressource TEXT;
        UPDATE public.ressources_personnalisees SET nom_ressource = titre WHERE nom_ressource IS NULL;
    END IF;
END $$;
