# Complete Netlify Wildcard Subdomain Setup

This guide shows how to set up wildcard subdomains (`*.soursync.com`) entirely within Netlify.

## Requirements

1. **Netlify Pro Plan or Above** ($19/month)
   - Free plan does NOT support wildcard subdomains
   - You need Pro, Business, or Enterprise plan

2. **Domain Delegation to Netlify DNS**
   - You must use Netlify's DNS (not your registrar's DNS)
   - This is required for wildcard subdomain support

## Step-by-Step Setup

### Step 1: Upgrade to Netlify Pro (if needed)

1. Go to **Team settings** → **Billing**
2. Upgrade to **Pro plan** ($19/month)
3. This enables wildcard subdomain support

### Step 2: Add Your Domain to Netlify

1. In Netlify dashboard, go to **Team settings** → **Domains**
2. Click **Add or register a domain**
3. Enter `soursync.com`
4. Click **Verify** and follow the prompts

### Step 3: Delegate DNS to Netlify

**This is the critical step!** You must use Netlify's DNS for wildcard subdomains to work.

1. After adding the domain, Netlify will show you **nameservers**:
   - Example: `dns1.p01.nsone.net`, `dns2.p01.nsone.net`
   - These will be unique to your account

2. **Go to your domain registrar** (where you bought `soursync.com`):
   - Go to DNS/Nameserver settings
   - Replace existing nameservers with Netlify's nameservers
   - Save changes

3. **Wait for DNS propagation** (5 minutes to 48 hours)
   - You can check status in Netlify dashboard
   - Netlify will show "DNS not configured" until propagation completes

### Step 4: Add Domain to Your Site

1. Go to your **site** in Netlify dashboard
2. Navigate to **Domain settings** → **Custom domains**
3. Click **Add custom domain**
4. Enter `soursync.com`
5. Netlify will verify ownership (may take a few minutes)

### Step 5: Configure Wildcard Subdomain

Once DNS is delegated to Netlify, wildcard subdomains work automatically!

1. **No need to manually add `*.soursync.com`**
2. Netlify automatically handles all subdomains when DNS is delegated
3. SSL certificates are automatically provisioned for all subdomains

### Step 6: Verify Setup

1. **Check DNS status:**
   - In Netlify: **Team settings** → **Domains** → `soursync.com`
   - Should show "DNS configured" or similar

2. **Test a subdomain:**
   - Try accessing `whitesourcing.soursync.com`
   - It should load your site
   - Your Next.js middleware will route it to `/site/whitesourcing`

3. **Check SSL:**
   - All subdomains automatically get SSL certificates
   - Check in browser: `https://whitesourcing.soursync.com`

## Alternative: If You Can't Upgrade to Pro

If you're on the free plan and can't upgrade, you have these options:

### Option A: Use Path-Based Routing (Free)
- URLs: `soursync.com/site/whitesourcing`
- Already works with your code
- No additional setup needed

### Option B: Add Individual Subdomains (Free)
- Add each subdomain manually: `whitesourcing.soursync.com`, `company2.soursync.com`, etc.
- Works on free plan
- Requires manual setup for each company

### Option C: Use Cloudflare (Free)
- See `CLOUDFLARE_WILDCARD_SETUP.md`
- Free wildcard subdomains via Cloudflare
- Netlify stays on free plan

## Netlify Configuration

Your `netlify.toml` is already configured correctly:

```toml
[build]
  command = "pnpm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  PNPM_VERSION = "10"
```

No additional configuration needed! Netlify automatically:
- Detects Next.js
- Handles routing
- Provisions SSL for all subdomains
- Your middleware handles subdomain → `/site/[companySlug]` routing

## Environment Variables

Make sure these are set in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_USE_SUBDOMAINS` = `true` (to use subdomain URLs in builder)

## Troubleshooting

### "Can't add wildcard domain"
- **Solution:** You must delegate DNS to Netlify first
- Wildcard domains are automatic once DNS is delegated
- You don't manually add `*.soursync.com` - it works automatically

### "DNS not configured"
- **Solution:** Update nameservers at your registrar
- Wait for propagation (can take up to 48 hours)
- Check status in Netlify dashboard

### "Subdomain not resolving"
- **Solution:** 
  1. Verify DNS is delegated to Netlify
  2. Check DNS propagation: https://www.whatsmydns.net
  3. Make sure domain is added to your site in Netlify
  4. Wait a few more minutes for SSL provisioning

### "SSL certificate error"
- **Solution:** 
  - Wait 5-10 minutes for automatic SSL provisioning
  - Netlify automatically provisions SSL for all subdomains
  - No manual configuration needed

## Cost Breakdown

**Netlify Pro Plan:**
- **Cost:** $19/month
- **Includes:**
  - Wildcard subdomains
  - 100GB bandwidth
  - 1,000 build minutes/month
  - Advanced features

**Alternative (Free):**
- Use path-based routing: `soursync.com/site/whitesourcing`
- Or use Cloudflare for free wildcard subdomains

## Summary

✅ **Everything can be handled in Netlify** if you:
1. Upgrade to Pro plan ($19/month)
2. Delegate DNS to Netlify
3. Add domain to your site

✅ **Wildcard subdomains work automatically** once DNS is delegated - no manual `*.soursync.com` entry needed!

✅ **Your code is already set up** - just configure Netlify and it will work.

## Quick Start Checklist

- [ ] Upgrade to Netlify Pro (if not already)
- [ ] Add `soursync.com` to Netlify (Team settings → Domains)
- [ ] Update nameservers at domain registrar
- [ ] Wait for DNS propagation
- [ ] Add `soursync.com` to your site (Domain settings)
- [ ] Set environment variable: `NEXT_PUBLIC_USE_SUBDOMAINS` = `true`
- [ ] Test: `whitesourcing.soursync.com`

That's it! Everything is handled in Netlify. 🎉




