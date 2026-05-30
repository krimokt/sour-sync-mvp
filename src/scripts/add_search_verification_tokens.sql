-- Search-engine verification tokens (applied via Supabase migration
-- "add_search_verification_tokens"). Kept here for repo history.

ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS google_site_verification text,
  ADD COLUMN IF NOT EXISTS bing_site_verification   text;
