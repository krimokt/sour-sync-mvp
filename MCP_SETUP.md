# MCP Supabase Setup Guide

This guide explains how to configure the Model Context Protocol (MCP) Supabase server for use with Cursor.

Based on the [official Supabase MCP server page](https://cursor.directory/mcp/supabase), this is an MCP server for PostgREST that allows LLMs to perform database queries and operations on Postgres databases via PostgREST.

## Configuration Steps

### Step 1: Open Cursor Settings

1. Open Cursor Settings (Cmd/Ctrl + ,)
2. Navigate to **Features** → **MCP**
3. Click the **"+ Add New MCP Server"** button

### Step 2: Configure the Server

Fill in the following details:

- **Name**: `supabase` (or any nickname you prefer)
- **Type**: Select `stdio` (standard input/output)
- **Command**: Use the following command template:

```bash
npx -y @supabase/mcp-server-postgrest@latest --apiUrl YOUR_SUPABASE_URL/rest/v1 --apiKey YOUR_ANON_KEY --schema public
```

### Step 3: Replace Placeholders

Replace the placeholders in the command with your actual Supabase credentials:

1. **YOUR_SUPABASE_URL**: Your Supabase project URL
   - Found in: `NEXT_PUBLIC_SUPABASE_URL` environment variable
   - Example: `https://your-project-ref.supabase.co`
   - **Important**: Add `/rest/v1` to the end for the API URL

2. **YOUR_ANON_KEY**: Your Supabase anonymous key
   - Found in: `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable
   - This is your public anon key (safe to use in MCP)

### Example Configuration

If your Supabase URL is `https://cfhochnjniddaztgwrbk.supabase.co` and your anon key is `eyJhbGc...`, your command would be:

```bash
npx -y @supabase/mcp-server-postgrest@latest --apiUrl https://cfhochnjniddaztgwrbk.supabase.co/rest/v1 --apiKey eyJhbGc... --schema public
```

## Quick Setup Script

You can create a wrapper script if you prefer to use environment variables. Create a file `setup-mcp-supabase.sh`:

```bash
#!/bin/bash
npx -y @supabase/mcp-server-postgrest@latest \
  --apiUrl "${NEXT_PUBLIC_SUPABASE_URL}/rest/v1" \
  --apiKey "${NEXT_PUBLIC_SUPABASE_ANON_KEY}" \
  --schema public
```

Then in Cursor, use:
- **Command**: `bash /path/to/setup-mcp-supabase.sh`

## Using MCP Tools

1. **Tool Availability**
   - After adding the server, it will appear in your MCP servers list
   - You may need to click the refresh button to populate the tool list

2. **Using Tools in Composer**
   - The Composer Agent automatically uses MCP tools when relevant
   - You can explicitly prompt tool usage by:
     - Referring to the tool by name
     - Describing the tool's function

3. **Tool Execution Process**
   - Displays a message in chat requesting approval
   - Shows tool call arguments (expandable)
   - Executes the tool upon user approval
   - Displays the tool's response in the chat

## Features

The Supabase MCP server provides:
- Database queries via PostgREST
- Database operations on Postgres databases
- Schema exploration and management
- Data manipulation through natural language

## Security Best Practices

⚠️ **Important Security Considerations:**

1. **Use Development Projects**: Prefer connecting to development/staging projects
2. **Anon Key is Public**: The anon key is safe to use as it respects your Row Level Security (RLS) policies
3. **RLS Policies**: Ensure your RLS policies are properly configured
4. **Read-Only Access**: Consider using read-only database users if possible
5. **Environment Variables**: Never commit your keys to version control

## Your Current Configuration

Based on your project setup:
- **Supabase URL**: Set via `NEXT_PUBLIC_SUPABASE_URL` environment variable
- **Supabase Anon Key**: Set via `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variable

## Important Notes

- MCP tools may not work with all models
- MCP tools are only available to the Agent in Composer
- The server uses `npx` to run the latest version automatically
- The `-y` flag auto-accepts the package installation

## Resources

- [Supabase MCP on Cursor Directory](https://cursor.directory/mcp/supabase)
- [Supabase MCP Documentation](https://supabase.com/docs/guides/getting-started/mcp)
- [Supabase MCP Features](https://supabase.com/features/mcp-server)

