# Netlify API Routes Troubleshooting Guide

## Problem
API routes are returning 404 HTML pages instead of JSON responses on Netlify, even though they work locally.

## Symptoms
- `/api/public/company/whitesourcing` returns 404 HTML
- `/api/client/whitesourcing/auth/login` returns 404 HTML or SSL errors
- Routes work perfectly in local development

## Root Cause
The Netlify Next.js plugin may not be processing API routes correctly, or the plugin isn't being recognized during the build.

## Solutions to Try

### 1. Verify Plugin Installation in Netlify Dashboard

1. Go to your Netlify site dashboard
2. Navigate to **Site settings** → **Build & deploy** → **Build plugins**
3. Check if `@netlify/plugin-nextjs` appears in the list
4. If not present, the plugin should be installed automatically from `netlify.toml`

### 2. Check Build Logs

1. Go to **Deploys** → Latest deploy → **Build log**
2. Look for:
   - `@netlify/plugin-nextjs` being installed
   - Messages about "Installing Netlify Build Plugin"
   - Any errors related to the plugin
   - Messages about "Next.js functions" or "API routes"

### 3. Verify Environment Variables

Ensure these are set in **Site settings** → **Environment variables**:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (critical for API routes)

### 4. Manual Plugin Installation (if needed)

If the plugin isn't being recognized:

1. Go to **Site settings** → **Build & deploy** → **Build plugins**
2. Click **Add plugin**
3. Search for `@netlify/plugin-nextjs`
4. Install it manually

### 5. Check Next.js Build Output

In the build logs, verify:
- The build completes successfully
- No errors about missing API routes
- The `.next` directory is created

### 6. Test API Routes Directly

After deployment, test these URLs directly in your browser:
- `https://sthe.shop/api/public/company/whitesourcing`
- Should return JSON: `{"company": {...}}`
- Should NOT return HTML 404 page

### 7. Check Netlify Functions

1. Go to **Functions** tab in Netlify dashboard
2. Check if any Next.js functions are listed
3. If empty, the plugin might not be working

### 8. Verify Custom Domain Configuration

1. Go to **Domain settings**
2. Verify `sthe.shop` is properly configured
3. Check SSL certificate status
4. Ensure DNS is pointing to Netlify

### 9. Try Clearing Build Cache

1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Click **Clear cache and retry deploy**
3. Trigger a new deployment

### 10. Check Plugin Version Compatibility

Current setup:
- Next.js: 14.1.0
- @netlify/plugin-nextjs: ^5.15.3

These versions should be compatible. If issues persist, try:
- Updating to the latest plugin version
- Checking Netlify's Next.js documentation for version compatibility

## Alternative: Use Netlify Functions Directly

If the plugin continues to fail, you might need to:
1. Convert API routes to Netlify Functions
2. Or use a different deployment strategy

## Expected Behavior After Fix

Once the plugin is working:
- API routes should return JSON responses
- No more 404 HTML pages
- Sign in/sign up should work correctly
- Company branding should load

## Still Not Working?

If none of these solutions work:
1. Check Netlify's status page for service issues
2. Review Netlify's Next.js documentation: https://docs.netlify.com/frameworks/next-js/
3. Contact Netlify support with:
   - Your site URL
   - Build log excerpts
   - API route examples that are failing

