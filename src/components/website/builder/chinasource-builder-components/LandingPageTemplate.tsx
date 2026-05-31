'use client';

import React, { useState, useEffect } from 'react';
import { FormData, GeneratedContent, ThemeColor, TemplateId } from '../chinasource-types';
import {
  Mail, MapPin, ArrowUpRight, LogIn, ExternalLink,
  ShieldCheck, Instagram, Linkedin, MessageCircle,
  CheckCircle2, Globe, Clock, Package, Menu, X,
} from 'lucide-react';
import { EditableText } from './EditorComponents';
import Sidebar from './Sidebar';
import PartnerLogoCarousel from './PartnerLogoCarousel';
import SiteFooter from './SiteFooter';
import SourcingRequestForm from './SourcingRequestForm';
import FactoryCertifications from './FactoryCertifications';
import ProcessTimeline from './ProcessTimeline';
import SolutionsList from './SolutionsList';
import BrandMark from './BrandMark';
import CaseStudyShowcase from './CaseStudyShowcase';
import TestimonialsShowcase from './TestimonialsShowcase';
import AboutHeroSection from '@/components/storefront/AboutHeroSection';
import LanguageSwitcher from '@/components/storefront/LanguageSwitcher';
import { useStorefrontLocale } from '@/components/storefront/LocaleProvider';
import { NAV_LABEL_KEY } from '@/lib/i18n/storefront-dict';
import type { CaseStudySeo, TestimonialSeo } from '@/lib/seo-data';

interface LandingPageTemplateProps {
  data: FormData;
  content: GeneratedContent;
  onEdit?: () => void;
  hideSidebar?: boolean;
  hasTopBar?: boolean;
  readOnly?: boolean;
  companySlug?: string;
  /** Published case studies — fetched server-side, threaded in for the live site. */
  caseStudies?: CaseStudySeo[];
  /** Published testimonials — fetched server-side, threaded in for the live site. */
  testimonials?: TestimonialSeo[];
}

const themeAccent: Record<ThemeColor, { hex: string; light: string; text: string }> = {
  amber:   { hex: '#f59e0b', light: 'bg-amber-50',   text: 'text-amber-600' },
  blue:    { hex: '#2563eb', light: 'bg-blue-50',     text: 'text-blue-600' },
  red:     { hex: '#dc2626', light: 'bg-red-50',      text: 'text-red-600' },
  emerald: { hex: '#059669', light: 'bg-emerald-50',  text: 'text-emerald-600' },
  indigo:  { hex: '#4f46e5', light: 'bg-indigo-50',   text: 'text-indigo-600' },
  zinc:    { hex: '#18181b', light: 'bg-zinc-100',     text: 'text-zinc-900' },
};

export const LandingPageTemplate: React.FC<LandingPageTemplateProps> = ({
  data, content: initialContent, hideSidebar = false, hasTopBar = false, readOnly = false, companySlug, caseStudies, testimonials,
}) => {
  const normalized = {
    ...initialContent,
    contact: { ...initialContent.contact, socialMedia: initialContent.contact.socialMedia || [] },
  };
  const [content, setContent] = useState<GeneratedContent>(normalized);
  const [activeSection, setActiveSection] = useState<string | null>('hero');
  const [themeColor, setThemeColor] = useState<ThemeColor>(data.themeColor);
  const [templateId, setTemplateId] = useState<TemplateId>(data.templateId);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { t, locale } = useStorefrontLocale();
  const langQs = locale !== 'en' ? `?lang=${locale}` : '';

  const accent = themeAccent[themeColor];
  // Shared CTA color — calm cyan-blue that pairs with the blue theme without
  // competing. Mirrors the "LET'S COLLABORATE" button on the About section.
  const ctaColor = { hex: '#2596be', hover: '#1f7fa0' };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);


  const updateContent = (path: string, value: unknown) => {
    setContent(prev => {
      const next = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = next;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = value;
      return next;
    });
  };

  /* ── Navbar ── */
  const navLinks = [
    ...(content.products?.items?.length ? ['Products'] : []),
    'Solutions',
    'Process',
    ...(caseStudies?.length ? ['Projects'] : []),
    'Certifications',
    'About',
    'Blog',
    'Contact',
  ];
  const slug = companySlug || data.companyName.toLowerCase().replace(/\s+/g, '-');
  const signInHref = `/site/${slug}/signin`;
  // Blog has no homepage section — route to its page; others smooth-scroll.
  const navHref = (label: string) => (label === 'Blog' ? `/site/${slug}/blog${langQs}` : `#${label.toLowerCase()}`);

  const Navbar = () => (
    <>
      <nav
        className={`fixed ${hasTopBar ? 'top-16' : 'top-0'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-white/85 backdrop-blur-xl backdrop-saturate-150 shadow-[0_1px_0_rgba(15,23,42,0.06),0_8px_24px_-12px_rgba(15,23,42,0.12)]'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}>

            {/* Logo — real logo when uploaded, else accent initial tile */}
            <BrandMark
              companyName={data.companyName}
              logoUrl={data.logoUrl}
              accentHex={accent.hex}
              href={`/site/${slug}${langQs}`}
              onDark={!scrolled}
            />

            {/* Desktop links — centered, pill hover with accent tint */}
            <div className="hidden lg:flex items-center gap-0.5 min-w-0">
              {navLinks.map(label => (
                <a
                  key={label}
                  href={navHref(label)}
                  className={`relative px-3 py-2 rounded-lg text-[13.5px] font-medium whitespace-nowrap transition-all duration-200 ${
                    scrolled
                      ? 'text-slate-600 hover:text-slate-900'
                      : 'text-white/75 hover:text-white'
                  }`}
                  style={
                    scrolled
                      ? ({ ['--hover-bg' as string]: `${accent.hex}10` } as React.CSSProperties)
                      : undefined
                  }
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = scrolled
                      ? `${accent.hex}10`
                      : 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '';
                  }}
                >
                  {t(NAV_LABEL_KEY[label])}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {readOnly && <LanguageSwitcher accentHex={accent.hex} onDark={!scrolled} />}
              <a
                href={signInHref}
                className={`group relative inline-flex items-center gap-2 pl-3.5 pr-4 h-10 rounded-full text-[13px] font-semibold whitespace-nowrap shrink-0 transition-all ${
                  scrolled
                    ? 'text-slate-700 bg-white ring-1 ring-slate-200 hover:ring-slate-300 hover:text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.04)]'
                    : 'text-white bg-white/10 ring-1 ring-white/25 hover:bg-white/15 hover:ring-white/40 backdrop-blur'
                }`}
              >
                <span
                  className={`inline-flex items-center justify-center w-6 h-6 rounded-full transition-colors ${
                    scrolled
                      ? 'bg-slate-100 text-slate-500 group-hover:text-slate-700'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  <LogIn size={12} />
                </span>
                {t('cta.clientPortal')}
              </a>
              {/* Site-wide primary CTA */}
              <a
                href="#contact"
                className="inline-flex items-center gap-2 h-10 pl-2 pr-4 rounded-xl bg-neutral-900 text-white text-[13px] font-semibold whitespace-nowrap shrink-0 hover:bg-neutral-800 transition-colors shadow-sm"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg shrink-0" style={{ background: accent.hex }}>
                  <ArrowUpRight size={13} className="text-white" />
                </span>
                {t('cta.getQuote')}
              </a>
            </div>

            {/* Mobile: language + sign in + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              {readOnly && <LanguageSwitcher accentHex={accent.hex} onDark={!scrolled} />}
              <a
                href={signInHref}
                aria-label={t('cta.clientPortal')}
                className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition ${
                  scrolled
                    ? 'bg-white ring-1 ring-slate-200 text-slate-600 hover:ring-slate-300 hover:text-slate-900'
                    : 'bg-white/10 ring-1 ring-white/25 text-white hover:bg-white/15 backdrop-blur'
                }`}
              >
                <LogIn size={16} />
              </a>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
                aria-expanded={mobileOpen}
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          className={`fixed ${hasTopBar ? 'top-[calc(4rem+3.5rem)]' : 'top-14'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-30 bg-white border-b border-gray-100 shadow-lg`}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map(label => (
              <a
                key={label}
                href={navHref(label)}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {t(NAV_LABEL_KEY[label])}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-1" />
            <a
              href={signInHref}
              className="mt-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-slate-800 bg-white ring-1 ring-slate-200 hover:ring-slate-300 hover:text-slate-900 transition"
            >
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-slate-100 text-slate-500">
                <LogIn size={13} />
              </span>
              {t('cta.clientPortal')}
            </a>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-1 inline-flex items-center justify-center gap-2 h-11 rounded-xl bg-neutral-900 text-white text-sm font-semibold whitespace-nowrap hover:bg-neutral-800 transition-colors"
            >
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg shrink-0" style={{ background: accent.hex }}>
                <ArrowUpRight size={14} className="text-white" />
              </span>
              {t('cta.getQuote')}
            </a>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div
      className="min-h-screen flex bg-white"
      style={{
        fontFamily: 'var(--font-jakarta, system-ui, sans-serif)',
        // Theme tokens — every hardcoded oklch in this file now resolves here.
        // Override per-tenant later by replacing these declarations.
        ['--ink-deep' as string]: 'oklch(0.12 0.018 240)',
        ['--ink-tint' as string]: 'oklch(0.16 0.02 230)',
        ['--ink-line' as string]: 'oklch(0.22 0.01 240)',
        ['--ink-line-soft' as string]: 'oklch(0.35 0.01 240)',
        ['--surface-soft' as string]: 'oklch(0.975 0.006 238)',
        ['--text-on-deep' as string]: 'oklch(0.82 0.01 230)',
        ['--text-on-deep-muted' as string]: 'oklch(0.72 0.01 230)',
      }}
    >
      {!hideSidebar && (
        <Sidebar
          content={content}
          onUpdate={updateContent}
          activeSection={activeSection}
          onSectionClick={setActiveSection}
          themeColor={themeColor}
          onThemeChange={setThemeColor}
          templateId={templateId}
          onTemplateChange={setTemplateId}
        />
      )}

      <main className={`flex-1 relative ${!hideSidebar ? 'ml-80' : ''}`}>
        <Navbar />

        {/* ── HERO ── */}
        <section
          id="hero"
          className="relative min-h-[clamp(640px,calc(100vh-4rem),900px)] flex items-center overflow-hidden"
          style={{ background: 'var(--ink-deep)' }}
          onClick={() => setActiveSection('hero')}
        >
          {/* Background — factory image with a strong dark scrim so headline
              copy still hits AA contrast. Falls back to a curated Unsplash
              factory photo when the AI-generated content didn't supply one. */}
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                content.hero.backgroundImage ||
                'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=2000&q=70'
              }
              className="w-full h-full object-cover"
              alt=""
              loading="eager"
              decoding="async"
            />
            {/* Dark scrim — left side darker so the headline is readable, right
                side keeps some of the image visible. */}
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(90deg, oklch(0.12 0.018 240 / 0.92) 0%, oklch(0.12 0.018 240 / 0.78) 45%, oklch(0.12 0.018 240 / 0.55) 100%)',
              }}
            />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-8 pt-32 pb-24 w-full">
            {/* Eyebrow — first in, smallest delay */}
            <div
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-8 hero-rise"
              style={{ borderColor: `${accent.hex}40`, background: `${accent.hex}15`, animationDelay: '40ms' }}
            >
              <ShieldCheck size={13} style={{ color: accent.hex }} />
              <span className="text-xs font-semibold tracking-wider" style={{ color: accent.hex }}>
                <EditableText value={content.hero.tagline} onChange={v => updateContent('hero.tagline', v)} readOnly={readOnly} />
              </span>
            </div>

            {/* Headline */}
            <div className="hero-rise" style={{ animationDelay: '120ms' }}>
              <EditableText
                value={content.hero.headline}
                onChange={v => updateContent('hero.headline', v)}
                tag="h1"
                className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 max-w-4xl"
                readOnly={readOnly}
              />
            </div>

            {/* Subheadline */}
            <p
              className="text-lg text-white/80 max-w-2xl mb-10 leading-relaxed font-normal hero-rise"
              style={{ animationDelay: '220ms' }}
            >
              <EditableText value={content.hero.subheadline} onChange={v => updateContent('hero.subheadline', v)} readOnly={readOnly} />
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 hero-rise" style={{ animationDelay: '320ms' }}>
              {/* Primary CTA — complementary color, pops against theme */}
              <a
                href="#contact"
                className="group inline-flex items-center gap-2 hover:gap-4 text-white px-6 py-3.5 rounded-lg font-semibold text-sm transition-all duration-300 ease-in-out"
                style={{
                  background: ctaColor.hex,
                  boxShadow: `0 10px 24px -10px ${ctaColor.hex}99, 0 1px 0 rgba(255,255,255,0.22) inset`,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = ctaColor.hover; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = ctaColor.hex; }}
              >
                {content.hero.ctaPrimary.text}
                <ArrowUpRight size={16} />
              </a>
              <a
                href="#solutions"
                className="flex items-center gap-2 px-7 py-4 rounded-xl text-white text-sm font-semibold border transition-colors hover:bg-white/10"
                style={{ borderColor: 'var(--ink-line-soft)' }}
              >
                {t('cta.seeServices')}
              </a>
            </div>

            {/* Trust bar — each pill rises after its predecessor */}
            <div
              className="flex flex-wrap items-center gap-6 mt-16 pt-10 hero-rise"
              style={{ borderTop: '1px solid oklch(0.22 0.01 240)', animationDelay: '440ms' }}
            >
              {[
                { icon: <CheckCircle2 size={14} />, label: 'Factory Verified Suppliers' },
                { icon: <Globe size={14} />, label: 'Global Logistics Network' },
                { icon: <Clock size={14} />, label: 'End-to-End Operations' },
                { icon: <Package size={14} />, label: 'Quality Control Included' },
              ].map((t, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 text-white/75 text-xs font-medium transition-colors hover:text-white"
                >
                  <span style={{ color: accent.hex }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>

          {/* Hero rise animation — runs once on first paint, respects
              prefers-reduced-motion. Each element with .hero-rise + its own
              animationDelay creates a staggered cascade. */}
          <style jsx>{`
            .hero-rise {
              opacity: 0;
              transform: translateY(14px);
              animation: heroRise 700ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
            }
            @keyframes heroRise {
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            @media (prefers-reduced-motion: reduce) {
              .hero-rise {
                animation: none;
                opacity: 1;
                transform: none;
              }
            }
          `}</style>
        </section>

        {/* ── PRODUCTS (top 6, populated server-side from products table) ── */}
        {content.products?.items && content.products.items.length > 0 && (
          <section id="products" className="py-28 px-8 bg-white" onClick={() => setActiveSection('products')}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  <EditableText
                    value={content.products.title}
                    onChange={v => updateContent('products.title', v)}
                    readOnly={readOnly}
                  />
                </h2>
                {content.products.subtitle && (
                  <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                    <EditableText
                      value={content.products.subtitle}
                      onChange={v => updateContent('products.subtitle', v)}
                      readOnly={readOnly}
                    />
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {content.products.items.slice(0, 6).map((p) => (
                  <a
                    key={p.id}
                    href={p.href}
                    className="group block bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all"
                  >
                    <div className="aspect-square bg-gray-100 overflow-hidden">
                      {p.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={p.image}
                          alt={p.name}
                          loading="lazy"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <Package className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{p.name}</h3>
                      {(() => {
                        // Postgres numeric -> JSON serializes as string; coerce before formatting.
                        const priceNum = typeof p.price === 'number' ? p.price : Number(p.price);
                        if (!Number.isFinite(priceNum) || priceNum <= 0) return null;
                        return (
                          <p className="mt-1 text-sm font-bold" style={{ color: accent.hex }}>
                            ${priceNum.toFixed(2)}
                          </p>
                        );
                      })()}
                    </div>
                  </a>
                ))}
              </div>
              <div className="text-center mt-10">
                <a
                  href={`/site/${slug}/products`}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: accent.hex }}
                >
                  {t('cta.viewAllProducts')}
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </section>
        )}

        {/* ── PARTNER LOGO CAROUSEL ── */}
        <PartnerLogoCarousel accentColor={accent.hex} />

        {/* ── SOLUTIONS (What We Do) ── */}
        <section
          id="solutions"
          className="py-28 px-8"
          style={{ background: 'var(--surface-soft)' }}
          onClick={() => setActiveSection('solutions')}
        >
          <div className="max-w-6xl mx-auto">
            <div className="max-w-2xl mb-16">
              <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accent.hex }}>
                What We Do
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight leading-tight mb-4">
                <EditableText value={content.solutions.title} onChange={v => updateContent('solutions.title', v)} readOnly={readOnly} />
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed">
                <EditableText value={content.solutions.description} onChange={v => updateContent('solutions.description', v)} readOnly={readOnly} />
              </p>
            </div>

            {/* Specification-manual layout — each solution is an entry in a list, not a card */}
            <SolutionsList
              items={content.solutions.items}
              accentHex={accent.hex}
              themeColor={themeColor}
              updateContent={updateContent}
              readOnly={readOnly}
            />
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" className="py-28 px-8 bg-white" onClick={() => setActiveSection('howItWorks')}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                <EditableText value={content.howItWorks.title} onChange={v => updateContent('howItWorks.title', v)} readOnly={readOnly} />
              </h2>
            </div>

            {/* Zigzag industrial timeline with imagery — no cards */}
            <ProcessTimeline
              steps={content.howItWorks.steps}
              accentHex={accent.hex}
              updateContent={updateContent}
              readOnly={readOnly}
            />
          </div>
        </section>

        {/* ── CASE STUDIES / PROJECTS (published from the dashboard) ── */}
        {caseStudies && caseStudies.length > 0 && (
          <CaseStudyShowcase items={caseStudies} accentHex={accent.hex} />
        )}

        {/* ── FACTORY CERTIFICATIONS (carousel of 3 documents) ── */}
        <FactoryCertifications
          accentColor={accent.hex}
          uploaded={content.certificates?.items}
        />

        {/* ── ABOUT — animated timeline-revealed hero, brand-adapted ── */}
        <div id="about" onClick={() => setActiveSection('about')}>
          <AboutHeroSection
            companyName={data.companyName}
            accentColor={accent.hex}
            heroImage={content.about.image}
            tagline={content.about.title}
            description1={content.about.description}
            stats={(() => {
              const m = content.about.trustMetrics || [];
              const pick = (i: number) =>
                m[i] ? { value: `${m[i].value || ''}${m[i].suffix || ''}`, label: m[i].label || '' } : undefined;
              return {
                years: pick(0),
                orders: pick(1),
                brands: pick(2),
                growth: pick(3),
              };
            })()}
            socials={{
              facebook: data.facebook,
              instagram: data.instagram,
              linkedin: data.linkedin,
              youtube: undefined,
            }}
            ctaHref="#contact"
          />
        </div>

        {/* ── CERTIFICATES (upload-managed via builder) ── */}
        {content.certificates?.items && content.certificates.items.length > 0 && (
          <section id="certificates" className="py-28 px-8 bg-gray-50" onClick={() => setActiveSection('certificates')}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight">
                  <EditableText
                    value={content.certificates.title}
                    onChange={v => updateContent('certificates.title', v)}
                    readOnly={readOnly}
                  />
                </h2>
                {content.certificates.subtitle && (
                  <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
                    <EditableText
                      value={content.certificates.subtitle}
                      onChange={v => updateContent('certificates.subtitle', v)}
                      readOnly={readOnly}
                    />
                  </p>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                {content.certificates.items.map((c, i) => (
                  <figure key={i} className="bg-white rounded-xl border border-gray-200 p-3 flex flex-col items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={c.url}
                      alt={c.label || `Certificate ${i + 1}`}
                      loading="lazy"
                      className="w-full h-40 object-contain"
                    />
                    {c.label && (
                      <figcaption className="mt-2 text-center text-xs text-gray-600">
                        {c.label}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── TESTIMONIALS (published from the dashboard) ── */}
        {testimonials && testimonials.length > 0 && (
          <TestimonialsShowcase items={testimonials} accentHex={accent.hex} />
        )}

        {/* ── CONTACT ── */}
        <section id="contact" className="py-28 px-8 bg-white" onClick={() => setActiveSection('contact')}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left */}
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-4 leading-tight">
                <EditableText value={content.contact.title} onChange={v => updateContent('contact.title', v)} readOnly={readOnly} />
              </h2>
              <p className="text-gray-500 mb-10 leading-relaxed">
                Tell us what you need. We&apos;ll get back within 24 hours with a sourcing plan.
              </p>

              {/* Contact info */}
              <div className="space-y-6 mb-10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent.hex}12` }}>
                    <Mail size={18} style={{ color: accent.hex }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email</div>
                    <div className="text-base font-semibold text-gray-900">
                      <EditableText value={content.contact.email} onChange={v => updateContent('contact.email', v)} readOnly={readOnly} />
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${accent.hex}12` }}>
                    <MapPin size={18} style={{ color: accent.hex }} />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Location</div>
                    <div className="text-base font-medium text-gray-700 max-w-xs">
                      <EditableText value={content.contact.address} onChange={v => updateContent('contact.address', v)} readOnly={readOnly} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Social media */}
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Follow Us</div>
                <div className="flex flex-wrap gap-3">
                  {content.contact.socialMedia && content.contact.socialMedia.length > 0 ? (
                    content.contact.socialMedia.map((social, idx) => {
                      const icon = social.platform === 'instagram' ? <Instagram size={18} />
                        : social.platform === 'linkedin' ? <Linkedin size={18} />
                        : social.platform === 'wechat' ? <MessageCircle size={18} />
                        : <ExternalLink size={18} />;
                      return (
                        <a key={idx} href={social.url || '#'} target="_blank" rel="noopener noreferrer"
                          className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-900 hover:border-gray-400 transition-all group relative"
                        >
                          {icon}
                          {!readOnly && (
                            <button
                              onClick={e => { e.preventDefault(); e.stopPropagation(); const s = [...(content.contact.socialMedia || [])]; s.splice(idx, 1); updateContent('contact.socialMedia', s); }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[9px]"
                            >×</button>
                          )}
                        </a>
                      );
                    })
                  ) : (
                    <span className="text-sm text-gray-400 italic">No social links yet</span>
                  )}
                  {!readOnly && (
                    <button
                      onClick={() => { const s = [...(content.contact.socialMedia || [])]; s.push({ platform: 'instagram', url: '' }); updateContent('contact.socialMedia', s); }}
                      className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 hover:border-gray-400 transition-all text-lg"
                    >+</button>
                  )}
                </div>

                {!readOnly && content.contact.socialMedia && content.contact.socialMedia.length > 0 && (
                  <div className="space-y-2 mt-4">
                    {content.contact.socialMedia.map((social, idx) => (
                      <div key={idx} className="flex gap-2">
                        <select value={social.platform} onChange={e => { const s = [...(content.contact.socialMedia || [])]; s[idx].platform = e.target.value as 'instagram' | 'linkedin' | 'wechat'; updateContent('contact.socialMedia', s); }}
                          className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none"
                        >
                          <option value="instagram">Instagram</option>
                          <option value="linkedin">LinkedIn</option>
                          <option value="wechat">WeChat</option>
                        </select>
                        <input type="url" value={social.url} onChange={e => { const s = [...(content.contact.socialMedia || [])]; s[idx].url = e.target.value; updateContent('contact.socialMedia', s); }}
                          placeholder="https://..." className="flex-[2] bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 outline-none"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right — Form (real submit, labels, validation) */}
            <SourcingRequestForm companySlug={slug} accentColor={accent.hex} />
          </div>
        </section>

        {/* ── FOOTER ── */}
        <SiteFooter data={data} content={content} accentColor={accent.hex} companySlug={slug} />
      </main>
    </div>
  );
};
