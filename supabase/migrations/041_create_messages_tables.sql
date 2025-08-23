-- Migration pour créer les tables de messages et conversations

-- Table des conversations
CREATE TABLE IF NOT EXISTS conversations (
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

-- Table des messages
CREATE TABLE IF NOT EXISTS messages (
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

-- Activer RLS (Row Level Security)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Supprimer les anciennes politiques si elles existent
DROP POLICY IF EXISTS "Coaches can view own conversations" ON conversations;
DROP POLICY IF EXISTS "Coaches can create conversations" ON conversations;
DROP POLICY IF EXISTS "Coaches can update own conversations" ON conversations;
DROP POLICY IF EXISTS "Coaches can delete own conversations" ON conversations;
DROP POLICY IF EXISTS "Clients can view own conversations" ON conversations;

DROP POLICY IF EXISTS "Coaches can view messages from own conversations" ON messages;
DROP POLICY IF EXISTS "Coaches can create messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Coaches can update own messages" ON messages;
DROP POLICY IF EXISTS "Clients can view messages from own conversations" ON messages;
DROP POLICY IF EXISTS "Clients can create messages in own conversations" ON messages;
DROP POLICY IF EXISTS "Clients can update own messages" ON messages;

-- Politiques RLS pour les conversations
-- Les coachs peuvent voir leurs propres conversations
CREATE POLICY "Coaches can view own conversations" ON conversations
  FOR SELECT USING (auth.uid()::text = coach_id::text);

-- Les coachs peuvent créer des conversations
CREATE POLICY "Coaches can create conversations" ON conversations
  FOR INSERT WITH CHECK (auth.uid()::text = coach_id::text);

-- Les coachs peuvent mettre à jour leurs conversations
CREATE POLICY "Coaches can update own conversations" ON conversations
  FOR UPDATE USING (auth.uid()::text = coach_id::text);

-- Les coachs peuvent supprimer leurs conversations
CREATE POLICY "Coaches can delete own conversations" ON conversations
  FOR DELETE USING (auth.uid()::text = coach_id::text);

-- Les clients peuvent voir leurs propres conversations
CREATE POLICY "Clients can view own conversations" ON conversations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = conversations.client_id 
      AND clients.coach_id = auth.uid()
    )
  );

-- Politiques RLS pour les messages
-- Les coachs peuvent voir les messages de leurs conversations
CREATE POLICY "Coaches can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.coach_id = auth.uid()
    )
  );

-- Les coachs peuvent créer des messages dans leurs conversations
CREATE POLICY "Coaches can create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.coach_id = auth.uid()
    )
  );

-- Les coachs peuvent mettre à jour leurs messages
CREATE POLICY "Coaches can update own messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.coach_id = auth.uid()
    )
  );

-- Les clients peuvent voir les messages de leurs conversations
CREATE POLICY "Clients can view messages from own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );

-- Les clients peuvent créer des messages dans leurs conversations
CREATE POLICY "Clients can create messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );

-- Les clients peuvent mettre à jour leurs messages
CREATE POLICY "Clients can update own messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );

-- Supprimer les anciens triggers et fonctions si ils existent
DROP TRIGGER IF EXISTS trigger_update_conversations_updated_at ON conversations;
DROP FUNCTION IF EXISTS update_conversations_updated_at();
DROP TRIGGER IF EXISTS trigger_create_conversation_for_new_client ON clients;
DROP FUNCTION IF EXISTS create_conversation_for_new_client();

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
    NOW()::time::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour créer automatiquement une conversation
CREATE TRIGGER trigger_create_conversation_for_new_client
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_new_client();

-- Commentaires sur les tables
COMMENT ON TABLE conversations IS 'Table pour stocker les conversations entre coachs et clients';
COMMENT ON COLUMN conversations.coach_id IS 'ID du coach propriétaire de la conversation';
COMMENT ON COLUMN conversations.client_id IS 'ID du client participant à la conversation';
COMMENT ON COLUMN conversations.last_message IS 'Dernier message échangé dans la conversation';
COMMENT ON COLUMN conversations.last_message_time IS 'Heure du dernier message';
COMMENT ON COLUMN conversations.unread_count IS 'Nombre de messages non lus';
COMMENT ON COLUMN conversations.is_online IS 'Statut en ligne du client';

COMMENT ON TABLE messages IS 'Table pour stocker les messages individuels des conversations';
COMMENT ON COLUMN messages.conversation_id IS 'ID de la conversation à laquelle appartient le message';
COMMENT ON COLUMN messages.content IS 'Contenu du message';
COMMENT ON COLUMN messages.sender_id IS 'ID de l''expéditeur du message';
COMMENT ON COLUMN messages.sender_type IS 'Type d''expéditeur (coach ou client)';
COMMENT ON COLUMN messages.timestamp IS 'Horodatage du message';
COMMENT ON COLUMN messages.is_read IS 'Indique si le message a été lu';
