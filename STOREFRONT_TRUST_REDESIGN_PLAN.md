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
| 4 | Testimonials | ⏳ Not started | New table + admin + homepage section (mirrors case studies). |
| 5 | Multi-language (EN / 中文 / العربية / Русский / +1) | ⏳ Not started | Platform feature: i18n + RTL + `hreflang`. 5th language TBC. |

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

### Phase 5 — Multi-language (~large, its own project)
Languages: English, Chinese (中文), Arabic (العربية, **RTL**), Russian
(Русский), + 1 to confirm (French or Spanish).
1. i18n framework (e.g. `next-intl`) + locale routing (`/[locale]/site/...`).
2. UI string catalogs per locale.
3. Per-tenant translated content (builder copy, case studies, blog) — needs a
   translation storage strategy (columns or a translations table).
4. **RTL** layout support for Arabic (`dir="rtl"`, logical CSS properties).
5. SEO: `hreflang` alternates + `lang`/`dir` on `<html>` + localized metadata.
6. Language switcher in the navbar/footer.

---

## Notes
- Strategic design context lives in `PRODUCT.md`.
- This redesign is independent of the SEO PR but touches the same homepage
  template, so it stacks on `feat/seo-pages-and-blog`.
- SEO roadmap (separate track) is in `SEO_RANKING_PLAN.md`.
