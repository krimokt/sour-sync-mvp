'use client';

import React, { useState } from 'react';
import {
  ArrowRight, Factory, Headset, Truck, Globe, Mail, Phone, MapPin,
  MessageCircle, ShieldCheck, Boxes, Wrench,
} from 'lucide-react';
import type { FormData, GeneratedContent } from '@/components/website/builder/chinasource-types';
import type { CaseStudySeo, TestimonialSeo } from '@/lib/seo-data';
import { useScroll } from '@/components/ui/use-scroll';
import { MenuToggleIcon } from '@/components/ui/menu-toggle-icon';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';
import LanguageSwitcher from '@/components/storefront/LanguageSwitcher';
import { NAV_LABEL_KEY } from '@/lib/i18n/storefront-dict';

/**
 * "Industrial Precision" homepage — a bespoke design (from Stitch) scoped to
 * the whitesourcing tenant only. Data-driven: hero / stats / products / about /
 * contact come from the tenant's builder content (already locale-translated
 * upstream); it keeps the storefront language switcher. Other tenants keep the
 * standard template.
 *
 * Palette + type follow the supplied DESIGN.md (Deep Navy + Signal Red,
 * IBM Plex Sans / Inter / JetBrains Mono).
 */

const NAVY = '#1B3E84';
const NAVY_DARK = '#13316b';
const RED = '#E2231A';
const INK = '#0F1115';
const STEEL = '#F4F6FA';

// Reused, known-good factory/industrial stock (already used elsewhere in repo).
const FALLBACK_HERO = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1400&q=75';
const FALLBACK_FACTORY = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=75';
// Brass valve hero cutout from the supplied design (Stitch asset). Replace with
// a real product photo when available; falls back to stock if the URL expires.
const HERO_VALVE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAKrydcCqqAtrJKgrEJfLnITuzDkVPr8fYD86UWs7FnVsCqUOJjbHsl07VVq4D83I6uEtGGcgcsXCIe0pq-GX3JhFsTFc7_hMRuSUPYVlmsJYaPq2AaH7pneRiHiowfYl1vV6RjiWis-aZKndjGAxpFUsDFLMQi2kbB2oVAB1LRNyJnD_VJ3KTZmKD9GNV7Vmw3EV691Am2-5OpIs4R0ta6CHqyw2Fz3uIInfZphv9CKrLkg9CxWdytrt3ry1vdzzxv-nwgn8afDjrc';

const PILLAR_ICONS = [Factory, Headset, Truck];

interface Props {
  companySlug: string;
  formData: FormData;
  generatedContent: GeneratedContent;
  caseStudies: CaseStudySeo[];
  testimonials: TestimonialSeo[];
}

export default function WhiteSourcingHome({
  companySlug,
  formData,
  generatedContent: gc,
  caseStudies,
  testimonials,
}: Props) {
  const { t } = useStorefrontLocale();
  const scrolled = useScroll(50);
  const [mobileOpen, setMobileOpen] = useState(false);

  const base = `/site/${companySlug}`;
  const products = gc.products?.items ?? [];
  const metrics = (gc.about?.trustMetrics ?? []).filter((m) => (m?.value ?? '').toString().trim() !== '').slice(0, 4);
  const pillars = (gc.solutions?.items ?? []).slice(0, 3);
  const contact = gc.contact;

  const navItems: { label: string; href: string }[] = [
    { label: t(NAV_LABEL_KEY.Products), href: `${base}/products` },
    { label: t(NAV_LABEL_KEY.About), href: `${base}/about` },
    { label: t(NAV_LABEL_KEY.Certifications), href: `${base}/certifications` },
    { label: t(NAV_LABEL_KEY.Blog), href: `${base}/blog` },
    { label: t(NAV_LABEL_KEY.Contact), href: `${base}/contact` },
  ];

  const Brand = ({ onDark = false }: { onDark?: boolean }) => (
    <a href={base} className="flex items-center gap-2.5 flex-shrink-0">
      <span
        className="inline-flex items-center justify-center h-8 w-8 rounded-[3px] text-white text-sm font-bold"
        style={{ background: NAVY, fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {formData.companyName.charAt(0).toUpperCase()}
      </span>
      <span
        className={`text-lg font-bold tracking-tight ${onDark ? 'text-white' : 'text-[#0F1115]'}`}
        style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}
      >
        {formData.companyName}
      </span>
    </a>
  );

  return (
    <div className="bg-white text-[#0F1115]" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Load the design's fonts (browser-side; falls back to system if offline) */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@600&display=swap"
        rel="stylesheet"
      />

      {/* ── Nav ── */}
      <nav
        className={`sticky top-0 z-50 w-full border-b transition-all duration-300 ${
          scrolled ? 'bg-white shadow-sm border-gray-200' : 'bg-white/85 backdrop-blur-md border-gray-200/70'
        }`}
      >
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 lg:px-16 py-3.5">
          <Brand />
          <div className="hidden lg:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-[13px] font-semibold uppercase tracking-wide text-gray-600 hover:text-[#1B3E84] transition-colors whitespace-nowrap"
                style={{ letterSpacing: '0.04em' }}
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher accentHex={NAVY} />
            <a
              href={`${base}/contact`}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2 rounded-[3px] text-white text-[13px] font-semibold uppercase tracking-wide whitespace-nowrap shadow-sm transition-colors"
              style={{ background: NAVY, letterSpacing: '0.04em' }}
            >
              {t('cta.getQuote')}
            </a>
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="lg:hidden p-2 -mr-2 text-gray-700"
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              <MenuToggleIcon open={mobileOpen} className="size-5" duration={300} />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 bg-white px-5 py-4">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-3 py-3 rounded-[3px] text-sm font-semibold uppercase tracking-wide text-gray-700 hover:bg-gray-50"
                >
                  {item.label}
                </a>
              ))}
              <a
                href={`${base}/contact`}
                onClick={() => setMobileOpen(false)}
                className="mt-2 inline-flex justify-center items-center px-5 py-3 rounded-[3px] text-white text-sm font-semibold uppercase"
                style={{ background: NAVY }}
              >
                {t('cta.getQuote')}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero (matches the supplied design: blueprint grid, split layout,
              left→right black gradient, brass valve cutout on the right) ── */}
      <section className="relative flex min-h-[600px] overflow-hidden" style={{ background: INK }}>
        {/* blueprint grid */}
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
          }}
        />
        <div
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(to right, ${INK} 0%, ${INK}e6 45%, transparent 100%)` }}
        />
        <div className="relative z-10 mx-auto flex w-full max-w-[1280px] px-5 lg:px-16 py-24">
          <div className="flex w-full flex-col justify-center text-white md:w-1/2">
            <h1
              className="mb-6 font-bold leading-[1.1] tracking-tight text-[clamp(2.25rem,5vw,3rem)]"
              style={{ fontFamily: "'IBM Plex Sans', sans-serif", letterSpacing: '-0.02em' }}
            >
              {gc.hero?.headline || 'Precision Valve Systems & Control'}
            </h1>
            <p className="mb-10 max-w-xl text-lg leading-relaxed text-gray-300">
              {gc.hero?.subheadline || ''}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={`${base}/products`}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-[3px] text-white text-[13px] font-semibold uppercase tracking-wide shadow-lg transition-colors"
                style={{ background: NAVY, letterSpacing: '0.04em' }}
              >
                {t('cta.viewAllProducts')} <ArrowRight size={16} />
              </a>
              <a
                href={`${base}/about`}
                className="inline-flex items-center px-8 py-4 rounded-[3px] border border-white/30 text-white text-[13px] font-semibold uppercase tracking-wide hover:bg-white/10 transition-colors"
                style={{ letterSpacing: '0.04em' }}
              >
                {t(NAV_LABEL_KEY.About)}
              </a>
            </div>
          </div>
          <div className="relative hidden w-1/2 items-center justify-center md:flex">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={HERO_VALVE}
              alt={`${formData.companyName} flagship product`}
              className="z-20 max-h-[500px] object-contain transition-transform duration-700 hover:scale-105"
              style={{ filter: 'drop-shadow(0 20px 50px rgba(19,82,162,0.3))' }}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = gc.hero?.backgroundImage || FALLBACK_HERO;
              }}
            />
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      {metrics.length > 0 && (
        <div className="relative z-20 border-y py-12 text-white shadow-xl" style={{ background: NAVY, borderColor: NAVY_DARK }}>
          <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-8 md:divide-x md:divide-white/20">
              {metrics.map((m, i) => (
                <div key={i} className="text-center md:px-4">
                  <dd className="block text-4xl font-bold tabular-nums" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                    {m.value}
                    {m.suffix}
                  </dd>
                  <dt className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-200">{m.label}</dt>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}

      {/* ── Product Catalog ── */}
      <section id="products" className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="mb-12 max-w-2xl">
            <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {gc.products?.title || 'Product Catalog'}
            </h2>
            <p className="text-gray-600">
              {gc.products?.subtitle || 'Engineered for reliability. Explore our range of high-performance components.'}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {(products.length > 0 ? products : Array.from({ length: 4 })).map((p, i) => {
              const item = products.length > 0 ? (p as (typeof products)[number]) : null;
              return (
                <a
                  key={item?.id ?? i}
                  href={item?.href || `${base}/products`}
                  className="group relative block overflow-hidden rounded-[3px] border border-gray-200 bg-white transition-all hover:shadow-xl hover:border-gray-300"
                >
                  <div className="flex h-56 items-center justify-center bg-gray-50 p-8 transition-colors group-hover:bg-blue-50/40">
                    {item?.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} loading="lazy" className="max-h-full object-contain transition-transform duration-500 group-hover:scale-110" />
                    ) : (
                      <Wrench size={48} className="text-gray-300" strokeWidth={1.5} />
                    )}
                  </div>
                  <div className="border-t border-gray-100 p-6">
                    {item && (
                      <div className="mb-1 text-sm text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        {/* sku not in tile type; show a short code from id */}
                        {`PN-${String(item.id).slice(0, 6).toUpperCase()}`}
                      </div>
                    )}
                    <h3 className="mb-2 text-lg font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                      {item?.name || 'Industrial Component'}
                    </h3>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold group-hover:underline" style={{ color: NAVY }}>
                      {t('cta.readMore')} <ArrowRight size={14} />
                    </span>
                  </div>
                </a>
              );
            })}
          </div>

          <div className="mt-12 text-center">
            <a
              href={`${base}/products`}
              className="inline-flex items-center gap-2 rounded-[3px] border-2 px-8 py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors hover:text-white"
              style={{ borderColor: INK, color: INK, letterSpacing: '0.04em' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = INK; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = INK; }}
            >
              {t('cta.viewAllProducts')}
            </a>
          </div>
        </div>
      </section>

      {/* ── About ── */}
      <section id="about" className="py-24 bg-white">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="relative w-full lg:w-1/2">
              <div className="absolute -left-4 -top-4 z-0 h-24 w-24 rounded-[3px]" style={{ background: STEEL }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={gc.about?.image || FALLBACK_FACTORY}
                alt={`${formData.companyName} facility`}
                className="relative z-10 h-[460px] w-full rounded-[3px] object-cover shadow-xl grayscale transition-all duration-700 hover:grayscale-0"
              />
            </div>
            <div className="w-full lg:w-1/2">
              <span className="mb-4 block text-sm font-semibold uppercase tracking-widest" style={{ color: NAVY, letterSpacing: '0.12em' }}>
                {t(NAV_LABEL_KEY.About)}
              </span>
              <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                {gc.about?.title || 'Manufacturing Excellence at Scale.'}
              </h2>
              <p className="mb-10 text-lg leading-relaxed text-gray-600">{gc.about?.description || ''}</p>
              <div className="space-y-8">
                {pillars.map((pillar, i) => {
                  const Icon = PILLAR_ICONS[i] ?? ShieldCheck;
                  return (
                    <div key={i} className="flex gap-4">
                      <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full" style={{ background: STEEL, color: NAVY }}>
                        <Icon size={22} strokeWidth={2} />
                      </div>
                      <div>
                        <h3 className="mb-2 text-xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>{pillar.title}</h3>
                        <p className="text-gray-600">{pillar.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Selected projects (case studies) — only when present ── */}
      {caseStudies.length > 0 && (
        <section id="projects" className="py-24" style={{ background: STEEL }}>
          <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
            <h2 className="mb-12 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {t('section.selectedProjects')}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {caseStudies.map((cs) => (
                <article key={cs.id} className="overflow-hidden rounded-[3px] border border-gray-200 bg-white">
                  <div className="aspect-[16/10] bg-gray-100">
                    {cs.cover_image && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={cs.cover_image} alt={cs.title} loading="lazy" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    {cs.client_name && (
                      <div className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: NAVY }}>{cs.client_name}</div>
                    )}
                    <h3 className="text-lg font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>{cs.title}</h3>
                    {cs.metric_value && (
                      <div className="mt-3 text-2xl font-bold tabular-nums" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
                        {cs.metric_value} <span className="text-sm font-normal text-gray-500">{cs.metric_label}</span>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Global Network ── */}
      <section className="relative overflow-hidden py-24 text-white" style={{ background: NAVY }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="flex flex-col gap-16 md:flex-row">
            <div className="w-full md:w-1/3">
              <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>Global Network</h2>
              <p className="mb-8 text-lg text-blue-100">
                Delivering reliable supply chains to partners worldwide, with quality control at every step.
              </p>
              <a
                href={`${base}/contact`}
                className="inline-flex items-center gap-2 rounded-[3px] bg-white px-6 py-3 text-[13px] font-semibold uppercase tracking-wide transition-colors hover:bg-gray-100"
                style={{ color: NAVY, letterSpacing: '0.04em' }}
              >
                {t('cta.getQuote')} <ArrowRight size={14} />
              </a>
            </div>
            <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 md:w-2/3">
              {[
                { region: 'Europe', list: 'Germany, Poland, UK, Italy, Spain, France' },
                { region: 'Middle East & Africa', list: 'UAE, Saudi Arabia, Egypt, Algeria, Nigeria' },
                { region: 'Americas', list: 'USA, Canada, Brazil, Mexico, Chile' },
                { region: 'Asia Pacific', list: 'Malaysia, Vietnam, Indonesia, Australia' },
              ].map((r) => (
                <div key={r.region} className="rounded-[3px] border border-white/20 bg-white/10 p-6 backdrop-blur-sm transition-colors hover:bg-white/20">
                  <h3 className="mb-3 flex items-center gap-2 text-xl font-bold">
                    <Globe size={18} className="text-blue-300" /> {r.region}
                  </h3>
                  <p className="text-sm text-blue-100">{r.list}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials — only when present ── */}
      {testimonials.length > 0 && (
        <section id="testimonials" className="py-24 bg-white">
          <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
            <h2 className="mb-12 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
              {t('section.testimonials')}
            </h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {testimonials.map((tm) => (
                <figure key={tm.id} className="rounded-[3px] border border-gray-200 bg-white p-6">
                  <blockquote className="text-[15px] leading-relaxed text-gray-700">&ldquo;{tm.quote}&rdquo;</blockquote>
                  <figcaption className="mt-5 text-sm">
                    <span className="font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>{tm.author_name}</span>
                    {(tm.author_title || tm.author_company) && (
                      <span className="block text-gray-500">{[tm.author_title, tm.author_company].filter(Boolean).join(', ')}</span>
                    )}
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Quote CTA ── */}
      <section className="border-b border-white/10 py-24 text-center text-white" style={{ background: INK }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>
            {gc.contact?.title || 'Need help with a project?'}
          </h2>
          <p className="mb-12 text-lg text-gray-400">
            Our team is ready to help with specifications, custom requirements, and bulk ordering.
          </p>
          <a
            href={`${base}/contact`}
            className="inline-flex items-center gap-2 rounded-[3px] px-10 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-lg transition-colors"
            style={{ background: RED, letterSpacing: '0.04em' }}
          >
            {t('cta.getQuote')}
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="pb-8 pt-16 text-gray-400" style={{ background: INK }}>
        <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-10 px-5 lg:px-16 pb-12 md:grid-cols-4">
          <div>
            <div className="mb-5"><Brand onDark /></div>
            <p className="text-sm leading-relaxed">{gc.hero?.subheadline || ''}</p>
          </div>
          <div>
            <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>Contact</h4>
            <ul className="space-y-4 text-sm">
              {contact?.email && (
                <li className="flex items-start gap-3"><Mail size={18} className="text-gray-500 shrink-0" /><a href={`mailto:${contact.email}`} className="hover:text-white">{contact.email}</a></li>
              )}
              {contact?.phone && (
                <li className="flex items-start gap-3"><Phone size={18} className="text-gray-500 shrink-0" /><a href={`tel:${contact.phone}`} className="hover:text-white">{contact.phone}</a></li>
              )}
              {contact?.address && (
                <li className="flex items-start gap-3"><MapPin size={18} className="text-gray-500 shrink-0" /><span>{contact.address}</span></li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.href}><a href={item.href} className="hover:text-white transition-colors">{item.label}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="mb-5 text-lg font-bold text-white" style={{ fontFamily: "'IBM Plex Sans', sans-serif" }}>{t('section.testimonials')}</h4>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-[3px]" style={{ background: NAVY }}><Boxes size={18} className="text-white" /></span>
              <a href={`${base}/contact`} className="text-sm font-semibold text-white hover:underline">{t('cta.getQuote')}</a>
            </div>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] border-t border-white/10 px-5 lg:px-16 pt-8 text-center">
          <p className="text-xs uppercase tracking-widest text-gray-600">
            © {new Date().getFullYear()} {formData.companyName}. {t('footer.rights')}
          </p>
        </div>
      </footer>

      {/* ── Chat FAB ── */}
      <a
        href={`${base}/contact`}
        aria-label={t('cta.getQuote')}
        className="fixed bottom-8 right-8 z-[100] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform hover:scale-110"
        style={{ background: NAVY }}
      >
        <MessageCircle size={26} />
      </a>
    </div>
  );
}
