-- Migration pour corriger la table feedback_questions

-- Ajouter la colonne order_index si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback_questions' AND column_name = 'order_index') THEN
        ALTER TABLE public.feedback_questions ADD COLUMN order_index integer NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Ajouter la colonne required si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback_questions' AND column_name = 'required') THEN
        ALTER TABLE public.feedback_questions ADD COLUMN required boolean DEFAULT true;
    END IF;
END $$;

-- Ajouter la colonne options si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback_questions' AND column_name = 'options') THEN
        ALTER TABLE public.feedback_questions ADD COLUMN options jsonb;
    END IF;
END $$;

-- Vérifier et corriger les contraintes
DO $$ 
BEGIN
    -- Ajouter la contrainte NOT NULL pour order_index si elle n'existe pas
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'feedback_questions' AND column_name = 'order_index' AND is_nullable = 'YES') THEN
        ALTER TABLE public.feedback_questions ALTER COLUMN order_index SET NOT NULL;
    END IF;
END $$;
