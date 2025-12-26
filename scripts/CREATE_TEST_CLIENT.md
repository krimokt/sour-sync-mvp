# Create Test Client for Whitesourcing

## Quick Method (Recommended)

### Option 1: Use the API Endpoint

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Create the client using curl:**
   ```bash
   curl -X POST http://localhost:3000/api/client/whitesourcing/auth/signup \
     -H "Content-Type: application/json" \
     -d '{
       "email": "client@test.com",
       "password": "Test123456",
       "fullName": "Test Client",
       "companyName": "Test Client Company"
     }'
   ```

### Option 2: Use the Signup Page

1. Navigate to: `http://localhost:3000/site/whitesourcing/signin`
2. Click on the "Sign Up" tab
3. Fill in the form:
   - **Full Name:** Test Client
   - **Email:** client@test.com
   - **Your Company Name:** Test Client Company
   - **Password:** Test123456
4. Click "Create Account"

## Test Credentials

After creating the client, use these credentials to login:

- **Email:** `client@test.com`
- **Password:** `Test123456`

## Login URLs

- **Sign In Page:** `http://localhost:3000/site/whitesourcing/signin`
- **Client Dashboard:** `http://localhost:3000/client/whitesourcing`

## What Gets Created

1. ✅ Supabase Auth User (email: client@test.com)
2. ✅ Profile record in `profiles` table
3. ✅ Client record in `clients` table linked to whitesourcing company
4. ✅ Status: Active

## Verify in Database

You can verify the client was created by checking:

```sql
-- Check client record
SELECT c.*, p.email, p.full_name, co.name as company_name
FROM clients c
JOIN profiles p ON p.id = c.user_id
JOIN companies co ON co.id = c.company_id
WHERE co.slug = 'whitesourcing'
AND p.email = 'client@test.com';
```














