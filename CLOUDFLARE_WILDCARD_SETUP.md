# Cloudflare Wildcard Subdomain Setup (Free Alternative)

This guide shows how to use Cloudflare (free) to enable wildcard subdomains with Netlify.

## Why Cloudflare?

- **Free wildcard subdomains** - No need for Netlify Pro
- **Free SSL certificates** for all subdomains
- **CDN and performance benefits**
- **Easy DNS management**

## Step 1: Add Domain to Cloudflare

1. Sign up for a free Cloudflare account at https://cloudflare.com
2. Click **Add a Site**
3. Enter `soursync.com`
4. Select the **Free plan**
5. Cloudflare will scan your existing DNS records

## Step 2: Update Nameservers

1. Cloudflare will provide you with nameservers (e.g., `alice.ns.cloudflare.com`)
2. Go to your domain registrar (where you bought `soursync.com`)
3. Update the nameservers to Cloudflare's nameservers
4. Wait for DNS propagation (usually 5-30 minutes)

## Step 3: Configure DNS Records in Cloudflare

1. In Cloudflare dashboard, go to **DNS** → **Records**
2. Add these records:

### Main Domain (A Record)
- **Type:** A
- **Name:** `@` (or `soursync.com`)
- **IPv4 address:** Get this from Netlify (your site's IP)
- **Proxy status:** Proxied (orange cloud) ✅
- **TTL:** Auto

### Wildcard Subdomain (CNAME Record)
- **Type:** CNAME
- **Name:** `*` (wildcard)
- **Target:** `your-site.netlify.app` (your Netlify site URL)
- **Proxy status:** Proxied (orange cloud) ✅
- **TTL:** Auto

### Optional: www Subdomain
- **Type:** CNAME
- **Name:** `www`
- **Target:** `your-site.netlify.app`
- **Proxy status:** Proxied ✅

## Step 4: Configure Netlify

1. In Netlify, go to **Domain settings**
2. Add `soursync.com` as a custom domain
3. Netlify will verify the domain (may take a few minutes)

## Step 5: SSL/TLS Settings

1. In Cloudflare, go to **SSL/TLS**
2. Set encryption mode to **Full** (or **Full (strict)** if you have SSL on Netlify)
3. Cloudflare will automatically provision SSL certificates for all subdomains

## Step 6: Test

1. Wait 5-30 minutes for DNS propagation
2. Test: `whitesourcing.soursync.com`
3. It should load your Netlify site
4. Your Next.js middleware will route it to `/site/whitesourcing`

## Step 7: Update Environment Variable (Optional)

If you want to use subdomain URLs in your builder:

1. In Netlify, go to **Site settings** → **Environment variables**
2. Add: `NEXT_PUBLIC_USE_SUBDOMAINS` = `true`
3. Redeploy your site

## Benefits

✅ **Free wildcard subdomains** (no Netlify Pro needed)
✅ **Automatic SSL** for all subdomains
✅ **CDN** for faster loading
✅ **DDoS protection**
✅ **Analytics** (basic on free plan)

## Troubleshooting

### Subdomain not resolving:
- Check DNS propagation: https://www.whatsmydns.net
- Verify CNAME record is correct in Cloudflare
- Make sure proxy is enabled (orange cloud)

### SSL errors:
- Set Cloudflare SSL mode to **Full** or **Full (strict)**
- Wait a few minutes for certificate provisioning

### Site not loading:
- Verify Netlify domain is added correctly
- Check Cloudflare DNS records point to correct Netlify URL
- Clear browser cache

## Important Notes

- **DNS Propagation:** Can take 5-30 minutes (sometimes up to 48 hours)
- **Cloudflare Proxy:** Keep it enabled (orange cloud) for SSL and CDN benefits
- **Netlify Build:** Your existing `netlify.toml` will work as-is
- **Middleware:** Your Next.js middleware already handles subdomain routing

## Cost

- **Cloudflare:** Free (forever)
- **Netlify:** Free plan is sufficient
- **Total:** $0/month for wildcard subdomains! 🎉



