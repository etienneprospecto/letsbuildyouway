-- Migration simple pour créer la table conversations

-- Supprimer les tables si elles existent déjà
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Créer la table conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  last_message TEXT,
  last_message_time TEXT,
  unread_count INTEGER DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contrainte unique pour éviter les doublons
  UNIQUE(coach_id, client_id)
);

-- Créer la table messages
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

-- Activer RLS
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Politiques RLS simples pour les conversations
CREATE POLICY "Coaches can manage own conversations" ON conversations
  FOR ALL USING (coach_id = auth.uid());

-- Politiques RLS simples pour les messages
CREATE POLICY "Coaches can manage messages in own conversations" ON messages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.coach_id = auth.uid()
    )
  );

-- Créer la conversation avec Antoine
INSERT INTO conversations (coach_id, client_id, client_name, last_message, last_message_time, unread_count, is_online)
SELECT 
  p.id as coach_id,
  c.id as client_id,
  c.first_name || ' ' || c.last_name as client_name,
  'Bienvenue Antoine ! Votre coach est là pour vous accompagner.' as last_message,
  NOW()::time::text as last_message_time,
  0 as unread_count,
  false as is_online
FROM profiles p
JOIN clients c ON c.coach_id = p.id
WHERE c.email = 'paulfst.business@gmail.com';

-- Créer un message de bienvenue
INSERT INTO messages (conversation_id, content, sender_id, sender_type, timestamp, is_read)
SELECT 
  conv.id as conversation_id,
  'Bienvenue Antoine ! Votre coach est là pour vous accompagner dans votre parcours fitness.' as content,
  conv.coach_id as sender_id,
  'coach' as sender_type,
  NOW()::time::text as timestamp,
  false as is_read
FROM conversations conv
JOIN clients c ON c.id = conv.client_id
WHERE c.email = 'paulfst.business@gmail.com';
