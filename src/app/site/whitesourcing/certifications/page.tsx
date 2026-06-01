'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { ShieldCheck, Award, CheckCircle2, Factory, Globe, FlaskConical, Search, ClipboardCheck } from 'lucide-react';

function CertCarousel({ images, slide, setSlide, navy }: {
  images: string[];
  slide: number;
  setSlide: (fn: (s: number) => number) => void;
  navy: string;
}) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [vpWidth, setVpWidth] = useState(0);
  const [touchX, setTouchX] = useState<number | null>(null);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setVpWidth(entry.contentRect.width));
    ro.observe(el);
    setVpWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const visible  = vpWidth < 480 ? 1 : vpWidth < 768 ? 2 : 4;
  const GAP      = vpWidth < 480 ? 10 : 16;
  const CARD_W   = vpWidth > 0 ? Math.floor((vpWidth - GAP * (visible - 1)) / visible) : 220;
  const trackW   = images.length * (CARD_W + GAP);
  const offset   = slide * (CARD_W + GAP);
  const maxSlide = images.length - 1;
  const btnSize  = vpWidth < 480 ? 36 : 44;

  const prev = () => setSlide(s => Math.max(0, s - 1));
  const next = () => setSlide(s => Math.min(maxSlide, s + 1));
  const onTouchStart = (e: React.TouchEvent) => setTouchX(e.touches[0].clientX);
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchX === null) return;
    const dx = touchX - e.changedTouches[0].clientX;
    if (dx >  40) next();
    if (dx < -40) prev();
    setTouchX(null);
  };

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    flexShrink: 0, width: btnSize, height: btnSize, borderRadius: '50%',
    border: '1px solid rgba(255,255,255,0.2)',
    background: disabled ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.12)',
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: disabled ? 'rgba(255,255,255,0.25)' : '#fff',
    fontSize: vpWidth < 480 ? 20 : 26, transition: 'background 0.2s',
  });

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: vpWidth < 480 ? 8 : 12 }}>
        <button onClick={prev} disabled={slide === 0} style={btnStyle(slide === 0)} aria-label="Previous">‹</button>
        <div ref={viewportRef} style={{ flex: 1, overflow: 'hidden', borderRadius: 6 }}
          onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
          <div style={{
            display: 'flex', gap: GAP,
            width: vpWidth > 0 ? trackW : 'auto',
            transform: `translateX(-${offset}px)`,
            transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'transform', padding: '10px 2px',
          }}>
            {images.map((src, i) => {
              const isActive = i === slide;
              const inView   = i >= slide && i < slide + visible;
              return (
                <div key={i} onClick={() => setSlide(() => i)} style={{
                  flexShrink: 0, width: vpWidth > 0 ? CARD_W : 220,
                  borderRadius: 6, overflow: 'hidden', background: '#fff', cursor: 'pointer',
                  opacity: isActive ? 1 : inView ? 0.65 : 0.25,
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  transition: 'opacity 0.3s, transform 0.3s, box-shadow 0.3s',
                  boxShadow: isActive
                    ? `0 0 0 2px ${navy}, 0 12px 40px rgba(0,0,0,0.55), 0 0 24px rgba(27,62,132,0.3)`
                    : '0 4px 14px rgba(0,0,0,0.3)',
                }}>
                  <img src={src} alt={`Certificate ${i + 1}`} draggable={false} style={{
                    width: '100%', height: vpWidth < 480 ? 260 : 300,
                    objectFit: 'contain', display: 'block', padding: vpWidth < 480 ? 8 : 12,
                  }} />
                  <div style={{
                    textAlign: 'center', padding: '6px 0 10px',
                    fontFamily: 'IBM Plex Sans', fontSize: 10, fontWeight: 700,
                    color: isActive ? navy : '#6b7280', letterSpacing: '0.06em',
                  }}>{i + 1} / {images.length}</div>
                </div>
              );
            })}
          </div>
        </div>
        <button onClick={next} disabled={slide === maxSlide} style={btnStyle(slide === maxSlide)} aria-label="Next">›</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
        {images.map((_, i) => (
          <button key={i} onClick={() => setSlide(() => i)} aria-label={`Certificate ${i + 1}`} style={{
            width: i === slide ? 22 : 8, height: 8, borderRadius: 4,
            border: 'none', cursor: 'pointer', padding: 0, minWidth: 8,
            background: i === slide ? '#60a5fa' : 'rgba(255,255,255,0.3)',
            transition: 'all 0.3s ease',
          }} />
        ))}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Brand palette
   Deep Navy  : #1B3E84
   Signal Red : #E2231A
   Steel Gray : #F4F6FA
   Black      : #0F1115
───────────────────────────────────────────── */

const NAVY = '#1B3E84';
const RED = '#E2231A';
const STEEL = '#F4F6FA';
const BLACK = '#0F1115';

/* ── Testing standards data ── */
const testingRows = [
  {
    product: 'Steel Panel Radiators',
    test: 'Hydraulic pressure test at 13 bar (1.3× working pressure)',
    standard: 'EN 442-1:2014',
  },
  {
    product: 'Aluminum Radiators',
    test: 'Heat output verification, pressure cycle test',
    standard: 'EN 442-1:2014',
  },
  {
    product: 'Cast Iron Radiators',
    test: '300-hour salt spray corrosion test, pressure test',
    standard: 'DIN 4703',
  },
  {
    product: 'Underfloor Heating (PEX-A)',
    test: 'Oxygen permeation, burst pressure, flexibility test',
    standard: 'EN ISO 15875',
  },
  {
    product: 'PPR Pipes',
    test: 'Hydrostatic pressure test at 95°C, 1000 hours',
    standard: 'ISO 15874',
  },
  {
    product: 'Brass Ball Valves',
    test: '10,000-cycle endurance test, seat tightness test',
    standard: 'EN 13828',
  },
  {
    product: 'Manifold Systems',
    test: 'Full-assembly pressure test, flow balance verification',
    standard: 'EN 1264-3',
  },
];

/* ── QC Process steps ── */
const qcSteps = [
  {
    num: '01',
    title: 'Raw Material Inspection',
    desc: 'Every incoming batch of steel, aluminum, brass, and polymer is tested against material certificates. Non-conforming materials are rejected before entering the production line.',
  },
  {
    num: '02',
    title: 'In-Process QC',
    desc: 'Dedicated QC inspectors check dimensional tolerances, weld integrity, and surface finish at each production stage. Defects are identified and corrected before the next process step.',
  },
  {
    num: '03',
    title: 'Finished Product Testing',
    desc: 'Every finished unit undergoes a hydraulic pressure test at 1.3 times the rated working pressure. Heat output is spot-checked on radiator batches against EN 442-1 tables.',
  },
  {
    num: '04',
    title: 'Pre-Shipment Inspection',
    desc: 'A final visual inspection, packaging check, and carton-marking review is completed before loading. Third-party PSI by SGS or Bureau Veritas is available on buyer request.',
  },
  {
    num: '05',
    title: 'Certificate Issuance',
    desc: 'Each shipment is accompanied by a factory test report, material certificates, and a packing list. CE Declaration of Conformity and ISO certificate copies are supplied on request.',
  },
];

/* ── FAQ items ── */
const faqs = [
  {
    q: 'Do all products carry CE marking?',
    a: 'Steel panel radiators, aluminum radiators, and brass ball valves carry CE marking. Underfloor heating systems and PPR pipes comply with the relevant EN standards but are sold under technical documentation rather than a full CE declaration. Contact us for specific product compliance documentation.',
  },
  {
    q: 'Can I get a copy of your ISO 9001 certificate?',
    a: 'Yes. Email sales@shuilida-hvac.com with your company name and we will send the current certificate within 24 hours. Our ISO 9001 scope covers all product lines listed on this website.',
  },
  {
    q: 'What happens if products fail at destination?',
    a: 'All products undergo factory pressure testing before shipment. In the event of a quality issue at destination, we investigate using shipping photos, test reports, and batch records. Replacements or credit notes are issued for confirmed manufacturing defects within 12 months of shipment.',
  },
  {
    q: 'Are your factories open for audit?',
    a: 'Yes. We welcome unannounced or scheduled factory audits from buyers and third-party inspection agencies. Contact our export team to schedule a visit.',
  },
  {
    q: 'Do you offer products certified for the US/Canadian market?',
    a: 'Currently our certifications target European (CE) and international (ISO) markets. US/Canadian specific certifications (NSF, UL, CSA) are available on OEM orders with sufficient volume. Contact us to discuss requirements.',
  },
  {
    q: 'What is your product warranty period?',
    a: 'Steel panel radiators: 10-year warranty against manufacturing defects. Brass ball valves: 5-year warranty. PPR pipes and underfloor heating: 10-year warranty on materials. All warranties are subject to correct installation and operating conditions.',
  },
];

const CERT_IMAGES = [
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
  '/images/banks/certification.jpg',
];

export default function CertificationsPage() {
  const [certSlide, setCertSlide] = useState(0);

  useEffect(() => {
    const els = document.querySelectorAll('.shd-fade');
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          setTimeout(() => entry.target.classList.add('visible'), i * 70);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="shd-root" style={{ colorScheme: 'light', color: BLACK }}>
      <style suppressHydrationWarning>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .shd-fade { opacity: 0; }
        .shd-fade.visible { animation: fadeInUp 0.55s ease forwards; }
      `}</style>

      {/* ══════════════════════════════════════
          SECTION 1 — PAGE HERO
      ══════════════════════════════════════ */}
      <section
        style={{
          position: 'relative',
          backgroundColor: NAVY,
          overflow: 'hidden',
          padding: '80px 40px 72px',
        }}
      >
        {/* Grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          {/* Breadcrumb */}
          <nav style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 8 }} aria-label="Breadcrumb">
            <Link
              href="/site/whitesourcing"
              style={{
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              Home
            </Link>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13 }}>/</span>
            <span
              style={{
                color: '#fff',
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Certifications
            </span>
          </nav>

          {/* Headline */}
          <h1
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(30px, 5vw, 54px)',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 20,
              maxWidth: '18ch',
              textWrap: 'balance',
            }}
          >
            Quality Certifications &amp; Standards
          </h1>

          <p
            style={{
              color: '#bfdbfe',
              fontSize: 17,
              lineHeight: 1.7,
              maxWidth: '62ch',
              marginBottom: 48,
            }}
          >
            Every SHUILIDA product is manufactured under certified quality management systems and tested to international standards before shipment.
          </p>

          {/* Trust badges */}
          <div
            className="flex flex-wrap"
            style={{ gap: 12 }}
          >
            {[
              { label: 'ISO 9001:2015' },
              { label: 'CE Mark' },
              { label: '100% Pressure Tested' },
              { label: 'Third-Party Audited' },
            ].map((badge) => (
              <div
                key={badge.label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  backgroundColor: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.22)',
                  color: '#fff',
                  padding: '9px 18px',
                  borderRadius: 2,
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: '#22c55e',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#fff',
                  }}
                >
                  <CheckCircle2 size={18} />
                </span>
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          CERTIFICATE CAROUSEL
      ══════════════════════════════════════ */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '64px 40px', background: BLACK }}>
        {/* Grid overlay */}
        <div className="shd-grid-bg" style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.7 }} />
        {/* Navy radial glow */}
        <div style={{
          position: 'absolute', inset: 0, zIndex: 0,
          background: `radial-gradient(ellipse 70% 60% at 50% 40%, rgba(27,62,132,0.55) 0%, transparent 70%)`,
        }} />
        {/* Top accent line */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 3, background: `linear-gradient(to right, transparent, ${NAVY}, transparent)`, zIndex: 2,
        }} />

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 1280, margin: '0 auto' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(27,62,132,0.35)', border: '1px solid rgba(27,62,132,0.6)',
              borderRadius: 2, padding: '5px 14px', marginBottom: 16,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', display: 'inline-block' }} />
              <span style={{ fontFamily: 'IBM Plex Sans', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: '#93c5fd', textTransform: 'uppercase' as const }}>
                Verified Quality
              </span>
            </div>
            <h2 style={{ fontFamily: 'IBM Plex Sans', fontSize: 'clamp(22px,3vw,32px)', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em', margin: 0 }}>
              Certificate Documents
            </h2>
            <p style={{ color: '#9ca3af', fontSize: 14, marginTop: 8 }}>
              ISO 9001:2015 · CE Mark · SGS Audited
            </p>
          </div>

          <CertCarousel
            images={CERT_IMAGES}
            slide={certSlide}
            setSlide={setCertSlide}
            navy={NAVY}
          />
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 2 — MAIN CERTIFICATIONS
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}
            >
              Our Certifications
            </h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.65, maxWidth: '65ch' }}>
              SHUILIDA holds internationally recognised certifications across quality management and product safety. These are not box-ticking exercises — they govern how every product is made, tested, and shipped.
            </p>
          </div>

          {/* Two cert cards */}
          <div className="grid grid-cols-1 md:grid-cols-2" style={{ gap: 28 }}>

            {/* Card 1: ISO 9001:2015 */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: STEEL,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  backgroundColor: NAVY,
                  padding: '32px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 22,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                      letterSpacing: '-0.02em',
                    }}
                  >
                    ISO
                  </span>
                  <span
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 13,
                      fontWeight: 700,
                      color: '#93c5fd',
                      lineHeight: 1,
                    }}
                  >
                    9001
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    ISO 9001:2015
                  </h3>
                  <p style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500 }}>
                    Quality Management System
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '32px 40px' }}>
                {/* Meta details */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: 16, marginBottom: 28 }}
                >
                  {[
                    { label: 'Certificate No.', value: 'SHD-QMS-2021-CN-0423' },
                    { label: 'Issued By', value: 'SGS Group' },
                    { label: 'Valid', value: '2021–2024 (renewable)' },
                    { label: 'TÜV Equivalent', value: 'Third-party accredited' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        backgroundColor: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        padding: '12px 16px',
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'IBM Plex Sans',
                          fontSize: 11,
                          fontWeight: 600,
                          color: '#9ca3af',
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                          marginBottom: 4,
                        }}
                      >
                        {item.label}
                      </div>
                      <div
                        className="shd-mono"
                        style={{ fontSize: 13, fontWeight: 600, color: BLACK }}
                      >
                        {item.value}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scope */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 700,
                      color: NAVY,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Certification Scope
                  </div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.7, fontStyle: 'italic' }}>
                    "Design, manufacturing, and export of heating and plumbing equipment including radiators, underfloor heating systems, PPR pipes, brass valves, and manifold systems."
                  </p>
                </div>

                {/* What it means */}
                <div style={{ marginBottom: 32 }}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 700,
                      color: NAVY,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    What This Means for Buyers
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      'Documented quality procedures for every production step',
                      'Regular internal audits and corrective action processes',
                      'Traceability: every batch traceable to raw material supplier',
                      'Continuous improvement culture embedded in operations',
                    ].map((point) => (
                      <li
                        key={point}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 14,
                          color: '#374151',
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 3,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: NAVY,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          <CheckCircle2 size={18} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/site/whitesourcing/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: NAVY,
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  Request Certificate Copy →
                </Link>
              </div>
            </div>

            {/* Card 2: CE Marking */}
            <div
              className="shd-fade"
              style={{
                backgroundColor: STEEL,
                border: '1px solid #e5e7eb',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              {/* Card header */}
              <div
                style={{
                  backgroundColor: '#1d3a80',
                  padding: '32px 40px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 24,
                }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 80,
                    height: 80,
                    backgroundColor: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 34,
                      fontWeight: 700,
                      color: '#fff',
                      lineHeight: 1,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    CE
                  </span>
                </div>
                <div>
                  <h3
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 24,
                      fontWeight: 700,
                      color: '#fff',
                      marginBottom: 4,
                      letterSpacing: '-0.01em',
                    }}
                  >
                    CE Marking
                  </h3>
                  <p style={{ color: '#93c5fd', fontSize: 13, fontWeight: 500 }}>
                    European Conformity Declaration
                  </p>
                </div>
              </div>

              {/* Card body */}
              <div style={{ padding: '32px 40px' }}>
                {/* Standards covered */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 700,
                      color: NAVY,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}
                  >
                    Standards Covered
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { std: 'EN 442-1:2014', desc: 'Radiators and convectors' },
                      { std: 'EN 1264', desc: 'Floor heating systems' },
                      { std: 'EN 13828', desc: 'Brass fittings for drinking water' },
                    ].map((item) => (
                      <div
                        key={item.std}
                        style={{
                          display: 'flex',
                          gap: 12,
                          alignItems: 'center',
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: 2,
                          padding: '10px 14px',
                        }}
                      >
                        <span
                          className="shd-mono"
                          style={{
                            fontSize: 12,
                            fontWeight: 600,
                            color: NAVY,
                            flexShrink: 0,
                            minWidth: 110,
                          }}
                        >
                          {item.std}
                        </span>
                        <span style={{ fontSize: 13, color: '#6b7280' }}>{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Products and notified body */}
                <div
                  className="grid grid-cols-1 sm:grid-cols-2"
                  style={{ gap: 16, marginBottom: 24 }}
                >
                  <div
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#9ca3af',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Notified Body
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>TÜV Rheinland</div>
                  </div>
                  <div
                    style={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: 2,
                      padding: '12px 16px',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 11,
                        fontWeight: 600,
                        color: '#9ca3af',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                        marginBottom: 4,
                      }}
                    >
                      Declaration No.
                    </div>
                    <div className="shd-mono" style={{ fontSize: 13, fontWeight: 600, color: BLACK }}>
                      DoC-SHD-2021-EU
                    </div>
                  </div>
                </div>

                {/* Products covered */}
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 700,
                      color: NAVY,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 8,
                    }}
                  >
                    Products Covered
                  </div>
                  <p style={{ color: '#374151', fontSize: 14, lineHeight: 1.65 }}>
                    Steel panel radiators, aluminum radiators, brass ball valves.
                  </p>
                </div>

                {/* What CE means */}
                <div style={{ marginBottom: 32 }}>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 12,
                      fontWeight: 700,
                      color: NAVY,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}
                  >
                    What CE Means for Buyers
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      'Legal right to sell in all 27 EU member states',
                      'Products tested to EU safety, health, and environmental standards',
                      'Backed by Declaration of Conformity (available on request)',
                      'Annual factory surveillance audits by notified body',
                    ].map((point) => (
                      <li
                        key={point}
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: 10,
                          fontSize: 14,
                          color: '#374151',
                          lineHeight: 1.6,
                        }}
                      >
                        <span
                          style={{
                            flexShrink: 0,
                            marginTop: 3,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            backgroundColor: NAVY,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff',
                          }}
                        >
                          <CheckCircle2 size={18} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/site/whitesourcing/contact"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: NAVY,
                    color: '#fff',
                    padding: '12px 24px',
                    borderRadius: 2,
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 13,
                    fontWeight: 700,
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  Request DoC Document →
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 3 — PRODUCT TESTING STANDARDS
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ marginBottom: 48 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}
            >
              Product Testing &amp; Standards
            </h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.65, maxWidth: '65ch' }}>
              Before leaving our factory, every product undergoes rigorous testing. Here are the key tests and standards applied to each product line.
            </p>
          </div>

          {/* Table */}
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-3"
              style={{
                backgroundColor: NAVY,
                padding: '14px 24px',
                gap: 16,
              }}
            >
              {['Product', 'Test Performed', 'Standard'].map((col) => (
                <div
                  key={col}
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 12,
                    fontWeight: 700,
                    color: '#fff',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  {col}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {testingRows.map((row, i) => (
              <div
                key={row.product}
                className="grid grid-cols-3 shd-fade"
                style={{
                  padding: '16px 24px',
                  gap: 16,
                  backgroundColor: i % 2 === 0 ? '#fff' : STEEL,
                  borderTop: '1px solid #e5e7eb',
                  alignItems: 'center',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 14,
                    fontWeight: 700,
                    color: BLACK,
                    lineHeight: 1.4,
                  }}
                >
                  {row.product}
                </div>
                <div
                  style={{
                    fontSize: 13,
                    color: '#374151',
                    lineHeight: 1.55,
                  }}
                >
                  {row.test}
                </div>
                <div>
                  <span
                    className="shd-mono"
                    style={{
                      display: 'inline-block',
                      backgroundColor: '#e8edf7',
                      color: NAVY,
                      fontSize: 12,
                      fontWeight: 600,
                      padding: '4px 10px',
                      borderRadius: 2,
                    }}
                  >
                    {row.standard}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <p
            style={{
              marginTop: 20,
              fontSize: 13,
              color: '#6b7280',
              lineHeight: 1.6,
            }}
          >
            Test reports for any product line are available on request. Third-party lab testing by accredited bodies can be arranged before shipment.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 4 — QUALITY PROCESS TIMELINE
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: '#fff', padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ textAlign: 'center', marginBottom: 64 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}
            >
              Our Quality Control Process
            </h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.65, maxWidth: '55ch', margin: '0 auto' }}>
              Five checkpoints between raw material arrival and container loading. Every batch that leaves our facility has passed each gate.
            </p>
          </div>

          {/* Desktop: horizontal flow. Mobile: vertical stack. */}
          {/* We use a grid on desktop and let it wrap on mobile */}
          <div
            className="hidden lg:flex"
            style={{
              gap: 0,
              alignItems: 'flex-start',
              position: 'relative',
            }}
          >
            {/* Connecting line */}
            <div
              style={{
                position: 'absolute',
                top: 28,
                left: '10%',
                right: '10%',
                height: 2,
                backgroundColor: '#e5e7eb',
                zIndex: 0,
              }}
            />

            {qcSteps.map((step, i) => (
              <div
                key={step.num}
                className="shd-fade"
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  zIndex: 1,
                  padding: '0 12px',
                }}
              >
                {/* Number circle */}
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: '50%',
                    backgroundColor: NAVY,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                    flexShrink: 0,
                    border: '3px solid #fff',
                    boxShadow: '0 0 0 2px #e5e7eb',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 15,
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {step.num}
                  </span>
                </div>

                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 15,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 10,
                    lineHeight: 1.3,
                  }}
                >
                  {step.title}
                </h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65 }}>
                  {step.desc}
                </p>

                {/* Arrow between steps */}
                {i < qcSteps.length - 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 26,
                      right: -8,
                      width: 16,
                      height: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2,
                    }}
                  >
                    <span
                      style={{
                        color: NAVY,
                        fontSize: 14,
                        fontWeight: 700,
                        lineHeight: 1,
                      }}
                    >
                      ›
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile: vertical stack */}
          <div
            className="flex flex-col lg:hidden"
            style={{ gap: 0 }}
          >
            {qcSteps.map((step, i) => (
              <div
                key={step.num}
                className="shd-fade"
                style={{
                  display: 'flex',
                  gap: 20,
                  alignItems: 'flex-start',
                  position: 'relative',
                }}
              >
                {/* Left: circle + line */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: '50%',
                      backgroundColor: NAVY,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: 'IBM Plex Sans',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#fff',
                      }}
                    >
                      {step.num}
                    </span>
                  </div>
                  {i < qcSteps.length - 1 && (
                    <div
                      style={{
                        width: 2,
                        flex: 1,
                        minHeight: 32,
                        backgroundColor: '#e5e7eb',
                        margin: '6px 0',
                      }}
                    />
                  )}
                </div>

                {/* Right: content */}
                <div style={{ paddingBottom: i < qcSteps.length - 1 ? 28 : 0 }}>
                  <h3
                    style={{
                      fontFamily: 'IBM Plex Sans',
                      fontSize: 16,
                      fontWeight: 700,
                      color: BLACK,
                      marginBottom: 8,
                      marginTop: 12,
                    }}
                  >
                    {step.title}
                  </h3>
                  <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 5 — THIRD-PARTY INSPECTION
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: NAVY,
          color: '#fff',
          padding: '96px 40px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle grid overlay */}
        <div
          className="shd-grid-bg"
          style={{ position: 'absolute', inset: 0, zIndex: 0 }}
        />

        <div style={{ maxWidth: 1280, margin: '0 auto', position: 'relative', zIndex: 1 }}>

          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: '#fff',
                letterSpacing: '-0.02em',
                marginBottom: 16,
              }}
            >
              Third-Party Inspection Available
            </h2>
            <p style={{ color: '#bfdbfe', fontSize: 17, lineHeight: 1.7, maxWidth: '65ch' }}>
              We welcome third-party inspection by SGS, Bureau Veritas, Intertek, or any inspector nominated by the buyer. Factory visits are welcome by appointment.
            </p>
          </div>

          {/* 3 columns */}
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ gap: 24, marginBottom: 56 }}>
            {[
              {
                num: '01',
                title: 'Pre-Shipment Inspection',
                body: 'Arrange a pre-shipment inspection (PSI) with SGS, Bureau Veritas, or Intertek before goods leave our factory. We provide full access to the production floor and packaged goods for inspection.',
              },
              {
                num: '02',
                title: 'Factory Audit',
                body: 'Full production audit for new buyers covering quality system documentation, production line capability, and QC records. Audit reports are available on request and can be arranged within two weeks notice.',
              },
              {
                num: '03',
                title: 'Sample Testing',
                body: 'Batch samples can be sent to accredited laboratories for independent chemical and mechanical testing. We cover packing and courier costs for first-order sample sets to serious buyers.',
              },
            ].map((col) => (
              <div
                key={col.num}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 2,
                  padding: '32px 32px',
                }}
              >
                <div
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 32,
                    fontWeight: 700,
                    color: 'rgba(255,255,255,0.18)',
                    lineHeight: 1,
                    marginBottom: 16,
                    letterSpacing: '-0.02em',
                  }}
                >
                  {col.num}
                </div>
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 18,
                    fontWeight: 700,
                    color: '#fff',
                    marginBottom: 12,
                    lineHeight: 1.3,
                  }}
                >
                  {col.title}
                </h3>
                <p style={{ color: '#bfdbfe', fontSize: 14, lineHeight: 1.7 }}>
                  {col.body}
                </p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <Link
              href="/site/whitesourcing/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: '#fff',
                color: NAVY,
                padding: '14px 28px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 14,
                fontWeight: 700,
                textDecoration: 'none',
                transition: 'background 0.2s',
              }}
            >
              Arrange an Inspection →
            </Link>
            <p style={{ color: '#93c5fd', fontSize: 13 }}>
              We respond to inspection requests within 24 hours.
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 6 — FAQ
      ══════════════════════════════════════ */}
      <section style={{ backgroundColor: STEEL, padding: '96px 40px' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>

          <div style={{ marginBottom: 56 }}>
            <h2
              className="shd-fade"
              style={{
                fontFamily: 'IBM Plex Sans',
                fontSize: 'clamp(26px, 4vw, 40px)',
                fontWeight: 700,
                color: BLACK,
                letterSpacing: '-0.02em',
                marginBottom: 14,
              }}
            >
              Certification FAQs
            </h2>
            <p style={{ color: '#4b5563', fontSize: 16, lineHeight: 1.65, maxWidth: '55ch' }}>
              Common questions from importers about our certificates, testing, and quality processes.
            </p>
          </div>

          {/* FAQ grid — two columns on desktop */}
          <div className="grid grid-cols-1 lg:grid-cols-2" style={{ gap: 20 }}>
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="shd-fade"
                style={{
                  backgroundColor: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: 2,
                  padding: '28px 32px',
                }}
              >
                <h3
                  style={{
                    fontFamily: 'IBM Plex Sans',
                    fontSize: 16,
                    fontWeight: 700,
                    color: BLACK,
                    marginBottom: 12,
                    lineHeight: 1.4,
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                  }}
                >
                  <span
                    style={{
                      flexShrink: 0,
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      backgroundColor: NAVY,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                      color: '#fff',
                      marginTop: 1,
                    }}
                  >
                    Q
                  </span>
                  {faq.q}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#374151',
                    lineHeight: 1.75,
                    paddingLeft: 36,
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>

          {/* Can't find your question */}
          <div
            style={{
              marginTop: 40,
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 2,
              padding: '24px 32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: 'IBM Plex Sans',
                  fontSize: 15,
                  fontWeight: 700,
                  color: BLACK,
                  marginBottom: 4,
                }}
              >
                Still have questions about compliance or certification?
              </div>
              <p style={{ fontSize: 14, color: '#6b7280' }}>
                Our export team can provide any documentation your customs or procurement team requires.
              </p>
            </div>
            <Link
              href="/site/whitesourcing/contact"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                backgroundColor: NAVY,
                color: '#fff',
                padding: '12px 24px',
                borderRadius: 2,
                fontFamily: 'IBM Plex Sans',
                fontSize: 13,
                fontWeight: 700,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              Contact Export Team →
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════
          SECTION 7 — CTA BANNER
      ══════════════════════════════════════ */}
      <section
        style={{
          backgroundColor: RED,
          padding: '72px 40px',
          textAlign: 'center',
        }}
      >
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'IBM Plex Sans',
              fontSize: 'clamp(24px, 4vw, 42px)',
              fontWeight: 700,
              color: '#fff',
              marginBottom: 14,
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              textWrap: 'balance',
            }}
          >
            Need Certification Documents for Your Import?
          </h2>
          <p
            style={{
              color: 'rgba(255,255,255,0.85)',
              fontSize: 17,
              lineHeight: 1.65,
              marginBottom: 40,
              maxWidth: '52ch',
              margin: '0 auto 40px',
            }}
          >
            We respond to all documentation requests within 24 hours.
          </p>
          <Link
            href="/site/whitesourcing/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              backgroundColor: '#fff',
              color: NAVY,
              padding: '15px 32px',
              borderRadius: 2,
              fontFamily: 'IBM Plex Sans',
              fontSize: 15,
              fontWeight: 700,
              textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
          >
            Request Documents →
          </Link>
        </div>
      </section>

    </div>
  );
}
