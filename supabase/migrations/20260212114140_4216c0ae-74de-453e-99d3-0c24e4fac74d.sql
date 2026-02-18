
-- Fix 1: Recreate connected_platforms_safe view WITHOUT security definer
DROP VIEW IF EXISTS public.connected_platforms_safe;

CREATE VIEW public.connected_platforms_safe AS
SELECT
  id,
  user_id,
  platform,
  platform_username,
  platform_user_id,
  is_connected,
  connected_at,
  last_synced_at,
  created_at,
  updated_at
FROM public.connected_platforms;

-- Fix 2: Create disconnect_platform RPC to avoid client-side token access
CREATE OR REPLACE FUNCTION public.disconnect_platform(p_platform_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.connected_platforms
  SET is_connected = false,
      platform_username = null,
      access_token = null,
      refresh_token = null,
      page_access_token = null,
      token_expires_at = null,
      last_synced_at = null,
      updated_at = now()
  WHERE id = p_platform_id
    AND user_id = auth.uid();
END;
$$;
