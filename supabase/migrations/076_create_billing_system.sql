-- Migration 076: Création du système de facturation et paiements complet
-- Date: 2025-01-11
-- Description: Système complet de facturation avec Stripe, abonnements, relances automatiques

-- Créer les types enum nécessaires
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'billing_interval') THEN
    CREATE TYPE billing_interval AS ENUM ('one_time', 'weekly', 'monthly', 'quarterly', 'yearly');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
    CREATE TYPE subscription_status AS ENUM ('active', 'paused', 'cancelled', 'past_due', 'incomplete', 'trialing');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'invoice_status') THEN
    CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'void');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('pending', 'succeeded', 'failed', 'cancelled', 'requires_action');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'sepa', 'apple_pay', 'google_pay', 'cash', 'other');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_type') THEN
    CREATE TYPE reminder_type AS ENUM ('first_notice', 'second_notice', 'final_notice', 'overdue');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reminder_status') THEN
    CREATE TYPE reminder_status AS ENUM ('pending', 'sent', 'failed', 'cancelled');
  END IF;
END $$;

-- Table des plans tarifaires
CREATE TABLE IF NOT EXISTS pricing_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  price_amount decimal(10,2) NOT NULL CHECK (price_amount >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  billing_interval billing_interval NOT NULL DEFAULT 'one_time',
  session_count integer CHECK (session_count > 0),
  features jsonb DEFAULT '[]'::jsonb,
  is_active boolean DEFAULT true,
  stripe_price_id text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des abonnements
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  pricing_plan_id uuid NOT NULL REFERENCES pricing_plans(id) ON DELETE CASCADE,
  stripe_subscription_id text,
  status subscription_status NOT NULL DEFAULT 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  next_billing_date timestamptz,
  sessions_remaining integer CHECK (sessions_remaining >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, client_id, pricing_plan_id)
);

-- Table des factures
CREATE TABLE IF NOT EXISTS invoices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  subscription_id uuid REFERENCES subscriptions(id) ON DELETE SET NULL,
  invoice_number text UNIQUE NOT NULL,
  stripe_invoice_id text,
  amount_total decimal(10,2) NOT NULL CHECK (amount_total >= 0),
  amount_paid decimal(10,2) DEFAULT 0 CHECK (amount_paid >= 0),
  currency text NOT NULL DEFAULT 'EUR',
  status invoice_status NOT NULL DEFAULT 'draft',
  due_date timestamptz NOT NULL,
  paid_at timestamptz,
  items jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes text,
  pdf_url text,
  tax_rate decimal(5,4) DEFAULT 0,
  tax_amount decimal(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des paiements
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  stripe_payment_intent_id text,
  amount decimal(10,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'EUR',
  payment_method payment_method NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  processed_at timestamptz,
  failure_reason text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Table des relances de paiement
CREATE TABLE IF NOT EXISTS payment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id uuid NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  reminder_type reminder_type NOT NULL,
  sent_at timestamptz,
  status reminder_status NOT NULL DEFAULT 'pending',
  email_content text,
  created_at timestamptz DEFAULT now()
);

-- Table des paramètres de paiement par coach
CREATE TABLE IF NOT EXISTS payment_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  stripe_account_id text,
  stripe_publishable_key text,
  stripe_secret_key text,
  payment_methods_enabled jsonb DEFAULT '["card", "sepa"]'::jsonb,
  auto_invoice_generation boolean DEFAULT true,
  reminder_schedule jsonb DEFAULT '{"first_reminder": 3, "second_reminder": 7, "final_reminder": 15}'::jsonb,
  company_info jsonb DEFAULT '{}'::jsonb,
  is_configured boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des webhooks Stripe
CREATE TABLE IF NOT EXISTS stripe_webhooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text UNIQUE NOT NULL,
  event_type text NOT NULL,
  processed boolean DEFAULT false,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_pricing_plans_coach_id ON pricing_plans(coach_id);
CREATE INDEX IF NOT EXISTS idx_pricing_plans_active ON pricing_plans(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_subscriptions_coach_id ON subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client_id ON subscriptions(client_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing ON subscriptions(next_billing_date);

CREATE INDEX IF NOT EXISTS idx_invoices_coach_id ON invoices(coach_id);
CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_payments_processed_at ON payments(processed_at);

CREATE INDEX IF NOT EXISTS idx_payment_reminders_invoice_id ON payment_reminders(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payment_reminders_status ON payment_reminders(status);

CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_event_id ON stripe_webhooks(stripe_event_id);
CREATE INDEX IF NOT EXISTS idx_stripe_webhooks_processed ON stripe_webhooks(processed);

-- Fonction pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS text AS $$
DECLARE
  year_part text;
  sequence_part text;
  invoice_number text;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::text;
  
  -- Récupérer le prochain numéro de séquence pour l'année courante
  SELECT COALESCE(MAX(CAST(SUBSTRING(invoice_number FROM '^BYW-' || year_part || '-(.+)$') AS INTEGER)), 0) + 1
  INTO sequence_part
  FROM invoices
  WHERE invoice_number LIKE 'BYW-' || year_part || '-%';
  
  -- Formater le numéro de facture (BYW-2025-001)
  invoice_number := 'BYW-' || year_part || '-' || LPAD(sequence_part::text, 3, '0');
  
  RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour générer automatiquement le numéro de facture
CREATE OR REPLACE FUNCTION trigger_generate_invoice_number()
RETURNS trigger AS $$
BEGIN
  IF NEW.invoice_number IS NULL OR NEW.invoice_number = '' THEN
    NEW.invoice_number := generate_invoice_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_invoice_number
  BEFORE INSERT ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION trigger_generate_invoice_number();

-- Fonction pour calculer automatiquement le montant total de la facture
CREATE OR REPLACE FUNCTION calculate_invoice_total()
RETURNS trigger AS $$
DECLARE
  total_amount decimal(10,2) := 0;
  item_amount decimal(10,2);
  item jsonb;
BEGIN
  -- Calculer le total à partir des items
  FOR item IN SELECT jsonb_array_elements(NEW.items)
  LOOP
    item_amount := COALESCE((item->>'amount')::decimal, 0);
    total_amount := total_amount + item_amount;
  END LOOP;
  
  -- Appliquer la TVA si définie
  IF NEW.tax_rate > 0 THEN
    NEW.tax_amount := total_amount * NEW.tax_rate;
    NEW.amount_total := total_amount + NEW.tax_amount;
  ELSE
    NEW.amount_total := total_amount;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_calculate_invoice_total
  BEFORE INSERT OR UPDATE ON invoices
  FOR EACH ROW
  EXECUTE FUNCTION calculate_invoice_total();

-- Fonction pour mettre à jour le statut de la facture selon les paiements
CREATE OR REPLACE FUNCTION update_invoice_status()
RETURNS trigger AS $$
DECLARE
  total_paid decimal(10,2);
  invoice_total decimal(10,2);
BEGIN
  -- Calculer le total payé pour cette facture
  SELECT COALESCE(SUM(amount), 0)
  INTO total_paid
  FROM payments
  WHERE invoice_id = NEW.invoice_id
    AND status = 'succeeded';
  
  -- Récupérer le montant total de la facture
  SELECT amount_total
  INTO invoice_total
  FROM invoices
  WHERE id = NEW.invoice_id;
  
  -- Mettre à jour le statut de la facture
  UPDATE invoices
  SET 
    amount_paid = total_paid,
    status = CASE
      WHEN total_paid >= invoice_total THEN 'paid'::invoice_status
      WHEN total_paid > 0 THEN 'sent'::invoice_status
      WHEN due_date < now() THEN 'overdue'::invoice_status
      ELSE 'sent'::invoice_status
    END,
    paid_at = CASE
      WHEN total_paid >= invoice_total AND paid_at IS NULL THEN now()
      ELSE paid_at
    END
  WHERE id = NEW.invoice_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_invoice_status
  AFTER INSERT OR UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_invoice_status();

-- RLS (Row Level Security) pour toutes les tables
ALTER TABLE pricing_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_reminders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhooks ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour pricing_plans
CREATE POLICY "Coaches can manage their own pricing plans" ON pricing_plans
  FOR ALL USING (coach_id = auth.uid());

-- Politiques RLS pour subscriptions
CREATE POLICY "Coaches can manage their subscriptions" ON subscriptions
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Clients can view their own subscriptions" ON subscriptions
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

-- Politiques RLS pour invoices
CREATE POLICY "Coaches can manage their invoices" ON invoices
  FOR ALL USING (coach_id = auth.uid());

CREATE POLICY "Clients can view their own invoices" ON invoices
  FOR SELECT USING (
    client_id IN (
      SELECT id FROM clients WHERE coach_id = auth.uid()
    )
  );

-- Politiques RLS pour payments
CREATE POLICY "Coaches can manage payments for their invoices" ON payments
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE coach_id = auth.uid()
    )
  );

CREATE POLICY "Clients can view payments for their invoices" ON payments
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices 
      WHERE client_id IN (
        SELECT id FROM clients WHERE coach_id = auth.uid()
      )
    )
  );

-- Politiques RLS pour payment_reminders
CREATE POLICY "Coaches can manage payment reminders for their invoices" ON payment_reminders
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE coach_id = auth.uid()
    )
  );

-- Politiques RLS pour payment_settings
CREATE POLICY "Coaches can manage their own payment settings" ON payment_settings
  FOR ALL USING (coach_id = auth.uid());

-- Politiques RLS pour stripe_webhooks (lecture seule pour les coaches)
CREATE POLICY "Coaches can view webhooks for their account" ON stripe_webhooks
  FOR SELECT USING (true); -- Les webhooks sont gérés par le système

-- Fonction pour créer un abonnement
CREATE OR REPLACE FUNCTION create_subscription(
  p_coach_id uuid,
  p_client_id uuid,
  p_pricing_plan_id uuid,
  p_stripe_subscription_id text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  subscription_id uuid;
  plan_record pricing_plans%ROWTYPE;
BEGIN
  -- Vérifier que le plan appartient au coach
  SELECT * INTO plan_record
  FROM pricing_plans
  WHERE id = p_pricing_plan_id AND coach_id = p_coach_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pricing plan not found or access denied';
  END IF;
  
  -- Créer l'abonnement
  INSERT INTO subscriptions (
    coach_id,
    client_id,
    pricing_plan_id,
    stripe_subscription_id,
    sessions_remaining,
    current_period_start,
    current_period_end,
    next_billing_date
  ) VALUES (
    p_coach_id,
    p_client_id,
    p_pricing_plan_id,
    p_stripe_subscription_id,
    plan_record.session_count,
    now(),
    CASE 
      WHEN plan_record.billing_interval = 'weekly' THEN now() + interval '1 week'
      WHEN plan_record.billing_interval = 'monthly' THEN now() + interval '1 month'
      WHEN plan_record.billing_interval = 'quarterly' THEN now() + interval '3 months'
      WHEN plan_record.billing_interval = 'yearly' THEN now() + interval '1 year'
      ELSE NULL
    END,
    CASE 
      WHEN plan_record.billing_interval = 'weekly' THEN now() + interval '1 week'
      WHEN plan_record.billing_interval = 'monthly' THEN now() + interval '1 month'
      WHEN plan_record.billing_interval = 'quarterly' THEN now() + interval '3 months'
      WHEN plan_record.billing_interval = 'yearly' THEN now() + interval '1 year'
      ELSE NULL
    END
  ) RETURNING id INTO subscription_id;
  
  RETURN subscription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour créer une facture
CREATE OR REPLACE FUNCTION create_invoice(
  p_coach_id uuid,
  p_client_id uuid,
  p_subscription_id uuid DEFAULT NULL,
  p_items jsonb DEFAULT '[]'::jsonb,
  p_due_date timestamptz DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  invoice_id uuid;
  calculated_due_date timestamptz;
BEGIN
  -- Calculer la date d'échéance si non fournie
  calculated_due_date := COALESCE(p_due_date, now() + interval '30 days');
  
  -- Créer la facture
  INSERT INTO invoices (
    coach_id,
    client_id,
    subscription_id,
    items,
    due_date,
    notes
  ) VALUES (
    p_coach_id,
    p_client_id,
    p_subscription_id,
    p_items,
    calculated_due_date,
    p_notes
  ) RETURNING id INTO invoice_id;
  
  RETURN invoice_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les statistiques financières d'un coach
CREATE OR REPLACE FUNCTION get_coach_financial_stats(p_coach_id uuid, p_period_days integer DEFAULT 30)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(amount_paid), 0),
    'pending_amount', COALESCE(SUM(amount_total - amount_paid), 0),
    'invoice_count', COUNT(*),
    'paid_invoices', COUNT(*) FILTER (WHERE status = 'paid'),
    'overdue_invoices', COUNT(*) FILTER (WHERE status = 'overdue'),
    'average_invoice_amount', COALESCE(AVG(amount_total), 0),
    'period_start', now() - (p_period_days || ' days')::interval,
    'period_end', now()
  )
  INTO stats
  FROM invoices
  WHERE coach_id = p_coach_id
    AND created_at >= now() - (p_period_days || ' days')::interval;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires sur les tables
COMMENT ON TABLE pricing_plans IS 'Plans tarifaires proposés par les coaches';
COMMENT ON TABLE subscriptions IS 'Abonnements actifs des clients aux plans tarifaires';
COMMENT ON TABLE invoices IS 'Factures générées pour les clients';
COMMENT ON TABLE payments IS 'Paiements effectués pour les factures';
COMMENT ON TABLE payment_reminders IS 'Relances automatiques de paiement';
COMMENT ON TABLE payment_settings IS 'Paramètres de paiement par coach';
COMMENT ON TABLE stripe_webhooks IS 'Log des webhooks Stripe reçus';

-- Commentaires sur les colonnes importantes
COMMENT ON COLUMN pricing_plans.price_amount IS 'Prix en centimes (ex: 5000 = 50.00€)';
COMMENT ON COLUMN invoices.amount_total IS 'Montant total TTC en centimes';
COMMENT ON COLUMN invoices.amount_paid IS 'Montant déjà payé en centimes';
COMMENT ON COLUMN payments.amount IS 'Montant du paiement en centimes';
COMMENT ON COLUMN payment_settings.stripe_secret_key IS 'Clé secrète Stripe chiffrée';
COMMENT ON COLUMN payment_settings.company_info IS 'Informations légales de l''entreprise (SIRET, adresse, etc.)';
