-- Create website_settings table
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  theme_name TEXT DEFAULT 'default',
  logo_url TEXT,
  primary_color TEXT DEFAULT '#3B82F6',
  secondary_color TEXT DEFAULT '#1E40AF',
  font TEXT DEFAULT 'inter',
  homepage_layout_draft JSONB DEFAULT '[]',
  homepage_layout_published JSONB DEFAULT '[]',
  is_published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id)
);

-- Enable RLS
ALTER TABLE website_settings ENABLE ROW LEVEL SECURITY;

-- RLS: Company members can view/edit their own settings
DROP POLICY IF EXISTS "Company members can view own website_settings" ON website_settings;
CREATE POLICY "Company members can view own website_settings" 
ON website_settings FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = website_settings.company_id
  )
);

DROP POLICY IF EXISTS "Company members can update own website_settings" ON website_settings;
CREATE POLICY "Company members can update own website_settings" 
ON website_settings FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = website_settings.company_id
  )
);

DROP POLICY IF EXISTS "Company members can insert own website_settings" ON website_settings;
CREATE POLICY "Company members can insert own website_settings" 
ON website_settings FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.company_id = website_settings.company_id
  )
);

-- RLS: Public can view published settings
DROP POLICY IF EXISTS "Public can view published website_settings" ON website_settings;
CREATE POLICY "Public can view published website_settings" 
ON website_settings FOR SELECT TO anon
USING (is_published = true);

-- Trigger to auto-create website_settings for new companies
CREATE OR REPLACE FUNCTION public.handle_new_company_website_settings()
RETURNS TRIGGER AS $$
DECLARE
  v_hero_id uuid := gen_random_uuid();
  v_services_id uuid := gen_random_uuid();
  v_contact_id uuid := gen_random_uuid();
BEGIN
  INSERT INTO public.website_settings (company_id, homepage_layout_draft, homepage_layout_published)
  VALUES (
    NEW.id,
    jsonb_build_array(
      jsonb_build_object(
        'id', v_hero_id, 
        'type', 'hero', 
        'data', jsonb_build_object(
          'title', 'Welcome to ' || NEW.name, 
          'subtitle', 'Your trusted partner for quality products.', 
          'buttonLabel', 'Contact Us',
          'imageUrl', ''
        )
      ),
      jsonb_build_object(
        'id', v_services_id, 
        'type', 'services', 
        'data', jsonb_build_object(
          'items', jsonb_build_array(
            jsonb_build_object('title', 'Global Sourcing', 'description', 'We source the best products for you.'),
            jsonb_build_object('title', 'Quality Control', 'description', 'Every item is inspected before shipping.')
          )
        )
      ),
      jsonb_build_object(
        'id', v_contact_id, 
        'type', 'contact', 
        'data', jsonb_build_object(
          'email', 'info@' || NEW.slug || '.com',
          'phone', '',
          'address', ''
        )
      )
    ),
    '[]'::jsonb
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_company_created_website_settings ON companies;
CREATE TRIGGER on_company_created_website_settings
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_company_website_settings();

-- Backfill for existing companies
DO $$
DECLARE
  r RECORD;
  v_hero_id uuid;
  v_services_id uuid;
  v_contact_id uuid;
BEGIN
  FOR r IN SELECT id, name, slug FROM companies WHERE id NOT IN (SELECT company_id FROM website_settings) LOOP
    v_hero_id := gen_random_uuid();
    v_services_id := gen_random_uuid();
    v_contact_id := gen_random_uuid();
    
    INSERT INTO website_settings (company_id, homepage_layout_draft)
    VALUES (
      r.id,
      jsonb_build_array(
        jsonb_build_object(
          'id', v_hero_id, 
          'type', 'hero', 
          'data', jsonb_build_object(
            'title', 'Welcome to ' || r.name, 
            'subtitle', 'Your trusted partner for quality products.', 
            'buttonLabel', 'Contact Us',
            'imageUrl', ''
          )
        ),
        jsonb_build_object(
          'id', v_services_id, 
          'type', 'services', 
          'data', jsonb_build_object(
            'items', jsonb_build_array(
              jsonb_build_object('title', 'Global Sourcing', 'description', 'We source the best products for you.'),
              jsonb_build_object('title', 'Quality Control', 'description', 'Every item is inspected before shipping.')
            )
          )
        ),
        jsonb_build_object(
          'id', v_contact_id, 
          'type', 'contact', 
          'data', jsonb_build_object(
            'email', 'info@' || r.slug || '.com',
            'phone', '',
            'address', ''
          )
        )
      )
    );
  END LOOP;
END;
$$;


