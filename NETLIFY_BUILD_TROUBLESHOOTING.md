# Netlify Build Troubleshooting Guide

## Getting Complete Build Logs

### Method 1: Netlify Dashboard
1. Go to your Netlify dashboard: https://app.netlify.com
2. Navigate to your site
3. Click on **Deploys** tab
4. Click on the failed deploy
5. Scroll down to see the complete build log
6. Look for error messages (usually in red) or lines starting with `Error:` or `Failed`

### Method 2: Download Build Logs
1. In the failed deploy page, look for a **Download logs** button
2. Download the log file
3. Search for keywords: `Error`, `Failed`, `Type error`, `Syntax error`

### Method 3: Netlify CLI
```bash
# Install Netlify CLI if you haven't
npm install -g netlify-cli

# Login to Netlify
netlify login

# View build logs
netlify logs:build
```

## Common Build Issues & Solutions

### 1. Publish Directory Mismatch
**Error:** `Deploy directory 'out' does not exist`

**Solution:**
- Go to **Site settings** → **Build & deploy** → **Build settings**
- Check **Publish directory** field
- **Clear it** or set it to `.next` (or leave blank for Next.js plugin to handle)
- The `@netlify/plugin-nextjs` plugin should handle this automatically

### 2. Missing Environment Variables
**Error:** `JWT_SECRET environment variable is required` or similar

**Solution:**
- Go to **Site settings** → **Environment variables**
- Add all required variables:
  - `JWT_SECRET`
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `NEXT_PUBLIC_GEMINI_API_KEY`
  - `NETLIFY_ACCESS_TOKEN`
  - `NETLIFY_SITE_ID`
  - `NEXT_PUBLIC_SITE_URL`

### 3. Build Command Issues
**Error:** Build command fails

**Check:**
- **Site settings** → **Build & deploy** → **Build settings**
- **Build command** should be: `pnpm run build`
- Make sure `pnpm` is available (set in `netlify.toml`)

### 4. Node Version Mismatch
**Error:** Version-related errors

**Solution:**
- Check `netlify.toml` has: `NODE_VERSION = "20"`
- Or set in Netlify UI: **Site settings** → **Build & deploy** → **Environment** → **Node version**

### 5. Secrets Scanner Blocking
**Error:** `Secrets scanning found secrets in build`

**Solution:**
- Remove any hardcoded secrets from code
- Use environment variables instead
- Check `.env` file is in `.gitignore`

## Current Configuration

Your `netlify.toml` is configured as:
```toml
[build]
  command = "pnpm run build"
  # @netlify/plugin-nextjs handles publish directory automatically

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "10"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

## Verification Steps

1. **Check Netlify UI Settings:**
   - Publish directory should be **empty** or `.next`
   - Build command: `pnpm run build`
   - Node version: `20`

2. **Verify Environment Variables:**
   - All required variables are set
   - No typos in variable names
   - Values are correct

3. **Check Build Logs:**
   - Look for the exact error message
   - Check which step failed (install, build, or deploy)
   - Note the line numbers mentioned in errors

4. **Test Locally:**
   ```bash
   npm run build
   ```
   - If local build fails, fix those errors first
   - If local build succeeds, issue is Netlify-specific

## Next Steps

1. **Get the complete build log** from Netlify dashboard
2. **Share the error section** (the part showing the actual failure)
3. **Check Netlify UI settings** match the configuration above
4. **Verify environment variables** are all set

## Quick Fixes to Try

1. **Clear build cache:**
   - In Netlify dashboard: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

2. **Redeploy:**
   - **Deploys** → **Trigger deploy** → **Deploy site**

3. **Check plugin installation:**
   - The `@netlify/plugin-nextjs` should be automatically installed
   - If not, it will be installed during build

4. **Verify package.json:**
   - Make sure all dependencies are listed
   - Run `pnpm install` locally to verify

### 6. Blob Upload Failure (Infrastructure Issue)
**Error:** `Error uploading blobs to deploy store: fetch failed` or `Build script returned non-zero exit code: 4`

**Symptoms:**
- Build completes successfully (all pages generated)
- Error occurs during "Uploading blobs to deploy store" stage
- This is a Netlify infrastructure/network issue, not a code problem

**Solutions:**
1. **Retry the build** - Transient network issues often resolve on retry:
   - Go to **Deploys** → **Trigger deploy** → **Deploy site**
   
2. **Clear cache and retry:**
   - **Deploys** → **Trigger deploy** → **Clear cache and deploy site**
   
3. **If issue persists:**
   - Contact Netlify support with:
     - Build ID (found in deploy URL)
     - Error snippet from logs
     - Mention it's a blob upload infrastructure issue
   
4. **Check for build warnings:**
   - Exit code 4 from Next.js can indicate warnings treated as errors
   - Review build logs for any warnings that might need addressing
   - Common warnings: `<img>` tag usage (consider using Next.js Image component)

**Note:** If the build shows "Generating static pages (40/40)" successfully but then fails on blob upload, this is definitely a Netlify infrastructure issue and should be reported to Netlify support.

