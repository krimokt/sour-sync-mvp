-- Create clients table to link users to sourcing companies as clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE, -- The Sourcing Company
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, -- The Client User
  status TEXT DEFAULT 'active', -- 'active', 'pending', 'inactive'
  company_name TEXT, -- The Client's Business Name
  tax_id TEXT,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(company_id, user_id)
);

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins/Staff of the sourcing company can view their clients
DROP POLICY IF EXISTS "Company staff can view clients" ON clients;
CREATE POLICY "Company staff can view clients" ON clients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = clients.company_id
      AND profiles.role IN ('admin', 'staff', 'owner')
    )
  );

-- Admins/Staff can manage clients
DROP POLICY IF EXISTS "Company staff can manage clients" ON clients;
CREATE POLICY "Company staff can manage clients" ON clients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.company_id = clients.company_id
      AND profiles.role IN ('admin', 'staff', 'owner')
    )
  );

-- Clients can view their own record
DROP POLICY IF EXISTS "Clients can view own record" ON clients;
CREATE POLICY "Clients can view own record" ON clients
  FOR SELECT USING (
    auth.uid() = user_id
  );

-- Indexes
CREATE INDEX IF NOT EXISTS idx_clients_company_id ON clients(company_id);
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);





