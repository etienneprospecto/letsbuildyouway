-- Migration pour corriger le trigger de création automatique de conversations

-- Supprimer l'ancien trigger et fonction
DROP TRIGGER IF EXISTS trigger_create_conversation_for_new_client ON clients;
DROP FUNCTION IF EXISTS create_conversation_for_new_client();

-- Recréer la fonction avec des valeurs par défaut pour toutes les colonnes
CREATE OR REPLACE FUNCTION create_conversation_for_new_client()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer automatiquement une conversation pour le nouveau client
  INSERT INTO conversations (
    coach_id, 
    client_id, 
    last_message, 
    last_message_time,
    unread_count,
    is_online
  )
  VALUES (
    NEW.coach_id,
    NEW.id,
    'Bienvenue ! Votre coach est là pour vous accompagner.',
    NOW()::time::text,
    0,
    false
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recréer le trigger
CREATE TRIGGER trigger_create_conversation_for_new_client
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION create_conversation_for_new_client();

-- Créer manuellement la conversation pour Antoine (client existant)
-- Remplacer 'COACH_ID' et 'CLIENT_ID' par les vrais IDs de ton profil coach et du client Antoine
-- Tu peux les trouver dans Supabase > Table Editor > profiles et clients

-- Exemple (à adapter avec tes vrais IDs) :
-- INSERT INTO conversations (coach_id, client_id, last_message, last_message_time, unread_count, is_online)
-- VALUES (
--   'ton-uuid-coach-ici',
--   'uuid-antoine-ici', 
--   'Bienvenue Antoine ! Votre coach est là pour vous accompagner.',
--   NOW()::time::text,
--   0,
--   false
-- );
