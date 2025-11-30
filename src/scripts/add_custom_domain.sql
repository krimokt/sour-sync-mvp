-- Add custom domain support to website_settings
-- This allows clients to use their own domain (like mycompany.com) for their storefront

-- Add custom_domain column to website_settings
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS custom_domain TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS custom_domain_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS custom_domain_verification_token TEXT;

-- Create index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_website_settings_custom_domain 
ON website_settings(custom_domain) 
WHERE custom_domain IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN website_settings.custom_domain IS 'Custom domain configured by the client (e.g., mycompany.com)';
COMMENT ON COLUMN website_settings.custom_domain_verified IS 'Whether the custom domain DNS has been verified';
COMMENT ON COLUMN website_settings.custom_domain_verification_token IS 'Token used for DNS verification (TXT record)';

-- Example: To set a custom domain
-- UPDATE website_settings SET custom_domain = 'mycompany.com' WHERE company_id = 'xxx';




