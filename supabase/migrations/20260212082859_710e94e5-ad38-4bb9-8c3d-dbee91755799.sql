
ALTER TABLE public.connected_platforms
ADD COLUMN page_access_token text,
ADD COLUMN metadata jsonb;
