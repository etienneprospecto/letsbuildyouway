-- Fix RLS policies for feedback_responses table
-- The existing policy was missing the operation type (INSERT, UPDATE, DELETE)

-- Drop the incomplete policy
DROP POLICY IF EXISTS "Clients can manage own responses" ON feedback_responses;

-- Create proper policies for clients to manage their own responses
CREATE POLICY "Clients can insert own responses" ON feedback_responses
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.client_id IN (
        SELECT c.id FROM clients c
        JOIN profiles p ON c.id = p.id
        WHERE p.id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Clients can update own responses" ON feedback_responses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.client_id IN (
        SELECT c.id FROM clients c
        JOIN profiles p ON c.id = p.id
        WHERE p.id::text = auth.uid()::text
      )
    )
  );

CREATE POLICY "Clients can delete own responses" ON feedback_responses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.client_id IN (
        SELECT c.id FROM clients c
        JOIN profiles p ON c.id = p.id
        WHERE p.id::text = auth.uid()::text
      )
    )
  );

-- Also add a policy for clients to view their own responses
CREATE POLICY "Clients can view own responses" ON feedback_responses
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM feedbacks_hebdomadaires 
      WHERE feedbacks_hebdomadaires.id = feedback_responses.feedback_id 
      AND feedbacks_hebdomadaires.client_id IN (
        SELECT c.id FROM clients c
        JOIN profiles p ON c.id = p.id
        WHERE p.id::text = auth.uid()::text
      )
    )
  );
