'use client';

import { ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Certificate } from '../chinasource-types';

interface FactoryCertificationsProps {
  accentColor: string;
  /**
   * Optional list of uploaded certificates (from CertificateManager).
   * When empty, we render five sensible defaults using the provided sample.
   */
  uploaded?: Certificate[];
}

const SAMPLE_IMG = '/images/banks/certification.jpg';

const DEFAULTS: Certificate[] = [
  { url: SAMPLE_IMG, label: 'SGS · Certificate of Compliance' },
  { url: SAMPLE_IMG, label: 'CE · Marking Compliance' },
  { url: SAMPLE_IMG, label: 'ISO 9001:2015 · Quality Management' },
  { url: SAMPLE_IMG, label: 'RoHS · Restricted Substances Compliance' },
  { url: SAMPLE_IMG, label: 'FCC · Federal Communications Compliance' },
];

// Trust-building warehouse backdrop (Unsplash, served at 2000px q=65)
const BACKGROUND_IMAGE =
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2000&q=65';

export default function FactoryCertifications({ accentColor, uploaded }: FactoryCertificationsProps) {
  const certs = uploaded && uploaded.length > 0 ? uploaded : DEFAULTS;
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  // Track which card is "centered" — updates the dots indicator on scroll.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const center = el.scrollLeft + el.clientWidth / 2;
        const cards = el.querySelectorAll<HTMLElement>('[data-cert-card]');
        let nearestIdx = 0;
        let nearestDist = Infinity;
        cards.forEach((card, i) => {
          const cardCenter = card.offsetLeft + card.offsetWidth / 2;
          const d = Math.abs(cardCenter - center);
          if (d < nearestDist) {
            nearestDist = d;
            nearestIdx = i;
          }
        });
        setActiveIdx(nearestIdx);
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [certs.length]);

  function scrollToIdx(i: number) {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelectorAll<HTMLElement>('[data-cert-card]')[i];
    if (!card) return;
    el.scrollTo({
      left: card.offsetLeft - (el.clientWidth - card.offsetWidth) / 2,
      behavior: 'smooth',
    });
  }

  function scrollBy(dir: -1 | 1) {
    scrollToIdx(Math.max(0, Math.min(certs.length - 1, activeIdx + dir)));
  }

  return (
    <section id="certifications" className="relative py-28 px-8 overflow-hidden isolate">
      {/* Background image + dark scrim — same "trust hero" treatment */}
      <div className="absolute inset-0 -z-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={BACKGROUND_IMAGE}
          alt=""
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, oklch(0.12 0.018 240 / 0.94) 0%, oklch(0.14 0.02 235 / 0.88) 50%, oklch(0.12 0.018 240 / 0.94) 100%)',
          }}
        />
      </div>

      <div className="relative max-w-6xl mx-auto">
        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div className="max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 border"
              style={{
                background: `${accentColor}1f`,
                color: '#fff',
                borderColor: `${accentColor}66`,
              }}
            >
              <ShieldCheck size={13} style={{ color: accentColor }} />
              Verified &amp; Certified
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
              Factory certifications &amp; compliance
            </h2>
            <p className="mt-3 text-white/75 leading-relaxed">
              Every partner factory is audited and credentialed. Documents are
              available on request — a sample of our standards is shown below.
            </p>
          </div>

          {/* Arrow controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => scrollBy(-1)}
              aria-label="Previous certificate"
              disabled={activeIdx === 0}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scrollBy(1)}
              aria-label="Next certificate"
              disabled={activeIdx === certs.length - 1}
              className="w-10 h-10 rounded-full border border-white/20 bg-white/5 backdrop-blur flex items-center justify-center text-white/80 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Scroll track */}
        <div
          ref={trackRef}
          className="flex gap-6 overflow-x-auto pb-4 -mx-2 px-2 snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: 'none' }}
        >
          <style jsx>{`
            div::-webkit-scrollbar { display: none; }
          `}</style>
          {certs.map((c, i) => (
            <figure
              key={i}
              data-cert-card
              className="snap-center flex-shrink-0 w-[260px] md:w-[300px] bg-white rounded-2xl overflow-hidden shadow-[0_18px_40px_-22px_rgba(0,0,0,0.55)] transition-all duration-300 hover:-translate-y-1.5"
            >
              <div className="bg-slate-100 px-5 pt-5 pb-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={c.url}
                  alt={c.label || `Certificate ${i + 1}`}
                  loading="lazy"
                  className="w-full h-[360px] object-contain bg-white border border-slate-200 rounded-md"
                />
              </div>
              <figcaption className="px-5 py-4 flex items-start gap-2">
                <ShieldCheck size={16} style={{ color: accentColor }} className="mt-0.5 flex-shrink-0" />
                <span className="text-sm font-medium text-slate-900 leading-snug">
                  {c.label || `Certificate ${i + 1}`}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        {/* Dots indicator */}
        <div className="flex items-center justify-center gap-2 mt-8" role="tablist" aria-label="Certificate pagination">
          {certs.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIdx(i)}
              aria-label={`Go to certificate ${i + 1}`}
              aria-selected={i === activeIdx}
              role="tab"
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: i === activeIdx ? 28 : 8,
                background: i === activeIdx ? accentColor : 'rgba(255,255,255,0.3)',
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
