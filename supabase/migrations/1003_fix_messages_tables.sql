-- Migration pour corriger et standardiser les tables conversations et messages

-- Supprimer les tables existantes pour repartir de zéro
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Créer la table conversations avec la structure attendue par MessageService
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  last_message TEXT,
  last_message_time TEXT,
  unread_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(coach_id, client_id)
);

-- Créer la table messages avec la structure attendue par MessageService
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('coach', 'client')),
  timestamp TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_conversations_coach_id ON conversations(coach_id);
CREATE INDEX IF NOT EXISTS idx_conversations_client_id ON conversations(client_id);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);

-- Désactiver RLS temporairement pour les tests
ALTER TABLE conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE messages DISABLE ROW LEVEL SECURITY;

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_conversations_updated_at
  BEFORE UPDATE ON conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Fonction pour créer automatiquement une conversation quand un client est ajouté
CREATE OR REPLACE FUNCTION create_conversation_for_new_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement une conversation pour le nouveau client
  INSERT INTO conversations (coach_id, client_id, last_message, last_message_time)
  VALUES (
    NEW.coach_id,
    NEW.id,
    'Conversation démarrée',
    NOW()::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement une conversation
CREATE TRIGGER trigger_create_conversation_for_new_client
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_new_client();

-- Créer des conversations d'exemple pour les clients existants
DO $$ 
DECLARE
    client_record RECORD;
BEGIN
    -- Pour chaque client existant, créer une conversation avec son coach
    FOR client_record IN 
        SELECT id, coach_id FROM clients 
        WHERE coach_id IS NOT NULL
    LOOP
        -- Vérifier si la conversation existe déjà
        IF NOT EXISTS (
            SELECT 1 FROM conversations 
            WHERE coach_id = client_record.coach_id 
            AND client_id = client_record.id
        ) THEN
            -- Créer la conversation
            INSERT INTO conversations (coach_id, client_id, last_message, last_message_time)
            VALUES (
                client_record.coach_id,
                client_record.id,
                'Conversation démarrée',
                NOW()::text
            );
        END IF;
    END LOOP;
END $$;
