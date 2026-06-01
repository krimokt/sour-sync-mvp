'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Clock, CheckCircle2 } from 'lucide-react';
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

const PRODUCT_OPTIONS = ['Ball Valves', 'Gate Valves', 'Globe Valves', 'Fittings', 'Lead-Free', 'Other'];

const inputClass =
  'w-full rounded-[3px] border border-gray-300 bg-white px-4 py-3 text-[#0F1115] placeholder:text-gray-400 transition-colors focus:border-[#1B3E84] focus:outline-none focus:ring-2 focus:ring-[#1B3E84]/20';

export default function WhiteSourcingContact({ companySlug, companyName }: Props) {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    product: PRODUCT_OPTIONS[0],
    message: '',
  });

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="bg-white text-[#0F1115]" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
      <WhiteSourcingNav companySlug={companySlug} companyName={companyName} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden py-24" style={{ background: INK }}>
        <div className="absolute inset-y-0 left-0 z-0 w-2" style={{ background: RED }} />
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
            <span className="mb-4 inline-block rounded-[3px] px-3 py-1 text-xs font-bold uppercase tracking-widest text-white" style={{ background: RED, letterSpacing: '0.1em' }}>
              24-Hour Response
            </span>
            <h1
              className="mb-6 max-w-4xl font-bold leading-[1.1] tracking-tight text-[clamp(2rem,4.5vw,3rem)]"
              style={{ fontFamily: 'var(--font-sora), sans-serif', letterSpacing: '-0.02em' }}
            >
              Get Your Free Quote in 24 Hours
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-gray-300">
              Contact Whitesourcing — China valve &amp; plumbing manufacturer. Send your specifications and our
              team at 商丘市水力达水暖器材厂 replies within one business day with pricing, MOQ and lead times.
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Form + info ── */}
      <section className="py-24" style={{ background: STEEL }}>
        <div className="mx-auto max-w-[1280px] px-5 lg:px-16">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* LEFT — form */}
            <Reveal className="lg:col-span-3">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm lg:p-10">
                <h2 className="mb-6 text-2xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  Request a Quote
                </h2>
                {sent ? (
                  <div className="flex flex-col items-center justify-center rounded-[3px] py-16 text-center" style={{ background: STEEL }}>
                    <CheckCircle2 size={56} style={{ color: NAVY }} />
                    <h3 className="mt-5 text-xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>Thank you, {form.name || 'there'}!</h3>
                    <p className="mt-2 max-w-md text-gray-600">
                      Your request has been received. Our team will reply to {form.email || 'your email'} within 24 hours.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={onSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Name</label>
                        <input type="text" required value={form.name} onChange={update('name')} placeholder="Your full name" className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Company</label>
                        <input type="text" value={form.company} onChange={update('company')} placeholder="Company name" className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Email</label>
                        <input type="email" required value={form.email} onChange={update('email')} placeholder="you@company.com" className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-sm font-semibold text-gray-700">Phone</label>
                        <input type="tel" value={form.phone} onChange={update('phone')} placeholder="+1 234 567 8900" className={inputClass} />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Product Interest</label>
                      <select value={form.product} onChange={update('product')} className={inputClass}>
                        {PRODUCT_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-gray-700">Message</label>
                      <textarea required rows={5} value={form.message} onChange={update('message')} placeholder="Tell us about quantities, specifications, drawings or target prices…" className={inputClass} />
                    </div>
                    <button
                      type="submit"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-[3px] px-8 py-4 text-sm font-semibold uppercase tracking-wide text-white shadow-sm transition-colors sm:w-auto"
                      style={{ background: NAVY, letterSpacing: '0.04em' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = NAVY_DARK; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = NAVY; }}
                    >
                      Send Request
                    </button>
                  </form>
                )}
              </div>
            </Reveal>

            {/* RIGHT — info card */}
            <Reveal delay={120} className="lg:col-span-2">
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm" style={{ borderTop: `4px solid ${NAVY}` }}>
                <h2 className="mb-6 text-2xl font-bold" style={{ fontFamily: 'var(--font-sora), sans-serif' }}>
                  Contact Information
                </h2>
                <ul className="space-y-5 text-sm">
                  <li className="flex items-start gap-3">
                    <MapPin size={20} className="shrink-0" style={{ color: NAVY }} />
                    <span className="text-gray-700">Shangqiu, Henan Province, China</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Mail size={20} className="shrink-0" style={{ color: NAVY }} />
                    <a href="mailto:info@whitesourcing.com" className="text-gray-700 hover:text-[#1B3E84]">info@whitesourcing.com</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <Phone size={20} className="shrink-0" style={{ color: NAVY }} />
                    <a href="tel:+8637088888888" className="text-gray-700 hover:text-[#1B3E84]">+86 370 8888 8888</a>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageCircle size={20} className="shrink-0" style={{ color: NAVY }} />
                    <span className="text-gray-700">WeChat: whitesourcing_cn</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageCircle size={20} className="shrink-0" style={{ color: NAVY }} />
                    <span className="text-gray-700">WhatsApp: +86 138 0000 0000</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock size={20} className="shrink-0" style={{ color: NAVY }} />
                    <span className="text-gray-700">Business hours: Mon–Fri 8:00–18:00 CST</span>
                  </li>
                </ul>
                <div
                  className="mt-7 inline-flex items-center gap-2 rounded-[3px] px-4 py-2.5 text-sm font-bold text-white"
                  style={{ background: RED }}
                >
                  ⚡ Reply within 24 hours
                </div>
              </div>
            </Reveal>
          </div>

          {/* 3 contact method cards */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Mail, label: 'Email', value: 'info@whitesourcing.com', href: 'mailto:info@whitesourcing.com' },
              { icon: MessageCircle, label: 'WhatsApp', value: '+86 138 0000 0000', href: 'https://wa.me/8613800000000' },
              { icon: MessageCircle, label: 'WeChat', value: 'whitesourcing_cn', href: undefined as string | undefined },
            ].map((m, i) => {
              const Icon = m.icon;
              const inner = (
                <div className="flex h-full items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[3px]" style={{ background: NAVY, color: '#fff' }}>
                    <Icon size={22} strokeWidth={2} />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-gray-500" style={{ letterSpacing: '0.04em' }}>{m.label}</div>
                    <div className="font-semibold text-[#0F1115]">{m.value}</div>
                  </div>
                </div>
              );
              return (
                <Reveal key={m.label} delay={i * 90}>
                  {m.href ? <a href={m.href} className="block h-full">{inner}</a> : inner}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <WhiteSourcingFooter companySlug={companySlug} companyName={companyName} />
    </div>
  );
}
