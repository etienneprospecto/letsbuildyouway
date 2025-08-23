-- 038: Désactiver RLS et supprimer les policies pour simplifier le débogage

-- Supprimer policies si elles existent (sécurité: idempotent)
DO $$
DECLARE r record;
BEGIN
  FOR r IN (
    SELECT polname, schemaname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.polname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Désactiver RLS sur les tables clés
ALTER TABLE IF EXISTS public.clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.workout_exercises DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.weekly_feedbacks DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.progress_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.conversations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.resources DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.trophies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.user_trophies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.seances DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.exercices_seance DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.ressources_personnalisees DISABLE ROW LEVEL SECURITY;

-- Confirmer l'état
SELECT schemaname, tablename, rowsecurity FROM pg_tables WHERE schemaname='public' ORDER BY tablename;

