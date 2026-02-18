
-- Create subscriptions table to track Razorpay subscription state
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  razorpay_subscription_id TEXT NOT NULL,
  razorpay_plan_id TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'starter',
  status TEXT NOT NULL DEFAULT 'created',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
ON public.subscriptions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can insert own subscription
CREATE POLICY "Users can insert own subscription"
ON public.subscriptions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update own subscription
CREATE POLICY "Users can update own subscription"
ON public.subscriptions
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Service role needs to update via webhook (allow via security definer function)
CREATE OR REPLACE FUNCTION public.update_subscription_from_webhook(
  p_razorpay_subscription_id TEXT,
  p_status TEXT,
  p_current_period_start TIMESTAMPTZ DEFAULT NULL,
  p_current_period_end TIMESTAMPTZ DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_plan TEXT;
BEGIN
  -- Update subscription status
  UPDATE public.subscriptions
  SET status = p_status,
      current_period_start = COALESCE(p_current_period_start, current_period_start),
      current_period_end = COALESCE(p_current_period_end, current_period_end),
      updated_at = now()
  WHERE razorpay_subscription_id = p_razorpay_subscription_id
  RETURNING user_id, plan INTO v_user_id, v_plan;

  -- Sync plan to profiles based on subscription status
  IF v_user_id IS NOT NULL THEN
    IF p_status = 'active' THEN
      UPDATE public.profiles SET plan = v_plan, updated_at = now() WHERE user_id = v_user_id;
    ELSIF p_status IN ('cancelled', 'expired', 'halted') THEN
      UPDATE public.profiles SET plan = 'starter', updated_at = now() WHERE user_id = v_user_id;
    END IF;
  END IF;
END;
$$;

-- Add updated_at trigger
CREATE TRIGGER update_subscriptions_updated_at
BEFORE UPDATE ON public.subscriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
