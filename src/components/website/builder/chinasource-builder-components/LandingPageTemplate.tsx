'use client';

import React, { useState, useEffect } from 'react';
import { FormData, GeneratedContent, ThemeColor, TemplateId } from '../chinasource-types';
import {
  Mail, MapPin, ArrowUpRight, LogIn, ExternalLink,
  ShieldCheck, Instagram, Linkedin, MessageCircle,
  CheckCircle2, Globe, Clock, Package, Menu, X,
} from 'lucide-react';
import { EditableText, EditableIcon, EditableImage } from './EditorComponents';
import Sidebar from './Sidebar';
import PartnerLogoCarousel from './PartnerLogoCarousel';
import SiteFooter from './SiteFooter';

interface LandingPageTemplateProps {
  data: FormData;
  content: GeneratedContent;
  onEdit?: () => void;
  hideSidebar?: boolean;
  hasTopBar?: boolean;
  readOnly?: boolean;
  companySlug?: string;
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
  data, content: initialContent, hideSidebar = false, hasTopBar = false, readOnly = false, companySlug,
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

  const accent = themeAccent[themeColor];

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
    'About',
    ...(content.certificates?.items?.length ? ['Certificates'] : []),
    'Contact',
  ];
  const slug = companySlug || data.companyName.toLowerCase().replace(/\s+/g, '-');
  const signInHref = `/site/${slug}/signin`;

  const Navbar = () => (
    <>
      <nav
        className={`fixed ${hasTopBar ? 'top-16' : 'top-0'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-40 transition-all duration-300
          ${scrolled
            ? 'bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-[0_1px_12px_rgba(0,0,0,0.06)]'
            : 'bg-transparent'
          }`}
      >
        <div className="max-w-6xl mx-auto px-6 lg:px-10">
          <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}>

            {/* Logo */}
            <a href="#" className="flex items-center gap-2.5 flex-shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold shadow-sm"
                style={{ background: accent.hex }}
              >
                {data.companyName.charAt(0).toUpperCase()}
              </div>
              <span className={`font-bold text-base tracking-tight transition-colors ${scrolled ? 'text-gray-900' : 'text-white'}`}>
                {data.companyName}
              </span>
            </a>

            {/* Desktop links — centered */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(label => (
                <a
                  key={label}
                  href={`#${label.toLowerCase()}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    scrolled
                      ? 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-2">
              <a
                href={signInHref}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled
                    ? 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <LogIn size={14} />
                Client Portal
              </a>
              <a
                href="#contact"
                className="flex items-center gap-1.5 px-5 py-2 rounded-lg text-white text-sm font-semibold shadow-sm transition-all hover:opacity-90 hover:shadow-md"
                style={{ background: accent.hex }}
              >
                Get a Quote
                <ArrowUpRight size={14} />
              </a>
            </div>

            {/* Mobile: sign in + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <a
                href={signInHref}
                className={`p-2 rounded-lg text-sm font-medium transition-colors ${
                  scrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10'
                }`}
              >
                <LogIn size={18} />
              </a>
              <button
                onClick={() => setMobileOpen(v => !v)}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled ? 'text-gray-600 hover:bg-gray-50' : 'text-white/80 hover:bg-white/10'
                }`}
                aria-label="Toggle menu"
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
          className={`fixed ${hasTopBar ? 'top-[calc(4rem+3.5rem)]' : 'top-14'} ${!hideSidebar ? 'left-80' : 'left-0'} right-0 z-39 bg-white border-b border-gray-100 shadow-lg`}
        >
          <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-1">
            {navLinks.map(label => (
              <a
                key={label}
                href={`#${label.toLowerCase()}`}
                onClick={() => setMobileOpen(false)}
                className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                {label}
              </a>
            ))}
            <div className="h-px bg-gray-100 my-1" />
            <a
              href={signInHref}
              className="px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <LogIn size={15} /> Client Portal
            </a>
            <a
              href="#contact"
              onClick={() => setMobileOpen(false)}
              className="mt-1 flex items-center justify-center gap-1.5 px-5 py-3 rounded-lg text-white text-sm font-semibold"
              style={{ background: accent.hex }}
            >
              Get a Quote <ArrowUpRight size={14} />
            </a>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen flex bg-white" style={{ fontFamily: 'var(--font-jakarta, system-ui, sans-serif)' }}>
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
          className="relative min-h-screen flex items-center overflow-hidden"
          style={{ background: 'oklch(0.12 0.018 240)' }}
          onClick={() => setActiveSection('hero')}
        >
          {/* Background image with dark overlay */}
          <div className="absolute inset-0">
            <img src={content.hero.backgroundImage} className="w-full h-full object-cover opacity-20" alt="" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, oklch(0.12 0.018 240) 50%, oklch(0.16 0.02 230) 100%)' }} />
          </div>

          {/* Subtle grid */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'linear-gradient(oklch(0.9 0 0) 1px, transparent 1px), linear-gradient(90deg, oklch(0.9 0 0) 1px, transparent 1px)', backgroundSize: '60px 60px' }}
          />

          <div className="relative z-10 max-w-6xl mx-auto px-8 pt-32 pb-24 w-full">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border mb-8"
              style={{ borderColor: `${accent.hex}40`, background: `${accent.hex}15` }}>
              <ShieldCheck size={13} style={{ color: accent.hex }} />
              <span className="text-xs font-semibold tracking-wider" style={{ color: accent.hex }}>
                <EditableText value={content.hero.tagline} onChange={v => updateContent('hero.tagline', v)} readOnly={readOnly} />
              </span>
            </div>

            {/* Headline */}
            <EditableText
              value={content.hero.headline}
              onChange={v => updateContent('hero.headline', v)}
              tag="h1"
              className="text-5xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight mb-6 max-w-4xl"
              readOnly={readOnly}
            />

            {/* Subheadline */}
            <p className="text-lg text-white/60 max-w-2xl mb-10 leading-relaxed font-normal">
              <EditableText value={content.hero.subheadline} onChange={v => updateContent('hero.subheadline', v)} readOnly={readOnly} />
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href="#contact"
                className="flex items-center gap-2 px-7 py-4 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-lg"
                style={{ background: accent.hex, boxShadow: `0 8px 30px ${accent.hex}40` }}
              >
                {content.hero.ctaPrimary.text} <ArrowUpRight size={15} />
              </a>
              <a
                href="#solutions"
                className="flex items-center gap-2 px-7 py-4 rounded-xl text-white text-sm font-semibold border transition-all hover:bg-white/10"
                style={{ borderColor: 'oklch(0.35 0.01 240)' }}
              >
                See Our Services
              </a>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap items-center gap-6 mt-16 pt-10" style={{ borderTop: '1px solid oklch(0.22 0.01 240)' }}>
              {[
                { icon: <CheckCircle2 size={14} />, label: 'Factory Verified Suppliers' },
                { icon: <Globe size={14} />, label: 'Global Logistics Network' },
                { icon: <Clock size={14} />, label: 'End-to-End Operations' },
                { icon: <Package size={14} />, label: 'Quality Control Included' },
              ].map((t, i) => (
                <div key={i} className="flex items-center gap-2 text-white/50 text-xs font-medium">
                  <span style={{ color: accent.hex }}>{t.icon}</span>
                  {t.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS (top 6, populated server-side from products table) ── */}
        {content.products?.items && content.products.items.length > 0 && (
          <section id="products" className="py-28 px-8 bg-white" onClick={() => setActiveSection('products')}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accent.hex }}>
                  Featured
                </span>
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
                      {p.price != null && p.price > 0 && (
                        <p className="mt-1 text-sm font-bold" style={{ color: accent.hex }}>
                          ${p.price.toFixed(2)}
                        </p>
                      )}
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
                  View all products
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
          style={{ background: 'oklch(0.975 0.006 238)' }}
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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {content.solutions.items.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white border border-gray-100 p-8 rounded-2xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                    style={{ background: `${accent.hex}12` }}
                  >
                    <EditableIcon
                      iconName={item.icon}
                      themeColor={themeColor}
                      onChange={v => updateContent(`solutions.items.${idx}.icon`, v)}
                      className="w-6 h-6"
                      readOnly={readOnly}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3 tracking-tight">
                    <EditableText value={item.title} onChange={v => updateContent(`solutions.items.${idx}.title`, v)} readOnly={readOnly} />
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    <EditableText value={item.description} onChange={v => updateContent(`solutions.items.${idx}.description`, v)} readOnly={readOnly} />
                  </p>
                  <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold transition-colors" style={{ color: accent.hex }}>
                    Learn more <ArrowUpRight size={13} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── PROCESS ── */}
        <section id="process" className="py-28 px-8 bg-white" onClick={() => setActiveSection('howItWorks')}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-20">
              <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accent.hex }}>
                How It Works
              </span>
              <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                <EditableText value={content.howItWorks.title} onChange={v => updateContent('howItWorks.title', v)} readOnly={readOnly} />
              </h2>
            </div>

            <div className="relative">
              {/* Connecting line */}
              <div
                className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${accent.hex}30, transparent)` }}
              />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10 lg:gap-6">
                {content.howItWorks.steps.map((step, idx) => (
                  <div key={idx} className="flex flex-col items-center text-center group">
                    <div
                      className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-extrabold text-white mb-6 shadow-md transition-transform group-hover:-translate-y-1 relative z-10"
                      style={{ background: `oklch(0.12 0.018 240)`, border: `2px solid ${accent.hex}30` }}
                    >
                      <span style={{ color: accent.hex }}>0{idx + 1}</span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 mb-2 tracking-tight">
                      <EditableText value={step.title} onChange={v => updateContent(`howItWorks.steps.${idx}.title`, v)} readOnly={readOnly} />
                    </h3>
                    <p className="text-gray-500 text-sm leading-relaxed max-w-[200px]">
                      <EditableText value={step.description} onChange={v => updateContent(`howItWorks.steps.${idx}.description`, v)} readOnly={readOnly} />
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── ABOUT / TRUST ── */}
        <section
          id="about"
          className="py-28 px-8 overflow-hidden"
          style={{ background: 'oklch(0.12 0.018 240)' }}
          onClick={() => setActiveSection('about')}
        >
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-20">
            {/* Image */}
            <div className="lg:w-5/12 relative flex-shrink-0">
              <div
                className="absolute -inset-4 rounded-3xl opacity-20"
                style={{ background: `radial-gradient(circle, ${accent.hex} 0%, transparent 70%)` }}
              />
              <EditableImage
                src={content.about.image}
                alt="Sourcing operations"
                onChange={v => updateContent('about.image', v)}
                className="w-full aspect-[4/5] object-cover rounded-2xl relative z-10"
                readOnly={readOnly}
              />
              {/* Floating stat */}
              <div
                className="absolute -bottom-6 -right-4 bg-white p-5 rounded-2xl shadow-xl z-20 text-center"
              >
                <div className="text-3xl font-extrabold text-gray-900">99%</div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-0.5">Retention</div>
              </div>
            </div>

            {/* Text */}
            <div className="lg:w-7/12 text-white">
              <span className="text-xs font-bold uppercase tracking-[0.12em] mb-4 block" style={{ color: accent.hex }}>
                About Us
              </span>
              <h2 className="text-4xl lg:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                <EditableText value={content.about.title} onChange={v => updateContent('about.title', v)} readOnly={readOnly} />
              </h2>
              <p className="text-lg leading-relaxed mb-12" style={{ color: 'oklch(0.65 0.008 230)' }}>
                <EditableText value={content.about.description} onChange={v => updateContent('about.description', v)} readOnly={readOnly} />
              </p>

              <div className="grid grid-cols-2 gap-8">
                {content.about.trustMetrics.map((m, i) => (
                  <div key={i} className="group">
                    <div className="text-3xl font-extrabold text-white mb-1 flex items-baseline gap-0.5">
                      {m.value}
                      <span style={{ color: accent.hex }}>{m.suffix}</span>
                    </div>
                    <div className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'oklch(0.5 0.008 230)' }}>
                      {m.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── CERTIFICATES (upload-managed via builder) ── */}
        {content.certificates?.items && content.certificates.items.length > 0 && (
          <section id="certificates" className="py-28 px-8 bg-gray-50" onClick={() => setActiveSection('certificates')}>
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="text-xs font-bold uppercase tracking-[0.12em] mb-3 block" style={{ color: accent.hex }}>
                  Trusted &amp; Certified
                </span>
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

        {/* ── CONTACT ── */}
        <section id="contact" className="py-28 px-8 bg-white" onClick={() => setActiveSection('contact')}>
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20">
            {/* Left */}
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.12em] mb-4 block" style={{ color: accent.hex }}>
                Get In Touch
              </span>
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

            {/* Right — Form */}
            <div className="rounded-2xl p-8 border border-gray-100" style={{ background: 'oklch(0.975 0.006 238)' }}>
              <h3 className="text-xl font-bold text-gray-900 mb-6">Start a Sourcing Request</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="First name"
                    className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full transition-shadow"
                    style={{ '--tw-ring-color': `${accent.hex}30` } as React.CSSProperties}
                  />
                  <input type="text" placeholder="Last name"
                    className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full transition-shadow"
                  />
                </div>
                <input type="email" placeholder="Business email"
                  className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full transition-shadow"
                />
                <input type="text" placeholder="Company name"
                  className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full transition-shadow"
                />
                <textarea rows={4} placeholder="What products do you need? Include quantity, destination, and any specifications."
                  className="bg-white px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 w-full resize-none transition-shadow"
                />
                <button
                  className="w-full py-3.5 rounded-xl text-white text-sm font-semibold transition-all hover:opacity-90 shadow-md flex items-center justify-center gap-2"
                  style={{ background: accent.hex, boxShadow: `0 4px 16px ${accent.hex}35` }}
                >
                  Send Sourcing Request <ArrowUpRight size={15} />
                </button>
                <p className="text-center text-xs text-gray-400">We respond within 24 hours. No commitment required.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── FOOTER ── */}
        <SiteFooter data={data} content={content} accentColor={accent.hex} companySlug={slug} />
      </main>
    </div>
  );
};
