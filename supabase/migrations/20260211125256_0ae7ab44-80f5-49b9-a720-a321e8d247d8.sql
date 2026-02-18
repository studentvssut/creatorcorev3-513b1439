
-- Fix: OAuth tokens (access_token, refresh_token) are readable via client-side SELECT.
-- Create a safe view that excludes token columns, then block direct SELECT on the base table.

-- Step 1: Create a safe view excluding sensitive token fields
-- Runs as definer (default) to bypass base table RLS
-- Filters by auth.uid() so users only see their own rows
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
FROM public.connected_platforms
WHERE user_id = auth.uid();

-- Step 2: Grant SELECT on the view to authenticated and anon roles
GRANT SELECT ON public.connected_platforms_safe TO authenticated;
GRANT SELECT ON public.connected_platforms_safe TO anon;

-- Step 3: Drop the existing SELECT policy that exposes all columns including tokens
DROP POLICY IF EXISTS "Users can view own platforms" ON public.connected_platforms;

-- Step 4: Deny all direct SELECT on the base table
-- Edge functions use service_role key which bypasses RLS, so they're unaffected
CREATE POLICY "No direct SELECT on connected_platforms" 
ON public.connected_platforms 
FOR SELECT 
USING (false);
