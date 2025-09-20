-- Migration 080: Correction des fonctions de facturation
-- Date: 2025-01-11
-- Description: Correction des fonctions de base de données pour le système de facturation

-- Corriger la fonction get_coach_financial_stats
CREATE OR REPLACE FUNCTION get_coach_financial_stats(
  p_coach_id uuid,
  p_start_date timestamptz DEFAULT NULL,
  p_end_date timestamptz DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  stats jsonb;
  start_date timestamptz;
  end_date timestamptz;
BEGIN
  -- Définir les dates par défaut
  start_date := COALESCE(p_start_date, now() - interval '30 days');
  end_date := COALESCE(p_end_date, now());
  
  -- Calculer les statistiques financières
  SELECT jsonb_build_object(
    'total_revenue', COALESCE(SUM(i.amount_paid), 0),
    'monthly_revenue', COALESCE(SUM(i.amount_paid) FILTER (WHERE i.created_at >= now() - interval '30 days'), 0),
    'recurring_revenue', COALESCE(SUM(i.amount_paid) FILTER (WHERE i.subscription_id IS NOT NULL), 0),
    'pending_amount', COALESCE(SUM(i.amount_total - i.amount_paid), 0),
    'overdue_amount', COALESCE(SUM(i.amount_total - i.amount_paid) FILTER (WHERE i.status = 'overdue'), 0),
    'invoice_count', COUNT(i.id),
    'paid_invoices', COUNT(i.id) FILTER (WHERE i.status = 'paid'),
    'overdue_invoices', COUNT(i.id) FILTER (WHERE i.status = 'overdue'),
    'payment_rate', CASE 
      WHEN COUNT(i.id) > 0 THEN 
        ROUND((COUNT(i.id) FILTER (WHERE i.status = 'paid')::decimal / COUNT(i.id)::decimal) * 100, 1)
      ELSE 0 
    END,
    'revenue_growth', 0, -- À calculer avec les données précédentes
    'average_invoice_amount', COALESCE(AVG(i.amount_total), 0),
    'period_start', start_date,
    'period_end', end_date,
    'top_clients', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'id', c.id,
          'first_name', c.first_name,
          'last_name', c.last_name,
          'total_revenue', client_stats.total_revenue,
          'invoice_count', client_stats.invoice_count,
          'payment_rate', client_stats.payment_rate
        )
      )
      FROM (
        SELECT 
          c.id,
          c.first_name,
          c.last_name,
          SUM(i.amount_paid) as total_revenue,
          COUNT(i.id) as invoice_count,
          CASE 
            WHEN COUNT(i.id) > 0 THEN 
              ROUND((COUNT(i.id) FILTER (WHERE i.status = 'paid')::decimal / COUNT(i.id)::decimal) * 100, 1)
            ELSE 0 
          END as payment_rate
        FROM clients c
        LEFT JOIN invoices i ON i.client_id = c.id
        WHERE c.coach_id = p_coach_id
          AND (i.created_at BETWEEN start_date AND end_date OR i.created_at IS NULL)
        GROUP BY c.id, c.first_name, c.last_name
        HAVING SUM(i.amount_paid) > 0
        ORDER BY total_revenue DESC
        LIMIT 5
      ) client_stats
      JOIN clients c ON c.id = client_stats.id
    ),
    'service_breakdown', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'name', 'Séances de coaching',
          'revenue', COALESCE(SUM(i.amount_paid), 0),
          'invoice_count', COUNT(i.id)
        )
      )
      FROM invoices i
      WHERE i.coach_id = p_coach_id
        AND i.created_at BETWEEN start_date AND end_date
    ),
    'monthly_payments', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'month', TO_CHAR(month_series, 'YYYY-MM'),
          'count', COALESCE(payment_count, 0),
          'amount', COALESCE(payment_amount, 0)
        )
      )
      FROM (
        SELECT 
          generate_series(
            date_trunc('month', start_date),
            date_trunc('month', end_date),
            interval '1 month'
          ) as month_series
      ) months
      LEFT JOIN (
        SELECT 
          date_trunc('month', p.processed_at) as month,
          COUNT(*) as payment_count,
          SUM(p.amount) as payment_amount
        FROM payments p
        JOIN invoices i ON i.id = p.invoice_id
        WHERE i.coach_id = p_coach_id
          AND p.status = 'succeeded'
          AND p.processed_at BETWEEN start_date AND end_date
        GROUP BY date_trunc('month', p.processed_at)
      ) payments ON payments.month = months.month_series
      ORDER BY month_series
    ),
    'payment_methods', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'method', p.payment_method,
          'count', COUNT(*),
          'amount', SUM(p.amount)
        )
      )
      FROM payments p
      JOIN invoices i ON i.id = p.invoice_id
      WHERE i.coach_id = p_coach_id
        AND p.status = 'succeeded'
        AND p.processed_at BETWEEN start_date AND end_date
      GROUP BY p.payment_method
    )
  )
  INTO stats
  FROM invoices i
  WHERE i.coach_id = p_coach_id
    AND i.created_at BETWEEN start_date AND end_date;
  
  RETURN COALESCE(stats, '{}'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les factures avec les informations des clients
CREATE OR REPLACE FUNCTION get_invoices_with_clients(p_coach_id uuid)
RETURNS TABLE (
  id uuid,
  invoice_number text,
  amount_total decimal,
  amount_paid decimal,
  currency text,
  status invoice_status,
  due_date timestamptz,
  created_at timestamptz,
  client_first_name text,
  client_last_name text,
  client_email text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    i.id,
    i.invoice_number,
    i.amount_total,
    i.amount_paid,
    i.currency,
    i.status,
    i.due_date,
    i.created_at,
    c.first_name as client_first_name,
    c.last_name as client_last_name,
    c.contact as client_email
  FROM invoices i
  JOIN clients c ON c.id = i.client_id
  WHERE i.coach_id = p_coach_id
  ORDER BY i.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour obtenir les paiements récents avec les informations des clients
CREATE OR REPLACE FUNCTION get_recent_payments_with_clients(
  p_coach_id uuid,
  p_limit integer DEFAULT 10
)
RETURNS TABLE (
  id uuid,
  amount decimal,
  currency text,
  payment_method payment_method,
  status payment_status,
  processed_at timestamptz,
  client_first_name text,
  client_last_name text,
  invoice_number text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.amount,
    p.currency,
    p.payment_method,
    p.status,
    p.processed_at,
    c.first_name as client_first_name,
    c.last_name as client_last_name,
    i.invoice_number
  FROM payments p
  JOIN invoices i ON i.id = p.invoice_id
  JOIN clients c ON c.id = i.client_id
  WHERE i.coach_id = p_coach_id
    AND p.status = 'succeeded'
  ORDER BY p.processed_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour marquer une facture comme payée (simulation de paiement)
CREATE OR REPLACE FUNCTION simulate_payment(
  p_invoice_id uuid,
  p_payment_method payment_method DEFAULT 'card',
  p_amount decimal DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  payment_id uuid;
  invoice_amount decimal;
  payment_amount decimal;
BEGIN
  -- Récupérer le montant de la facture
  SELECT amount_total - amount_paid INTO invoice_amount
  FROM invoices
  WHERE id = p_invoice_id;
  
  -- Utiliser le montant fourni ou le montant restant
  payment_amount := COALESCE(p_amount, invoice_amount);
  
  -- Créer le paiement
  INSERT INTO payments (
    invoice_id,
    amount,
    currency,
    payment_method,
    status,
    processed_at
  ) VALUES (
    p_invoice_id,
    payment_amount,
    (SELECT currency FROM invoices WHERE id = p_invoice_id),
    p_payment_method,
    'succeeded',
    now()
  ) RETURNING id INTO payment_id;
  
  RETURN payment_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour générer un numéro de facture unique
CREATE OR REPLACE FUNCTION generate_invoice_number(p_coach_id uuid)
RETURNS text AS $$
DECLARE
  year_part text;
  prefix text;
  last_number integer;
  next_number text;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::text;
  prefix := 'BYW-' || year_part || '-';
  
  -- Récupérer le dernier numéro pour cette année
  SELECT COALESCE(
    MAX(CAST(SUBSTRING(invoice_number FROM LENGTH(prefix) + 1) AS INTEGER)), 
    0
  ) INTO last_number
  FROM invoices
  WHERE coach_id = p_coach_id
    AND invoice_number LIKE prefix || '%';
  
  -- Générer le prochain numéro
  next_number := LPAD((last_number + 1)::text, 3, '0');
  
  RETURN prefix || next_number;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ajouter des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_invoices_coach_created ON invoices(coach_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_processed ON payments(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_coach ON subscriptions(coach_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_client ON subscriptions(client_id);

-- Commentaires
COMMENT ON FUNCTION get_coach_financial_stats IS 'Calcule les statistiques financières complètes pour un coach';
COMMENT ON FUNCTION get_invoices_with_clients IS 'Récupère les factures avec les informations des clients';
COMMENT ON FUNCTION get_recent_payments_with_clients IS 'Récupère les paiements récents avec les informations des clients';
COMMENT ON FUNCTION simulate_payment IS 'Simule un paiement pour une facture (pour les tests)';
COMMENT ON FUNCTION generate_invoice_number IS 'Génère un numéro de facture unique pour un coach';
