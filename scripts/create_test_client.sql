-- ============================================
-- CREATE TEST CLIENT FOR WHITESOURCING
-- ============================================
-- This script creates a test client account for whitesourcing
-- 
-- IMPORTANT: You need to create the auth user first using Supabase Admin API
-- or use the API endpoint: POST /api/client/whitesourcing/auth/signup
--
-- To create via SQL (requires Supabase admin access):
-- 1. First create the auth user using Supabase Dashboard or Admin API
-- 2. Then run this script with the user_id from step 1
--
-- OR use the API endpoint directly (recommended):
-- POST http://localhost:3000/api/client/whitesourcing/auth/signup
-- Body: {
--   "email": "client@test.com",
--   "password": "Test123456",
--   "fullName": "Test Client",
--   "companyName": "Test Client Company"
-- }
-- ============================================

-- Step 1: Get the whitesourcing company ID
DO $$
DECLARE
    v_company_id UUID;
    v_user_id UUID;
    v_client_id UUID;
BEGIN
    -- Get company ID for whitesourcing
    SELECT id INTO v_company_id
    FROM companies
    WHERE slug = 'whitesourcing'
    LIMIT 1;

    IF v_company_id IS NULL THEN
        RAISE EXCEPTION 'Company "whitesourcing" not found';
    END IF;

    RAISE NOTICE 'Found company ID: %', v_company_id;

    -- NOTE: You need to create the auth user first using Supabase Admin API
    -- The user_id should be obtained from the auth.users table after creating the user
    -- For now, this is a placeholder - replace with actual user_id after creating auth user
    
    -- Example: Get user_id from auth.users (if you created it manually)
    -- SELECT id INTO v_user_id FROM auth.users WHERE email = 'client@test.com' LIMIT 1;
    
    -- If user doesn't exist, you need to create it first via:
    -- 1. Supabase Dashboard > Authentication > Users > Add User
    -- 2. Or use the API endpoint: POST /api/client/whitesourcing/auth/signup
    
    RAISE NOTICE 'To complete this setup:';
    RAISE NOTICE '1. Create auth user with email: client@test.com';
    RAISE NOTICE '2. Get the user_id from auth.users table';
    RAISE NOTICE '3. Update v_user_id in this script and run again';
    RAISE NOTICE 'OR use the API endpoint instead (recommended)';

END $$;

-- ============================================
-- ALTERNATIVE: Use this after creating auth user
-- ============================================
-- Replace 'USER_ID_HERE' with the actual user_id from auth.users

/*
DO $$
DECLARE
    v_company_id UUID;
    v_user_id UUID := 'USER_ID_HERE'; -- Replace with actual user_id
    v_client_id UUID;
BEGIN
    -- Get company ID
    SELECT id INTO v_company_id
    FROM companies
    WHERE slug = 'whitesourcing'
    LIMIT 1;

    -- Create profile if it doesn't exist
    INSERT INTO profiles (id, full_name, email, role)
    VALUES (v_user_id, 'Test Client', 'client@test.com', NULL)
    ON CONFLICT (id) DO UPDATE
    SET full_name = 'Test Client',
        email = 'client@test.com';

    -- Create client record
    INSERT INTO clients (company_id, user_id, status, company_name)
    VALUES (v_company_id, v_user_id, 'active', 'Test Client Company')
    ON CONFLICT (company_id, user_id) DO UPDATE
    SET status = 'active',
        company_name = 'Test Client Company',
        updated_at = NOW();

    RAISE NOTICE 'Client created successfully!';
END $$;
*/





