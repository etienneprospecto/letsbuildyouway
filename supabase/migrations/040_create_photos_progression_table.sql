-- Migration pour créer la table photos_progression

-- Créer la table photos_progression
CREATE TABLE IF NOT EXISTS photos_progression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  nom_photo TEXT NOT NULL,
  url_fichier TEXT NOT NULL,
  description TEXT,
  date_prise TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer un index pour optimiser les requêtes par client
CREATE INDEX IF NOT EXISTS idx_photos_progression_client_id ON photos_progression(client_id);

-- Créer un index pour optimiser les requêtes par date
CREATE INDEX IF NOT EXISTS idx_photos_progression_date_prise ON photos_progression(date_prise);

-- Créer un index pour optimiser les requêtes par date de création
CREATE INDEX IF NOT EXISTS idx_photos_progression_created_at ON photos_progression(created_at);

-- Activer RLS (Row Level Security)
ALTER TABLE photos_progression ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
-- Les clients peuvent voir leurs propres photos
CREATE POLICY "Clients can view own progress photos" ON photos_progression
  FOR SELECT USING (auth.uid()::text = client_id::text);

-- Les clients peuvent insérer leurs propres photos
CREATE POLICY "Clients can insert own progress photos" ON photos_progression
  FOR INSERT WITH CHECK (auth.uid()::text = client_id::text);

-- Les clients peuvent mettre à jour leurs propres photos
CREATE POLICY "Clients can update own progress photos" ON photos_progression
  FOR UPDATE USING (auth.uid()::text = client_id::text);

-- Les clients peuvent supprimer leurs propres photos
CREATE POLICY "Clients can delete own progress photos" ON photos_progression
  FOR DELETE USING (auth.uid()::text = client_id::text);

-- Les coachs peuvent voir toutes les photos de leurs clients
CREATE POLICY "Coaches can view client progress photos" ON photos_progression
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = photos_progression.client_id 
      AND clients.coach_id = auth.uid()
    )
  );

-- Les coachs peuvent insérer des photos pour leurs clients
CREATE POLICY "Coaches can insert client progress photos" ON photos_progression
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = photos_progression.client_id 
      AND clients.coach_id = auth.uid()
    )
  );

-- Les coachs peuvent mettre à jour des photos pour leurs clients
CREATE POLICY "Coaches can update client progress photos" ON photos_progression
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = photos_progression.client_id 
      AND clients.coach_id = auth.uid()
    )
  );

-- Les coachs peuvent supprimer des photos pour leurs clients
CREATE POLICY "Coaches can delete client progress photos" ON photos_progression
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = photos_progression.client_id 
      AND clients.coach_id = auth.uid()
    )
  );

-- Créer un trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_photos_progression_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_photos_progression_updated_at
  BEFORE UPDATE ON photos_progression
  FOR EACH ROW
  EXECUTE FUNCTION update_photos_progression_updated_at();

-- Commentaire sur la table
COMMENT ON TABLE photos_progression IS 'Table pour stocker les photos de progression physique des clients';
COMMENT ON COLUMN photos_progression.client_id IS 'ID du client propriétaire de la photo';
COMMENT ON COLUMN photos_progression.nom_photo IS 'Nom original du fichier photo';
COMMENT ON COLUMN photos_progression.url_fichier IS 'Chemin du fichier dans le bucket de stockage';
COMMENT ON COLUMN photos_progression.description IS 'Description optionnelle de la photo';
COMMENT ON COLUMN photos_progression.date_prise IS 'Date de prise de la photo (par défaut maintenant)';
COMMENT ON COLUMN photos_progression.created_at IS 'Date de création de l''enregistrement';
COMMENT ON COLUMN photos_progression.updated_at IS 'Date de dernière modification de l''enregistrement';
