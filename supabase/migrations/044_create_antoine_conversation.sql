-- Migration pour créer manuellement la conversation avec Antoine

-- Créer la conversation avec Antoine en trouvant automatiquement les IDs
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
WHERE c.email = 'paulfst.business@gmail.com'
  AND NOT EXISTS (
    SELECT 1 FROM conversations conv 
    WHERE conv.coach_id = p.id AND conv.client_id = c.id
  );

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
