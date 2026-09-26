-- =============================================================================
-- DocShield: Auth User Trigger Schema Hardening & Search Path Resolution
-- Migration: 20240924000000_fix_auth_trigger_search_path.sql
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    email, 
    full_name, 
    badge_id, 
    role, 
    station_or_lab,
    department,
    designation,
    status
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'badge_id', 'OFF-' || UPPER(SUBSTRING(NEW.id::text, 1, 8))),
    COALESCE((NEW.raw_user_meta_data->>'role')::public.app_role, 'inspector'::public.app_role),
    COALESCE(NEW.raw_user_meta_data->>'station_or_lab', 'Bhopal Central Police Station'),
    COALESCE(NEW.raw_user_meta_data->>'department', 'Investigation Division'),
    COALESCE(NEW.raw_user_meta_data->>'designation', 'Police Officer'),
    'Active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
