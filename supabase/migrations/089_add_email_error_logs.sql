-- Migration: Add email error logs table
-- Description: Table pour logger les erreurs d'envoi d'emails

CREATE TABLE IF NOT EXISTS email_error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES client_invitations(id) ON DELETE CASCADE,
  client_email TEXT NOT NULL,
  error_type TEXT NOT NULL,
  error_message TEXT NOT NULL,
  error_details JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_email_error_logs_client_email ON email_error_logs(client_email);
CREATE INDEX IF NOT EXISTS idx_email_error_logs_timestamp ON email_error_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_email_error_logs_invitation_id ON email_error_logs(invitation_id);

-- RLS (Row Level Security)
ALTER TABLE email_error_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Les coaches peuvent voir les logs de leurs invitations
CREATE POLICY "Coaches can view their invitation error logs" ON email_error_logs
  FOR SELECT USING (
    invitation_id IN (
      SELECT id FROM client_invitations 
      WHERE coach_id = auth.uid()
    )
  );

-- Policy: Les coaches peuvent insérer des logs d'erreur
CREATE POLICY "Coaches can insert error logs" ON email_error_logs
  FOR INSERT WITH CHECK (
    invitation_id IN (
      SELECT id FROM client_invitations 
      WHERE coach_id = auth.uid()
    )
  );

-- Commentaires
COMMENT ON TABLE email_error_logs IS 'Logs des erreurs d''envoi d''emails d''invitation';
COMMENT ON COLUMN email_error_logs.invitation_id IS 'ID de l''invitation associée';
COMMENT ON COLUMN email_error_logs.client_email IS 'Email du client destinataire';
COMMENT ON COLUMN email_error_logs.error_type IS 'Type d''erreur (Timeout, Network, API, etc.)';
COMMENT ON COLUMN email_error_logs.error_message IS 'Message d''erreur détaillé';
COMMENT ON COLUMN email_error_logs.error_details IS 'Détails complets de l''erreur en JSON';
