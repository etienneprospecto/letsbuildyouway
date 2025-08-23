-- Migration pour ajouter client_name à la table conversations

-- Ajouter la colonne client_name
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS client_name TEXT;

-- Mettre à jour les conversations existantes avec le nom du client
UPDATE conversations 
SET client_name = (
  SELECT clients.first_name || ' ' || clients.last_name 
  FROM clients 
  WHERE clients.id = conversations.client_id
);

-- Rendre la colonne NOT NULL après l'avoir remplie
ALTER TABLE conversations ALTER COLUMN client_name SET NOT NULL;

-- Ajouter un index pour optimiser les recherches par nom
CREATE INDEX IF NOT EXISTS idx_conversations_client_name ON conversations(client_name);

-- Mettre à jour la fonction de création automatique pour inclure client_name
CREATE OR REPLACE FUNCTION create_conversation_for_new_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement une conversation pour le nouveau client
  INSERT INTO conversations (
    coach_id, 
    client_id,
    client_name,
    last_message, 
    last_message_time,
    unread_count,
    is_online
  )
  VALUES (
    NEW.coach_id,
    NEW.id,
    NEW.first_name || ' ' || NEW.last_name,
    'Bienvenue ! Votre coach est là pour vous accompagner.',
    NOW()::time::text,
    0,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
