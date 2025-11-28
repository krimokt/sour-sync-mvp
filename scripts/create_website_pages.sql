-- Create website_pages table for multi-page support
CREATE TABLE IF NOT EXISTS website_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB DEFAULT '[]', -- Stores the layout blocks for this page
  type TEXT DEFAULT 'custom', -- 'home', 'contact', 'terms', 'privacy', 'custom'
  is_published BOOLEAN DEFAULT false,
  seo_title TEXT,
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, slug)
);

-- Enable RLS
ALTER TABLE website_pages ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Company members (admins/staff) can view all pages
DROP POLICY IF EXISTS "Company members can view own pages" ON website_pages;
CREATE POLICY "Company members can view own pages" ON website_pages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = website_pages.company_id
    )
  );

-- Company members can manage (insert/update/delete) pages
DROP POLICY IF EXISTS "Company members can manage own pages" ON website_pages;
CREATE POLICY "Company members can manage own pages" ON website_pages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = website_pages.company_id
    )
  );

-- Public can view published pages
DROP POLICY IF EXISTS "Public can view published pages" ON website_pages;
CREATE POLICY "Public can view published pages" ON website_pages
  FOR SELECT TO anon
  USING (is_published = true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_website_pages_company_id ON website_pages(company_id);
CREATE INDEX IF NOT EXISTS idx_website_pages_slug ON website_pages(slug);

