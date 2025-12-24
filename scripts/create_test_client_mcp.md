# Create Test Client Using MCP Supabase

## Step 1: Create Auth User via API (Required)

Auth users must be created via Supabase Admin API. Run this command:

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

## Step 2: Verify Client Creation

After running the API call, verify the client was created:

```sql
SELECT 
  c.id as client_id,
  c.status,
  c.company_name,
  p.email,
  p.full_name,
  au.id as user_id
FROM clients c
JOIN profiles p ON p.id = c.user_id
JOIN auth.users au ON au.id = c.user_id
JOIN companies co ON co.id = c.company_id
WHERE co.slug = 'whitesourcing'
AND p.email = 'client@test.com';
```

## Test Credentials

- **Email:** `client@test.com`
- **Password:** `Test123456`

## Login URLs

- **Sign In:** `http://localhost:3000/site/whitesourcing/signin`
- **Dashboard:** `http://localhost:3000/client/whitesourcing`









