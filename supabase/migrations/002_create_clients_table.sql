-- Migration 002: Création de la table clients
-- Date: 2025-01-20
-- Description: Table pour les informations détaillées des clients et relation avec leur coach

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  age integer NOT NULL CHECK (age >= 16 AND age <= 100),
  photo_url text,
  objective text NOT NULL,
  level text NOT NULL CHECK (level IN ('Débutant', 'Intermédiaire', 'Avancé')),
  mentality text NOT NULL,
  coaching_type text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  constraints text,
  allergies text,
  morphotype text,
  equipment text,
  lifestyle text,
  contact text NOT NULL,
  sports_history text NOT NULL,
  needs_attention boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security (RLS)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Create policies for clients table

-- Policy: Coaches can view their own clients
CREATE POLICY "Coaches can view own clients" ON clients
  FOR SELECT USING (coach_id = auth.uid());

-- Policy: Coaches can insert new clients
CREATE POLICY "Coaches can insert clients" ON clients
  FOR INSERT WITH CHECK (coach_id = auth.uid());

-- Policy: Coaches can update their own clients
CREATE POLICY "Coaches can update own clients" ON clients
  FOR UPDATE USING (coach_id = auth.uid());

-- Policy: Coaches can delete their own clients
CREATE POLICY "Coaches can delete own clients" ON clients
  FOR DELETE USING (coach_id = auth.uid());

-- Policy: Clients can view their own profile
CREATE POLICY "Clients can view own profile" ON clients
  FOR SELECT USING (
    id IN (
      SELECT c.id FROM clients c
      JOIN profiles p ON c.id = p.id
      WHERE p.id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_coach_id ON clients(coach_id);
CREATE INDEX IF NOT EXISTS idx_clients_level ON clients(level);
CREATE INDEX IF NOT EXISTS idx_clients_start_date ON clients(start_date);
CREATE INDEX IF NOT EXISTS idx_clients_needs_attention ON clients(needs_attention);
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_clients_updated_at 
    BEFORE UPDATE ON clients 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update the profiles policy to use the clients table
DROP POLICY IF EXISTS "Coaches can view client profiles" ON profiles;

CREATE POLICY "Coaches can view client profiles" ON profiles
  FOR SELECT USING (
    role = 'coach' OR 
    EXISTS (
      SELECT 1 FROM clients 
      WHERE clients.id = profiles.id 
      AND clients.coach_id = auth.uid()
    )
  );
