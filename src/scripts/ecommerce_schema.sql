-- ============================================
-- E-COMMERCE DATABASE SCHEMA
-- Run this migration to set up all e-commerce tables
-- ============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. STORE USERS (Website Customers)
-- ============================================
CREATE TABLE IF NOT EXISTS store_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(50),
  avatar_url TEXT,
  email_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, email)
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_store_users_company_email ON store_users(company_id, email);

-- ============================================
-- 2. USER ADDRESSES
-- ============================================
CREATE TABLE IF NOT EXISTS user_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('shipping', 'billing')),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  company_name VARCHAR(200),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  postal_code VARCHAR(20),
  country VARCHAR(100) NOT NULL,
  phone VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id);

-- ============================================
-- 3. PRODUCT CATEGORIES
-- ============================================
CREATE TABLE IF NOT EXISTS product_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  description TEXT,
  image_url TEXT,
  parent_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  sort_order INT DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_product_categories_company ON product_categories(company_id);

-- ============================================
-- 4. PRODUCTS
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  category_id UUID REFERENCES product_categories(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  description TEXT,
  short_description VARCHAR(500),
  price DECIMAL(10, 2),
  compare_at_price DECIMAL(10, 2),
  cost_price DECIMAL(10, 2),
  sku VARCHAR(100),
  barcode VARCHAR(100),
  stock_quantity INT DEFAULT 0,
  track_inventory BOOLEAN DEFAULT TRUE,
  allow_backorder BOOLEAN DEFAULT FALSE,
  weight DECIMAL(10, 2),
  weight_unit VARCHAR(10) DEFAULT 'kg',
  images JSONB DEFAULT '[]',
  thumbnail_url TEXT,
  allow_quote BOOLEAN DEFAULT TRUE,
  allow_purchase BOOLEAN DEFAULT TRUE,
  min_order_quantity INT DEFAULT 1,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  meta_title VARCHAR(255),
  meta_description TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, slug)
);

CREATE INDEX IF NOT EXISTS idx_products_company ON products(company_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(company_id, is_featured) WHERE is_active = TRUE;

-- ============================================
-- 5. SHOPPING CARTS
-- ============================================
CREATE TABLE IF NOT EXISTS carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES store_users(id) ON DELETE CASCADE,
  session_id VARCHAR(255),
  currency VARCHAR(3) DEFAULT 'USD',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_carts_user ON carts(user_id);
CREATE INDEX IF NOT EXISTS idx_carts_session ON carts(session_id);

-- ============================================
-- 6. CART ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1 CHECK (quantity > 0),
  price_at_add DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(cart_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items(cart_id);

-- ============================================
-- 7. ORDERS
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES store_users(id) ON DELETE SET NULL,
  order_number VARCHAR(50) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0,
  shipping_cost DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  total DECIMAL(10, 2) NOT NULL DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  
  -- Shipping Address (stored as snapshot)
  shipping_first_name VARCHAR(100),
  shipping_last_name VARCHAR(100),
  shipping_company VARCHAR(200),
  shipping_address_1 VARCHAR(255),
  shipping_address_2 VARCHAR(255),
  shipping_city VARCHAR(100),
  shipping_state VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  shipping_country VARCHAR(100),
  shipping_phone VARCHAR(50),
  
  -- Billing Address (stored as snapshot)
  billing_first_name VARCHAR(100),
  billing_last_name VARCHAR(100),
  billing_company VARCHAR(200),
  billing_address_1 VARCHAR(255),
  billing_address_2 VARCHAR(255),
  billing_city VARCHAR(100),
  billing_state VARCHAR(100),
  billing_postal_code VARCHAR(20),
  billing_country VARCHAR(100),
  billing_phone VARCHAR(50),
  
  -- Payment Info
  payment_method VARCHAR(50) CHECK (payment_method IN ('bank_transfer', 'stripe', 'paypal', 'cod')),
  payment_status VARCHAR(50) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partial')),
  stripe_payment_intent_id VARCHAR(255),
  stripe_charge_id VARCHAR(255),
  
  -- Tracking
  tracking_number VARCHAR(100),
  tracking_url TEXT,
  shipping_carrier VARCHAR(100),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  -- Notes
  customer_notes TEXT,
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(company_id, order_number)
);

CREATE INDEX IF NOT EXISTS idx_orders_company ON orders(company_id);
CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(company_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);

-- ============================================
-- 8. ORDER ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  product_sku VARCHAR(100),
  product_image TEXT,
  quantity INT NOT NULL DEFAULT 1,
  unit_price DECIMAL(10, 2) NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- ============================================
-- 9. BANK ACCOUNTS (Admin's payment details)
-- ============================================
CREATE TABLE IF NOT EXISTS bank_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  bank_name VARCHAR(200) NOT NULL,
  account_name VARCHAR(200) NOT NULL,
  account_number VARCHAR(100),
  iban VARCHAR(50),
  swift_code VARCHAR(20),
  routing_number VARCHAR(50),
  branch_name VARCHAR(200),
  branch_address TEXT,
  currency VARCHAR(3) DEFAULT 'USD',
  instructions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_bank_accounts_company ON bank_accounts(company_id);

-- ============================================
-- 10. PAYMENT PROOFS (User uploaded receipts)
-- ============================================
CREATE TABLE IF NOT EXISTS payment_proofs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name VARCHAR(255),
  file_size INT,
  amount_claimed DECIMAL(10, 2),
  transaction_reference VARCHAR(255),
  payment_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  reviewed_by UUID REFERENCES profiles(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payment_proofs_order ON payment_proofs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_proofs_status ON payment_proofs(status);

-- ============================================
-- 11. USER FAVORITES / WISHLIST
-- ============================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES store_users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

CREATE INDEX IF NOT EXISTS idx_user_favorites_user ON user_favorites(user_id);

-- ============================================
-- 12. QUOTE REQUESTS
-- ============================================
CREATE TABLE IF NOT EXISTS quote_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES store_users(id) ON DELETE SET NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  
  -- Contact Info
  name VARCHAR(200) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  company_name VARCHAR(200),
  
  -- Request Details
  product_name VARCHAR(255),
  product_url TEXT,
  quantity INT,
  description TEXT,
  attachments JSONB DEFAULT '[]',
  
  -- Status
  status VARCHAR(50) DEFAULT 'new' CHECK (status IN ('new', 'reviewing', 'quoted', 'accepted', 'declined', 'expired')),
  quoted_price DECIMAL(10, 2),
  quote_notes TEXT,
  valid_until DATE,
  
  -- Admin
  assigned_to UUID REFERENCES profiles(id),
  admin_notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quote_requests_company ON quote_requests(company_id);
CREATE INDEX IF NOT EXISTS idx_quote_requests_status ON quote_requests(company_id, status);

-- ============================================
-- 13. STRIPE SETTINGS (Per Company)
-- ============================================
ALTER TABLE website_settings 
ADD COLUMN IF NOT EXISTS stripe_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_public_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_secret_key VARCHAR(255),
ADD COLUMN IF NOT EXISTS stripe_webhook_secret VARCHAR(255),
ADD COLUMN IF NOT EXISTS bank_transfer_enabled BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS cod_enabled BOOLEAN DEFAULT FALSE;

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE store_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_proofs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE quote_requests ENABLE ROW LEVEL SECURITY;

-- Store Users: Users can only see/edit their own data
CREATE POLICY "store_users_self" ON store_users
  FOR ALL USING (id = auth.uid()::uuid OR company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Products: Public read, admin write
CREATE POLICY "products_public_read" ON products
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "products_admin_all" ON products
  FOR ALL USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Orders: Users see own orders, admins see company orders
CREATE POLICY "orders_user_own" ON orders
  FOR SELECT USING (user_id::text = auth.uid()::text);

CREATE POLICY "orders_admin_all" ON orders
  FOR ALL USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- Bank Accounts: Public read (active only), admin write
CREATE POLICY "bank_accounts_public_read" ON bank_accounts
  FOR SELECT USING (is_active = TRUE);

CREATE POLICY "bank_accounts_admin_all" ON bank_accounts
  FOR ALL USING (company_id IN (
    SELECT company_id FROM profiles WHERE id = auth.uid()
  ));

-- ============================================
-- FUNCTIONS & TRIGGERS
-- ============================================

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  prefix VARCHAR(10);
  seq_num INT;
BEGIN
  prefix := 'ORD';
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 4) AS INT)), 0) + 1
  INTO seq_num
  FROM orders
  WHERE company_id = NEW.company_id;
  
  NEW.order_number := prefix || LPAD(seq_num::TEXT, 6, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating order number
DROP TRIGGER IF EXISTS trigger_generate_order_number ON orders;
CREATE TRIGGER trigger_generate_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables
DO $$
DECLARE
  t TEXT;
BEGIN
  FOR t IN 
    SELECT unnest(ARRAY['store_users', 'user_addresses', 'product_categories', 'products', 
                        'carts', 'cart_items', 'orders', 'bank_accounts', 'payment_proofs', 'quote_requests'])
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS trigger_updated_at ON %I', t);
    EXECUTE format('CREATE TRIGGER trigger_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION update_updated_at()', t);
  END LOOP;
END;
$$;

-- ============================================
-- SEED DATA: Default Product Categories
-- ============================================
-- (Run this only once after creating a company)
-- INSERT INTO product_categories (company_id, name, slug, sort_order) VALUES
-- ('your-company-id', 'Electronics', 'electronics', 1),
-- ('your-company-id', 'Clothing', 'clothing', 2),
-- ('your-company-id', 'Home & Garden', 'home-garden', 3),
-- ('your-company-id', 'Sports', 'sports', 4),
-- ('your-company-id', 'Other', 'other', 99);

COMMIT;




