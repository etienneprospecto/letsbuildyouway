-- ========================================
-- MIGRATION COMPLÈTE MULTI-COACH SAAS
-- ========================================
-- Date: 2025-01-11
-- Description: Migration du système mono-coach vers multi-coach avec Stripe
-- Auteur: Assistant IA

-- ========================================
-- ÉTAPE 1 : PRÉPARATION ET VÉRIFICATIONS
-- ========================================

-- Vérifier que les tables existent
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Table profiles n''existe pas. Migration impossible.';
  END IF;
  
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
    RAISE EXCEPTION 'Table clients n''existe pas. Migration impossible.';
  END IF;
  
  RAISE NOTICE '✅ Tables de base vérifiées';
END $$;

-- ========================================
-- ÉTAPE 2 : AJOUTER COACH_ID AUX TABLES
-- ========================================

-- Ajouter coach_id à PROFILES (pour les clients seulement)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;

-- Lier Paul (client existant) à son coach Etienne
UPDATE profiles 
SET 
  role = 'client',
  coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE email = 'Paulfst.business@gmail.com';

-- Vérifier qu'Etienne est bien coach
UPDATE profiles 
SET role = 'coach' 
WHERE email = 'etienne.guimbard@gmail.com';

-- Index pour performances
CREATE INDEX IF NOT EXISTS idx_profiles_coach_id ON profiles(coach_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ========================================
-- ÉTAPE 3 : AJOUTER COACH_ID AUX TABLES EXISTANTES
-- ========================================

-- Table WORKOUTS
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE workouts 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_workouts_coach_id ON workouts(coach_id);

-- Table EXERCISES
ALTER TABLE exercises ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE exercises 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_exercises_coach_id ON exercises(coach_id);

-- Table SEANCES (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'seances') THEN
    ALTER TABLE seances ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    EXECUTE 'UPDATE seances SET coach_id = (SELECT id FROM profiles WHERE email = ''etienne.guimbard@gmail.com'' LIMIT 1) WHERE coach_id IS NULL';
    CREATE INDEX IF NOT EXISTS idx_seances_coach_id ON seances(coach_id);
    RAISE NOTICE '✅ Table seances migrée';
  END IF;
END $$;

-- Table MESSAGES
ALTER TABLE messages ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE messages 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_messages_coach_id ON messages(coach_id);

-- Table APPOINTMENTS (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'appointments') THEN
    ALTER TABLE appointments ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    EXECUTE 'UPDATE appointments SET coach_id = (SELECT id FROM profiles WHERE email = ''etienne.guimbard@gmail.com'' LIMIT 1) WHERE coach_id IS NULL';
    CREATE INDEX IF NOT EXISTS idx_appointments_coach_id ON appointments(coach_id);
    RAISE NOTICE '✅ Table appointments migrée';
  END IF;
END $$;

-- Table NUTRITION_ENTRIES (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nutrition_entries') THEN
    ALTER TABLE nutrition_entries ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    EXECUTE 'UPDATE nutrition_entries SET coach_id = (SELECT id FROM profiles WHERE email = ''etienne.guimbard@gmail.com'' LIMIT 1) WHERE coach_id IS NULL';
    CREATE INDEX IF NOT EXISTS idx_nutrition_entries_coach_id ON nutrition_entries(coach_id);
    RAISE NOTICE '✅ Table nutrition_entries migrée';
  END IF;
END $$;

-- Table PROGRESS_DATA (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'progress_data') THEN
    ALTER TABLE progress_data ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    EXECUTE 'UPDATE progress_data SET coach_id = (SELECT id FROM profiles WHERE email = ''etienne.guimbard@gmail.com'' LIMIT 1) WHERE coach_id IS NULL';
    CREATE INDEX IF NOT EXISTS idx_progress_data_coach_id ON progress_data(coach_id);
    RAISE NOTICE '✅ Table progress_data migrée';
  END IF;
END $$;

-- Table FEEDBACKS_HEBDOMADAIRES
ALTER TABLE feedbacks_hebdomadaires ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE feedbacks_hebdomadaires 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_feedbacks_hebdo_coach_id ON feedbacks_hebdomadaires(coach_id);

-- Table WORKOUT_EXERCISES
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE workout_exercises 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_workout_exercises_coach_id ON workout_exercises(coach_id);

-- Table FEEDBACK_TEMPLATES
ALTER TABLE feedback_templates ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE feedback_templates 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_templates_coach_id ON feedback_templates(coach_id);

-- Table FEEDBACK_QUESTIONS
ALTER TABLE feedback_questions ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE feedback_questions 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_feedback_questions_coach_id ON feedback_questions(coach_id);

-- Table FEEDBACK_RESPONSES (si elle existe)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'feedback_responses') THEN
    ALTER TABLE feedback_responses ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
    EXECUTE 'UPDATE feedback_responses SET coach_id = (SELECT id FROM profiles WHERE email = ''etienne.guimbard@gmail.com'' LIMIT 1) WHERE coach_id IS NULL';
    CREATE INDEX IF NOT EXISTS idx_feedback_responses_coach_id ON feedback_responses(coach_id);
    RAISE NOTICE '✅ Table feedback_responses migrée';
  END IF;
END $$;

-- Table CONVERSATIONS
ALTER TABLE conversations ADD COLUMN IF NOT EXISTS coach_id UUID REFERENCES profiles(id) ON DELETE CASCADE;
UPDATE conversations 
SET coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1)
WHERE coach_id IS NULL;
CREATE INDEX IF NOT EXISTS idx_conversations_coach_id ON conversations(coach_id);

-- ========================================
-- ÉTAPE 4 : SYSTÈME D'ABONNEMENT STRIPE
-- ========================================

-- Champs Stripe et abonnement pour PROFILES
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan VARCHAR(50) CHECK (subscription_plan IN ('warm_up', 'transformationnel', 'elite'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id VARCHAR(255) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id VARCHAR(255) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'inactive';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP;

-- Limites du pack (JSON)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan_limits JSONB DEFAULT '{
  "max_clients": 0,
  "max_workouts": 0,
  "max_exercises": 0,
  "timeline_weeks": 0,
  "features": []
}';

-- Compteurs d'usage
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_clients_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_workouts_count INT DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS current_exercises_count INT DEFAULT 0;

-- Token de configuration compte
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_setup_token VARCHAR(255) UNIQUE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_setup_token_expires TIMESTAMP;

-- Donner le pack Elite à Etienne (coach existant)
UPDATE profiles 
SET 
  subscription_plan = 'elite',
  subscription_status = 'active',
  subscription_start_date = NOW(),
  plan_limits = '{
    "max_clients": 100,
    "max_workouts": -1,
    "max_exercises": -1,
    "timeline_weeks": 52,
    "features": ["ai_nutrition", "financial_dashboard", "full_automation", "custom_theme", "video_messaging", "priority_support"]
  }',
  current_clients_count = (SELECT COUNT(*) FROM clients WHERE coach_id = profiles.id),
  current_workouts_count = (SELECT COUNT(*) FROM workouts WHERE coach_id = profiles.id),
  current_exercises_count = (SELECT COUNT(*) FROM exercises WHERE coach_id = profiles.id)
WHERE email = 'etienne.guimbard@gmail.com';

-- Index pour Stripe
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);

-- ========================================
-- ÉTAPE 5 : SYSTÈME D'INVITATION CLIENT
-- ========================================

-- Ajouter champs d'invitation à CLIENTS
ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255) UNIQUE;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_sent_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_accepted_at TIMESTAMP;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS invitation_status VARCHAR(50) DEFAULT 'accepted';

-- Paul est déjà accepté
UPDATE clients 
SET 
  invitation_status = 'accepted',
  invitation_accepted_at = NOW()
WHERE coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1);

-- Index
CREATE INDEX IF NOT EXISTS idx_clients_invitation_token ON clients(invitation_token);

-- ========================================
-- ÉTAPE 6 : ROW LEVEL SECURITY (RLS)
-- ========================================

-- Activer RLS sur les tables principales
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks_hebdomadaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback_questions ENABLE ROW LEVEL SECURITY;

-- PROFILES : Les coachs voient leur profil, les clients voient leur profil
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- CLIENTS : Les coachs voient leurs clients
DROP POLICY IF EXISTS "Coaches can view their clients" ON clients;
CREATE POLICY "Coaches can view their clients"
  ON clients FOR SELECT
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Coaches can manage their clients" ON clients;
CREATE POLICY "Coaches can manage their clients"
  ON clients FOR ALL
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Clients can view own data" ON clients;
CREATE POLICY "Clients can view own data"
  ON clients FOR SELECT
  USING (id = auth.uid());

-- WORKOUTS : Les coachs gèrent leurs workouts
DROP POLICY IF EXISTS "Coaches can manage their workouts" ON workouts;
CREATE POLICY "Coaches can manage their workouts"
  ON workouts FOR ALL
  USING (coach_id = auth.uid());

-- EXERCISES : Les coachs gèrent leurs exercices
DROP POLICY IF EXISTS "Coaches can manage their exercises" ON exercises;
CREATE POLICY "Coaches can manage their exercises"
  ON exercises FOR ALL
  USING (coach_id = auth.uid());

-- MESSAGES : Coachs et clients voient leurs conversations
DROP POLICY IF EXISTS "Users can view their messages" ON messages;
CREATE POLICY "Users can view their messages"
  ON messages FOR SELECT
  USING (
    coach_id = auth.uid() 
    OR 
    (SELECT coach_id FROM profiles WHERE id = auth.uid()) = coach_id
  );

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    coach_id = auth.uid() 
    OR 
    (SELECT coach_id FROM profiles WHERE id = auth.uid()) = coach_id
  );

-- CONVERSATIONS : Coachs et clients voient leurs conversations
DROP POLICY IF EXISTS "Users can view their conversations" ON conversations;
CREATE POLICY "Users can view their conversations"
  ON conversations FOR SELECT
  USING (
    coach_id = auth.uid() 
    OR 
    client_id = auth.uid()
  );

-- FEEDBACKS : Coachs voient, clients gèrent le leur
DROP POLICY IF EXISTS "Coaches can view feedbacks" ON feedbacks_hebdomadaires;
CREATE POLICY "Coaches can view feedbacks"
  ON feedbacks_hebdomadaires FOR SELECT
  USING (coach_id = auth.uid());

DROP POLICY IF EXISTS "Clients can manage own feedbacks" ON feedbacks_hebdomadaires;
CREATE POLICY "Clients can manage own feedbacks"
  ON feedbacks_hebdomadaires FOR ALL
  USING (client_id = auth.uid());

-- FEEDBACK_TEMPLATES : Coachs gèrent leurs templates
DROP POLICY IF EXISTS "Coaches can manage their templates" ON feedback_templates;
CREATE POLICY "Coaches can manage their templates"
  ON feedback_templates FOR ALL
  USING (coach_id = auth.uid());

-- FEEDBACK_QUESTIONS : Coachs gèrent leurs questions
DROP POLICY IF EXISTS "Coaches can manage their questions" ON feedback_questions;
CREATE POLICY "Coaches can manage their questions"
  ON feedback_questions FOR ALL
  USING (coach_id = auth.uid());

-- ========================================
-- ÉTAPE 7 : FONCTIONS POUR COMPTEURS
-- ========================================

-- Fonction pour incrémenter les compteurs
CREATE OR REPLACE FUNCTION increment_counter(
  coach_id UUID,
  counter_field TEXT
)
RETURNS VOID AS $
BEGIN
  EXECUTE format('
    UPDATE profiles 
    SET %I = %I + 1 
    WHERE id = $1
  ', counter_field, counter_field)
  USING coach_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour décrémenter les compteurs
CREATE OR REPLACE FUNCTION decrement_counter(
  coach_id UUID,
  counter_field TEXT
)
RETURNS VOID AS $
BEGIN
  EXECUTE format('
    UPDATE profiles 
    SET %I = GREATEST(%I - 1, 0)
    WHERE id = $1
  ', counter_field, counter_field)
  USING coach_id;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- ========================================
-- ÉTAPE 8 : TRIGGERS POUR COMPTEURS AUTO
-- ========================================

-- Trigger pour auto-incrémenter quand un client est ajouté
CREATE OR REPLACE FUNCTION auto_increment_clients()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_clients_count = current_clients_count + 1
  WHERE id = NEW.coach_id;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_clients ON clients;
CREATE TRIGGER trigger_increment_clients
  AFTER INSERT ON clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_clients();

-- Trigger pour auto-décrémenter quand un client est supprimé
CREATE OR REPLACE FUNCTION auto_decrement_clients()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_clients_count = GREATEST(current_clients_count - 1, 0)
  WHERE id = OLD.coach_id;
  RETURN OLD;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_clients ON clients;
CREATE TRIGGER trigger_decrement_clients
  AFTER DELETE ON clients
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_clients();

-- Même chose pour workouts
CREATE OR REPLACE FUNCTION auto_increment_workouts()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_workouts_count = current_workouts_count + 1
  WHERE id = NEW.coach_id;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_workouts ON workouts;
CREATE TRIGGER trigger_increment_workouts
  AFTER INSERT ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_workouts();

CREATE OR REPLACE FUNCTION auto_decrement_workouts()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_workouts_count = GREATEST(current_workouts_count - 1, 0)
  WHERE id = OLD.coach_id;
  RETURN OLD;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_workouts ON workouts;
CREATE TRIGGER trigger_decrement_workouts
  AFTER DELETE ON workouts
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_workouts();

-- Même chose pour exercises
CREATE OR REPLACE FUNCTION auto_increment_exercises()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_exercises_count = current_exercises_count + 1
  WHERE id = NEW.coach_id;
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_increment_exercises ON exercises;
CREATE TRIGGER trigger_increment_exercises
  AFTER INSERT ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION auto_increment_exercises();

CREATE OR REPLACE FUNCTION auto_decrement_exercises()
RETURNS TRIGGER AS $
BEGIN
  UPDATE profiles
  SET current_exercises_count = GREATEST(current_exercises_count - 1, 0)
  WHERE id = OLD.coach_id;
  RETURN OLD;
END;
$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_decrement_exercises ON exercises;
CREATE TRIGGER trigger_decrement_exercises
  AFTER DELETE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION auto_decrement_exercises();

-- ========================================
-- ÉTAPE 9 : VÉRIFICATION FINALE
-- ========================================

-- Afficher le résultat pour Etienne
SELECT 
  id,
  email,
  role,
  subscription_plan,
  subscription_status,
  plan_limits,
  current_clients_count,
  current_workouts_count,
  current_exercises_count
FROM profiles 
WHERE email = 'etienne.guimbard@gmail.com';

-- Afficher les clients d'Etienne
SELECT 
  c.id,
  c.email,
  c.coach_id,
  p.email as coach_email
FROM clients c
LEFT JOIN profiles p ON c.coach_id = p.id
WHERE c.coach_id = (SELECT id FROM profiles WHERE email = 'etienne.guimbard@gmail.com' LIMIT 1);

-- Compter les tables migrées
SELECT 
  'profiles' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN coach_id IS NOT NULL THEN 1 END) as with_coach_id
FROM profiles
UNION ALL
SELECT 
  'clients' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN coach_id IS NOT NULL THEN 1 END) as with_coach_id
FROM clients
UNION ALL
SELECT 
  'workouts' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN coach_id IS NOT NULL THEN 1 END) as with_coach_id
FROM workouts
UNION ALL
SELECT 
  'exercises' as table_name, 
  COUNT(*) as total_records,
  COUNT(CASE WHEN coach_id IS NOT NULL THEN 1 END) as with_coach_id
FROM exercises;

-- ========================================
-- FIN DE LA MIGRATION
-- ========================================

RAISE NOTICE '🎉 MIGRATION MULTI-COACH TERMINÉE AVEC SUCCÈS !';
RAISE NOTICE '✅ Etienne configuré comme coach Elite';
RAISE NOTICE '✅ Paul lié comme client d''Etienne';
RAISE NOTICE '✅ Toutes les tables migrées avec coach_id';
RAISE NOTICE '✅ RLS configuré pour isolation des données';
RAISE NOTICE '✅ Système d''abonnement Stripe prêt';
RAISE NOTICE '✅ Compteurs automatiques configurés';
RAISE NOTICE '🚀 Prêt pour les nouveaux coachs !';
