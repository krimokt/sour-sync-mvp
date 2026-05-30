-- SEO fields migration (applied via Supabase: migration "add_seo_fields").
-- Kept here for repo history / re-application against other environments.

-- Per-product SEO levers
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug             text,
  ADD COLUMN IF NOT EXISTS meta_title       text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS focus_keyword    text,
  ADD COLUMN IF NOT EXISTS og_image         text;

-- Slug must be unique per company (when present)
CREATE UNIQUE INDEX IF NOT EXISTS products_company_slug_unique
  ON public.products (company_id, slug)
  WHERE slug IS NOT NULL;

-- Homepage / site-level SEO overrides
ALTER TABLE public.website_settings
  ADD COLUMN IF NOT EXISTS meta_title       text,
  ADD COLUMN IF NOT EXISTS meta_description text,
  ADD COLUMN IF NOT EXISTS og_image         text;
