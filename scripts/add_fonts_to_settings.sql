-- Add font_heading and font_body to website_settings
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS font_heading TEXT DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS font_body TEXT DEFAULT 'inter',
ADD COLUMN IF NOT EXISTS accent_color TEXT DEFAULT '#06b6d4';

-- Also ensure we have created_at/updated_at if missing (create_website_settings.sql has them)



