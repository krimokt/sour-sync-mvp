# SourSync SEO Ranking Plan

A practical plan for getting tenant storefronts (and individual products) to rank in Google for: **product-name keywords**, **company-name keywords**, and **chosen custom keywords**.

---

## Part 1 — The three ranking targets

| Target | Example query | Page that should rank | Difficulty |
|---|---|---|---|
| **Company brand** | "WhiteSourcing" | `/site/whitesourcing` (home) | Easy |
| **Product name** | "stainless centrifugal water pump 5HP" | `/site/whitesourcing/products/{id}` | Medium |
| **Custom keyword** | "water pumps supplier Morocco" | Home or category page | Hard |

Each needs a different setup. The infrastructure is shared.

---

## Part 2 — Platform-level work (SourSync builds this once)

These ship to every tenant for free.

### 2.1 Per-page metadata (`generateMetadata`)
Each route needs unique title + description + canonical, derived from tenant + page data.

- **Home** → `{CompanyName} — {tagline} | {Country}`
- **Product** → `{ProductName} — Buy from {CompanyName}`
- **Category** → `{Category} | {CompanyName}`
- **Services / About / Contact** → templated

### 2.2 Dynamic `sitemap.xml`
At `/sitemap.xml`, list every active company plus their products/categories. Submit to Google Search Console.

For custom domains, generate a per-tenant sitemap at `{tenant-domain}/sitemap.xml`.

### 2.3 `robots.txt`
Allow storefront routes. Block `/admin`, `/api`, `/client/*`, `/store/*`.

### 2.4 Structured data (JSON-LD)
- Home: `Organization` + `LocalBusiness` (if address present)
- Product: `Product` with `offers`, `aggregateRating` (when reviews land), `brand`
- Breadcrumbs: `BreadcrumbList` on every sub-page
- Quote-form / contact: `ContactPoint`

These unlock rich results (price, stock, ratings shown in search).

### 2.5 Custom domains per tenant
Critical for ranking. `whitesourcing.com` (or `whitesourcing.soursync.com`) ranks for "whitesourcing" far better than `soursync.com/site/whitesourcing` ever will. Wildcard subdomain support exists in your repo (`CLOUDFLARE_WILDCARD_SETUP.md`) — finish it.

### 2.6 OG / Twitter cards
Per-page OG image, title, description. Improves CTR from social and is a soft Google signal.

### 2.7 Performance
- Image optimization (already using `next/image` for some routes — extend everywhere).
- Lighthouse target: LCP < 2.5s, CLS < 0.1, INP < 200ms.
- Cache static product data at edge.

### 2.8 In-app SEO tab per tenant
A new section in the builder where tenants can:
- Edit page title / meta description per page
- Add target keywords per product
- Add canonical URLs
- Upload OG image
- Connect Google Search Console (verification meta tag)
- See indexed pages count + queries (via GSC API)

This turns SEO from "trust the platform" into "tenant has levers."

---

## Part 3 — What each tenant needs to do

### Step 1 — Brand-name ranking (week 1)

Goal: rank #1 for `{CompanyName}` search.

1. **Set custom domain** (or branded subdomain). Without this, ranking caps out.
2. **Fill the About page completely** — full company name, founding year, address, contact, social links. Google needs entity signals.
3. **Create a Google Business Profile** with same name, address, phone (NAP must match the website exactly).
4. **Submit to Google Search Console** + submit sitemap.
5. **Add `Organization` schema** (auto via SourSync — tenant just confirms data).
6. **Get 3–5 directory listings** (industry directories, LinkedIn company page, Crunchbase if applicable) with consistent NAP.

Expected result: rank #1–3 for exact brand name within 2–6 weeks.

### Step 2 — Product-name ranking (ongoing per product)

Goal: rank on page 1 for `{ProductName}` and `{ProductName} + buy/supplier/wholesale`.

For each product the tenant publishes:

1. **Product name = the exact keyword shoppers type.** Not "Premium Pump XJ-5000" — write "5HP Stainless Steel Centrifugal Water Pump." Match how people search.
2. **Description ≥ 300 words, unique.** Never copy from Alibaba/supplier. Cover: specs, use cases, materials, dimensions, MOQ, lead time, certifications, FAQ.
3. **Real product photos.** Multiple angles, original (not stock from Alibaba — duplicate images hurt rankings). Compress, use `alt` text with product name.
4. **SKU + structured data.** The `Product` JSON-LD auto-emits from SourSync.
5. **Set per-product meta title + description** in the SEO tab.
6. **Internal links.** Link from category page and related products.
7. **External signals.** Share product on the company's LinkedIn / X. Backlinks from supplier directories.

Expected result: long-tail product queries (4+ words) rank within 1–3 months. Generic 1–2 word product names are competitive — those need backlinks.

### Step 3 — Custom keyword ranking (months 2+)

Goal: rank for chosen commercial keywords like "ceramic tile supplier vietnam" or "industrial water pumps morocco."

This is the hard one — competing with established suppliers.

1. **Keyword research first.** Use Google Keyword Planner, Ahrefs, or Ubersuggest. Pick keywords with:
   - Search volume 100–1,000/mo (avoid 10k+ — too competitive for new sites)
   - Buyer intent ("supplier," "manufacturer," "wholesale," "buy," "factory")
   - Geographic modifier when possible ("water pumps morocco" easier than "water pumps")

2. **Create a dedicated landing page per primary keyword.** SourSync's builder already supports custom pages — use one page per major keyword cluster:
   - `/services/water-pump-sourcing`
   - `/industries/agriculture-equipment`
   - `/regions/morocco-suppliers`

3. **Page structure per landing page:**
   - H1 contains the exact keyword
   - 800–1,500 words of original, useful content
   - Mention competitors / alternatives honestly
   - FAQ section (gets you in "People Also Ask")
   - Internal links to relevant products
   - Strong CTA → quote form

4. **Backlinks.** This is what actually moves rankings for competitive keywords:
   - Guest posts on industry blogs
   - Be listed on B2B directories (Kompass, ThomasNet, EC21, Made-in-China alternatives)
   - Press releases when you launch a product line
   - LinkedIn articles linking back

5. **Content cadence.** Publish a blog post every 2 weeks targeting long-tail variations of the main keyword. Five blog posts feeding one landing page beats the landing page alone.

Expected result: 3–6 months to break page 1 for medium-competition keywords. Longer for high-competition.

---

## Part 3.5 — Ranking a single product page on page 1

The most common tenant question: **"Can my product page rank on Google's first page?"**

Short answer: yes, but only for the right kinds of queries.

### When a single product page CAN rank page 1

✅ **Long-tail product queries (4+ words)** — very achievable.
- "5HP stainless centrifugal water pump 220V Morocco" → realistic in 4–8 weeks.
- "ceramic floor tile 60x60 anti-slip wholesale" → realistic in 1–3 months.
- Low competition, high buyer intent.

✅ **Branded product queries** — easy.
- "WhiteSourcing centrifugal pump XJ-5000" → ranks fast because nobody else uses that exact name.

✅ **Niche / technical specs** — achievable.
- "IP68 submersible pump 3kW 380V three-phase" → buyers who search this way convert well, and the keyword has few competitors.

### When it's hard or unrealistic

❌ **Generic 1–2 word product names** — very hard from a single product page.
- "water pump", "ceramic tiles", "led lights" → dominated by Amazon, Alibaba, Home Depot, established brands with millions of backlinks. A single product page on a new domain won't reach page 1 for these in under a year, if ever.

❌ **Pure category / comparison terms** — won't rank from a product page at all.
- "best water pumps 2026" → needs a comparison/blog page, not a product page.

### What it takes for the product page to actually rank

Per product page, the tenant must:

1. **Title tag (50–60 chars):** `5HP Stainless Centrifugal Pump — Free Quote | WhiteSourcing`
2. **H1 = the exact keyword.** Product name appears in the page heading.
3. **300–800 words of unique copy.** Specs, use cases, materials, dimensions, MOQ, lead time, warranty, FAQ. Never copy-paste from Alibaba.
4. **5+ original photos.** Different angles, in-use shots. `alt` text contains the keyword. Stock photos and Alibaba images hurt — Google detects duplicates.
5. **`Product` JSON-LD** — auto-generated by SourSync. Unlocks price, stock, rating in search results.
6. **Internal links.** Category page + 2–3 related products link to it.
7. **One external backlink.** A LinkedIn post, an industry directory listing, a forum mention. Just one quality link dramatically helps a new product page.
8. **Submit via Google Search Console.** "Request indexing" on the product URL — gets it crawled in hours instead of weeks.

### Realistic timeline for a single product page

| Week | What happens |
|---|---|
| 0 | Tenant publishes product with full SEO setup |
| 1 | Google indexes the page (faster with GSC request) |
| 2–4 | Ranks on page 3–5 for long-tail queries |
| 4–8 | Climbs to page 1–2 for long-tail queries if there's any backlink + traffic |
| 2–6 months | Stable page-1 position for the right queries |

### How to answer the tenant question honestly

- **"Can my product rank page 1?"** → Yes, for the specific way buyers will search for it, within 1–3 months, if you write a unique 300+ word description, use real photos, and pick a specific multi-word product name.
- **"Can my product rank for 'water pump'?"** → No. Not from a product page, not in the first year.

### What SourSync should build to enable per-product ranking

For every product, the builder should require / coach:

- Product name length ≥ 4 words (warning if shorter).
- Description ≥ 300 words (live word counter).
- At least 3 unique uploaded images (block stock URLs / Alibaba CDN domains).
- Meta title + description fields (pre-filled, editable).
- Focus keyword field with a real-time scorecard:
  - "appears in title ✓"
  - "appears in H1 ✓"
  - "appears in first paragraph ✓"
  - "appears in image alt text ✗"
- One-click "Submit to Google" via GSC integration after publishing.
- Duplicate-content check: warn if description looks pasted from a known source.

This turns ranking from luck into a checklist tenants can actually complete.

---

## Part 4 — What to build first (priority order)

If I were building this:

1. **`generateMetadata` for all storefront routes** — half a day. Biggest single win.
2. **Dynamic sitemap.xml + robots.txt** — half a day.
3. **JSON-LD: Organization on home, Product on product pages, BreadcrumbList** — 1 day.
4. **SEO tab in builder** (title/description/OG per page) — 2–3 days.
5. **Custom domains finished + auto-canonical** — 1–2 days (mostly done per CLOUDFLARE_WILDCARD_SETUP.md).
6. **Google Search Console integration** (verification + indexed-pages display) — 1 day.
7. **Per-product SEO fields** (focus keyword, meta title, meta description, OG image) — 1 day.
8. **Blog/articles section in builder** — 3 days. Critical for custom-keyword ranking.
9. **In-builder SEO scorecard** ("title too short," "missing H1," "no alt text," "thin content") — 2 days. Coaches tenants.
10. **Tenant-facing docs/checklist** — half a day. The "how to rank" guide they follow.

Total: ~2 weeks of focused work to ship a real SEO offering.

---

## Part 5 — What to honestly tell tenants

- **Brand-name ranking is realistic in weeks** if they set up basics.
- **Long-tail product ranking is realistic in months** with good descriptions and photos.
- **Generic high-volume keywords need investment** — content, backlinks, time. SourSync gives them the platform; they still have to do marketing.
- **A custom domain is non-negotiable** for serious ranking. Subpath storefronts will always lose to dedicated domains.
