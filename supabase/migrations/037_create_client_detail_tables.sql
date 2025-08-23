-- Migration pour créer les tables nécessaires à la fiche client détaillée

-- Étendre la table clients avec les champs manquants pour la progression
ALTER TABLE clients ADD COLUMN IF NOT EXISTS poids_depart DECIMAL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS poids_objectif DECIMAL;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS poids_actuel DECIMAL;

-- Table séances (remplace sessions existante avec plus de détails)
CREATE TABLE IF NOT EXISTS seances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nom_seance TEXT NOT NULL,
  date_seance DATE NOT NULL,
  statut TEXT CHECK (statut IN ('programmée', 'terminée', 'manquée')) DEFAULT 'programmée',
  intensite_ressentie INTEGER CHECK (intensite_ressentie BETWEEN 1 AND 10),
  humeur TEXT,
  commentaire_client TEXT,
  date_fin TIMESTAMP,
  exercices_termines INTEGER DEFAULT 0,
  taux_reussite DECIMAL DEFAULT 0,
  reponse_coach TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Table exercices par séance
CREATE TABLE IF NOT EXISTS exercices_seance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seance_id UUID REFERENCES seances(id) ON DELETE CASCADE,
  nom_exercice TEXT NOT NULL,
  series INTEGER NOT NULL,
  repetitions TEXT NOT NULL,
  temps_repos TEXT,
  ordre INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Table ressources personnalisées
CREATE TABLE IF NOT EXISTS ressources_personnalisees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  nom_ressource TEXT NOT NULL,
  type_ressource TEXT CHECK (type_ressource IN ('video', 'pdf', 'link', 'image', 'document')),
  theme TEXT CHECK (theme IN ('Alimentation', 'Style de vie', 'Ressentis', 'Entraînement')),
  url_fichier TEXT,
  taille_fichier INTEGER,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_seances_client_id ON seances(client_id);
CREATE INDEX IF NOT EXISTS idx_seances_date ON seances(date_seance DESC);
CREATE INDEX IF NOT EXISTS idx_exercices_seance_seance_id ON exercices_seance(seance_id);
CREATE INDEX IF NOT EXISTS idx_ressources_client_id ON ressources_personnalisees(client_id);
CREATE INDEX IF NOT EXISTS idx_ressources_theme ON ressources_personnalisees(theme);

-- Désactiver RLS
ALTER TABLE seances DISABLE ROW LEVEL SECURITY;
ALTER TABLE exercices_seance DISABLE ROW LEVEL SECURITY;
ALTER TABLE ressources_personnalisees DISABLE ROW LEVEL SECURITY;

-- Supprimer triggers existants AVANT de les recréer
DROP TRIGGER IF EXISTS update_seances_updated_at ON seances;
DROP TRIGGER IF EXISTS update_ressources_updated_at ON ressources_personnalisees;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_seances_updated_at BEFORE UPDATE ON seances
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ressources_updated_at BEFORE UPDATE ON ressources_personnalisees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
