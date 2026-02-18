
-- Change default plan from 'starter' to 'free'
ALTER TABLE public.profiles ALTER COLUMN plan SET DEFAULT 'free';

-- Update the webhook function to downgrade to 'free' instead of 'starter'
CREATE OR REPLACE FUNCTION public.update_subscription_from_webhook(
  p_razorpay_subscription_id text,
  p_status text,
  p_current_period_start timestamp with time zone DEFAULT NULL,
  p_current_period_end timestamp with time zone DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_user_id UUID;
  v_plan TEXT;
BEGIN
  UPDATE public.subscriptions
  SET status = p_status,
      current_period_start = COALESCE(p_current_period_start, current_period_start),
      current_period_end = COALESCE(p_current_period_end, current_period_end),
      updated_at = now()
  WHERE razorpay_subscription_id = p_razorpay_subscription_id
  RETURNING user_id, plan INTO v_user_id, v_plan;

  IF v_user_id IS NOT NULL THEN
    IF p_status = 'active' THEN
      UPDATE public.profiles SET plan = v_plan, updated_at = now() WHERE user_id = v_user_id;
    ELSIF p_status IN ('cancelled', 'expired', 'halted') THEN
      UPDATE public.profiles SET plan = 'free', updated_at = now() WHERE user_id = v_user_id;
    END IF;
  END IF;
END;
$$;
