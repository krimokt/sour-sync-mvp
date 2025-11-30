# Netlify Wildcard Subdomain Setup Guide

This guide explains how to configure Netlify to support wildcard subdomains like `{companySlug}.soursync.com`.

## Step 1: Configure DNS in Netlify

1. **Go to your Netlify site settings:**
   - Navigate to your site in Netlify dashboard
   - Go to **Domain settings** → **Custom domains**

2. **Add your main domain:**
   - Add `soursync.com` as your primary domain
   - Netlify will provide DNS records to add to your domain registrar

3. **Add wildcard subdomain:**
   - In Netlify, add `*.soursync.com` as a custom domain
   - This allows any subdomain (e.g., `whitesourcing.soursync.com`) to point to your site

## Step 2: Configure DNS at Your Domain Registrar

You need to add DNS records at your domain registrar (where you bought `soursync.com`):

### Option A: Use Netlify DNS (Recommended)

1. In Netlify, go to **Domain settings** → **DNS**
2. Click **Add DNS provider** or **Use Netlify DNS**
3. Follow the instructions to update your domain's nameservers to Netlify's nameservers
4. Netlify will automatically handle wildcard subdomains

### Option B: Configure DNS Manually

If you prefer to keep your current DNS provider:

1. Add an **A Record** or **CNAME Record** for the wildcard:
   - **Type:** CNAME (or A if CNAME not supported)
   - **Name/Host:** `*` (wildcard)
   - **Value/Target:** Your Netlify site URL (e.g., `your-site.netlify.app`)

2. Add DNS records for the main domain:
   - Follow Netlify's instructions for `soursync.com`

**Note:** Some DNS providers don't support wildcard CNAME records. In that case:
- Use Netlify DNS (Option A), or
- Add individual A records for each subdomain (not scalable)

## Step 3: Verify Configuration

1. **Check DNS propagation:**
   - Use a tool like `dig` or online DNS checker
   - Verify `*.soursync.com` resolves to Netlify's IPs

2. **Test a subdomain:**
   - Try accessing `whitesourcing.soursync.com` in your browser
   - It should load your Next.js app
   - The middleware will route it to `/site/whitesourcing`

## Step 4: Environment Variables

Make sure your Netlify environment variables are set:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- Any other required environment variables

## Troubleshooting

### Subdomain not resolving:
- Check DNS propagation (can take up to 48 hours)
- Verify wildcard DNS record is correctly configured
- Check Netlify domain settings show `*.soursync.com`

### Subdomain resolves but shows error:
- Check Netlify build logs for errors
- Verify environment variables are set
- Check that the middleware is correctly handling subdomains

### "Site not found" error:
- Ensure the wildcard domain is added in Netlify
- Verify DNS is pointing to Netlify
- Check that your site is published in Netlify

## Important Notes

- **DNS Propagation:** Changes can take 24-48 hours to propagate globally
- **SSL Certificates:** Netlify automatically provisions SSL certificates for all subdomains
- **Build Settings:** The `netlify.toml` file is already configured for Next.js
- **Middleware:** The Next.js middleware handles subdomain routing automatically

## Testing Locally

For local development, you can use:
- `whitesourcing.localhost:3000` (works automatically)
- Or modify your `/etc/hosts` file to point subdomains to `127.0.0.1`




