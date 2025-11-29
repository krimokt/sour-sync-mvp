-- Add status columns for custom domain automation
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS ssl_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'error'
ADD COLUMN IF NOT EXISTS dns_status TEXT DEFAULT 'pending', -- 'pending', 'active', 'error'
ADD COLUMN IF NOT EXISTS last_checked_at TIMESTAMPTZ;

-- Comment on columns
COMMENT ON COLUMN website_settings.ssl_status IS 'Status of SSL certificate provisioning';
COMMENT ON COLUMN website_settings.dns_status IS 'Status of DNS verification';
COMMENT ON COLUMN website_settings.last_checked_at IS 'Timestamp of the last automated check';

