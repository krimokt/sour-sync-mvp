'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ArrowRight, Download } from 'lucide-react';
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

const FILTERS = ['All', 'Ball Valves', 'Gate Valves', 'Globe Valves', 'Fittings', 'Lead-Free'] as const;

interface CatalogItem {
  pn: string;
  name: string;
  category: string;
  img: string;
}

// The 4 CATALOG items from WhiteSourcingHome, re-categorised for the catalog
// filter set, plus 4 additional SKUs supplied for the full catalog page.
const PRODUCTS: CatalogItem[] = [
  {
    pn: 'PN25-BV-BLUE', name: 'High-Pressure Ball Valve', category: 'Ball Valves',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9XrthpI2aPACCzLBRLj9u8iNWx2R9K06inCKsxkg3Vti9UoNnCYgZ3q2--f4-hkMlOawwQ2oYdO5e5mbJYPaaGNqx_8fj8I0J5H3xff_rhgMFvwekowTuWmgXpnFiu6PS3IyXIoT7m9KUjOvAD4a46sQn4NsAtvPLgR19bm8j3ekYu5gIYyUgGmlErtejf2fZXTYpneAhjdjptiKuzjBZhDFZUye9RbcLNILzjg0Df3sO_iTy4xvwEC2zpw7Q2fFqGehgroRj8m4J',
  },
  {
    pn: 'PN16-GV-ORG', name: 'Industrial Gate Valve', category: 'Gate Valves',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC-O40EMK12y7mh6UgX6rCCnYJ8E6-tg7EDQDFqstJWS8BLOXOVUin8ILNHishvkdNN4HG0cXuD4kMUbPZ-3rDXzagfiTYkkcKcTIsmRrrIk991WbWMrHp74Kr22a8mlXZgca9LTKEQO456_qOiVrdTYWikD7tVbfUHKwAhigQXJO38nXK594HwzpAOKOSZj-na-IItb1l1UpOAu0_yWNMCx4rIvKrfbirF7LnGrclmPJFT4hpBbrPcVOLBNVJ_Rbz-Z-CgmKPbH548',
  },
  {
    pn: 'BF-T-3WAY', name: 'Brass T-Fittings', category: 'Fittings',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDwpcCK_YEcy_bQw2JfWb4V241UMlBcEjoogt79xF2wNxNKQdLpkWR8lohgQnauhg5a0FyhL-rIMu8PQ-h_EnGCQVoKmiTZWCudBwYgbcWKJOZ1rZq-EuwvTizwZTRDaPDvfdIowXe6lhvs5KPzLIYZ4R_8ni854kH11Jxk6Gf8lLQvHttq-VXPyRu21Dd5ESrVuV4MkNmlzQwWHrp-0WQvivyKqyeCRT9deuQgTJHoOUo-RWGv8cVrSbnV1L0k3VOpxux1RR2Ifnez',
  },
  {
    pn: 'LF-ELB-90', name: 'Lead-Free Elbows', category: 'Lead-Free',
    img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC_0SCrOdWrVvwihE4OLjiNgvHot5k4-8P-WsSNefPDNjz5Wi4IP2j9iRFC-tHmkelG8ZYNJMktiCPbjYWHw4o3KkEgn6c-IgAfbPFlu8cMDWrstaZ_NusvE6GDeW9j0tkEyiiUQtHnJGNbk6-SJwcVSnbhfufCBNplGuLeKOO3r5Blx0--bod5zIruieQ-SxRQTvDOMU4geVNm-i7ujYlbwKrj6oMU0WWPMb2vQFkEi2RFIM-bUuncBQFyt6vJd-tZ_UVOQH2j9mND',
  },
  { pn: 'GV-PN16-SS', name: 'Globe Valve PN16', category: 'Globe Valves', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=75' },
  { pn: 'BC-COMP-15', name: 'Brass Compression Fitting', category: 'Fittings', img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=75' },
  { pn: 'LF-BV-12', name: 'Lead-Free Ball Valve 1/2"', category: 'Lead-Free', img: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=75' },
  { pn: 'SGV-DN50', name: 'Stainless Gate Valve DN50', category: 'Gate Valves', img: 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=75' },
];

const FALLBACK = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=800&q=75';

export default function WhiteSourcingProducts({ companySlug, companyName }: Props) {
  const [filter, setFilter] = useState<string>('All');
  const base = `/site/${companySlug}`;
  const shown = filter === 'All' ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  return (
    <div className="bg-white text-[#0F1115]" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <WhiteSourcingNav companySlug={companySlug} companyName={companyName} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24" style={{ background: NAVY }}>
        <div
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundSize: '40px 40px',
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.06) 1px, transparent 1px)',
          }}
        />
        <div className="relative z-10 mx-auto max-w-[1280px] px-5 lg:px-16 text-white">
          <Reveal>
            <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-blue-200" style={{ letterSpacing: '0.12em' }}>
              Industrial Valve &amp; Fitting Catalog
            </span>
            <h1
              className="mb-6 max-w-4xl font-bold leading-[1.1] tracking-tight text-[clamp(2rem,4.5vw,2.75rem)]"
              style={{ fontFamily: 'var(--font-sora), sans-serif', letterSpacing: '-0.02em' }}
            >
              Industrial Ball Valves, Gate Valves &amp; Brass Fittings — China Manufacturer
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-blue-100">
              Engineered for high-pressure fluid control. Browse ball valves, gate valves, globe valves,
              brass fittings and NSF-certified lead-free plumbing equipment, manufactured to ISO 9001 and
              CE standards by 商丘市水力达水暖器材厂 (Shangqiu Shuilida Plumbing &amp; Heating Equipment Factory).
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Catalog ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <div className="mb-12 flex flex-wrap gap-2">
              {FILTERS.map((f) => {
                const active = filter === f;
                return (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold transition-colors ${
                      active ? 'text-white' : 'border border-gray-200 bg-white text-gray-600 hover:text-[#1B3E84]'
                    }`}
                    style={active ? { background: NAVY } : undefined}
                  >
                    {f}
                  </button>
                );
              })}
            </div>
          </Reveal>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {shown.map((p, i) => (
              <Reveal key={p.pn} delay={(i % 4) * 80}>
                <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-gray-300 hover:shadow-xl">
                  <div className="h-64 overflow-hidden bg-gray-50">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={p.img}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                      onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = FALLBACK; }}
                    />
                  </div>
                  <div className="flex flex-1 flex-col border-t border-gray-100 p-6">
                    <div className="mb-2 text-sm text-gray-500" style={{ fontFamily: 'var(--font-mono), monospace' }}>{p.pn}</div>
                    <h3 className="mb-3 text-lg font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{p.name}</h3>
                    <span
                      className="mb-5 inline-flex w-fit items-center rounded-[3px] px-3 py-1 text-xs font-semibold uppercase tracking-wide"
                      style={{ background: 'rgba(27,62,132,0.08)', color: NAVY, letterSpacing: '0.04em' }}
                    >
                      {p.category}
                    </span>
                    <a
                      href={`${base}/contact`}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-2.5 text-[13px] font-semibold uppercase tracking-wide text-white transition-colors"
                      style={{ background: NAVY, letterSpacing: '0.04em' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = NAVY_DARK; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = NAVY; }}
                    >
                      Request Quote <ArrowRight size={14} />
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-14 text-center">
            <a
              href={`${base}/contact`}
              className="group inline-flex items-center gap-2.5 rounded-full border-2 px-9 py-4 text-[13px] font-semibold uppercase tracking-wide shadow-sm transition-all hover:shadow-lg"
              style={{ borderColor: NAVY, color: NAVY, letterSpacing: '0.04em' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = NAVY; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = NAVY; }}
            >
              <Download size={17} className="transition-transform group-hover:translate-y-0.5" />
              Download Full Catalog (PDF)
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center text-white" style={{ background: NAVY }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Request a Custom Quote
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-blue-100">
              Send your specifications, drawings or sample requirements. Our engineering team replies within
              24 hours with pricing, MOQ and lead times for bulk valve and fitting orders.
            </p>
            <a
              href={`${base}/contact`}
              className="inline-flex items-center gap-2 rounded-[3px] px-10 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-lg transition-colors"
              style={{ background: RED, letterSpacing: '0.04em' }}
            >
              Get Your Quote <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <WhiteSourcingFooter companySlug={companySlug} companyName={companyName} />
    </div>
  );
}
