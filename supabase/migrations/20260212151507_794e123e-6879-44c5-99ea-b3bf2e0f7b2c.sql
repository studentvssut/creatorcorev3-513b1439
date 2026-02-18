
ALTER TABLE public.subscriptions
ADD COLUMN IF NOT EXISTS next_billing_date timestamp with time zone,
ADD COLUMN IF NOT EXISTS billing_type text NOT NULL DEFAULT 'anniversary';
