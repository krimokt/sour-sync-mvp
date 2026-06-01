'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import WhiteSourcingNav from './WhiteSourcingNav';
import WhiteSourcingFooter from './WhiteSourcingFooter';

const NAVY = '#1B3E84';
const NAVY_DARK = '#13316b';
const RED = '#E2231A';
const INK = '#0F1115';
const STEEL = '#F4F6FA';

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Fade/rise in when scrolled into view (and on first paint for above-the-fold). */
function Reveal({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) { setShown(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) { setShown(true); io.disconnect(); } }),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? 'none' : 'translateY(26px)',
        transition: `opacity 700ms ease-out ${delay}ms, transform 800ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

interface Props {
  companySlug: string;
  companyName: string;
}

const FEATURED = {
  category: 'BUYING GUIDE',
  title: 'Complete Guide: Selecting Industrial Ball Valves for High-Pressure Applications',
  excerpt:
    'Pressure rating, body material, seat design and actuation all matter when specifying ball valves for demanding fluid-control systems. This guide walks procurement and engineering teams through every selection criterion — from PN ratings and full-bore vs reduced-bore flow to lead-free compliance — so you order the right valve the first time.',
  date: 'Jan 15, 2025',
  read: '8 min read',
  img: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1200&q=75',
};

const POSTS = [
  { category: 'COMPLIANCE', title: 'Lead-Free Valves: NSF/ANSI 61 Certification Explained', excerpt: 'What NSF/ANSI 61 actually certifies, why it matters for potable water, and how to verify a supplier’s lead-free claims.', date: 'Feb 2025', read: '6 min read', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=75' },
  { category: 'EXPORT', title: 'Exporting Plumbing Products China to Europe: Complete Guide', excerpt: 'CE marking, documentation, Incoterms and logistics — the practical steps to import valves and fittings into the EU.', date: 'Mar 2025', read: '7 min read', img: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=75' },
  { category: 'TECHNICAL', title: 'Ball Valve vs Gate Valve: Technical Comparison', excerpt: 'Flow characteristics, sealing, throttling and lifecycle cost compared — choose the right valve for your system.', date: 'Mar 2025', read: '5 min read', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=75' },
  { category: 'QUALITY', title: 'ISO 9001:2015 in Manufacturing: What Buyers Should Know', excerpt: 'How an ISO-certified quality system reduces supplier risk and what to look for during qualification.', date: 'Apr 2025', read: '6 min read', img: 'https://images.unsplash.com/photo-1581092580497-e0d23cbdf1dc?auto=format&fit=crop&w=800&q=75' },
  { category: 'SOURCING', title: 'Bulk Brass Fittings: MOQ, Pricing & Lead Times', excerpt: 'How minimum order quantities, alloy pricing and production scheduling shape your bulk-fitting procurement.', date: 'May 2025', read: '5 min read', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=75' },
  { category: 'TRENDS', title: 'Sustainable Plumbing: Lead-Free & RoHS Trends 2025', excerpt: 'Regulation, materials and buyer expectations are reshaping the plumbing supply chain — here’s what to watch.', date: 'May 2025', read: '6 min read', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=75' },
];

const FALLBACK = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=75';

export default function WhiteSourcingBlog({ companySlug, companyName }: Props) {
  const base = `/site/${companySlug}`;
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const onSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setSubscribed(true);
  };

  return (
    <div className="bg-white text-[#0F1115]" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <WhiteSourcingNav companySlug={companySlug} companyName={companyName} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24" style={{ background: INK }}>
        <div
          className="absolute inset-0 z-0 opacity-15"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-16 text-white">
          <Reveal>
            <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-blue-200" style={{ letterSpacing: '0.12em' }}>
              Industry Insights &amp; Sourcing Guides
            </span>
            <h1
              className="mb-6 max-w-4xl font-bold leading-[1.1] tracking-tight text-[clamp(2rem,4.5vw,2.75rem)]"
              style={{ fontFamily: 'var(--font-sora), sans-serif', letterSpacing: '-0.02em' }}
            >
              Valve Industry Insights — Ball Valve &amp; Plumbing Equipment Blog
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              Technical comparisons, certification explainers and sourcing guides for ball valves, gate valves,
              brass fittings and lead-free plumbing equipment — from the team at 商丘市水力达水暖器材厂.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Featured post ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <a
              href={`${base}/contact`}
              className="group grid grid-cols-1 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl lg:grid-cols-2"
            >
              <div className="h-64 overflow-hidden lg:h-auto">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={FEATURED.img}
                  alt={FEATURED.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12">
                <span className="mb-3 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono), monospace', color: NAVY, letterSpacing: '0.06em' }}>
                  {FEATURED.category}
                </span>
                <h2 className="mb-4 text-2xl font-bold leading-snug lg:text-3xl" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  {FEATURED.title}
                </h2>
                <p className="mb-6 text-gray-600">{FEATURED.excerpt}</p>
                <div className="mb-6 flex items-center gap-3 text-sm text-gray-500">
                  <span>{FEATURED.date}</span>
                  <span className="h-1 w-1 rounded-full bg-gray-300" />
                  <span>{FEATURED.read}</span>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold group-hover:underline" style={{ color: NAVY }}>
                  Read article <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </a>
          </Reveal>
        </div>
      </section>

      {/* ── Blog grid ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-12 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Latest Articles
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {POSTS.map((p, i) => (
              <Reveal key={p.title} delay={(i % 3) * 80}>
                <a
                  href={`${base}/contact`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="h-48 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.img}
                      alt={p.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <span className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono), monospace', color: NAVY, letterSpacing: '0.06em' }}>
                      {p.category}
                    </span>
                    <h3 className="mb-2 text-lg font-bold leading-snug" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{p.title}</h3>
                    <p className="mb-5 line-clamp-2 text-sm text-gray-600">{p.excerpt}</p>
                    <div className="mt-auto flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{p.date}</span>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <span>{p.read}</span>
                      </div>
                      <ArrowRight size={16} style={{ color: NAVY }} className="transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Newsletter ── */}
      <section className="py-24 text-white" style={{ background: NAVY }}>
        <div className="mx-auto max-w-[760px] px-5 lg:px-16 text-center">
          <Reveal>
            <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Sourcing Insights, In Your Inbox
            </h2>
            <p className="mb-10 text-lg text-blue-100">
              Get new guides on valves, fittings, certifications and export logistics. No spam — unsubscribe anytime.
            </p>
            {subscribed ? (
              <div
                className="mx-auto inline-flex items-center gap-2 rounded-[3px] px-6 py-4 text-base font-semibold text-white"
                style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                ✓ Thank you — you&apos;re subscribed.
              </div>
            ) : (
              <form onSubmit={onSubscribe} className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your email address"
                  className="flex-1 rounded-[3px] border border-white/30 bg-white/10 px-5 py-3.5 text-white placeholder:text-blue-200 focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded-[3px] px-8 py-3.5 text-sm font-semibold uppercase tracking-wide text-white shadow-lg transition-colors"
                  style={{ background: RED, letterSpacing: '0.04em' }}
                >
                  Subscribe
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>

      <WhiteSourcingFooter companySlug={companySlug} companyName={companyName} />
    </div>
  );
}
