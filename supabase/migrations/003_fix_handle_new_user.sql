-- Migration 003: Correction de la fonction handle_new_user
-- Date: 2025-01-20
-- Description: Correction de la fonction trigger pour la création automatique de profil

-- Supprimer l'ancien trigger et la fonction
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recréer la fonction avec une meilleure gestion des erreurs
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Vérifier que les métadonnées existent
  IF new.raw_user_meta_data IS NULL THEN
    RAISE LOG 'No metadata found for user: %', new.id;
    RETURN new;
  END IF;

  -- Insérer le profil avec gestion des valeurs NULL
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name, 
    role
  ) VALUES (
    new.id,
    COALESCE(new.email, ''),
    COALESCE(new.raw_user_meta_data->>'first_name', ''),
    COALESCE(new.raw_user_meta_data->>'last_name', ''),
    COALESCE(new.raw_user_meta_data->>'role', 'client')::user_role
  );

  RAISE LOG 'Profile created for user: % with role: %', new.id, COALESCE(new.raw_user_meta_data->>'role', 'client');
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    RAISE LOG 'Error creating profile for user %: %', new.id, SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recréer le trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Vérifier que la table profiles existe et a la bonne structure
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RAISE EXCEPTION 'Table profiles does not exist';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'id') THEN
    RAISE EXCEPTION 'Column id does not exist in profiles table';
  END IF;
  
  RAISE NOTICE 'Table profiles structure verified successfully';
END $$;
