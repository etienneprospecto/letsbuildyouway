-- Migration pour créer le système de calendrier complet
-- Tables : availability_slots, appointments, blocked_periods, calendar_notifications
-- Tables externes : calendar_integrations, sync_events, calendar_settings

-- Créer les types énumérés pour le calendrier
CREATE TYPE session_type AS ENUM ('individual', 'group', 'video', 'in_person');
CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE notification_type AS ENUM ('reminder_24h', 'reminder_2h', 'booking_confirmation', 'cancellation');
CREATE TYPE notification_status AS ENUM ('pending', 'sent', 'failed');
CREATE TYPE calendar_provider AS ENUM ('google', 'outlook', 'apple');
CREATE TYPE sync_direction AS ENUM ('import', 'export', 'bidirectional');
CREATE TYPE sync_status AS ENUM ('success', 'failed', 'pending');
CREATE TYPE conflict_resolution_mode AS ENUM ('manual', 'auto_reschedule', 'auto_block');

-- Table des créneaux de disponibilité des coachs
CREATE TABLE availability_slots (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=dimanche, 1=lundi, etc.
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type session_type NOT NULL DEFAULT 'individual',
  duration_minutes INTEGER NOT NULL DEFAULT 60,
  max_clients INTEGER NOT NULL DEFAULT 1,
  price DECIMAL(10,2), -- Prix du créneau
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CHECK (start_time < end_time),
  CHECK (duration_minutes > 0),
  CHECK (max_clients > 0)
);

-- Table des rendez-vous
CREATE TABLE appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  session_type session_type NOT NULL DEFAULT 'individual',
  status appointment_status NOT NULL DEFAULT 'pending',
  client_notes TEXT,
  coach_notes TEXT,
  meeting_link TEXT, -- Lien Zoom/Meet pour les visios
  location TEXT, -- Adresse pour les séances en présentiel
  price DECIMAL(10,2), -- Prix facturé
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CHECK (start_time < end_time),
  CHECK (appointment_date >= CURRENT_DATE)
);

-- Table des périodes bloquées par les coachs
CREATE TABLE blocked_periods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  start_time TIME, -- NULL si toute la journée
  end_time TIME, -- NULL si toute la journée
  reason TEXT NOT NULL,
  is_all_day BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CHECK (start_date <= end_date),
  CHECK (
    (is_all_day = true AND start_time IS NULL AND end_time IS NULL) OR
    (is_all_day = false AND start_time IS NOT NULL AND end_time IS NOT NULL AND start_time < end_time)
  )
);

-- Table des notifications de calendrier
CREATE TABLE calendar_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  notification_type notification_type NOT NULL,
  recipient_id UUID NOT NULL, -- Peut être coach ou client
  sent_at TIMESTAMPTZ,
  status notification_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table des intégrations calendriers externes
CREATE TABLE calendar_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  provider calendar_provider NOT NULL,
  access_token TEXT NOT NULL, -- Sera chiffré côté application
  refresh_token TEXT, -- Sera chiffré côté application
  token_expires_at TIMESTAMPTZ,
  calendar_id TEXT NOT NULL, -- ID du calendrier externe
  calendar_name TEXT, -- Nom du calendrier externe
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_sync TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un coach ne peut avoir qu'une intégration par provider
  UNIQUE(coach_id, provider)
);

-- Table des événements synchronisés
CREATE TABLE sync_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE, -- NULL pour les événements importés
  external_event_id TEXT NOT NULL,
  provider calendar_provider NOT NULL,
  sync_direction sync_direction NOT NULL,
  last_synced TIMESTAMPTZ DEFAULT NOW(),
  sync_status sync_status NOT NULL DEFAULT 'pending',
  error_message TEXT,
  event_data JSONB, -- Données de l'événement externe
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Un événement externe ne peut être synchronisé qu'une fois
  UNIQUE(coach_id, provider, external_event_id)
);

-- Table des paramètres de calendrier par coach
CREATE TABLE calendar_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coach_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  auto_sync_enabled BOOLEAN NOT NULL DEFAULT true,
  travel_time_minutes INTEGER NOT NULL DEFAULT 15,
  event_prefix TEXT NOT NULL DEFAULT 'BYW - ',
  include_client_details BOOLEAN NOT NULL DEFAULT true,
  sync_frequency_minutes INTEGER NOT NULL DEFAULT 15,
  conflict_resolution_mode conflict_resolution_mode NOT NULL DEFAULT 'manual',
  auto_create_meeting_links BOOLEAN NOT NULL DEFAULT true,
  default_meeting_provider TEXT DEFAULT 'zoom', -- zoom, meet, teams
  reminder_24h_enabled BOOLEAN NOT NULL DEFAULT true,
  reminder_2h_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contraintes
  CHECK (travel_time_minutes >= 0),
  CHECK (sync_frequency_minutes >= 5)
);

-- Créer les index pour optimiser les performances
CREATE INDEX IF NOT EXISTS idx_availability_slots_coach_id ON availability_slots(coach_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_day_of_week ON availability_slots(day_of_week);
CREATE INDEX IF NOT EXISTS idx_availability_slots_is_active ON availability_slots(is_active);

CREATE INDEX IF NOT EXISTS idx_appointments_coach_id ON appointments(coach_id);
CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_coach_date ON appointments(coach_id, appointment_date);

CREATE INDEX IF NOT EXISTS idx_blocked_periods_coach_id ON blocked_periods(coach_id);
CREATE INDEX IF NOT EXISTS idx_blocked_periods_dates ON blocked_periods(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_calendar_notifications_appointment_id ON calendar_notifications(appointment_id);
CREATE INDEX IF NOT EXISTS idx_calendar_notifications_recipient_id ON calendar_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_calendar_notifications_status ON calendar_notifications(status);

CREATE INDEX IF NOT EXISTS idx_calendar_integrations_coach_id ON calendar_integrations(coach_id);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_provider ON calendar_integrations(provider);
CREATE INDEX IF NOT EXISTS idx_calendar_integrations_is_active ON calendar_integrations(is_active);

CREATE INDEX IF NOT EXISTS idx_sync_events_coach_id ON sync_events(coach_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_appointment_id ON sync_events(appointment_id);
CREATE INDEX IF NOT EXISTS idx_sync_events_provider ON sync_events(provider);
CREATE INDEX IF NOT EXISTS idx_sync_events_status ON sync_events(sync_status);

-- Créer les triggers pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_availability_slots_updated_at BEFORE UPDATE ON availability_slots
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_integrations_updated_at BEFORE UPDATE ON calendar_integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_settings_updated_at BEFORE UPDATE ON calendar_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement les paramètres de calendrier lors de la création d'un coach
CREATE OR REPLACE FUNCTION create_default_calendar_settings()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.role = 'coach' THEN
        INSERT INTO calendar_settings (coach_id)
        VALUES (NEW.id)
        ON CONFLICT (coach_id) DO NOTHING;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER create_coach_calendar_settings 
    AFTER INSERT OR UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION create_default_calendar_settings();

-- Fonction pour vérifier les conflits de rendez-vous
CREATE OR REPLACE FUNCTION check_appointment_conflicts(
    p_coach_id UUID,
    p_appointment_date DATE,
    p_start_time TIME,
    p_end_time TIME,
    p_exclude_appointment_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    conflict_count INTEGER;
BEGIN
    -- Vérifier les conflits avec d'autres rendez-vous
    SELECT COUNT(*)
    INTO conflict_count
    FROM appointments
    WHERE coach_id = p_coach_id
      AND appointment_date = p_appointment_date
      AND status IN ('confirmed', 'pending')
      AND (p_exclude_appointment_id IS NULL OR id != p_exclude_appointment_id)
      AND (
        (start_time <= p_start_time AND end_time > p_start_time) OR
        (start_time < p_end_time AND end_time >= p_end_time) OR
        (start_time >= p_start_time AND end_time <= p_end_time)
      );
    
    IF conflict_count > 0 THEN
        RETURN true;
    END IF;
    
    -- Vérifier les conflits avec les périodes bloquées
    SELECT COUNT(*)
    INTO conflict_count
    FROM blocked_periods
    WHERE coach_id = p_coach_id
      AND start_date <= p_appointment_date
      AND end_date >= p_appointment_date
      AND (
        is_all_day = true OR
        (
          start_time <= p_start_time AND end_time > p_start_time OR
          start_time < p_end_time AND end_time >= p_end_time OR
          start_time >= p_start_time AND end_time <= p_end_time
        )
      );
    
    RETURN conflict_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour obtenir les créneaux disponibles d'un coach
CREATE OR REPLACE FUNCTION get_available_slots(
    p_coach_id UUID,
    p_date DATE,
    p_session_type session_type DEFAULT NULL
)
RETURNS TABLE (
    slot_id UUID,
    start_time TIME,
    end_time TIME,
    session_type session_type,
    duration_minutes INTEGER,
    max_clients INTEGER,
    price DECIMAL,
    available_spots INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.start_time,
        a.end_time,
        a.session_type,
        a.duration_minutes,
        a.max_clients,
        a.price,
        (a.max_clients - COALESCE(booked.count, 0))::INTEGER as available_spots
    FROM availability_slots a
    LEFT JOIN (
        SELECT 
            coach_id,
            start_time,
            end_time,
            session_type,
            COUNT(*) as count
        FROM appointments
        WHERE appointment_date = p_date
          AND status IN ('confirmed', 'pending')
        GROUP BY coach_id, start_time, end_time, session_type
    ) booked ON (
        a.coach_id = booked.coach_id AND
        a.start_time = booked.start_time AND
        a.end_time = booked.end_time AND
        a.session_type = booked.session_type
    )
    WHERE a.coach_id = p_coach_id
      AND a.is_active = true
      AND EXTRACT(DOW FROM p_date) = a.day_of_week
      AND (p_session_type IS NULL OR a.session_type = p_session_type)
      AND (a.max_clients - COALESCE(booked.count, 0)) > 0
      AND NOT check_appointment_conflicts(p_coach_id, p_date, a.start_time, a.end_time)
    ORDER BY a.start_time;
END;
$$ LANGUAGE plpgsql;

-- Désactiver RLS temporairement pour les tests (sera activé plus tard avec des politiques appropriées)
ALTER TABLE availability_slots DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_periods DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_integrations DISABLE ROW LEVEL SECURITY;
ALTER TABLE sync_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_settings DISABLE ROW LEVEL SECURITY;

-- Insérer des données de test pour le coach existant
INSERT INTO availability_slots (coach_id, day_of_week, start_time, end_time, session_type, duration_minutes, price)
SELECT 
    p.id,
    generate_series(1, 5) as day_of_week, -- Lundi à vendredi
    '09:00'::TIME,
    '10:00'::TIME,
    'individual'::session_type,
    60,
    80.00
FROM profiles p 
WHERE p.role = 'coach'
LIMIT 1;

INSERT INTO availability_slots (coach_id, day_of_week, start_time, end_time, session_type, duration_minutes, price)
SELECT 
    p.id,
    generate_series(1, 5) as day_of_week, -- Lundi à vendredi
    '14:00'::TIME,
    '15:00'::TIME,
    'individual'::session_type,
    60,
    80.00
FROM profiles p 
WHERE p.role = 'coach'
LIMIT 1;

INSERT INTO availability_slots (coach_id, day_of_week, start_time, end_time, session_type, duration_minutes, max_clients, price)
SELECT 
    p.id,
    3 as day_of_week, -- Mercredi
    '18:00'::TIME,
    '19:00'::TIME,
    'group'::session_type,
    60,
    6,
    30.00
FROM profiles p 
WHERE p.role = 'coach'
LIMIT 1;
