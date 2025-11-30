-- Migration: Add columns for Netlify domain automation
-- This enables the Shopify-like automated domain system

-- Add columns for storing Netlify DNS records and domain tracking
ALTER TABLE website_settings
ADD COLUMN IF NOT EXISTS netlify_dns_records JSONB DEFAULT '[]',
ADD COLUMN IF NOT EXISTS netlify_domain_id TEXT,
ADD COLUMN IF NOT EXISTS domain_registered_at TIMESTAMPTZ;

-- Add columns for tracking verification timestamps
ALTER TABLE website_settings
ADD COLUMN IF NOT EXISTS dns_verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ssl_provisioned_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS ssl_last_attempt_at TIMESTAMPTZ;

-- Add index for faster domain lookups
CREATE INDEX IF NOT EXISTS idx_website_settings_netlify_domain_id 
ON website_settings(netlify_domain_id) 
WHERE netlify_domain_id IS NOT NULL;

-- Comment on columns for documentation
COMMENT ON COLUMN website_settings.netlify_dns_records IS 'JSON array of DNS records from Netlify API (A records, CNAME)';
COMMENT ON COLUMN website_settings.netlify_domain_id IS 'Netlify domain ID for API operations';
COMMENT ON COLUMN website_settings.domain_registered_at IS 'When the domain was registered with Netlify';
COMMENT ON COLUMN website_settings.dns_verified_at IS 'When DNS was verified by Netlify';
COMMENT ON COLUMN website_settings.ssl_provisioned_at IS 'When SSL certificate was successfully provisioned';
COMMENT ON COLUMN website_settings.ssl_last_attempt_at IS 'Last SSL provisioning attempt (for retry logic)';

