-- Create reminder_templates table
CREATE TABLE IF NOT EXISTS reminder_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reminder_type TEXT NOT NULL CHECK (reminder_type IN ('first_notice', 'second_notice', 'final_notice', 'overdue')),
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_reminder_templates_coach_id ON reminder_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_type ON reminder_templates(reminder_type);

-- Enable RLS
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own reminder templates" ON reminder_templates
  FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert their own reminder templates" ON reminder_templates
  FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own reminder templates" ON reminder_templates
  FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own reminder templates" ON reminder_templates
  FOR DELETE USING (auth.uid() = coach_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_reminder_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_reminder_templates_updated_at
  BEFORE UPDATE ON reminder_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_reminder_templates_updated_at();

-- Insert default reminder templates for existing coaches
INSERT INTO reminder_templates (coach_id, reminder_type, subject, content, is_active)
SELECT 
  u.id as coach_id,
  'first_notice' as reminder_type,
  'Rappel de paiement - Facture {{invoice_number}}' as subject,
  'Bonjour {{client_name}},

J''espère que vous allez bien !

Je vous contacte pour vous rappeler que la facture {{invoice_number}} d''un montant de {{amount}}€ était due le {{due_date}}.

Si vous avez déjà effectué le paiement, merci de l''avoir fait et veuillez ignorer ce message.

Dans le cas contraire, vous pouvez régler cette facture en cliquant sur le lien suivant :
{{payment_link}}

N''hésitez pas à me contacter si vous avez des questions.

Cordialement,
{{coach_name}}' as content,
  true as is_active
FROM auth.users u
WHERE u.role = 'coach'
ON CONFLICT DO NOTHING;

INSERT INTO reminder_templates (coach_id, reminder_type, subject, content, is_active)
SELECT 
  u.id as coach_id,
  'second_notice' as reminder_type,
  'Relance de paiement - Facture {{invoice_number}}' as subject,
  'Bonjour {{client_name}},

Je vous contacte concernant la facture {{invoice_number}} d''un montant de {{amount}}€ qui était due le {{due_date}}.

Cette facture est maintenant en retard de {{days_overdue}} jour(s).

Veuillez régler cette facture dans les plus brefs délais en cliquant sur le lien suivant :
{{payment_link}}

Des frais de retard pourraient être appliqués si le paiement n''est pas effectué rapidement.

Pour toute question, n''hésitez pas à me contacter.

Cordialement,
{{coach_name}}' as content,
  true as is_active
FROM auth.users u
WHERE u.role = 'coach'
ON CONFLICT DO NOTHING;

INSERT INTO reminder_templates (coach_id, reminder_type, subject, content, is_active)
SELECT 
  u.id as coach_id,
  'final_notice' as reminder_type,
  'Mise en demeure - Facture {{invoice_number}}' as subject,
  'Bonjour {{client_name}},

Je vous contacte concernant la facture {{invoice_number}} d''un montant de {{amount}}€ qui était due le {{due_date}}.

Cette facture est maintenant en retard de {{days_overdue}} jour(s).

Cette lettre constitue une mise en demeure de payer dans un délai de 8 jours à compter de la réception de ce message.

Passé ce délai, des poursuites pourraient être engagées.

Vous pouvez régler cette facture en cliquant sur le lien suivant :
{{payment_link}}

Je reste à votre disposition pour toute question.

Cordialement,
{{coach_name}}' as content,
  true as is_active
FROM auth.users u
WHERE u.role = 'coach'
ON CONFLICT DO NOTHING;

INSERT INTO reminder_templates (coach_id, reminder_type, subject, content, is_active)
SELECT 
  u.id as coach_id,
  'overdue' as reminder_type,
  'Suspension de service - Facture {{invoice_number}}' as subject,
  'Bonjour {{client_name}},

Malgré nos relances, la facture {{invoice_number}} d''un montant de {{amount}}€ reste impayée depuis {{days_overdue}} jour(s).

Conformément à nos conditions générales, vos services sont suspendus à compter d''aujourd''hui.

Pour réactiver vos services, veuillez régler cette facture en cliquant sur le lien suivant :
{{payment_link}}

Je reste à votre disposition pour toute question.

Cordialement,
{{coach_name}}' as content,
  true as is_active
FROM auth.users u
WHERE u.role = 'coach'
ON CONFLICT DO NOTHING;