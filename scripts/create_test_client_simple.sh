#!/bin/bash

# Create Test Client for Whitesourcing
# This script creates a test client account via the API

echo "Creating test client for whitesourcing..."
echo ""

# Test credentials
EMAIL="client@test.com"
PASSWORD="Test123456"
FULL_NAME="Test Client"
COMPANY_NAME="Test Client Company"

# API endpoint
API_URL="http://localhost:3000/api/client/whitesourcing/auth/signup"

# Make the request
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\",
    \"fullName\": \"$FULL_NAME\",
    \"companyName\": \"$COMPANY_NAME\"
  }")

# Check if server is running
if [ $? -ne 0 ]; then
  echo "❌ Error: Could not connect to server."
  echo "   Make sure your dev server is running: npm run dev"
  exit 1
fi

# Parse response
if echo "$RESPONSE" | grep -q '"success"'; then
  echo "✅ Client created successfully!"
  echo ""
  echo "Login Credentials:"
  echo "  Email: $EMAIL"
  echo "  Password: $PASSWORD"
  echo ""
  echo "Login URLs:"
  echo "  Sign In: http://localhost:3000/site/whitesourcing/signin"
  echo "  Dashboard: http://localhost:3000/client/whitesourcing"
else
  echo "❌ Error creating client:"
  echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
  exit 1
fi














