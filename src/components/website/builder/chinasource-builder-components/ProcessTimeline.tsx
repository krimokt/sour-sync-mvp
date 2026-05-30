'use client';

import { useEffect, useRef, useState } from 'react';
import { EditableText } from './EditorComponents';
import type { GeneratedContent } from '../chinasource-types';

interface ProcessTimelineProps {
  steps: GeneratedContent['howItWorks']['steps'];
  accentHex: string;
  updateContent: (path: string, value: unknown) => void;
  readOnly: boolean;
}

/**
 * Industrial-spec process layout.
 *
 * Each step is a full-width zigzag row: imagery on alternating sides, big
 * numeral + technical eyebrow on the content side. No card grids. Rows are
 * separated by hairline rules (industrial-manual feel).
 *
 * Phase 01–03 use factory / B2B sourcing photography; Phase 04+ rotates
 * through additional manufacturing & logistics scenes.
 */
// Warehouse B2B logistics arc — same industrial style as Phase 03, distinct scenes.
// All URLs verified HTTP 200 (broken Unsplash IDs silently fell back to Phase 03).
const FACTORY_B2B_PHASE_IMAGES = [
  'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?auto=format&fit=crop&w=1400&q=70&v=2', // container yard / freight
  'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=1400&q=70&v=2', // stacked cartons / shipment prep
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=70&v=2', // warehouse worker & pallets
];

// Factory / logistics imagery for Phase 04+ (also verified).
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=1400&q=70',
  'https://images.unsplash.com/photo-1581094271901-8022df4466f9?auto=format&fit=crop&w=1400&q=70',
  'https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=1400&q=70',
  'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1400&q=70',
];

const ALL_VERIFIED_IMAGES = [...FACTORY_B2B_PHASE_IMAGES, ...FALLBACK_IMAGES];

const SAFE_FALLBACK = FACTORY_B2B_PHASE_IMAGES[2];

function resolveStepImage(idx: number): string {
  if (idx < 3) {
    return FACTORY_B2B_PHASE_IMAGES[idx] ?? FACTORY_B2B_PHASE_IMAGES[0];
  }
  return FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
}

function nextFallback(currentSrc: string, stepIdx: number): string {
  const start = ALL_VERIFIED_IMAGES.indexOf(currentSrc);
  if (start >= 0 && start < ALL_VERIFIED_IMAGES.length - 1) {
    return ALL_VERIFIED_IMAGES[start + 1];
  }
  return FACTORY_B2B_PHASE_IMAGES[stepIdx % FACTORY_B2B_PHASE_IMAGES.length] ?? SAFE_FALLBACK;
}

export default function ProcessTimeline({
  steps,
  accentHex,
  updateContent,
  readOnly,
}: ProcessTimelineProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px -5% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={sectionRef} className="relative">
      {steps.map((step, idx) => {
        const flip = idx % 2 === 1;
        return (
          <div
            key={idx}
            className={`proc-row group relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center py-12 lg:py-16 ${
              idx > 0 ? 'border-t border-slate-200' : ''
            }`}
            style={{
              transitionDelay: `${idx * 70}ms`,
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 420ms cubic-bezier(.22,1,.36,1), transform 420ms cubic-bezier(.22,1,.36,1)',
            }}
          >
            {/* Row-wide accent gradient that fades in on hover — paints the whole strip */}
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none -z-10"
              style={{
                background: flip
                  ? `linear-gradient(270deg, ${accentHex}0a 0%, transparent 55%)`
                  : `linear-gradient(90deg, ${accentHex}0a 0%, transparent 55%)`,
              }}
            />

            {/* Image — alternates left/right */}
            <div className={`relative lg:col-span-5 ${flip ? 'lg:order-2' : ''}`}>
              <div
                className="relative aspect-[4/3] rounded-md overflow-hidden bg-slate-100 transition-shadow duration-700"
                style={{
                  // Glow grows as cursor enters
                  boxShadow: '0 4px 12px -6px rgba(15,23,42,0.18)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 18px 50px -18px ${accentHex}66, 0 2px 6px -3px rgba(15,23,42,0.2)`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px -6px rgba(15,23,42,0.18)';
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={resolveStepImage(idx)}
                  alt={idx < 3 ? `Phase ${idx + 1} factory B2B sourcing` : ''}
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    const img = e.currentTarget;
                    const fallback = nextFallback(img.src, idx);
                    if (img.src !== fallback) {
                      img.src = fallback;
                    }
                  }}
                  className="absolute inset-0 w-full h-full object-cover will-change-transform"
                  style={{
                    // Resting: slightly desaturated + cooled. Hover: full color, deeper contrast, gentle zoom.
                    filter: 'saturate(0.75) brightness(0.95)',
                    transform: 'scale(1)',
                    transition:
                      'filter 700ms cubic-bezier(.22,1,.36,1), transform 1100ms cubic-bezier(.22,1,.36,1)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.filter = 'saturate(1.15) brightness(1.04) contrast(1.05)';
                    e.currentTarget.style.transform = 'scale(1.07)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.filter = 'saturate(0.75) brightness(0.95)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                />
                {/* Accent wash — diagonal accent overlay using mix-blend; deepens hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-700 mix-blend-soft-light pointer-events-none"
                  style={{
                    background: `linear-gradient(135deg, ${accentHex} 0%, transparent 50%, ${accentHex}55 100%)`,
                    opacity: 0.25,
                  }}
                />

                {/* Vignette — pulled down on hover so the image pops while the edges fade */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 transition-opacity duration-700 pointer-events-none opacity-100 group-hover:opacity-40"
                  style={{
                    background:
                      'radial-gradient(circle at center, transparent 55%, rgba(0,0,0,0.25) 100%)',
                  }}
                />

                {/* Corner marker — flips to filled accent state on hover */}
                <div
                  className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-sm transition-all duration-500 ease-out backdrop-blur-sm group-hover:-translate-y-0.5 group-hover:shadow-lg"
                  style={{
                    background: 'rgba(255,255,255,0.92)',
                    color: '#0f172a',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = accentHex;
                    e.currentTarget.style.color = '#fff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.92)';
                    e.currentTarget.style.color = '#0f172a';
                  }}
                >
                  <span
                    className="block w-1.5 h-1.5 rounded-full transition-all duration-500"
                    style={{
                      background: accentHex,
                      boxShadow: `0 0 0 0 ${accentHex}`,
                    }}
                  />
                  <span className="text-[10px] font-bold tracking-[0.18em]">
                    PROC-{String(idx + 1).padStart(2, '0')}
                  </span>
                </div>

                {/* Scanline overlay — very subtle, only visible on hover. Industrial spec feel. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-700 pointer-events-none"
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(0deg, transparent 0px, transparent 2px, rgba(255,255,255,0.04) 2px, rgba(255,255,255,0.04) 3px)',
                  }}
                />
              </div>
            </div>

            {/* Content — alternates */}
            <div className={`lg:col-span-7 ${flip ? 'lg:order-1 lg:pr-12' : 'lg:pl-4'}`}>
              {/* Mono-style technical eyebrow — the rule line "extends" on hover */}
              <div className="flex items-baseline gap-3 mb-4">
                <span
                  className="text-[11px] font-bold uppercase tracking-[0.22em] transition-[letter-spacing] duration-500 group-hover:tracking-[0.28em]"
                  style={{ color: accentHex }}
                >
                  Phase {String(idx + 1).padStart(2, '0')}
                </span>
                <span
                  className="h-px flex-1 bg-slate-200 origin-left transition-all duration-700 ease-out group-hover:bg-slate-300"
                />
                <span className="text-[11px] font-medium uppercase tracking-[0.18em] text-slate-400 transition-colors duration-500 group-hover:text-slate-600">
                  {idx === 0 ? 'Source' : idx === steps.length - 1 ? 'Deliver' : 'Operate'}
                </span>
              </div>

              {/* Massive numeral — lifts and gains a gradient fill on hover */}
              <div
                className="relative inline-block mb-6 will-change-transform"
                style={{
                  transition:
                    'transform 600ms cubic-bezier(.22,1,.36,1), filter 600ms cubic-bezier(.22,1,.36,1)',
                  transform: 'translateY(0)',
                }}
              >
                <span
                  className="font-black leading-none tabular-nums tracking-tight block transition-colors duration-500"
                  style={{
                    fontSize: 'clamp(4.5rem, 10vw, 7.5rem)',
                    color: accentHex,
                    letterSpacing: '-0.04em',
                    backgroundImage: `linear-gradient(135deg, ${accentHex} 0%, ${accentHex}cc 60%, ${accentHex} 100%)`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    // Default: solid color. On hover: gradient fill via transparent text.
                  }}
                >
                  {String(idx + 1).padStart(2, '0')}
                </span>
                {/* Subtle underline mark, expands on hover */}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1 left-0 h-[3px] w-12 transition-all duration-700 ease-out group-hover:w-32"
                  style={{ background: accentHex, opacity: 0.5 }}
                />
              </div>

              <h3 className="text-2xl lg:text-3xl font-extrabold text-slate-900 mb-4 tracking-tight leading-tight max-w-xl transition-colors duration-500 group-hover:text-slate-950">
                <EditableText
                  value={step.title}
                  onChange={(v) => updateContent(`howItWorks.steps.${idx}.title`, v)}
                  readOnly={readOnly}
                />
              </h3>
              <p className="text-slate-600 text-base lg:text-lg leading-relaxed max-w-xl">
                <EditableText
                  value={step.description}
                  onChange={(v) => updateContent(`howItWorks.steps.${idx}.description`, v)}
                  readOnly={readOnly}
                />
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
