
-- Drop the restrictive SELECT policy that blocks UPDATE/DELETE
DROP POLICY "No direct SELECT on connected_platforms" ON public.connected_platforms;

-- Drop restrictive policies and recreate as permissive
DROP POLICY "Users can insert own platforms" ON public.connected_platforms;
DROP POLICY "Users can update own platforms" ON public.connected_platforms;
DROP POLICY "Users can delete own platforms" ON public.connected_platforms;

-- Add permissive SELECT for own rows (needed for UPDATE/DELETE to find rows)
CREATE POLICY "Users can view own platforms"
  ON public.connected_platforms FOR SELECT
  USING (auth.uid() = user_id);

-- Recreate as permissive
CREATE POLICY "Users can insert own platforms"
  ON public.connected_platforms FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own platforms"
  ON public.connected_platforms FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own platforms"
  ON public.connected_platforms FOR DELETE
  USING (auth.uid() = user_id);
