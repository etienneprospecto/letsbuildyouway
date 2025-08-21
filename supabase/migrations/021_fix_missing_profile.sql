-- Fix missing profile for existing user
INSERT INTO public.profiles (id, email, first_name, last_name, role)
SELECT 
  u.id, 
  u.email, 
  COALESCE(u.raw_user_meta_data->>'first_name', ''),
  COALESCE(u.raw_user_meta_data->>'last_name', ''),
  COALESCE((u.raw_user_meta_data->>'role')::user_role, 'client'::user_role)
FROM auth.users u
WHERE u.id = 'ef371912-96dc-40bd-9e52-1f20815a0a15'
  AND NOT EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = u.id)
ON CONFLICT (id) DO NOTHING;

-- Log the fix
DO $$
BEGIN
  RAISE LOG 'Fixed missing profile for user ef371912-96dc-40bd-9e52-1f20815a0a15';
END $$;
