
-- Fix security: restrict all policies to authenticated role only
-- and fix the security definer view

-- Drop and recreate the view as SECURITY INVOKER
DROP VIEW IF EXISTS public.connected_platforms_safe;
CREATE VIEW public.connected_platforms_safe
WITH (security_invoker = true)
AS
SELECT id, user_id, platform, is_connected, platform_user_id, platform_username, connected_at, last_synced_at, created_at, updated_at
FROM public.connected_platforms;

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix connected_platforms policies
DROP POLICY IF EXISTS "Users can view own platforms" ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can insert own platforms" ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can update own platforms" ON public.connected_platforms;
DROP POLICY IF EXISTS "Users can delete own platforms" ON public.connected_platforms;
CREATE POLICY "Users can view own platforms" ON public.connected_platforms FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own platforms" ON public.connected_platforms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own platforms" ON public.connected_platforms FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own platforms" ON public.connected_platforms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix content_posts policies
DROP POLICY IF EXISTS "Users can view own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can insert own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.content_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.content_posts;
CREATE POLICY "Users can view own posts" ON public.content_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own posts" ON public.content_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.content_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.content_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix performance_metrics policies
DROP POLICY IF EXISTS "Users can view own metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can insert own metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can update own metrics" ON public.performance_metrics;
DROP POLICY IF EXISTS "Users can delete own metrics" ON public.performance_metrics;
CREATE POLICY "Users can view own metrics" ON public.performance_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own metrics" ON public.performance_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own metrics" ON public.performance_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own metrics" ON public.performance_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix ai_insights policies
DROP POLICY IF EXISTS "Users can view own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can insert own insights" ON public.ai_insights;
DROP POLICY IF EXISTS "Users can update own insights" ON public.ai_insights;
CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own insights" ON public.ai_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own insights" ON public.ai_insights FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Fix media_uploads policies
DROP POLICY IF EXISTS "Users can view own uploads" ON public.media_uploads;
DROP POLICY IF EXISTS "Users can insert own uploads" ON public.media_uploads;
DROP POLICY IF EXISTS "Users can update own uploads" ON public.media_uploads;
DROP POLICY IF EXISTS "Users can delete own uploads" ON public.media_uploads;
CREATE POLICY "Users can view own uploads" ON public.media_uploads FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own uploads" ON public.media_uploads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own uploads" ON public.media_uploads FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own uploads" ON public.media_uploads FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Fix subscriptions policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can insert own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Users can update own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own subscription" ON public.subscriptions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own subscription" ON public.subscriptions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
