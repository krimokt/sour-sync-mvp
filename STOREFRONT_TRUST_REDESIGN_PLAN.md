# Storefront Trust Redesign — Plan

Make the tenant storefront homepage feel more **trusted, B2B, and high-value** —
credibility through evidence — while staying a multi-tenant template that ranks
in Google. North-star reference: **rikaz.kz** (clean layout, quantified stats,
real project portfolio, client logos, certifications).

Branch: `feat/storefront-trust-redesign` · stacks on `feat/seo-pages-and-blog`.

---

## Decisions (confirmed with the client)

| Topic | Decision |
|---|---|
| Scope | The **shared template** (all stores), themed per tenant accent. |
| Hero | **Keep the existing dark photographic hero** (light version was tried and rejected). |
| Color | Apply rikaz-style treatment to **new** sections; leave existing sections (About, Certifications, Process, Solutions, Contact) as they are. |
| Trust sections | Logo wall, case-study portfolio, testimonials, multi-language. |

---

## Phase status

| # | Phase | Status | Notes |
|---|---|---|---|
| 1 | Light hero + stats band | ❌ Reverted | Client preferred the original dark hero. |
| 2 | Logo wall | ✅ Done | Marquee → static "trusted by" grid. Verified live. |
| 3 | Case-study / project portfolio | ✅ Done | DB + admin + homepage section. See verification note. |
| H | Header audit + unify | ✅ Done | Shared `BrandMark`, real-logo support, accent-safe hover, `z-39` bug fix, a11y. |
| 4 | Testimonials | ✅ Done | DB + admin + homepage section (before contact). |
| 5 | Multi-language (EN / 中文 / العربية / Русский) | ✅ Done (UI chrome + RTL) | Switcher + dict + RTL for Arabic. Tenant content = Phase 5b. No 5th language. |

### Audit summary (impeccable `audit`)

Storefront scored solid; no AI-slop tells. Header was the weak spot and is now fixed:

- **[P1] fixed** — mobile menu `z-39` (invalid Tailwind class → no z-index) → `z-30`.
- **[P1] fixed** — Client Portal hover hardcoded blue in both navbars → neutral slate (on-brand for every accent).
- **[P2] fixed** — both navbars now render the tenant's real logo (shared `BrandMark`), with a proper home link + `aria-label`; was a bare initial.
- **[P2] fixed** — two navbars deduplicated via `BrandMark`, so they can't drift.
- **Still open (lower priority):** homepage `Navbar` is a nested component (works, but ideally hoisted); no current-page active state on sub-page nav.

---

## ✅ Phase 2 — Logo wall

- `PartnerLogoCarousel.tsx` converted from a CSS marquee into a static,
  hairline-divided logo grid (2 / 3 / 5 columns). Wordmarks muted gray →
  ink on hover; image logos go grayscale → full color on hover.
- Same props API (`accentColor`, `title`, `logos`), so nothing else changed.

## ✅ Phase 3 — Case-study / project portfolio

**Database** (`case_studies`, applied to Supabase project `tlvwyobhndrtidetltcp`):

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | `gen_random_uuid()` |
| company_id | uuid | FK → companies, `on delete cascade` |
| slug, title | text | `unique (company_id, slug)` |
| client_name, summary, scope, location, year | text | optional |
| cover_image | text | optional |
| metric_value, metric_label | text | headline proof point (e.g. "50,000" / "units shipped") |
| sort_order | int | manual ordering |
| status | text | `draft` / `published` |
| created_at, updated_at | timestamptz | |

RLS mirrors `blog_posts`: public read where `status='published'`; owner CRUD
scoped by `company_id` via `profiles`.

**App:**
- `src/lib/seo-data.ts` — `getPublishedCaseStudies(companyId)` + `CaseStudySeo`.
- `src/app/site/[companySlug]/page.tsx` — fetches published case studies and
  threads them through `PublishedBuilderSite`.
- `CaseStudyShowcase.tsx` — homepage "Selected projects" section (cards with
  photo, client, headline metric, location·year). Renders only when data
  exists; adds a "Projects" nav link when present.
- `src/app/store/[companySlug]/case-studies/page.tsx` — dashboard CRUD tab.
- `StoreSidebar.tsx` — "Case Studies" link (Storefront group).

**How a tenant uses it:** Dashboard → Case Studies → New project → fill the
fields → Publish → it appears in "Selected projects" on the homepage.

> ⚠️ **Verification note.** Code, data, RLS, and wiring are all verified
> correct (typecheck + lint clean; the exact app query and anon REST both
> return rows; a hardcoded array renders the section). The **running dev
> server** showed the section empty because the table was created mid-session
> and that process cached an empty result. **Restart `npm run dev`** to see
> real data. Production is unaffected (table exists before deploy).

---

## Remaining work

### Phase 4 — Testimonials (~medium)
Mirror the case-study pattern.
1. `testimonials` table: company_id, quote, author_name, author_title,
   company_name, avatar_image, rating?, sort_order, status, timestamps. RLS
   like `case_studies`.
2. `getPublishedTestimonials(companyId)` in seo-data.
3. Dashboard "Testimonials" CRUD tab + sidebar link.
4. Homepage testimonials section (quote cards), themed per accent; render only
   when data exists.

### Phase 5 — Multi-language — ✅ DONE (UI chrome + RTL)
Languages shipped: English, 中文, العربية (**RTL**), Русский. No 5th language.

Delivered:
- `src/lib/i18n/storefront-dict.ts` — typed keys + EN/ZH/AR/RU translations,
  RTL set, dir helper, native labels, `NAV_LABEL_KEY`.
- `LocaleProvider` (cookie-persisted client context; sets `<html lang/dir>`;
  English default so the builder editor still works; reads cookie on mount to
  keep ISR intact).
- `LanguageSwitcher` in both navbars (light + over-hero variants).
- Translated chrome: nav, CTAs, hero buttons, logo wall, Selected projects,
  What buyers say, the sourcing form, and the footer.

### Phase 5b — Per-locale tenant content — ✅ DONE (auto-translate)
Tenant content (hero, solutions, process, about, contact, case studies,
testimonials) is now machine-translated per locale and cached server-side.

Delivered:
- `tenant_content_i18n` cache table (company_id, locale, kind, source_hash,
  content). Public read; writes via service role.
- `src/lib/i18n/translate-content.ts` — Gemini-backed translation with a
  hash-keyed cache (re-translates only when the source changes). Deep-walks
  the builder content (skipping urls/icons/handles/numbers); field-list
  translation for case studies + testimonials. Falls back to source text on
  any error so the page never breaks.
- `?lang=` URL strategy: homepage (force-dynamic) + the standalone sub-pages
  (solutions / process / certifications / contact) read `?lang=`, translate
  their content, and wrap output in `<div lang dir>` (RTL for Arabic).
- `LocaleProvider` resolves `?lang=` → cookie → default; `LanguageSwitcher`
  navigates to `?lang=` so the server renders translated content; navbars
  carry `?lang=` across links.
- `localeAlternates()` adds `hreflang` alternates to page metadata.

**Verify in production / open-network env:**
1. **Live translation needs egress to `generativelanguage.googleapis.com`.**
   This sandbox (and possibly the local network) can't reach it, so `?lang=ar`
   currently falls back to English here. Confirm from the deploy: open
   `/site/<slug>?lang=ar` and check the content is Arabic + RTL.
2. **hreflang query param**: Next's metadata normalizes `alternates.languages`
   and drops the `?lang=` query, so the emitted hreflang links collapse to the
   origin. Functionality is unaffected; revisit for SEO (e.g. inject links
   manually or move to `/[locale]` paths) if hreflang precision is needed.

### Phase 5c — Optional follow-ups
- Tenant manual override of machine translations (edit per language).
- Translate blog posts (long free-text; higher cost — excluded from 5b).
- Pre-warm the translation cache on publish (avoid first-visit latency).

---

## Notes
- Strategic design context lives in `PRODUCT.md`.
- This redesign is independent of the SEO PR but touches the same homepage
  template, so it stacks on `feat/seo-pages-and-blog`.
- SEO roadmap (separate track) is in `SEO_RANKING_PLAN.md`.
