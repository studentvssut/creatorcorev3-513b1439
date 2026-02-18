
-- Add grace period column for payment failure handling
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS grace_period_end timestamp with time zone DEFAULT NULL;
