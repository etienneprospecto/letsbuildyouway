-- Migration pour corriger les politiques RLS et permettre aux clients d'accéder à leurs conversations

-- Ajouter des politiques RLS pour les clients sur les conversations
CREATE POLICY "Clients can view own conversations" ON conversations
  FOR SELECT USING (client_id = auth.uid());

-- Ajouter des politiques RLS pour les clients sur les messages
CREATE POLICY "Clients can view messages in own conversations" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );

-- Permettre aux clients d'envoyer des messages dans leurs conversations
CREATE POLICY "Clients can insert messages in own conversations" ON messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );

-- Permettre aux clients de marquer leurs messages comme lus
CREATE POLICY "Clients can update own messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.client_id = auth.uid()
    )
  );
