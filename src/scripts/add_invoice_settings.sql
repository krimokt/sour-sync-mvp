-- ============================================
-- Add invoice-specific settings to website_settings
-- ============================================

ALTER TABLE website_settings
  ADD COLUMN IF NOT EXISTS invoice_tax_label      VARCHAR(50)   DEFAULT 'Tax',
  ADD COLUMN IF NOT EXISTS invoice_tax_number     VARCHAR(100),
  ADD COLUMN IF NOT EXISTS invoice_tax_rate       NUMERIC(5,2)  DEFAULT 0,
  ADD COLUMN IF NOT EXISTS invoice_payment_terms  VARCHAR(100),
  ADD COLUMN IF NOT EXISTS invoice_footer_text    TEXT;
