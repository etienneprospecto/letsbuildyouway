-- Script de création des tables de facturation BYW
-- À exécuter dans l'interface Supabase (SQL Editor)

-- 1. Créer les types ENUM
DO $$ BEGIN
    CREATE TYPE billing_interval AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'past_due', 'incomplete', 'trialing');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'requires_action');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'sepa', 'apple_pay', 'google_pay', 'cash', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_type AS ENUM ('first_notice', 'second_notice', 'final_notice', 'overdue');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Créer la table pricing_plans
CREATE TABLE IF NOT EXISTS pricing_plans (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price_amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    billing_interval billing_interval NOT NULL,
    session_count INTEGER,
    features JSONB,
    is_active BOOLEAN DEFAULT true,
    stripe_price_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Créer la table subscriptions
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pricing_plan_id UUID NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
    stripe_subscription_id TEXT,
    status subscription_status NOT NULL DEFAULT 'active',
    current_period_start TIMESTAMP WITH TIME ZONE,
    current_period_end TIMESTAMP WITH TIME ZONE,
    next_billing_date TIMESTAMP WITH TIME ZONE,
    sessions_remaining INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Créer la table invoices
CREATE TABLE IF NOT EXISTS invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    invoice_number TEXT NOT NULL UNIQUE,
    stripe_invoice_id TEXT,
    amount_total DECIMAL(10,2) NOT NULL,
    amount_paid DECIMAL(10,2) DEFAULT 0,
    currency TEXT NOT NULL DEFAULT 'EUR',
    status invoice_status NOT NULL DEFAULT 'draft',
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    items JSONB,
    notes TEXT,
    pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Créer la table payments
CREATE TABLE IF NOT EXISTS payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    stripe_payment_intent_id TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT NOT NULL DEFAULT 'EUR',
    payment_method payment_method NOT NULL,
    status payment_status NOT NULL DEFAULT 'pending',
    processed_at TIMESTAMP WITH TIME ZONE,
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Créer la table payment_reminders
CREATE TABLE IF NOT EXISTS payment_reminders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    reminder_type reminder_type NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE NOT NULL,
    status reminder_status NOT NULL DEFAULT 'sent',
    email_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Créer la table payment_settings
CREATE TABLE IF NOT EXISTS payment_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    stripe_account_id TEXT,
    stripe_publishable_key TEXT,
    stripe_secret_key TEXT,
    payment_methods_enabled JSONB DEFAULT '{"card": true, "sepa": true, "apple_pay": true, "google_pay": true}',
    auto_invoice_generation BOOLEAN DEFAULT true,
    reminder_schedule JSONB DEFAULT '{"first_reminder_days": 3, "second_reminder_days": 7, "final_reminder_days": 15, "overdue_suspension_days": 30}',
    company_info JSONB,
    is_configured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Créer la table stripe_webhooks
CREATE TABLE IF NOT EXISTS stripe_webhooks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id TEXT NOT NULL UNIQUE,
    event_type TEXT NOT NULL,
    processed BOOLEAN DEFAULT false,
    processed_at TIMESTAMP WITH TIME ZONE,
    error TEXT,
    data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Créer la table reminder_templates
CREATE TABLE IF NOT EXISTS reminder_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    coach_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    reminder_type reminder_type NOT NULL,
    subject TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Créer les index pour les performances
CREATE INDEX IF NOT EXISTS idx_pricing_plans_coach_id ON pricing_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active);

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_id ON subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_pricing_plan_id ON subscriptions(pricing_plan_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

CREATE INDEX IF NOT EXISTS idx_invoices_coach_id ON invoices(coach_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_processed_at ON payments(processed_at);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_type ON payment_reminders(reminder_type);

CREATE INDEX IF NOT EXISTS idx_payment_settings_coach_id ON payment_settings(coach_id);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON stripe_webhooks(event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON stripe_webhooks(processed);

CREATE INDEX IF NOT EXISTS idx_reminder_templates_coach_id ON reminder_templates(coach_id);
CREATE INDEX IF NOT EXISTS idx_reminder_templates_type ON reminder_templates(reminder_type);

-- 11. Activer RLS (Row Level Security)
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminder_templates ENABLE ROW LEVEL SECURITY;

-- 12. Créer les politiques RLS pour pricing_plans
CREATE POLICY "Users can view their own pricing plans" ON pricing_plans
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert their own pricing plans" ON pricing_plans
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own pricing plans" ON pricing_plans
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own pricing plans" ON pricing_plans
    FOR DELETE USING (auth.uid() = coach_id);

-- 13. Créer les politiques RLS pour subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
    FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Users can insert their own subscriptions" ON subscriptions
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own subscriptions" ON subscriptions
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own subscriptions" ON subscriptions
    FOR DELETE USING (auth.uid() = coach_id);

-- 14. Créer les politiques RLS pour invoices
CREATE POLICY "Users can view their own invoices" ON invoices
    FOR SELECT USING (auth.uid() = coach_id OR auth.uid() = client_id);

CREATE POLICY "Users can insert their own invoices" ON invoices
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own invoices" ON invoices
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own invoices" ON invoices
    FOR DELETE USING (auth.uid() = coach_id);

-- 15. Créer les politiques RLS pour payments
CREATE POLICY "Users can view payments for their invoices" ON payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND (invoices.coach_id = auth.uid() OR invoices.client_id = auth.uid())
        )
    );

CREATE POLICY "Users can insert payments for their invoices" ON payments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND (invoices.coach_id = auth.uid() OR invoices.client_id = auth.uid())
        )
    );

CREATE POLICY "Users can update payments for their invoices" ON payments
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payments.invoice_id 
            AND (invoices.coach_id = auth.uid() OR invoices.client_id = auth.uid())
        )
    );

-- 16. Créer les politiques RLS pour payment_reminders
CREATE POLICY "Users can view reminders for their invoices" ON payment_reminders
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payment_reminders.invoice_id 
            AND invoices.coach_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert reminders for their invoices" ON payment_reminders
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM invoices 
            WHERE invoices.id = payment_reminders.invoice_id 
            AND invoices.coach_id = auth.uid()
        )
    );

-- 17. Créer les politiques RLS pour payment_settings
CREATE POLICY "Users can view their own payment settings" ON payment_settings
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert their own payment settings" ON payment_settings
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own payment settings" ON payment_settings
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own payment settings" ON payment_settings
    FOR DELETE USING (auth.uid() = coach_id);

-- 18. Créer les politiques RLS pour stripe_webhooks
CREATE POLICY "Service role can manage webhooks" ON stripe_webhooks
    FOR ALL USING (true);

-- 19. Créer les politiques RLS pour reminder_templates
CREATE POLICY "Users can view their own reminder templates" ON reminder_templates
    FOR SELECT USING (auth.uid() = coach_id);

CREATE POLICY "Users can insert their own reminder templates" ON reminder_templates
    FOR INSERT WITH CHECK (auth.uid() = coach_id);

CREATE POLICY "Users can update their own reminder templates" ON reminder_templates
    FOR UPDATE USING (auth.uid() = coach_id);

CREATE POLICY "Users can delete their own reminder templates" ON reminder_templates
    FOR DELETE USING (auth.uid() = coach_id);

-- 20. Créer les fonctions de mise à jour des timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 21. Créer les triggers pour updated_at
CREATE TRIGGER update_pricing_plans_updated_at
    BEFORE UPDATE ON pricing_plans
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_settings_updated_at
    BEFORE UPDATE ON payment_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminder_templates_updated_at
    BEFORE UPDATE ON reminder_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 22. Créer la fonction pour les statistiques financières
CREATE OR REPLACE FUNCTION get_coach_financial_stats(
    p_coach_id UUID,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
    start_date_filter TIMESTAMP WITH TIME ZONE;
    end_date_filter TIMESTAMP WITH TIME ZONE;
BEGIN
    -- Définir les dates par défaut si non fournies
    start_date_filter := COALESCE(p_start_date, NOW() - INTERVAL '12 months');
    end_date_filter := COALESCE(p_end_date, NOW());
    
    WITH financial_data AS (
        SELECT 
            -- Revenus totaux
            COALESCE(SUM(CASE WHEN p.status = 'succeeded' THEN p.amount ELSE 0 END), 0) as total_revenue,
            
            -- Revenus récurrents (abonnements actifs)
            COALESCE(SUM(CASE 
                WHEN s.status = 'active' AND p.status = 'succeeded' 
                THEN p.amount 
                ELSE 0 
            END), 0) as recurring_revenue,
            
            -- Taux de paiement
            CASE 
                WHEN COUNT(*) > 0 THEN 
                    (COUNT(CASE WHEN p.status = 'succeeded' THEN 1 END)::FLOAT / COUNT(*)::FLOAT) * 100
                ELSE 0 
            END as payment_rate,
            
            -- Factures en retard
            COUNT(CASE WHEN i.status = 'overdue' THEN 1 END) as overdue_invoices,
            
            -- Montant des impayés
            COALESCE(SUM(CASE WHEN i.status = 'overdue' THEN i.amount_total - i.amount_paid ELSE 0 END), 0) as overdue_amount,
            
            -- Croissance des revenus (comparaison avec la période précédente)
            COALESCE(SUM(CASE 
                WHEN p.processed_at >= start_date_filter + INTERVAL '6 months' 
                AND p.processed_at < end_date_filter 
                AND p.status = 'succeeded' 
                THEN p.amount 
                ELSE 0 
            END), 0) as current_period_revenue,
            
            COALESCE(SUM(CASE 
                WHEN p.processed_at >= start_date_filter 
                AND p.processed_at < start_date_filter + INTERVAL '6 months' 
                AND p.status = 'succeeded' 
                THEN p.amount 
                ELSE 0 
            END), 0) as previous_period_revenue
            
        FROM invoices i
        LEFT JOIN payments p ON i.id = p.invoice_id
        LEFT JOIN subscriptions s ON i.subscription_id = s.id
        WHERE i.coach_id = p_coach_id
        AND i.created_at >= start_date_filter
        AND i.created_at <= end_date_filter
    )
    SELECT json_build_object(
        'total_revenue', financial_data.total_revenue,
        'recurring_revenue', financial_data.recurring_revenue,
        'payment_rate', financial_data.payment_rate,
        'overdue_invoices', financial_data.overdue_invoices,
        'overdue_amount', financial_data.overdue_amount,
        'revenue_growth', CASE 
            WHEN financial_data.previous_period_revenue > 0 THEN
                ((financial_data.current_period_revenue - financial_data.previous_period_revenue) / financial_data.previous_period_revenue) * 100
            ELSE 0
        END,
        'monthly_revenue', financial_data.total_revenue / 12,
        'top_clients', (
            SELECT json_agg(
                json_build_object(
                    'id', client_id,
                    'first_name', profiles.first_name,
                    'last_name', profiles.last_name,
                    'total_revenue', client_revenue,
                    'invoice_count', invoice_count,
                    'payment_rate', payment_rate
                )
            )
            FROM (
                SELECT 
                    i.client_id,
                    p.first_name,
                    p.last_name,
                    SUM(CASE WHEN pay.status = 'succeeded' THEN pay.amount ELSE 0 END) as client_revenue,
                    COUNT(i.id) as invoice_count,
                    CASE 
                        WHEN COUNT(i.id) > 0 THEN 
                            (COUNT(CASE WHEN pay.status = 'succeeded' THEN 1 END)::FLOAT / COUNT(i.id)::FLOAT) * 100
                        ELSE 0 
                    END as payment_rate
                FROM invoices i
                LEFT JOIN payments pay ON i.id = pay.invoice_id
                LEFT JOIN profiles p ON i.client_id = p.id
                WHERE i.coach_id = p_coach_id
                AND i.created_at >= start_date_filter
                AND i.created_at <= end_date_filter
                GROUP BY i.client_id, p.first_name, p.last_name
                ORDER BY client_revenue DESC
                LIMIT 5
            ) top_clients
        )
    ) INTO result
    FROM financial_data;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- 23. Insérer des templates de relance par défaut pour les coaches existants
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

-- Script terminé !
-- Toutes les tables de facturation ont été créées avec succès.
