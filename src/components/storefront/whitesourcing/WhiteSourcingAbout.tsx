'use client';

import React, { useEffect, useRef, useState } from 'react';
import { ShieldCheck, Factory, Boxes, Cpu, FlaskConical, Truck, ArrowRight } from 'lucide-react';
import WhiteSourcingNav from './WhiteSourcingNav';
import WhiteSourcingFooter from './WhiteSourcingFooter';

const NAVY = '#1B3E84';
const NAVY_DARK = '#13316b';
const RED = '#E2231A';
const INK = '#0F1115';
const STEEL = '#F4F6FA';

const FACTORY_IMG = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=75';
const FACTORY_HERO = 'https://images.unsplash.com/photo-1565043666747-69f6646db940?auto=format&fit=crop&w=1600&q=75';

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

const STATS = [
  { value: '29+', label: 'Years Experience' },
  { value: '280+', label: 'Expert Staff' },
  { value: '25', label: 'Product Lines' },
  { value: '20k', label: 'Units/Month' },
];

const CAPABILITIES = [
  { icon: Cpu, title: 'Precision CNC Machining', text: 'Computer-controlled brass and stainless machining centers hold tight tolerances across every valve body, stem and fitting for repeatable, leak-free performance.' },
  { icon: FlaskConical, title: 'ISO-Certified Testing Lab', text: 'In-house pressure, leakage and lead-content testing on every production batch — backed by ISO 9001:2015, SGS and NSF/ANSI 61 verification.' },
  { icon: Truck, title: 'Global Export Logistics', text: 'Containerized shipping, export documentation and bulk lead-time planning for partners across Europe, the Middle East, the Americas and Asia Pacific.' },
];

const TIMELINE = [
  { year: '1996', event: 'Founded' },
  { year: '2003', event: 'ISO 9001 Certified' },
  { year: '2008', event: 'CE Marking Achieved' },
  { year: '2015', event: 'Lead-Free Production Line' },
  { year: '2020', event: '100+ Export Countries' },
  { year: '2024', event: 'Digital Sourcing Platform' },
];

const VALUES = [
  { icon: ShieldCheck, title: 'Quality', text: 'Every component is pressure-tested and certified before it leaves the factory. Quality is engineered in, not inspected after.' },
  { icon: Factory, title: 'Reliability', text: 'Three decades of consistent output — 20,000 units a month — with on-time delivery our buyers can plan around.' },
  { icon: Boxes, title: 'Innovation', text: 'Continuous investment in lead-free alloys, CNC automation and new product lines keeps our catalog ahead of global standards.' },
];

export default function WhiteSourcingAbout({ companySlug, companyName }: Props) {
  const base = `/site/${companySlug}`;

  return (
    <div className="bg-white text-[#0F1115]" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <WhiteSourcingNav companySlug={companySlug} companyName={companyName} />

      {/* ── Hero ── */}
      <section className="relative flex min-h-[520px] items-center overflow-hidden" style={{ background: INK }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={FACTORY_HERO}
          alt=""
          aria-hidden
          decoding="async"
          className="absolute inset-0 z-0 h-full w-full object-cover opacity-30"
        />
        <div
          className="absolute inset-0 z-0"
          style={{ background: `linear-gradient(to right, ${INK} 0%, ${INK}e6 55%, ${INK}99 100%)` }}
        />
        <div className="relative z-10 mx-auto w-full max-w-[1280px] px-5 lg:px-16 py-24 text-white">
          <Reveal>
            <span className="mb-4 block text-sm font-semibold uppercase tracking-widest text-blue-200" style={{ letterSpacing: '0.12em' }}>
              About Whitesourcing
            </span>
            <h1
              className="mb-6 max-w-4xl font-bold leading-[1.1] tracking-tight text-[clamp(2rem,4.5vw,3rem)]"
              style={{ fontFamily: 'var(--font-sora), sans-serif', letterSpacing: '-0.02em' }}
            >
              China Valve Manufacturer — 商丘市水力达水暖器材厂 | 29 Years Experience
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              29 years of manufacturing excellence in industrial valves, brass fittings and lead-free
              plumbing equipment — engineered, tested and exported from Shangqiu, Henan Province, China.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <div className="border-y py-12 text-white shadow-xl" style={{ background: NAVY, borderColor: NAVY_DARK }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <dl className="grid grid-cols-2 gap-8 md:grid-cols-4 md:divide-x md:divide-white/20">
            {STATS.map((s) => (
              <div key={s.label} className="text-center md:px-4">
                <span className="block text-4xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{s.value}</span>
                <dt className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-200">{s.label}</dt>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* ── Company story ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="flex flex-col items-center gap-16 lg:flex-row">
            <Reveal className="relative w-full lg:w-1/2">
              <div className="absolute -left-4 -top-4 z-0 h-24 w-24 rounded-[3px]" style={{ background: STEEL }} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={FACTORY_IMG}
                alt={`${companyName} manufacturing facility in Shangqiu, China`}
                loading="lazy"
                className="relative z-10 h-[460px] w-full rounded-[3px] object-cover shadow-xl grayscale transition-all duration-700 hover:grayscale-0"
              />
            </Reveal>
            <Reveal delay={120} className="w-full lg:w-1/2">
              <span className="mb-4 block text-sm font-semibold uppercase tracking-widest" style={{ color: NAVY, letterSpacing: '0.12em' }}>
                Our Story
              </span>
              <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                Manufacturing Excellence at Scale
              </h2>
              <div className="space-y-5 text-lg leading-relaxed text-gray-600">
                <p>
                  Founded in 1996, Whitesourcing — known in China as 商丘市水力达水暖器材厂 — began as a small
                  brass-fittings workshop in Shangqiu, Henan Province. Three decades later, Shangqiu Shuilida
                  Plumbing &amp; Heating Equipment Factory operates 25 dedicated product lines and produces over
                  20,000 valve and fitting units every month.
                </p>
                <p>
                  Our 280-strong team of engineers, machinists and quality inspectors builds ball valves, gate
                  valves, globe valves, brass fittings and NSF-certified lead-free components for procurement
                  partners in more than 100 countries. From raw-material inspection to final packaging, every
                  step is controlled under our ISO 9001:2015 quality system.
                </p>
                <p>
                  Whether you are sourcing a single specialized valve or planning a bulk container order,
                  Shangqiu Shuilida delivers the reliability, certification and lead-time discipline that
                  engineering and facility teams depend on.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Manufacturing capabilities ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <h2 className="mb-4 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                Manufacturing Capabilities
              </h2>
              <p className="text-lg text-gray-600">
                Integrated machining, testing and logistics — the backbone of consistent, certified output.
              </p>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {CAPABILITIES.map((c, i) => {
              const Icon = c.icon;
              return (
                <Reveal key={c.title} delay={i * 100}>
                  <div className="flex h-full flex-col rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-[3px]" style={{ background: NAVY, color: '#fff' }}>
                      <Icon size={26} strokeWidth={2} />
                    </div>
                    <h3 className="mb-3 text-xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{c.title}</h3>
                    <p className="text-gray-600">{c.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-14 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Our Journey
            </h2>
          </Reveal>
          <div className="relative">
            <div className="absolute left-0 right-0 top-5 hidden h-px bg-gray-200 md:block" />
            <div className="grid grid-cols-1 gap-10 md:grid-cols-6">
              {TIMELINE.map((m, i) => (
                <Reveal key={m.year} delay={i * 80}>
                  <div className="relative flex flex-col items-start md:items-center md:text-center">
                    <span className="relative z-10 mb-4 flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: NAVY }}>
                      {String(i + 1)}
                    </span>
                    <div className="text-2xl font-bold tabular-nums" style={{ fontFamily: 'var(--font-mono), monospace', color: NAVY }}>{m.year}</div>
                    <div className="mt-1 text-sm font-semibold text-gray-700">{m.event}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-14 text-center text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              What We Stand For
            </h2>
          </Reveal>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {VALUES.map((v, i) => {
              const Icon = v.icon;
              return (
                <Reveal key={v.title} delay={i * 100}>
                  <div className="flex h-full flex-col items-center rounded-2xl border border-gray-200 bg-white p-10 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: 'rgba(27,62,132,0.08)', color: NAVY }}>
                      <Icon size={30} strokeWidth={2} />
                    </div>
                    <h3 className="mb-3 text-2xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>{v.title}</h3>
                    <p className="text-gray-600">{v.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 text-center text-white" style={{ background: INK }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <Reveal>
            <h2 className="mb-6 text-4xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
              Partner with a Proven Manufacturer
            </h2>
            <p className="mx-auto mb-12 max-w-2xl text-lg text-gray-400">
              Tell us what you need to source. Our team replies within 24 hours with specifications,
              certificates and bulk pricing.
            </p>
            <a
              href={`${base}/contact`}
              className="inline-flex items-center gap-2 rounded-[3px] px-10 py-4 text-base font-semibold uppercase tracking-wide text-white shadow-lg transition-colors"
              style={{ background: RED, letterSpacing: '0.04em' }}
            >
              Get a Quote <ArrowRight size={16} />
            </a>
          </Reveal>
        </div>
      </section>

      <WhiteSourcingFooter companySlug={companySlug} companyName={companyName} />
    </div>
  );
}
