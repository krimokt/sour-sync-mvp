#!/bin/bash

# MCP Supabase Setup Script
# This script helps set up the Supabase MCP server for Cursor

# Check if environment variables are set
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_URL environment variable is not set"
    echo "Please set it in your .env file or export it in your shell"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "Error: NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable is not set"
    echo "Please set it in your .env file or export it in your shell"
    exit 1
fi

# Construct the API URL
API_URL="${NEXT_PUBLIC_SUPABASE_URL}/rest/v1"

echo "Setting up MCP Supabase server..."
echo "API URL: $API_URL"
echo ""

# Run the MCP server
exec npx -y @supabase/mcp-server-postgrest@latest \
  --apiUrl "$API_URL" \
  --apiKey "$NEXT_PUBLIC_SUPABASE_ANON_KEY" \
  --schema public





