-- Migration pour ajouter le support des messages vocaux
-- Date: 2025-01-20
-- Description: Ajout des champs pour les messages vocaux dans la table messages

-- Ajouter les colonnes pour les messages vocaux
ALTER TABLE messages ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'voice', 'image', 'file'));
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_duration INTEGER; -- Durée en secondes
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_file_size INTEGER; -- Taille du fichier en bytes
ALTER TABLE messages ADD COLUMN IF NOT EXISTS voice_mime_type TEXT DEFAULT 'audio/webm'; -- Type MIME du fichier audio

-- Ajouter un index pour optimiser les requêtes sur le type de message
CREATE INDEX IF NOT EXISTS idx_messages_message_type ON messages(message_type);
CREATE INDEX IF NOT EXISTS idx_messages_voice_url ON messages(voice_url) WHERE voice_url IS NOT NULL;

-- Mettre à jour les commentaires
COMMENT ON COLUMN messages.message_type IS 'Type de message: text, voice, image, file';
COMMENT ON COLUMN messages.voice_url IS 'URL du fichier audio pour les messages vocaux';
COMMENT ON COLUMN messages.voice_duration IS 'Durée du message vocal en secondes';
COMMENT ON COLUMN messages.voice_file_size IS 'Taille du fichier audio en bytes';
COMMENT ON COLUMN messages.voice_mime_type IS 'Type MIME du fichier audio (audio/webm, audio/mp3, etc.)';

-- Fonction pour valider les messages vocaux
CREATE OR REPLACE FUNCTION validate_voice_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Si c'est un message vocal, vérifier que les champs requis sont présents
  IF NEW.message_type = 'voice' THEN
    IF NEW.voice_url IS NULL OR NEW.voice_duration IS NULL THEN
      RAISE EXCEPTION 'Les messages vocaux doivent avoir une URL et une durée';
    END IF;
    
    -- Vérifier que la durée est raisonnable (max 5 minutes)
    IF NEW.voice_duration > 300 THEN
      RAISE EXCEPTION 'La durée des messages vocaux ne peut pas dépasser 5 minutes';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger pour valider les messages vocaux
DROP TRIGGER IF EXISTS trigger_validate_voice_message ON messages;
CREATE TRIGGER trigger_validate_voice_message
  BEFORE INSERT OR UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION validate_voice_message();
