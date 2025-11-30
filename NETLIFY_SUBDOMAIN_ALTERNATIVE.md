# Alternative Solutions for Wildcard Subdomains on Netlify

Since Netlify requires **Pro plan or above** for wildcard subdomains, here are alternative solutions:

## Solution 1: Use Netlify DNS Delegation (Recommended if you have Pro plan)

1. **Delegate your domain to Netlify DNS:**
   - In Netlify: **Team settings** → **Domains** → **Add or register a domain**
   - Enter `soursync.com`
   - Netlify will provide nameservers (e.g., `dns1.p01.nsone.net`)
   - Update your domain registrar to use these nameservers

2. **After DNS delegation:**
   - Go to your site → **Domain settings**
   - Add `soursync.com` as custom domain
   - Netlify will automatically handle `*.soursync.com` subdomains

## Solution 2: Use Main Domain with Path-Based Routing (Works on Free Plan)

Instead of subdomains, use paths: `soursync.com/site/whitesourcing`

**Pros:**
- Works on free plan
- No DNS configuration needed
- Already supported by your codebase

**Cons:**
- URLs are longer
- Less "professional" looking

**Implementation:** Your code already supports this! Just use:
- `soursync.com/site/whitesourcing` instead of `whitesourcing.soursync.com`

## Solution 3: Add Individual Subdomains (Works on Free Plan)

Add each company subdomain individually as needed:

1. In Netlify: **Domain settings** → **Add custom domain**
2. Add each subdomain: `whitesourcing.soursync.com`, `company2.soursync.com`, etc.
3. Configure DNS at your registrar for each subdomain

**Pros:**
- Works on free plan
- Clean URLs

**Cons:**
- Manual setup for each company
- Need to add new subdomain for each new company

## Solution 4: Use a Reverse Proxy (Advanced)

Use a service like Cloudflare in front of Netlify:

1. Point `*.soursync.com` DNS to Cloudflare
2. Cloudflare proxies to your Netlify site
3. Cloudflare handles wildcard subdomains (free)

**Configuration:**
- DNS: `*.soursync.com` → CNAME → `your-site.netlify.app`
- Cloudflare automatically handles wildcards

## Solution 5: Upgrade to Netlify Pro

If you need wildcard subdomains:
- Upgrade to Netlify Pro ($19/month)
- Then follow Solution 1

## Recommended Approach for Your Use Case

Since you're building a multi-tenant SaaS, I recommend:

**Short term:** Use Solution 2 (path-based routing)
- Already works with your code
- No additional cost
- URLs: `soursync.com/site/whitesourcing`

**Long term:** 
- Option A: Upgrade to Netlify Pro + use wildcard subdomains
- Option B: Use Cloudflare (free) + Netlify for wildcard support
- Option C: Consider Vercel (has better Next.js support and wildcard subdomains on Pro)

## Quick Fix: Update Your Links

If you want to use path-based routing immediately, update the client link in the builder:

Change from: `https://${companySlug}.soursync.com`
Change to: `https://soursync.com/site/${companySlug}`

This works immediately without any DNS or Netlify configuration!




