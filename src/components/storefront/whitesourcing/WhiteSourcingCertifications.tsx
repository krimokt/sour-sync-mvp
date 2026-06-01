'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Globe, Boxes, ArrowRight, Download } from 'lucide-react';
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

const CERTS = [
  { code: 'ISO 9001:2015', title: 'Quality Management System', icon: ShieldCheck, accent: NAVY, text: 'Independently audited processes covering design, machining, testing and traceability across every production line.' },
  { code: 'CE Marking', title: 'European Conformity', icon: Globe, accent: NAVY, text: 'Conformity with EU health, safety and environmental directives for valves and fittings sold across the European market.' },
  { code: 'SGS Certified', title: 'Independent Testing', icon: Boxes, accent: NAVY, text: 'Third-party SGS inspection and material verification confirm declared specifications and pressure ratings.' },
  { code: 'RoHS Compliant', title: 'Restriction of Hazardous Substances', icon: ShieldCheck, accent: NAVY, text: 'Materials free of restricted hazardous substances, meeting global environmental and procurement requirements.' },
  { code: 'NSF/ANSI 61', title: 'Lead-Free Certified', icon: ShieldCheck, accent: RED, text: 'Drinking-water safety certification for our lead-free brass alloys — essential for potable-water plumbing systems.' },
];

const PROCESS = [
  'Raw Material Inspection',
  'CNC Machining',
  'Assembly',
  'Pressure Testing',
  'Visual QC',
  'Final Packaging',
];

export default function WhiteSourcingCertifications({ companySlug, companyName }: Props) {
  const base = `/site/${companySlug}`;

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
              Quality &amp; Compliance
            </span>
            <h1
              className="mb-6 max-w-4xl font-bold leading-[1.1] tracking-tight text-[clamp(2rem,4.5vw,2.75rem)]"
              style={{ fontFamily: 'var(--font-sora), sans-serif', letterSpacing: '-0.02em' }}
            >
              ISO 9001 &amp; CE Certified Valve Manufacturer | NSF Lead-Free Certified
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-blue-100">
              Certified quality, global standards. Every valve and fitting from 商丘市水力达水暖器材厂 is
              produced under internationally recognized certifications that give procurement teams confidence
              in compliance, safety and traceability.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Certification cards ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {CERTS.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.code} delay={(i % 2) * 100}>
                  <div className="flex h-full gap-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-[3px]" style={{ background: c.accent, color: '#fff' }}>
                      <Icon size={30} strokeWidth={2} />
                    </div>
                    <div>
                      <div className="mb-1 text-sm font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-mono), monospace', color: c.accent, letterSpacing: '0.04em' }}>
                        {c.code}
                      </div>
                      <h3 className="mb-2 text-xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{c.title}</h3>
                      <p className="text-gray-600">{c.text}</p>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Quality process ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                Our Quality Process
              </h2>
              <p className="text-lg text-gray-600">
                Six controlled stages from raw brass to packed, certified product.
              </p>
            </div>
          </Reveal>
          <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
            {PROCESS.map((step, i) => (
              <Reveal key={step} delay={i * 80} className="flex-1">
                <div className="flex h-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm md:flex-col md:items-start md:text-left">
                  <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full text-sm font-bold text-white" style={{ background: NAVY, fontFamily: 'var(--font-mono), monospace' }}>
                    {i + 1}
                  </span>
                  <span className="text-sm font-semibold leading-snug text-gray-800">{step}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trust paragraph ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[860px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-6 text-3xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              What These Certifications Mean for Procurement
            </h2>
            <div className="space-y-5 text-lg leading-relaxed text-gray-600">
              <p>
                <strong className="text-[#0F1115]">ISO 9001:2015</strong> tells your auditors that our quality
                management system is documented, audited and repeatable — reducing your supplier-qualification
                risk. <strong className="text-[#0F1115]">CE marking</strong> confirms our valves and fittings
                meet EU directives, so they can be sold and installed across European markets without re-testing.
              </p>
              <p>
                <strong className="text-[#0F1115]">SGS certification</strong> means an independent global testing
                body has verified our declared specifications, while <strong className="text-[#0F1115]">RoHS
                compliance</strong> assures your environmental and customs teams that restricted substances are
                absent. For potable-water applications, <strong className="text-[#0F1115]">NSF/ANSI 61</strong>
                certifies our lead-free brass is safe for drinking-water contact — a non-negotiable requirement
                for plumbing buyers in North America and beyond.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Download CTA ── */}
      <section className="py-24 text-center text-white" style={{ background: NAVY }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Request Certificate Copies
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-blue-100">
              Need ISO, CE, SGS, RoHS or NSF/ANSI 61 documentation for your supplier file? Request copies and
              our compliance team will send them within 24 hours.
            </p>
            <a
              href={`${base}/contact`}
              className="inline-flex items-center gap-2 rounded-[3px] px-10 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-lg transition-colors"
              style={{ background: RED, letterSpacing: '0.04em' }}
            >
              <Download size={18} /> Request Certificates <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <WhiteSourcingFooter companySlug={companySlug} companyName={companyName} />
    </div>
  );
}
