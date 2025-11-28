# MCP Supabase Quick Reference

## Quick Setup in Cursor

1. **Open Cursor Settings**: `Cmd/Ctrl + ,` → **Features** → **MCP**
2. **Click**: "+ Add New MCP Server"
3. **Fill in**:
   - **Name**: `supabase`
   - **Type**: `stdio`
   - **Command**: See below

## Command Template

Replace `YOUR_SUPABASE_URL` and `YOUR_ANON_KEY` with your actual values:

```bash
npx -y @supabase/mcp-server-postgrest@latest --apiUrl YOUR_SUPABASE_URL/rest/v1 --apiKey YOUR_ANON_KEY --schema public
```

## Option 1: Direct Command (Recommended)

If you know your Supabase credentials, use this format directly in Cursor:

```bash
npx -y @supabase/mcp-server-postgrest@latest --apiUrl https://YOUR-PROJECT-REF.supabase.co/rest/v1 --apiKey YOUR_ANON_KEY --schema public
```

## Option 2: Using the Setup Script

If you have environment variables set up, you can use the provided script:

**Command in Cursor**:
```bash
bash /Users/ikram/Documents/project/mehdi\ admin/admin_sourcing_launch/scripts/setup-mcp-supabase.sh
```

Or use a relative path from your project root:
```bash
bash ./scripts/setup-mcp-supabase.sh
```

## Finding Your Supabase Credentials

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Find:
   - **Project URL**: This is your `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key**: This is your `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Example

If your project URL is `https://cfhochnjniddaztgwrbk.supabase.co`:
- API URL would be: `https://cfhochnjniddaztgwrbk.supabase.co/rest/v1`
- Use your anon key from the Supabase dashboard

## After Setup

1. The server will appear in your MCP servers list
2. Click refresh to see available tools
3. Use in Cursor Composer to query your database naturally

## Package Information

- **Package**: `@supabase/mcp-server-postgrest`
- **Source**: [cursor.directory/mcp/supabase](https://cursor.directory/mcp/supabase)
- **Description**: MCP server for PostgREST that allows LLMs to perform database queries and operations


