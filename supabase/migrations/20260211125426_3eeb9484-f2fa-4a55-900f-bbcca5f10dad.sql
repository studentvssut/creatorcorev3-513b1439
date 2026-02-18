
-- Fix anonymous access warnings: restrict all policies to 'authenticated' role only

-- connected_platforms
DROP POLICY IF EXISTS "No direct SELECT on connected_platforms" ON public.connected_platforms;
CREATE POLICY "No direct SELECT on connected_platforms" ON public.connected_platforms FOR SELECT TO authenticated USING (false);

DROP POLICY IF EXISTS "Users can insert own platforms" ON public.connected_platforms;
CREATE POLICY "Users can insert own platforms" ON public.connected_platforms FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own platforms" ON public.connected_platforms;
CREATE POLICY "Users can update own platforms" ON public.connected_platforms FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own platforms" ON public.connected_platforms;
CREATE POLICY "Users can delete own platforms" ON public.connected_platforms FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ai_insights
DROP POLICY IF EXISTS "Users can view own insights" ON public.ai_insights;
CREATE POLICY "Users can view own insights" ON public.ai_insights FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own insights" ON public.ai_insights;
CREATE POLICY "Users can insert own insights" ON public.ai_insights FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own insights" ON public.ai_insights;
CREATE POLICY "Users can update own insights" ON public.ai_insights FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- content_posts
DROP POLICY IF EXISTS "Users can view own posts" ON public.content_posts;
CREATE POLICY "Users can view own posts" ON public.content_posts FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own posts" ON public.content_posts;
CREATE POLICY "Users can insert own posts" ON public.content_posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts" ON public.content_posts;
CREATE POLICY "Users can update own posts" ON public.content_posts FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts" ON public.content_posts;
CREATE POLICY "Users can delete own posts" ON public.content_posts FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- performance_metrics
DROP POLICY IF EXISTS "Users can view own metrics" ON public.performance_metrics;
CREATE POLICY "Users can view own metrics" ON public.performance_metrics FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own metrics" ON public.performance_metrics;
CREATE POLICY "Users can insert own metrics" ON public.performance_metrics FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own metrics" ON public.performance_metrics;
CREATE POLICY "Users can update own metrics" ON public.performance_metrics FOR UPDATE TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own metrics" ON public.performance_metrics;
CREATE POLICY "Users can delete own metrics" ON public.performance_metrics FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
