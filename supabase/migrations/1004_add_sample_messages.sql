-- Migration pour ajouter des messages d'exemple pour tester la fonctionnalité

-- Ajouter des messages d'exemple pour les conversations existantes
DO $$ 
DECLARE
    conv_record RECORD;
    coach_id_val UUID;
    client_id_val UUID;
BEGIN
    -- Récupérer l'ID du coach (premier coach trouvé)
    SELECT id INTO coach_id_val FROM profiles WHERE role = 'coach' LIMIT 1;
    
    IF coach_id_val IS NOT NULL THEN
        -- Pour chaque conversation existante, ajouter quelques messages d'exemple
        FOR conv_record IN 
            SELECT id, client_id FROM conversations 
            WHERE coach_id = coach_id_val
        LOOP
            -- Vérifier si des messages existent déjà pour cette conversation
            IF NOT EXISTS (
                SELECT 1 FROM messages 
                WHERE conversation_id = conv_record.id
            ) THEN
                -- Ajouter un message de bienvenue du coach
                INSERT INTO messages (conversation_id, content, sender_id, sender_type, timestamp, is_read)
                VALUES (
                    conv_record.id,
                    'Bonjour ! Bienvenue dans votre espace de coaching BYW. N''hésitez pas à me poser vos questions !',
                    coach_id_val,
                    'coach',
                    NOW()::text,
                    false
                );
                
                -- Ajouter un message de réponse du client
                INSERT INTO messages (conversation_id, content, sender_id, sender_type, timestamp, is_read)
                VALUES (
                    conv_record.id,
                    'Merci ! Je suis ravi de commencer ce coaching avec vous.',
                    conv_record.client_id,
                    'client',
                    (NOW() + INTERVAL '5 minutes')::text,
                    true
                );
                
                -- Ajouter un autre message du coach
                INSERT INTO messages (conversation_id, content, sender_id, sender_type, timestamp, is_read)
                VALUES (
                    conv_record.id,
                    'Parfait ! Nous allons travailler ensemble pour atteindre vos objectifs. Avez-vous des questions sur votre programme d''entraînement ?',
                    coach_id_val,
                    'coach',
                    (NOW() + INTERVAL '10 minutes')::text,
                    false
                );
                
                -- Mettre à jour la conversation avec le dernier message
                UPDATE conversations 
                SET 
                    last_message = 'Parfait ! Nous allons travailler ensemble pour atteindre vos objectifs. Avez-vous des questions sur votre programme d''entraînement ?',
                    last_message_time = (NOW() + INTERVAL '10 minutes')::text,
                    unread_count = 1
                WHERE id = conv_record.id;
            END IF;
        END LOOP;
    END IF;
END $$;
