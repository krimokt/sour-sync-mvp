-- Add variant_groups column to quotations table
ALTER TABLE quotations ADD COLUMN IF NOT EXISTS variant_groups JSONB DEFAULT '[]'::jsonb;

-- Add comment to the column
COMMENT ON COLUMN quotations.variant_groups IS 'Alibaba-style variant groups with values, images, and MOQ per value (same structure as products table)';

